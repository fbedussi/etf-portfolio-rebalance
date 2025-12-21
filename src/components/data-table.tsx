import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Schema = {
  name: string,
  isin: string,
  assetClass: string,
  quantity: number,
  paidPrice: number,
  currentPrice: number
}

function Row({ row }: { row: Schema }) {
  const currentValue = row.currentPrice * row.quantity
  const valuePaid = row.paidPrice * row.quantity
  const currentValueProfit = currentValue - valuePaid
  return (
    <TableRow className="relative z-0">
      <TableCell>{row.name}</TableCell>
      <TableCell>{row.isin}</TableCell>
      <TableCell><Badge variant="outline" className={`text-white px-1.5 ${row.assetClass === 'stocks' ? 'bg-chart-2' : 'bg-chart-1'}`}>{row.assetClass}</Badge></TableCell>
      <TableCell>{row.quantity}</TableCell>
      <TableCell>{(valuePaid).toFixed(2)} €</TableCell>
      <TableCell>{(currentValue).toFixed(2)} €</TableCell>
      <TableCell><Badge variant="outline" className={`px-1.5 ${currentValueProfit > 0 ? 'bg-green-500' : 'bg-red-500 text-white'}`}>{(currentValueProfit).toFixed(2)} €</Badge></TableCell>
    </TableRow>
  )
}

const data = [
  {
    name: 'x-tracker MCI world',
    isin: '29218312983',
    assetClass: 'stocks',
    quantity: 14,
    paidPrice: 10,
    currentPrice: 9
  },
   {
    name: 'iShares corporate bond',
    isin: 'sdfs98fs09',
    assetClass: 'bonds',
    quantity: 140,
    paidPrice: 8,
    currentPrice: 11
  }
]

export function DataTable() {
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

