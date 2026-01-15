import { useEffect, useMemo, useRef } from "react";
import * as Store from "./store";
import * as Cache from "./services/cacheService"
import * as Api from "./services/apiService"
import { convertDt } from "./lib/utils";
import type { CurrentPrice, Portfolio } from "./model";

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
                const demoPortfolio: Portfolio = {
                    _id: 'demo-portfolio-1',
                    name: 'Fra2',
                    targetAssetClassAllocation: {
                        stocks: 50,
                        bonds: 45,
                        // corporateBonds: 20,
                        // governmentBonds: 25,
                        gold: 5
                    },
                    targetCountryAllocation: {
                        'US': 50,
                        'others': 50,
                    },
                    maxDrift: 10,
                    etfs: {
                        IE00B4L5Y983: {
                            dataSource: 'borsaitaliana',
                            isin: 'IE00B4L5Y983',
                            name: 'iShares Core MSCI World UCITS',
                            assetClass: {
                                name: "Global developed stocks markets",
                                category: "stocks",
                            },
                            countries: {
                                'US': 68.96,
                                'others': 31.04,
                            },
                            transactions: [{
                                date: "2025-10-28",
                                quantity: 14,
                                price: 111,
                            }],
                        },
                        LU0478205379: {
                            dataSource: 'borsaitaliana',
                            isin: 'LU0478205379',
                            name: 'Xtrackers II EUR Corporate Bond UCITS ETF 1C',
                            assetClass: {
                                name: "Eur Corporate Bonds",
                                // category: "corporateBonds",
                                category: "bonds",
                            },
                            countries: {
                                'US': 15.33,
                                'others': 84.67,
                            },
                            transactions: [{
                                date: "2025-11-15",
                                quantity: 15,
                                price: 163,
                            }],
                        },
                        IE0006WW1TQ4: {
                            dataSource: 'borsaitaliana',
                            isin: 'IE0006WW1TQ4',
                            name: 'Xtrackers MSCI World ex USA UCITS ETF 1C',
                            assetClass: {
                                name: "Azioni mercati sviluppati escluso USA",
                                category: "stocks",
                            },
                            countries: {
                                'others': 100,
                            },
                            transactions: [{
                                date: "2025-12-01",
                                quantity: 21,
                                price: 36.36,
                            }],
                        },
                        XS2852999775: {
                            dataSource: 'justetf',
                            isin: 'XS2852999775',
                            name: 'IncomeShares Gold+ Yield ETP',
                            assetClass: {
                                name: "Oro",
                                category: "gold",
                            },
                            countries: {},
                            transactions: [{
                                date: "2025-15-01",
                                quantity: 1,
                                price: 13.75,
                            }],
                        },
                    }
                }
                Cache.savePortfolio(demoPortfolio)
                Store.setPortfolio(demoPortfolio)
            }
        })
    }, [])
}
export function useLoadPrices() {
    const portfolio = Store.usePortfolio()
    const refreshPrices = Store.useRefreshPrices()

    const isins = useMemo(() => Object.keys(portfolio?.etfs || {}), [portfolio])

    useEffect(() => {
        if (refreshPrices === false) {
            // refreshPrices is undefined when the component is mounted
            // true when the user clicks the refresh button
            // false after the prices have been refreshed
            return
        }

        isins.forEach(async isin => {
            const cachedData = refreshPrices ? await Cache.getCurrentPrices(isin) : undefined

            if (!refreshPrices && cachedData && (Date.now() - new Date(cachedData.timestamp).getTime() < ONE_DAY)) {
                Store.setPrice(isin, cachedData.price, cachedData.history)
            } else {
                if (portfolio?.etfs[isin].dataSource === 'borsaitaliana') {
                    fetchPricesFromBorsaItaliana(isin, cachedData)
                } else {
                    fetchPricesFromJustEtf(isin, cachedData)
                }


                Store.setRefreshPrices(false)
            }
        })
    }, [isins, refreshPrices])
}

function handleError(isin: string, cachedData: CurrentPrice | undefined, error: Error) {
    // TODO: handle error in the store
    console.error(error)
    if (cachedData) {
        Store.setPrice(isin, cachedData.price, cachedData.history)
    }
}

async function fetchPricesFromBorsaItaliana(isin: string, cachedData?: CurrentPrice) {
    const freshData = await Api.getPricesBorsaItaliana(isin)

    if ('error' in freshData) {
        handleError(isin, cachedData, freshData.error)
    } else {
        const history = freshData.data.history.historyDt.map(item => ({
            price: item.closePx,
            date: convertDt(item.dt),
        }))

        const lastPrice = history.at(-1)
        if (!lastPrice) {
            handleError(isin, cachedData, new Error(`No last price for ISIN ${isin}`))
            return
        }

        const timestamp = new Date().toISOString()
        Cache.saveCurrentPrices({ [isin]: { price: lastPrice.price, timestamp, history } })
        Store.setPrice(isin, lastPrice.price, history)
    }
}

async function fetchPricesFromJustEtf(isin: string, cachedData?: CurrentPrice) {
    const freshData = await Api.getPricesJustEtf(isin)

    if ('error' in freshData) {
        handleError(isin, cachedData, freshData.error)
    } else {
        const history = freshData.data.series.map(item => ({
            price: item.value.raw,
            date: item.date,
        }))

        const lastPrice = history.at(-1)
        if (!lastPrice) {
            handleError(isin, cachedData, new Error(`No last price for ISIN ${isin}`))
            return
        }

        const timestamp = new Date().toISOString()
        Cache.saveCurrentPrices({ [isin]: { price: lastPrice.price, timestamp, history } })
        Store.setPrice(isin, lastPrice.price, history)
    }
}