import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return `${(price).toFixed(2)} €`
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