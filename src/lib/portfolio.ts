import type {
  AssetClassCategory,
  Country,
  CurrentPrices,
  ETF,
  Isin,
  IsoDate,
  SIP,
  Transaction,
} from "@/model"
import dayjs from "dayjs"

export function getDriftDataByAssetClass(
  targetAllocation: Record<AssetClassCategory, number> | undefined,
  currentValuesByAssetClass: Record<AssetClassCategory, number>,
): {
  assetClass: string
  // positive is more than the targer, so to sell
  driftAmount: number
  // drift percentage, positive is more than the target
  percentage: number
  // amount to buy to rebalance investing new cash, without selling any other asset. It is always positive
  // is null if it is not possible to rebalance without selling something or changing the target allocation
  amountToBuyToCompensate: number | null
  // amount to sell to rebalance without buying any other asset. It is always positive
  // is null if it is not possible to rebalance without buying something or changing the target allocation
  amountToSellToCompensate: number | null
}[] {
  if (!targetAllocation) {
    return []
  }

  const assetClasses = [
    ...new Set(Object.keys(targetAllocation).concat(Object.keys(currentValuesByAssetClass))),
  ]

  const portfolioValue = Object.values(currentValuesByAssetClass).reduce((sum, val) => sum + val, 0)

  const assetClassesInTarget = Object.keys(targetAllocation)

  const drifts = assetClasses.map((assetClass) => {
    const targetAllocationPercentage = targetAllocation[assetClass] || 0
    const currentValue = currentValuesByAssetClass[assetClass] || 0

    const currentPercentageOnPortfolioValue = portfolioValue
      ? (currentValue / portfolioValue) * 100
      : 0 // if portfolioValue is 0, currentValue is 0
    const percentageDelta = currentPercentageOnPortfolioValue - targetAllocationPercentage
    const driftPercentage = targetAllocationPercentage
      ? (percentageDelta / targetAllocationPercentage) * 100
      : 100

    const targetValue = (targetAllocationPercentage / 100) * portfolioValue

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
  const isItPossibleToCompensateWithBuyStrategy = assetClassesInPortfolio.every((key) =>
    assetClassesInTarget.includes(key),
  )

  // if an asset class is not in the portfolio it is impossible to compensate the drift without buying it or changing the target
  const isItPossibleToCompensateWithSellStrategy = assetClassesInTarget.every((key) =>
    assetClassesInPortfolio.includes(key),
  )

  const sortedDrifts = drifts.toSorted((a, b) => a.driftAmount - b.driftAmount)
  const assetClassWithLowestDrift = sortedDrifts.at(0)
  const assetClassWithHighestDrift = sortedDrifts.at(-1)
  const newPorfolioValue_buyStrategy =
    isItPossibleToCompensateWithBuyStrategy && assetClassWithHighestDrift
      ? (assetClassWithHighestDrift.currentValue /
        assetClassWithHighestDrift.targetAllocationPercentage) *
      100
      : portfolioValue

  const newPorfolioValue_sellStrategy = assetClassWithLowestDrift
    ? (assetClassWithLowestDrift.currentValue /
      assetClassWithLowestDrift.targetAllocationPercentage) *
    100
    : portfolioValue

  return drifts.map(
    ({ assetClass, currentValue, driftAmount, targetAllocationPercentage, percentage }) => ({
      assetClass,
      driftAmount,
      percentage,
      amountToBuyToCompensate: isItPossibleToCompensateWithBuyStrategy
        ? Number(
          (
            (newPorfolioValue_buyStrategy / 100) * targetAllocationPercentage -
            currentValue
          ).toFixed(2),
        )
        : null,
      amountToSellToCompensate: isItPossibleToCompensateWithSellStrategy
        ? Number(
          (
            currentValue -
            (newPorfolioValue_sellStrategy / 100) * targetAllocationPercentage
          ).toFixed(2),
        )
        : null,
    }),
  )
}

export const quantityAtDate = (transactions: Transaction[], date: string, sip?: SIP) => {
  let quantity = 0
  for (const transaction of transactions) {
    if (transaction.date > date) {
      break
    }
    quantity += transaction.quantity
  }

  if (sip && sip.startDate <= date) {
    const numberOfMonthsSinceStartDate = dayjs(date).diff(dayjs(sip.startDate), "month") + 1 // since the start date is at least equal to the current date, if it is the same day it must be counted
    const numberOfPurchases = Math.floor(
      numberOfMonthsSinceStartDate / Math.floor(sip.frequency / 12),
    )
    quantity += numberOfPurchases * sip.quantity
  }

  return quantity
}

export function calculatePortfolioCost(
  etfs: Record<Isin, ETF>,
  prices: Record<Isin, Record<IsoDate, number>>,
  date: IsoDate,
) {
  const quantities = Object.values(etfs).reduce(
    (result, etf) => {
      const transactionCost = etf.transactions.reduce(
        (cost, transaction) => cost + transaction.quantity * transaction.price,
        0,
      )

      let sipCost = 0
      if (etf.sip) {
        const lastKnownPrice = etf.transactions.at(-1)?.price
        let dateToProcess = etf.sip.startDate
        while (dateToProcess <= date) {
          // TODO: if we are using a fallback price we should communicate that to the user
          const price = prices[etf.isin]?.[dateToProcess] ?? lastKnownPrice ?? 0
          sipCost += etf.sip.quantity * price
          dateToProcess = dayjs(dateToProcess)
            .add(Math.floor(12 / etf.sip.frequency), "month")
            .format("YYYY-MM-DD")
        }
      }

      result[etf.isin] = transactionCost + sipCost
      return result
    },
    {} as Record<string, number> /*isin, cost*/,
  )

  const value = Object.values(quantities).reduce((result, cost) => (result += cost), 0)

  return value
}

const pricesHistoryToMap = (history: { price: number; date: string }[]) => {
  return history.reduce(
    (result, price) => {
      result[price.date] = price.price
      return result
    },
    {} as Record<IsoDate, number>,
  )
}

export const calculatePricesHistoryMap = (prices: CurrentPrices) => {
  return Object.entries(prices).reduce(
    (result, [isin, price]) => {
      result[isin] = pricesHistoryToMap(price.history)
      return result
    },
    {} as Record<Isin, Record<IsoDate, number>>,
  )
}

export const calculateCurrentPortfolioValue = (
  etfs: Record<Isin, ETF>,
  prices: CurrentPrices,
  today: IsoDate,
) => {
  return calculateCurrentPortfolioValueForFilteredEtfs(etfs, prices, today, () => true)
}

export const calculateCurrentPortfolioValueForCountryAllocation = (
  etfs: Record<Isin, ETF>,
  prices: CurrentPrices,
  today: IsoDate,
) => {
  return calculateCurrentPortfolioValueForFilteredEtfs(
    etfs,
    prices,
    today,
    (etf) => etf.assetClass.category === "stocks",
  )
}

const calculateCurrentPortfolioValueForFilteredEtfs = (
  etfs: Record<Isin, ETF>,
  prices: CurrentPrices,
  today: IsoDate,
  filterFn: (etf: ETF) => boolean,
) => {
  const quantities = Object.values(etfs)
    .filter(filterFn)
    .reduce(
      (result, etf) => {
        result[etf.isin] = quantityAtDate(etf.transactions, today, etf.sip)
        return result
      },
      {} as Record<Isin, number> /*isin, quantity*/,
    )

  const value = Object.entries(quantities).reduce(
    (result, [isin, quantity]) => (result += (prices[isin]?.price || 0) * quantity),
    0,
  )

  return value
}

export const calculateCurrentEtfData = (
  etfs: Record<Isin, ETF>,
  prices: CurrentPrices,
  today: IsoDate,
) => {
  return Object.values(etfs).map((etf) => {
    const quantity = quantityAtDate(etf.transactions, today, etf.sip)
    return {
      name: etf.name,
      isin: etf.isin,
      assetClass: etf.assetClass.category,
      quantity,
      paidValue: etf.transactions.reduce(
        (sum, { quantity, price }) => (sum += quantity * price),
        0,
      ),
      currentValue: quantity * (prices[etf.isin]?.price || 0),
    }
  })
}

export const calculateCurrentValuesByCountry = (
  etfs: Record<Isin, ETF>,
  prices: CurrentPrices,
  today: IsoDate,
) => {
  const currentCountryValue = Object.values(etfs)
    .filter((etf) => etf.assetClass.category === "stocks")
    .reduce(
      (result, etf) => {
        const quantity = quantityAtDate(etf.transactions, today, etf.sip)
        Object.entries(etf.countries).forEach(([country, percentage]) => {
          result[country] =
            (result[country] || 0) + quantity * ((prices[etf.isin]?.price * percentage) / 100 || 0)
        })
        return result
      },
      {} as Record<Country, number>,
    )

  return currentCountryValue
}

export const calculateCurrentAssetClassAllocation = (
  etfs: Record<Isin, ETF>,
  prices: CurrentPrices,
  today: IsoDate,
  currentPortfolioValue: number,
) => {
  const currentAssetClassValue = Object.values(etfs).reduce(
    (result, etf) => {
      const quantity = quantityAtDate(etf.transactions, today, etf.sip)
      result[etf.assetClass.category] =
        (result[etf.assetClass.category] || 0) + quantity * (prices[etf.isin]?.price || 0)
      return result
    },
    {} as Record<AssetClassCategory, number>,
  )

  const currentAllocationByAssetClass = Object.entries(currentAssetClassValue).reduce(
    (result, [assetClass, value]) => {
      result[assetClass] = (value / currentPortfolioValue) * 100
      return result
    },
    {} as Record<AssetClassCategory, number>,
  )

  return currentAllocationByAssetClass
}


export const calculateCurrentValuesByAssetClass = (currentEtfData: {
  name: string;
  isin: string;
  assetClass: string;
  quantity: number;
  paidValue: number;
  currentValue: number;
}[]) => {
  return currentEtfData.reduce(
    (result, { assetClass, currentValue }) => {
      result[assetClass] = (result[assetClass] || 0) + currentValue
      return result
    },
    {} as Record<AssetClassCategory, number>,
  )
}

export const calculateCurrentCountryAllocation = (currentPortfolioValue: number, currentCountryValue: Record<string, number>) => {
  const currentAllocationByCountry = Object.entries(currentCountryValue).reduce(
    (result, [country, value]) => {
      result[country] = (value / currentPortfolioValue) * 100
      return result
    },
    {} as Record<Country, number>,
  )

  return currentAllocationByCountry
}

export const calculateCountryDriftData = (
  currentPortfolioValue: number,
  targetCountryAllocation: Record<string, number>,
  currentValueByCountry: Record<string, number>,
  currentPercentageByCountry: Record<string, number>,
) => {
  const drifts = Object.entries(targetCountryAllocation).map(([country, targetPercentage]) => {
    const percentageDelta = currentPercentageByCountry[country] - targetCountryAllocation[country]

    const driftPercentage = targetCountryAllocation[country]
      ? (percentageDelta / targetCountryAllocation[country]) * 100
      : 100

    return {
      country,
      currentValue: currentValueByCountry[country],
      targetAllocationPercentage: targetPercentage,
      driftAmount:
        currentValueByCountry[country] - (targetPercentage / 100) * currentPortfolioValue,
      percentage: Number(driftPercentage.toFixed(2)),
    }
  })

  const countriesInPortfolio = Object.keys(currentValueByCountry)

  const countiresInTarget = Object.keys(targetCountryAllocation)

  // if country is not in the target it is impossible to compensate the drift without selling it or changing the target
  const isItPossibleToCompensateWithBuyStrategy = countriesInPortfolio.every((key) =>
    countiresInTarget.includes(key),
  )

  // if country is not in the portfolio it is impossible to compensate the drift without buying it or changing the target
  const isItPossibleToCompensateWithSellStrategy = countiresInTarget.every((key) =>
    countriesInPortfolio.includes(key),
  )

  const sortedDrifts = drifts.toSorted((a, b) => a.driftAmount - b.driftAmount)
  const countryWithLowestDrift = sortedDrifts.at(0)
  const countryWithHighestDrift = sortedDrifts.at(-1)
  const newPorfolioValue_buyStrategy =
    isItPossibleToCompensateWithBuyStrategy && countryWithHighestDrift
      ? (countryWithHighestDrift.currentValue /
        countryWithHighestDrift.targetAllocationPercentage) *
      100
      : currentPortfolioValue

  const newPorfolioValue_sellStrategy = countryWithLowestDrift
    ? (countryWithLowestDrift.currentValue / countryWithLowestDrift.targetAllocationPercentage) *
    100
    : currentPortfolioValue

  return drifts.map(
    ({ country, currentValue, driftAmount, targetAllocationPercentage, percentage }) => ({
      country,
      driftAmount,
      percentage,
      amountToBuyToCompensate: isItPossibleToCompensateWithBuyStrategy
        ? Number(
          (
            (newPorfolioValue_buyStrategy / 100) * targetAllocationPercentage -
            currentValue
          ).toFixed(2),
        )
        : null,
      amountToSellToCompensate: isItPossibleToCompensateWithSellStrategy
        ? Number(
          (
            currentValue -
            (newPorfolioValue_sellStrategy / 100) * targetAllocationPercentage
          ).toFixed(2),
        )
        : null,
    }),
  )
}

export const calculateAssetClassColors = (targetAssetClasses: string[], etfs: Record<Isin, ETF>) => {
  const currentAssetClasses = Object.values(etfs).map(
    (etf) => etf.assetClass.category,
  )

  const assetClasses = [...new Set(targetAssetClasses.concat(currentAssetClasses))]

  const colors = assetClasses.reduce(
    (result, assetClass, index) => {
      result[assetClass] = `chart-${index + 1}`
      return result
    },
    {} as Record<AssetClassCategory, string>,
  )

  return colors
}

export const calculateCountryColors = (targetCountries: string[], etfs: Record<Isin, ETF>) => {
  const currentCountries = Object.values(etfs).flatMap((etf) =>
    Object.keys(etf.countries),
  )

  const countries = [...new Set(targetCountries.concat(currentCountries))]

  const colors = countries.reduce(
    (result, country, index) => {
      result[country] = `chart-${index + 1}`
      return result
    },
    {} as Record<AssetClassCategory, string>,
  )

  return colors
}