export type Portfolio = {
  name: string;
  targetAllocation: Record<string, number>; // category -> percentage
  etfs: Record<string, ETF>;
}

export type ETF = {
  isin: string;
  name: string;
  assetClasses: AssetClass[];
  transactions: Transaction[];
}

export type AssetClass = {
  name: string; // e.g., "US Large Cap"
  category: string; // e.g., "Stocks"
  percentage: number; // e.g., 60 (means 60%)
}

export type Transaction = {
  date: string; // ISO 8601: "2024-01-15"
  quantity: number; // positive = buy, negative = sell
  price: number; // price per unit in portfolio currency
}