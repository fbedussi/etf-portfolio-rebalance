import {
  deleteVirtualData,
  useAssetClassColors,
  useGetOrder,
  useThereAreVirtualTrasactions,
} from "@/store"
import { Button } from "./ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { assetClassCategoryToString, formatMoney } from "@/lib/utils"

export function VirtualDataToolbox() {
  const thereAreVirtualTransactios = useThereAreVirtualTrasactions()
  const order = useGetOrder()
  const data = Object.values(order).map((etf) => ({
    isin: etf.isin,
    name: etf.name,
    assetClass: etf.assetClass.category,
    quantity: etf.transactions.reduce((result, transaction) => transaction.quantity + result, 0),
    value: etf.transactions.reduce(
      (result, transaction) => transaction.price * transaction.quantity + result,
      0,
    ),
  }))

  return thereAreVirtualTransactios ? (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead colSpan={5}>Ordine di acquisto/vendita</TableHead>
            </TableRow>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Isin</TableHead>
              <TableHead>Asset class</TableHead>
              <TableHead>Quantità</TableHead>
              <TableHead>Valore</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {data.length ? (
              data.map((row) => <Row key={row.isin} {...row} />)
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="p-3">
          <Button onClick={() => deleteVirtualData()}>Cancella dati virtuali</Button>
        </div>
      </div>
    </div>
  ) : null
}

function Row({
  name,
  isin,
  assetClass,
  quantity,
  value,
}: {
  name: string
  isin: string
  assetClass: string
  quantity: number
  value: number
}) {
  const colors = useAssetClassColors()

  const color = colors[assetClass]

  const colorToClass: Record<string, string> = {
    "chart-1": "bg-chart-1",
    "chart-2": "bg-chart-2",
    "chart-3": "bg-chart-3",
    "chart-4": "bg-chart-4",
    "chart-5": "bg-chart-5",
    "chart-6": "bg-chart-6",
    "chart-7": "bg-chart-7",
    "chart-8": "bg-chart-8",
    "chart-9": "bg-chart-9",
    "chart-10": "bg-chart-10",
  }

  return (
    <TableRow className="relative z-0">
      <TableCell>
        <a
          href={`https://www.borsaitaliana.it/borsa/etf/scheda/${isin}.html?lang=it`}
          target="_blank"
        >
          {name}
        </a>
      </TableCell>
      <TableCell>{isin}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={["text-white", "px-1.5", colorToClass[color]].join(" ")}
        >
          {assetClassCategoryToString(assetClass)}
        </Badge>
      </TableCell>
      <TableCell>{quantity}</TableCell>
      <TableCell>{formatMoney(value)}</TableCell>
    </TableRow>
  )
}
