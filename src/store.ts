import { create } from 'zustand'
import type { AssetClassCategory, CurrentPrices, Portfolio } from './model'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

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

export const setPrice = (isin: string, price: number, history: {price: number, date: string}[]) => useStore.setState(state => ({
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

export const usePortfolio = () => useStore((state: State) => state.portfolio)

export const usePrices = () => useStore((state: State) => state.prices)

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

const selectCurrentDrift = (state: State) => {
    const currentPortfolioValue = selectCurrentPortfolioValue(state)
    const currentDriftByAssetClass = Object.entries(state.portfolio?.targetAllocation || {}).reduce((result, [assetClass, percentage]) => {
        const targetAssetClassValue = currentPortfolioValue * percentage / 100
        const currentAssetClassValue = Object.values(state.portfolio?.etfs || {})
            .filter(etf => etf.assetClass.category === assetClass)
            .map(etf => {
                const quantity = etf.transactions.reduce((sum, { quantity }) => sum += quantity, 0)
                return quantity * (state.prices[etf.isin]?.price || 0)
            })
            .reduce((sum, price) => sum += price, 0)
        result[assetClass] = (currentAssetClassValue - targetAssetClassValue) / targetAssetClassValue * 100
        return result
    }, {} as Record<AssetClassCategory, number>)

    return currentDriftByAssetClass
}

export const useCurrentDrift = () => useStore(useShallow(selectCurrentDrift))

export const useTargetAllocation = () => useStore(useShallow((state: State) => state.portfolio?.targetAllocation || {}))

const selectCurrentAllocation = (state: State) => {
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

export const useCurrentAllocation = () => useStore(useShallow(selectCurrentAllocation))

export const useAssetClassColors = () => useStore(useShallow((state: State) => {
    const targetAssetClasses = Object.keys(state.portfolio?.targetAllocation || {})
    const currentAssetClasses = Object.values(state.portfolio?.etfs || {}).map(etf => etf.assetClass.category)

    const assetClasses = [...new Set(targetAssetClasses.concat(currentAssetClasses))]

    const colors = assetClasses.reduce((result, assetClass, index) => {
        result[assetClass] = `chart-${index + 1}`
        return result
    }, {} as Record<AssetClassCategory, string>)

    return colors
}))

export const useRefreshPrices = () => useStore((state: State) => state.refreshPrices)