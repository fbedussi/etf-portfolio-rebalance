import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const moneyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
})
export function formatMoney(price: number) {
  return moneyFormatter.format(price)
}

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "short",
})
export function formatDate(date: Date) {
  return dateFormatter.format(date)
}

export function assetClassCategoryToString(assetClassCategory: string) {
  switch (assetClassCategory) {
    case "stocks":
      return "azioni"
    case "bonds":
      return "obbligazioni"
    default:
      return assetClassCategory
  }
}

/**
 * Converts a date string in the format "YYYYMMDD" to a date string in the format "YYYY-MM-DD".
 */
export function convertDt(dt: string) {
  const [part1] = dt.split("-")
  const year = part1.substring(0, 4)
  const month = part1.substring(4, 6)
  const day = part1.substring(6, 8)
  const isoDate = `${year}-${month}-${day}`
  return isoDate
}
