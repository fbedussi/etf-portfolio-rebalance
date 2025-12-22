import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const moneyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
})
export function formatMoney(price: number) {
  return moneyFormatter.format(price)
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