import type { ETF, Isin, Portfolio } from "../model.ts";
import yamlParser from 'js-yaml'
import * as z from "zod";

const AssetClassSchema = z.object({
  name: z.string(),
  category: z.string()
})

const TransactionSchema = z.object({
  date: z.string(),
  quantity: z.number(),
  price: z.number()
})

const SIPSchema = z.object({
  quantity: z.number(),
  frequency: z.number(), // in months: 12 = monthly, 6 = bi-monthly, 3 = quarterly, 1 = yearly
  startDate: z.string() // ISO date
})

const ETFSchema = z.object({
  dataSource: z.enum(["borsaitaliana", "justetf"]).optional(),
  name: z.string(),
  assetClass: AssetClassSchema,
  countries: z.record(z.string(), z.number()).optional(),
  transactions: z.array(TransactionSchema).optional(),
  sip: SIPSchema.optional()
})

const PortfolioSchema = z.object({
  name: z.string(),
  targetAssetClassAllocation: z.record(z.string(), z.number()),
  targetCountryAllocation: z.record(z.string(), z.number()),
  maxDrift: z.number(),
  etfs: z.record(z.string(), ETFSchema)
});

export async function parseFile(file: File): Promise<Portfolio> {
  const fileText = await file.text()

  if (!fileText) {
    throw new Error("The file is empty")
  }

  const result = yamlParser.load(fileText)
  const parsed = PortfolioSchema.parse(result)

  return {
    ...parsed,
    _id: crypto.randomUUID(),
    etfs: Object.entries(parsed.etfs).reduce((result, [isin, etf]) => {
      result[isin] = {
        ...etf,
        transactions: etf.transactions ?? [],
        isin,
        dataSource: etf.dataSource ?? "borsaitaliana",
        countries: etf.countries ?? {},
      }
      return result
    }, {} as Record<Isin, ETF>)
  }
}