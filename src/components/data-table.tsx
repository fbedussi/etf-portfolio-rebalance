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
import { setEftQuantity, useAssetClassColors, useCurrentEtfData } from "@/store"
import { Input } from "./ui/input"


function Row({ name, isin, assetClass, quantity, paidValue, currentValue }: {
  name: string,
  isin: string,
  assetClass: string,
  quantity: number,
  paidValue: number,
  currentValue: number
}) {
  const colors = useAssetClassColors()

  const currentValueProfit = currentValue - paidValue

  let color = colors[assetClass]

  return (
    <TableRow className="relative z-0">
      <TableCell><a href={`https://www.borsaitaliana.it/borsa/etf/scheda/${isin}.html?lang=it`} target='_blank'>{name}</a></TableCell>
      <TableCell>{isin}</TableCell>
      <TableCell><Badge variant="outline" className={['text-white', 'px-1.5', color === 'chart-1' && 'bg-chart-1', color === 'chart-2' && 'bg-chart-2'].join(' ')}>{assetClassCategoryToString(assetClass)}</Badge></TableCell>
      <TableCell><Input value={quantity} onChange={(e) => setEftQuantity(isin, Number(e.target.value) - quantity)} type="number" step={1} /></TableCell>
      <TableCell>{formatMoney(paidValue)}</TableCell>
      <TableCell>{formatMoney(currentValue)}</TableCell>
      <TableCell><Badge variant="outline" className={`px-1.5 ${currentValueProfit > 0 ? 'bg-green-500' : 'bg-red-500 text-white'}`}>{(currentValueProfit).toFixed(2)} €</Badge></TableCell>
    </TableRow>
  )
}

export function DataTable() {
  const data = useCurrentEtfData()

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
                <Row key={row.isin} {...row} />
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

