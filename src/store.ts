import { create } from "zustand"
import type { CurrentPrices, ETF, Portfolio } from "./model"
import { devtools } from "zustand/middleware"
import { useShallow } from "zustand/shallow"
import { createSelector } from "reselect"
import {
  calculateAssetClassColors,
  calculateCountryColors,
  calculateCountryDriftData,
  calculateCurrentAssetClassAllocation,
  calculateCurrentCountryAllocation,
  calculateCurrentEtfData,
  calculateCurrentPortfolioValue,
  calculateCurrentPortfolioValueForCountryAllocation,
  calculateCurrentValuesByAssetClass,
  calculateCurrentValuesByCountry,
  calculatePortfolioCost,
  calculatePricesHistoryMap,
  getDriftDataByAssetClass,
} from "./lib/portfolio"
import dayjs from "dayjs"

type State = {
  portfolio: Portfolio | null
  prices: CurrentPrices
  refreshPrices?: boolean
  showOnlyRealTransactions: boolean
}

export const useStore = create<State>()(
  devtools(() => ({
    portfolio: null,
    prices: {},
    showOnlyRealTransactions: false,
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
                      date: dayjs().format("YYYY-MM-DD"),
                      type: "virtual",
                    },
                  ]) || [],
              },
            },
          },
        }
  })

const selectShowOnlyRealTransactions = (state: State) => state.showOnlyRealTransactions

const selectPortfolio = createSelector(
  selectShowOnlyRealTransactions,
  (state: State) => state.portfolio,
  (showOnlyRealTransactions, portfolio) => {
    if (showOnlyRealTransactions) {
      const clonedPortfolio = structuredClone(portfolio)
      Object.values(clonedPortfolio?.etfs || {}).forEach((etf) => {
        etf.transactions = etf.transactions.filter((transaction) => transaction.type === "real")
      })
      return clonedPortfolio
    } else {
      return portfolio
    }
  },
)

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

const selectPricesHistoryMap = createSelector(selectPrices, calculatePricesHistoryMap)

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
  selectPricesHistoryMap,
  selectToday,
  calculateCurrentEtfData,
)

export const useCurrentEtfData = () => useStore(selectCurretEtfData)

const selectCurrentValuesByAssetClass = createSelector(
  selectCurretEtfData,
  calculateCurrentValuesByAssetClass,
)

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
  calculateCurrentCountryAllocation,
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
  calculateCountryDriftData,
)

export const useCountryDriftData = () => useStore(selectCountryDriftData)

export const useAssetClassColors = () =>
  useStore(
    createSelector(
      (model) => Object.keys(model.portfolio?.targetAssetClassAllocation || {}),
      selectEtfs,
      calculateAssetClassColors,
    ),
  )

export const useCountryColors = () =>
  useStore(
    createSelector(
      (state: State) => Object.keys(state.portfolio?.targetCountryAllocation || {}),
      selectEtfs,
      calculateCountryColors,
    ),
  )

export const useRefreshPrices = () => useStore((state: State) => state.refreshPrices)

export const useThereAreVirtualTrasactions = () =>
  useStore((state: State) =>
    Object.values(state.portfolio?.etfs || {}).some((etf) =>
      etf.transactions.some((transaction) => transaction.type === "virtual"),
    ),
  )

export const setShowOnlyRealTransaction = (showOnlyRealTransactions: boolean) => {
  useStore.setState((state) => ({ ...state, showOnlyRealTransactions }))
}

export const useShowOnlyRealTransactions = () => useStore(selectShowOnlyRealTransactions)

export const deleteVirtualData = () => {
  useStore.setState(
    (state): State => ({
      ...state,
      portfolio: state?.portfolio
        ? {
            ...state.portfolio,
            etfs: Object.entries(state.portfolio.etfs).reduce(
              (result, [isin, etf]) => {
                result[isin] = {
                  ...etf,
                  transactions: etf.transactions.filter(
                    (transaction) => transaction.type === "real",
                  ),
                }
                return result
              },
              {} as Record<string, ETF>,
            ),
          }
        : null,
      showOnlyRealTransactions: false,
    }),
  )
}

export const useGetOrder = () =>
  useStore(
    createSelector(
      (state: State) => state.portfolio?.etfs,
      (etfs) => {
        return Object.entries(etfs || []).reduce(
          (result, [isin, etf]) => {
            const virtualTransactions = etf.transactions.filter(
              (transaction) => transaction.type === "virtual",
            )
            if (virtualTransactions.length) {
              result[isin] = {
                ...etf,
                transactions: virtualTransactions,
              }
            }
            return result
          },
          {} as Record<string, ETF>,
        )
      },
    ),
  )
