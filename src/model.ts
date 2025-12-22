export type Isin = string

export type AssetClassCategory = string

export type IsoDate = string

export type Portfolio = {
  name: string
  targetAllocation: Record<AssetClassCategory, number> // category -> percentage
  maxDrift: number // in percentage, e.g 10 means 10%
  etfs: Record<Isin, ETF>
}

export type ETF = {
  isin: string
  name: string
  assetClass: AssetClass
  transactions: Transaction[]
}

export type AssetClass = {
  name: string // e.g., "US Large Cap"
  category: AssetClassCategory
}

export type Transaction = {
  date: IsoDate
  quantity: number // positive = buy, negative = sell
  price: number // price per unit in portfolio currency
}

export type CurrentPrices = Record<Isin, {
  price: number
  timestamp: IsoDate
  history: {price: number, date: string}[]
}> 

export type ApiResponse = {
  intradayPoint: IntradayPoint[]
  status: number,
  entityID: string,
  view: string,
  sessionQuality: string,
  currency: string,
  accuracy: number,
  tickSizeRule: string,
  label: string,
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
