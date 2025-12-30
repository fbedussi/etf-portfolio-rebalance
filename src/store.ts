import { create } from 'zustand'
import type { AssetClassCategory, CurrentPrices, Portfolio } from './model'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import { createSelector } from "reselect";

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

const selectPortfolio = (state: State) => state.portfolio

export const usePortfolio = () => useStore(selectPortfolio)

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

const selectCurrentDrift = createSelector([selectPortfolio, selectPrices, selectCurrentPortfolioValue], (portfolio, prices, currentPortfolioValue) => {
    const currentDriftByAssetClass = Object.entries(portfolio?.targetAllocation || {}).reduce((result, [assetClass, percentage]) => {
        const targetAssetClassValue = currentPortfolioValue * percentage / 100
        const currentAssetClassValue = Object.values(portfolio?.etfs || {})
            .filter(etf => etf.assetClass.category === assetClass)
            .map(etf => {
                const quantity = etf.transactions.reduce((sum, { quantity }) => sum += quantity, 0)
                return quantity * (prices[etf.isin]?.price || 0)
            })
            .reduce((sum, price) => sum += price, 0)
        const amount = currentAssetClassValue - targetAssetClassValue
        result.push({ assetClass, amount, percentage: amount / targetAssetClassValue * 100 })
        return result
    }, [] as { assetClass: AssetClassCategory, amount: number, percentage: number }[])

    const amountToReallocate = currentDriftByAssetClass.reduce((result, { amount }) => amount < 0 ? result + Math.abs(amount) : result, 0)

    const assetClassToBuy = currentDriftByAssetClass
        .filter(({ amount }) => amount < 0)
        .toSorted((a, b) => a.percentage - b.percentage)
        .map(({ assetClass }) => assetClass)

    const assetClassToBuyWithRatio = assetClassToBuy.map((assetClass, index) => ({
        assetClass,
        ratio: index === 0 ? 1 : (portfolio?.targetAllocation[assetClass] || 1) / (portfolio?.targetAllocation?.[assetClassToBuy[0]] || 1)
    }))

    const parts = assetClassToBuyWithRatio.reduce((result, {ratio}) => result + ratio, 0)
    return currentDriftByAssetClass.map(({assetClass, amount, percentage}) => {
        const amountExternal =  amount > 0 ? 0 : Math.abs(amount) + (amountToReallocate / (parts || 1) * (assetClassToBuyWithRatio.find(acwr => acwr.assetClass === assetClass)?.ratio || 1))
        
        return {
        assetClass,
        amount,
        percentage,
        amountExternal,
    }})
})

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