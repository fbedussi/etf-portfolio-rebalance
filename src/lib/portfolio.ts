import type { AssetClassCategory, Transaction } from "@/model";

export function getDriftDataByAssetClass(
    targetAllocation: Record<AssetClassCategory, number> | undefined,
    currentValuesByAssetClass: Record<AssetClassCategory, number>
): {
    assetClass: string,
    // positive is more than the targer, so to sell
    driftAmount: number,
    // drift percentage, positive is more than the target
    percentage: number,
    // amount to buy to rebalance investing new cash, without selling any other asset. It is always positive
    // is null if it is not possible to rebalance without selling something or changing the target allocation
    amountToBuyToCompensate: number | null,
    // amount to sell to rebalance without buying any other asset. It is always positive
    // is null if it is not possible to rebalance without buying something or changing the target allocation
    amountToSellToCompensate: number | null,
}[] {
    if (!targetAllocation) {
        return []
    }

    const assetClasses = [...new Set(Object.keys(targetAllocation).concat(Object.keys(currentValuesByAssetClass)))]

    const portfolioValue = Object.values(currentValuesByAssetClass).reduce((sum, val) => sum + val, 0)

    const assetClassesInTarget = Object.keys(targetAllocation)

    const drifts = assetClasses.map((assetClass) => {
        const targetAllocationPercentage = targetAllocation[assetClass] || 0
        const currentValue = currentValuesByAssetClass[assetClass] || 0

        const currentPercentageOnPortfolioValue = portfolioValue
            ? currentValue / portfolioValue * 100
            : 0 // if portfolioValue is 0, currentValue is 0
        const percentageDelta = currentPercentageOnPortfolioValue - targetAllocationPercentage
        const driftPercentage = targetAllocationPercentage
            ? percentageDelta / targetAllocationPercentage * 100
            : 100

        const targetValue = targetAllocationPercentage / 100 * portfolioValue


        return {
            assetClass,
            currentValue,
            targetAllocationPercentage,
            driftAmount: currentValue - targetValue,
            percentage: Number(driftPercentage.toFixed(2)),
        }
    })

    const assetClassesInPortfolio = Object.keys(currentValuesByAssetClass)

    // if an asset class is not in the target it is impossible to compensate the drift without selling it or changing the target
    const isItPossibleToCompensateWithBuyStrategy = assetClassesInPortfolio.every(key => assetClassesInTarget.includes(key))

    // if an asset class is not in the portfolio it is impossible to compensate the drift without buying it or changing the target
    const isItPossibleToCompensateWithSellStrategy = assetClassesInTarget.every(key => assetClassesInPortfolio.includes(key))

    const sortedDrifts = drifts.toSorted((a, b) => a.driftAmount - b.driftAmount)
    const assetClassWithLowestDrift = sortedDrifts.at(0)
    const assetClassWithHighestDrift = sortedDrifts.at(-1)
    const newPorfolioValue_buyStrategy = isItPossibleToCompensateWithBuyStrategy && assetClassWithHighestDrift
        ? assetClassWithHighestDrift.currentValue / assetClassWithHighestDrift.targetAllocationPercentage * 100
        : portfolioValue

    const newPorfolioValue_sellStrategy = assetClassWithLowestDrift
        ? assetClassWithLowestDrift.currentValue / assetClassWithLowestDrift.targetAllocationPercentage * 100
        : portfolioValue


    return drifts.map(({ assetClass, currentValue, driftAmount, targetAllocationPercentage, percentage }) => ({
        assetClass,
        driftAmount,
        percentage,
        amountToBuyToCompensate: isItPossibleToCompensateWithBuyStrategy
            ? Number(((newPorfolioValue_buyStrategy / 100 * targetAllocationPercentage) - currentValue).toFixed(2))
            : null,
        amountToSellToCompensate: isItPossibleToCompensateWithSellStrategy
            ? Number((currentValue - (newPorfolioValue_sellStrategy / 100 * targetAllocationPercentage)).toFixed(2))
            : null,
    }))
}

export const quantityAtDate = (transactions: Transaction[], date: string) => {
    let quantity = 0
    for (const transaction of transactions) {
      if (transaction.date > date) {
        break
      }
      quantity += transaction.quantity
    }
    return quantity
  }