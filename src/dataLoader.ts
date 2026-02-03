import { useEffect, useMemo, useRef } from "react"
import * as Store from "./store"
import * as Cache from "./services/cacheService"
import * as Api from "./services/apiService"
import { convertDt } from "./lib/utils"
import type { CurrentPrice } from "./model"

const ONE_DAY = 24 * 60 * 60 * 1000

export function useLoadPortfolio() {
  const loadingPortfolio = useRef(false)

  useEffect(() => {
    if (loadingPortfolio.current) return

    loadingPortfolio.current = true

    Cache.getPortfolios().then((cachedPortfolios) => {
      if (cachedPortfolios.length) {
        Store.setPortfolio(cachedPortfolios[0])
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

    isins.forEach(async (isin) => {
      const cachedData = refreshPrices ? await Cache.getCurrentPrices(isin) : undefined

      if (
        !refreshPrices &&
        cachedData &&
        Date.now() - new Date(cachedData.timestamp).getTime() < ONE_DAY
      ) {
        Store.setPrice(isin, cachedData.price, cachedData.history)
      } else {
        if (portfolio?.etfs[isin].dataSource === "borsaitaliana") {
          fetchPricesFromBorsaItaliana(isin, cachedData)
        } else {
          fetchPricesFromJustEtf(isin, cachedData)
        }

        Store.setRefreshPrices(false)
      }
    })
  }, [isins, refreshPrices, portfolio?.etfs])
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

  if ("error" in freshData) {
    handleError(isin, cachedData, freshData.error)
  } else {
    const history = freshData.data.history.historyDt.map((item) => ({
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

  if ("error" in freshData) {
    handleError(isin, cachedData, freshData.error)
  } else {
    const history = freshData.data.series.map((item) => ({
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
