import type { AssetClassCategory } from "@/model";

export function getDriftDataByAssetClass(
    targetAllocation: Record<AssetClassCategory, number>,
    currentValuesByAssetClass: Record<AssetClassCategory, number>
): {
    assetClass: string,
    // positive is more than the targer, so to sell
    drifAmount: number,
    // drift percentage, positive is more than the target
    percentage: number,
    // amount to buy to rebalance investing new cash, without selling any other asset. It is always positive
    // is null if it is not possible to rebalance without selling something or changing the target allocation
    amountToBuyToCompensate: number | null,
}[] {
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
            drifAmount: currentValue - targetValue,
            percentage: Number(driftPercentage.toFixed(2)),
        }
    })

    // if an asset class is not in the target it is impossible to compensate the drift without selling it or changing the target
    const isItPossibleToCompensate = Object.keys(currentValuesByAssetClass).every(key => assetClassesInTarget.includes(key))

    const assetClassWithGreatestDrift = drifts.toSorted((a, b) => a.drifAmount - b.drifAmount).at(-1)
    const newPorfolioValue = isItPossibleToCompensate && assetClassWithGreatestDrift
        ? assetClassWithGreatestDrift.currentValue / assetClassWithGreatestDrift.targetAllocationPercentage * 100
        : portfolioValue

    return drifts.map(({ assetClass, currentValue, drifAmount, targetAllocationPercentage, percentage }) => ({
        assetClass,
        drifAmount,
        percentage,
        amountToBuyToCompensate: isItPossibleToCompensate
            ? Number(((newPorfolioValue / 100 * targetAllocationPercentage) - currentValue).toFixed(2))
            : null,
    }))
}