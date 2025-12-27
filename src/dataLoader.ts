import { useEffect, useMemo, useRef } from "react";
import * as Store from "./store";
import * as Cache from "./services/cacheService"
import * as Api from "./services/apiService"

const ONE_DAY = 24 * 60 * 60 * 1000

export function useLoadPortfolio() {
    const loadingPortfolio = useRef(false)

    useEffect(() => {
        if (loadingPortfolio.current) return

        loadingPortfolio.current = true

        Cache.getPortfolios().then(cachedPortfolios => {
            if (cachedPortfolios.length) {
                Store.setPortfolio(cachedPortfolios[0])
            } else {
                const demoPortfolio = {
                    name: 'Fra2',
                    targetAllocation: {
                        stocks: 50,
                        bonds: 50,
                    },
                    maxDrift: 10,
                    etfs: {
                        IE00B4L5Y983: {
                            isin: 'IE00B4L5Y983',
                            name: 'iShares Core MSCI World UCITS',
                            assetClass: {
                                name: "Global developed stocks markets",
                                category: "stocks",
                            },
                            transactions: [{
                                date: "2025-10-28",
                                quantity: 14,
                                price: 111,
                            }],
                        },
                        LU0478205379: {
                            isin: 'LU0478205379',
                            name: 'Xtrackers II EUR Corporate Bond UCITS ETF 1C',
                            assetClass: {
                                name: "Eur Corporate Bonds",
                                category: "bonds",
                            },
                            transactions: [{
                                date: "2024-11-15",
                                quantity: 15,
                                price: 163,
                            }],
                        }
                    },
                }
                Cache.savePortfolio(demoPortfolio)
                Store.setPortfolio(demoPortfolio)
            }
        })
    }, [])
}
export function useLoadPrices() {
    const portfolio = Store.usePortfolio()

    const isins = useMemo(() => Object.keys(portfolio?.etfs || {}), [portfolio])

    useEffect(() => {
        isins.forEach(async isin => {
            debugger
            const cachedData = await Cache.getCurrentPrices(isin)

            const handleError = (error: Error) => {
                // TODO: handle error in the store
                console.error(error)
                if (cachedData) {
                    Store.setPrice(isin, cachedData.price, cachedData.history)
                }
            }

            if (cachedData && (new Date(cachedData.timestamp).getTime() - Date.now() < ONE_DAY)) {
                Store.setPrice(isin, cachedData.price, cachedData.history)
            } else {
                const freshData = await Api.getPrices(isin)

                if ('error' in freshData) {
                    handleError(freshData.error)
                } else {
                    const history = freshData.data.intradayPoint.map(item => ({
                        price: item.endPx,
                        date: item.time,
                    }))

                    const lastPrice = history.at(-1)
                    if (!lastPrice) {
                        handleError(new Error(`No last price for ISIN ${isin}`))
                        return
                    }
                    
                    const timestamp = new Date().toISOString()
                    Cache.saveCurrentPrices({ [isin]: { price: lastPrice.price, timestamp, history } })
                    Store.setPrice(isin, lastPrice.price, history)
                }
            }
        })
    }, [isins])
}   