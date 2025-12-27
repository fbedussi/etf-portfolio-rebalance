import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { assetClassCategoryToString, formatMoney } from "@/lib/utils"
import { useAssetClassColoros, usePortfolio, usePrices } from "@/store"

type Schema = {
  name: string,
  isin: string,
  assetClass: string,
  quantity: number,
  paidPrice: number,
  currentPrice: number
}

function Row({ row }: { row: Schema }) {
  const colors = useAssetClassColoros()

  const currentValue = row.currentPrice * row.quantity
  const valuePaid = row.paidPrice * row.quantity
  const currentValueProfit = currentValue - valuePaid

  return (
    <TableRow className="relative z-0">
      <TableCell><a href={`https://www.borsaitaliana.it/borsa/etf/scheda/${row.isin}.html?lang=it`} target='_blank'>{row.name}</a></TableCell>
      <TableCell>{row.isin}</TableCell>
      <TableCell><Badge variant="outline" className={`text-white px-1.5 bg-${colors[row.assetClass]}`}>{assetClassCategoryToString(row.assetClass)}</Badge></TableCell>
      <TableCell>{row.quantity}</TableCell>
      <TableCell>{formatMoney(valuePaid)}</TableCell>
      <TableCell>{formatMoney(currentValue)}</TableCell>
      <TableCell><Badge variant="outline" className={`px-1.5 ${currentValueProfit > 0 ? 'bg-green-500' : 'bg-red-500 text-white'}`}>{(currentValueProfit).toFixed(2)} €</Badge></TableCell>
    </TableRow>
  )
}

export function DataTable() {
  const portfolio = usePortfolio()
  const prices = usePrices()

  const data = (Object.values(portfolio?.etfs || {})).map(etf => {
    const quantity = etf.transactions.reduce((sum, { quantity }) => sum += quantity, 0)
    return {
      name: etf.name,
      isin: etf.isin,
      assetClass: etf.assetClass.category,
      quantity,
      paidPrice: etf.transactions.reduce((sum, { quantity, price }) => sum += quantity * price, 0),
      currentPrice: quantity * (prices[etf.isin]?.price || 0)
    }
  })

  return (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Isin</TableHead>
              <TableHead>Asset class</TableHead>
              <TableHead>Quantità</TableHead>
              <TableHead>Valore acquisto</TableHead>
              <TableHead>Valore corrente</TableHead>
              <TableHead>Profit/Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {data.length ? (
              data.map((row) => (
                <Row key={row.isin} row={row} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

