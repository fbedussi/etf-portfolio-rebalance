import { create } from "zustand"
import type { AssetClassCategory, Country, CurrentPrices, Isin, IsoDate, Portfolio } from "./model"
import { devtools } from "zustand/middleware"
import { useShallow } from "zustand/shallow"
import { createSelector } from "reselect"
import {
  calculateCurrentAssetClassAllocation,
  calculateCurrentEtfData,
  calculateCurrentPortfolioValue,
  calculateCurrentPortfolioValueForCountryAllocation,
  calculateCurrentValuesByCountry,
  calculatePortfolioCost,
  getDriftDataByAssetClass,
  pricesHistoryToMap,
} from "./lib/portfolio"
import dayjs from "dayjs"

type State = {
  portfolio: Portfolio | null
  prices: CurrentPrices
  refreshPrices?: boolean
}

export const useStore = create<State>()(
  devtools(() => ({
    portfolio: null,
    prices: {},
  })),
)

export const setPortfolio = (portfolio: Portfolio) => useStore.setState({ portfolio })

export const setEftQuantity = (isin: string, quantity: number) =>
  useStore.setState((state) => {
    return !state.portfolio?.etfs[isin]
      ? state
      : {
          portfolio: {
            ...state.portfolio,
            etfs: {
              ...state.portfolio?.etfs,
              [isin]: {
                ...state.portfolio?.etfs[isin],
                transactions:
                  state.portfolio?.etfs[isin].transactions.concat([
                    {
                      quantity,
                      price: state.prices[isin]?.price || 0,
                      date: new Date().toISOString(),
                    },
                  ]) || [],
              },
            },
          },
        }
  })

const selectPortfolio = (state: State) => state.portfolio

export const usePortfolio = () => useStore(selectPortfolio)

export const setPrice = (isin: string, price: number, history: { price: number; date: string }[]) =>
  useStore.setState((state) => ({
    prices: {
      ...state.prices,
      [isin]: {
        price,
        timestamp: new Date().toISOString(),
        history,
      },
    },
  }))

export const setRefreshPrices = (refreshPrices: boolean) => useStore.setState({ refreshPrices })

const selectTargetAssetClassAllocation = (state: State) =>
  state.portfolio?.targetAssetClassAllocation

const selectPrices = (state: State) => state.prices

export const usePrices = () => useStore(selectPrices)

export const usePortfolioName = () => useStore((state: State) => state.portfolio?.name || "")

const selectEtfs = createSelector(selectPortfolio, (portfolio) => portfolio?.etfs || {})

const selectPricesHistoryMap = createSelector(selectPrices, (prices) => {
  return Object.entries(prices).reduce(
    (result, [isin, price]) => {
      result[isin] = pricesHistoryToMap(price.history)
      return result
    },
    {} as Record<Isin, Record<IsoDate, number>>,
  )
})

const selectToday = () => dayjs().format("YYYY-MM-DD")

const selectCurrentPortfolioCost = createSelector(
  selectEtfs,
  selectPricesHistoryMap,
  selectToday,
  calculatePortfolioCost,
)

export const useCurrentPortfolioCost = () => useStore(selectCurrentPortfolioCost)

const selectCurrentPortfolioValue = createSelector(
  selectEtfs,
  selectPrices,
  selectToday,
  calculateCurrentPortfolioValue,
)

const selectCurrentPortfolioValueForCountryAllocation = createSelector(
  selectEtfs,
  selectPrices,
  selectToday,
  calculateCurrentPortfolioValueForCountryAllocation,
)

const selectCurrentPortfolioValueDate = createSelector(selectEtfs, selectPrices, (etfs, prices) => {
  const date = Object.values(etfs).reduce(
    (result, etf) => {
      const lastDateStr = prices[etf.isin]?.history.at(-1)?.date
      const lastDate = lastDateStr ? new Date(lastDateStr) : null

      return !result || (lastDate && lastDate > result) ? lastDate : result
    },
    null as null | Date,
  )
  return date
})

export const useCurrentPortfolioValue = () => useStore(selectCurrentPortfolioValue)

export const useCurrentPortfolioValueDate = () =>
  useStore(useShallow(selectCurrentPortfolioValueDate))

export const useMaxDrift = () => useStore((state: State) => state.portfolio?.maxDrift || 0)

const selectCurretEtfData = createSelector(
  selectEtfs,
  selectPrices,
  selectToday,
  calculateCurrentEtfData,
)

export const useCurrentEtfData = () => useStore(selectCurretEtfData)

const selectCurrentValuesByAssetClass = createSelector(selectCurretEtfData, (currentEtfData) => {
  return currentEtfData.reduce(
    (result, { assetClass, currentValue }) => {
      result[assetClass] = (result[assetClass] || 0) + currentValue
      return result
    },
    {} as Record<AssetClassCategory, number>,
  )
})

const selectDriftData = createSelector(
  selectTargetAssetClassAllocation,
  selectCurrentValuesByAssetClass,
  getDriftDataByAssetClass,
)

export const useDriftData = () => useStore(selectDriftData)

export const useTargetAssetClassAllocation = () =>
  useStore(useShallow((state: State) => state.portfolio?.targetAssetClassAllocation || {}))

const selectTargetCountryAllocation = createSelector(
  selectPortfolio,
  (portfolio) => portfolio?.targetCountryAllocation || {},
)

export const useTargetCountryAllocation = () => useStore(useShallow(selectTargetCountryAllocation))

const selectCurrentValuesByCountry = createSelector(
  selectEtfs,
  selectPrices,
  selectToday,
  calculateCurrentValuesByCountry,
)

const selectCurrentAssetClassAllocation = createSelector(
  selectEtfs,
  selectPrices,
  selectToday,
  selectCurrentPortfolioValue,
  calculateCurrentAssetClassAllocation,
)

const selectCurrentCountryAllocation = createSelector(
  selectCurrentPortfolioValueForCountryAllocation,
  selectCurrentValuesByCountry,
  (currentPortfolioValue, currentCountryValue) => {
    const currentAllocationByCountry = Object.entries(currentCountryValue).reduce(
      (result, [country, value]) => {
        result[country] = (value / currentPortfolioValue) * 100
        return result
      },
      {} as Record<Country, number>,
    )

    return currentAllocationByCountry
  },
)

export const useCurrentAssetClassAllocation = () =>
  useStore(useShallow(selectCurrentAssetClassAllocation))

export const useCurrentCountryAllocation = () =>
  useStore(useShallow(selectCurrentCountryAllocation))

const selectCountryDriftData = createSelector(
  selectCurrentPortfolioValueForCountryAllocation,
  selectTargetCountryAllocation,
  selectCurrentValuesByCountry,
  selectCurrentCountryAllocation,
  (
    currentPortfolioValue,
    targetCountryAllocation,
    currentValueByCountry,
    currentPercentageByCountry,
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
  },
)

export const useCountryDriftData = () => useStore(selectCountryDriftData)

export const useAssetClassColors = () =>
  useStore(
    useShallow((state: State) => {
      const targetAssetClasses = Object.keys(state.portfolio?.targetAssetClassAllocation || {})
      const currentAssetClasses = Object.values(state.portfolio?.etfs || {}).map(
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
    }),
  )

export const useCountryColors = () =>
  useStore(
    useShallow((state: State) => {
      const targetCountries = Object.keys(state.portfolio?.targetCountryAllocation || {})
      const currentCountries = Object.values(state.portfolio?.etfs || {}).flatMap((etf) =>
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
    }),
  )

export const useRefreshPrices = () => useStore((state: State) => state.refreshPrices)
