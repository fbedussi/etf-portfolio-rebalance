import { create } from 'zustand'
import type { AssetClassCategory, Country, CurrentPrices, Portfolio } from './model'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import { createSelector } from "reselect";
import { getDriftDataByAssetClass } from './lib/portfolio';

type State = {
    portfolio: Portfolio | null
    prices: CurrentPrices
    refreshPrices?: boolean
}

export const useStore = create<State>()(devtools(() => ({
    portfolio: null,
    prices: {},
})))

export const setPortfolio = (portfolio: Portfolio) => useStore.setState({ portfolio })

export const setEftQuantity = (isin: string, quantity: number) => useStore.setState(state => {
    return !state.portfolio?.etfs[isin]
        ? state
        : {
        portfolio: {
            ...state.portfolio,
            etfs: {
                ...state.portfolio?.etfs,
                [isin]: {
                    ...state.portfolio?.etfs[isin],
                    transactions: state.portfolio?.etfs[isin].transactions.concat([{
                        quantity,
                        price: state.prices[isin]?.price || 0,
                        date: new Date().toISOString(),
                    }]) || []
                },
            }
        }
    }
})

const selectPortfolio = (state: State) => state.portfolio

export const usePortfolio = () => useStore(selectPortfolio)

export const setPrice = (isin: string, price: number, history: { price: number, date: string }[]) => useStore.setState(state => ({
    prices: {
        ...state.prices,
        [isin]: {
            price,
            timestamp: new Date().toISOString(),
            history,
        },
    }
}))

export const setRefreshPrices = (refreshPrices: boolean) => useStore.setState({ refreshPrices })

const selectTargetAssetClassAllocation = (state: State) => state.portfolio?.targetAssetClassAllocation

const selectPrices = (state: State) => state.prices

export const usePrices = () => useStore(selectPrices)

export const usePortfolioName = () => useStore((state: State) => state.portfolio?.name || '')

export const useCurrentPortfolioCost = () => useStore((state: State) => {
    const quantities = Object.values(state.portfolio?.etfs || {}).reduce((result, etf) => {
        result[etf.isin] = etf.transactions.reduce((cost, transaction) => cost + transaction.quantity * transaction.price, 0)
        return result
    }, {} as Record<string, number>/*isin, cost*/)

    const value = Object.values(quantities).reduce((result, cost) => result += cost, 0)

    return value
})

const selectCurrentPortfolioValue = (state: State) => {
    const quantities = Object.values(state.portfolio?.etfs || {}).reduce((result, etf) => {
        result[etf.isin] = etf.transactions.reduce((quantity, transaction) => quantity + transaction.quantity, 0)
        return result
    }, {} as Record<string, number>/*isin, quantity*/)

    const value = Object.entries(quantities).reduce((result, [isin, quantity]) => result += (state.prices[isin]?.price || 0) * quantity, 0)

    return value
}

const selectCurrentPortfolioValueForCountryAllocation = (state: State) => {
    const quantities = Object.values(state.portfolio?.etfs || {})
        .filter(etf => etf.assetClass.category === 'stocks')
        .reduce((result, etf) => {
            result[etf.isin] = etf.transactions.reduce((quantity, transaction) => quantity + transaction.quantity, 0)
            return result
        }, {} as Record<string, number>/*isin, quantity*/)

    const value = Object.entries(quantities).reduce((result, [isin, quantity]) => result += (state.prices[isin]?.price || 0) * quantity, 0)

    return value
}



const selectCurrentPortfolioValueDate = (state: State) => {
    const date = Object.values(state.portfolio?.etfs || {}).reduce((result, etf) => {
        const lastDateStr = state.prices[etf.isin]?.history.at(-1)?.date
        const lastDate = lastDateStr ? new Date(lastDateStr) : null

        return !result || (lastDate && lastDate > result) ? lastDate : result
    }, null as null | Date)
    return date
}

export const useCurrentPortfolioValue = () => useStore(selectCurrentPortfolioValue)

export const useCurrentPortfolioValueDate = () => useStore(useShallow(selectCurrentPortfolioValueDate))


export const useMaxDrift = () => useStore((state: State) => state.portfolio?.maxDrift || 0)

const selectCurretEtfData = createSelector(selectPortfolio, selectPrices, (portfolio, prices) => {
    return (Object.values(portfolio?.etfs || {})).map(etf => {
        const quantity = etf.transactions.reduce((sum, { quantity }) => sum += quantity, 0)
        return {
            name: etf.name,
            isin: etf.isin,
            assetClass: etf.assetClass.category,
            quantity,
            paidValue: etf.transactions.reduce((sum, { quantity, price }) => sum += quantity * price, 0),
            currentValue: quantity * (prices[etf.isin]?.price || 0)
        }
    })
})

export const useCurrentEtfData = () => useStore(selectCurretEtfData)

const selectCurrentValuesByAssetClass = createSelector(selectCurretEtfData, currentEtfData => {
    return currentEtfData.reduce((result, { assetClass, currentValue }) => {
        result[assetClass] = (result[assetClass] || 0) + currentValue
        return result
    }, {} as Record<AssetClassCategory, number>)
})

const selectDriftData = createSelector(selectTargetAssetClassAllocation, selectCurrentValuesByAssetClass, getDriftDataByAssetClass)

export const useDriftData = () => useStore(selectDriftData)

export const useTargetAssetClassAllocation = () => useStore(useShallow((state: State) => state.portfolio?.targetAssetClassAllocation || {}))

export const useTargetCountryAllocation = () => useStore(useShallow((state: State) => state.portfolio?.targetCountryAllocation || {}))

const selectCurrentAssetClassAllocation = (state: State) => {
    const currentPortfolioValue = selectCurrentPortfolioValue(state)
    const currentAssetClassValue = Object.values(state.portfolio?.etfs || {})
        .reduce((result, etf) => {
            const quantity = etf.transactions.reduce((sum, { quantity }) => sum += quantity, 0)
            result[etf.assetClass.category] = (result[etf.assetClass.category] || 0) + quantity * (state.prices[etf.isin]?.price || 0)
            return result
        }, {} as Record<AssetClassCategory, number>)

    const currentAllocationByAssetClass = Object.entries(currentAssetClassValue).reduce((result, [assetClass, value]) => {
        result[assetClass] = value / currentPortfolioValue * 100
        return result
    }, {} as Record<AssetClassCategory, number>)

    return currentAllocationByAssetClass
}

const selectCurrentCountryAllocation = (state: State) => {
    const currentPortfolioValue = selectCurrentPortfolioValueForCountryAllocation(state)
    const currentCountryValue = Object.values(state.portfolio?.etfs || {})
        .filter(etf => etf.assetClass.category === 'stocks')
        .reduce((result, etf) => {
            const quantity = etf.transactions.reduce((sum, { quantity }) => sum += quantity, 0)
            Object.entries(etf.countries).forEach(([country, percentage]) => {
                result[country] = (result[country] || 0) + quantity * (state.prices[etf.isin]?.price * percentage / 100 || 0)
            })
            return result
        }, {} as Record<Country, number>)

    const currentAllocationByCountry = Object.entries(currentCountryValue).reduce((result, [country, value]) => {
        result[country] = value / currentPortfolioValue * 100
        return result
    }, {} as Record<Country, number>)

    return currentAllocationByCountry
}

export const useCurrentAssetClassAllocation = () => useStore(useShallow(selectCurrentAssetClassAllocation))

export const useCurrentCountryAllocation = () => useStore(useShallow(selectCurrentCountryAllocation))

export const useAssetClassColors = () => useStore(useShallow((state: State) => {
    const targetAssetClasses = Object.keys(state.portfolio?.targetAssetClassAllocation || {})
    const currentAssetClasses = Object.values(state.portfolio?.etfs || {}).map(etf => etf.assetClass.category)

    const assetClasses = [...new Set(targetAssetClasses.concat(currentAssetClasses))]

    const colors = assetClasses.reduce((result, assetClass, index) => {
        result[assetClass] = `chart-${index + 1}`
        return result
    }, {} as Record<AssetClassCategory, string>)

    return colors
}))

export const useCountryColors = () => useStore(useShallow((state: State) => {
    const targetCountries = Object.keys(state.portfolio?.targetCountryAllocation || {})
    const currentCountries = Object.values(state.portfolio?.etfs || {}).flatMap(etf => Object.keys(etf.countries))

    const countries = [...new Set(targetCountries.concat(currentCountries))]

    const colors = countries.reduce((result, country, index) => {
        result[country] = `chart-${index + 1}`
        return result
    }, {} as Record<AssetClassCategory, string>)

    return colors
}))

export const useRefreshPrices = () => useStore((state: State) => state.refreshPrices)