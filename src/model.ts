export type Isin = string

export type AssetClassCategory = string

export type IsoDate = string

export type Portfolio = {
  name: string
  targetAllocation: Record<AssetClassCategory, number> // category -> percentage
  etfs: Record<Isin, ETF>
}

export type ETF = {
  isin: string
  name: string
  assetClasses: AssetClass[]
  transactions: Transaction[]
}

export type AssetClass = {
  name: string // e.g., "US Large Cap"
  category: AssetClassCategory
  percentage: number // e.g., 60 (means 60%)
}

export type Transaction = {
  date: IsoDate
  quantity: number // positive = buy, negative = sell
  price: number // price per unit in portfolio currency
}

export type CurrentPrices = Record<Isin, {
  price: number
  timestamp: IsoDate
}> 