export type Isin = string

export type AssetClassCategory = string

export type Country = string

export type IsoDate = string // ISO 8601 format (YYYY-MM-DD)

export type Portfolio = {
  _id: string
  name: string
  targetAssetClassAllocation: Record<AssetClassCategory, number> // category -> percentage
  targetCountryAllocation: Record<Country, number> // country -> percentage
  maxDrift: number // in percentage, e.g 10 means 10%
  etfs: Record<Isin, ETF>
}

export type ETF = {
  dataSource: 'borsaitaliana' | 'justetf'
  isin: string
  name: string
  assetClass: AssetClass
  countries: Record<Country, number> // country -> percentage
  transactions: Transaction[]
  sip?: SIP
}

export   type AssetClass = {
  name: string // e.g., "US Large Cap"
  category: AssetClassCategory
}

export type Transaction = {
  date: IsoDate
  quantity: number // positive = buy, negative = sell
  price: number // price per unit in portfolio currency
}

export type CurrentPrices = Record<Isin, CurrentPrice>

export type CurrentPrice = {
  price: number
  timestamp: IsoDate
  history: { price: number, date: string }[]
}

export type ApiResponse<T> = { data: T } | { error: Error }

export type PricesApiResponse = {
  transco: {
    code: string
    codification: string
    exchCode: string
  }
  history: History
  status: number,
  entityID: string,
  view: string,
  beginningDate: string,
  endingDate: string,
  period: string,
  tickSizeRule: string,
  adjustement: boolean,
  addDayLastPrice: boolean
}

export type History = {
  historyDt: {
    dt: string // e.g., "20251208"
    openPx: number
    closePx: number
    highPx: number
    lowPx: number
    lastPx: number
    qty: number
    volNbTrade: number
    volCap: number
    setPx: number
    tickSizeRule: string
    vwap: number
  }[]
  accuracy: number
  currency: string
  instrType: string
}

export type IntradayPoint = {
  time: string, //"20251208-09:10:00"
  nbTrade: number,
  beginPx: number,
  beginTime: string, //"09:10:43"
  endPx: number,
  endTime: string, //"09:10:43"
  highPx: number,
  lowPx: number,
  beginAskPx: number,
  endAskPx: number,
  highAskPx: number,
  lowAskPx: number,
  beginBidPx: number,
  endBidPx: number,
  highBidPx: number,
  lowBidPx: number,
  vol: number,
  amt: number,
  previousClosingPx: number,
  previousClosingDt: string, //"20251205"
  previousSettlementPx: number,
  previousSettlementDt: string, //"20251205
}

export type PricesApiResponseJustEtf = {
  latestQuote: {
    raw: number,
    localized: string
  },
  latestQuoteDate: string,
  price: {
    raw: number,
    localized: string
  },
  performance: {
    raw: number,
    localized: string
  },
  prevDaySeries: {
    date: string,
    value: {
      raw: number,
      localized: string
    }
  }[],
  series: {
    date: string,
    value: {
      raw: number,
      localized: string
    }
  }[],
}

export type SIP = {
  quantity: number
  dayOfMonth: number
  frequency: number // in months: 12 = monthly, 6 = bi-monthly, 3 = quarterly, 1 = yearly
  startDate: string // ISO date
}