import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CircleAlertIcon, MoveDownIcon, MoveUpIcon, ThumbsUpIcon } from "lucide-react"
import { useDriftData, useMaxDrift } from "@/store"
import { assetClassCategoryToString, formatMoney } from "@/lib/utils"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { useState } from "react"

export function DriftCard() {
  const maxDrift = useMaxDrift()
  const currentDrift = useDriftData()
  const [internalRebalance, setInternalRebalance] = useState(true)
  const maxCurrentDrift = Math.max(...Object.values(currentDrift).map((drift) => drift.percentage))

  const renderAmountToBuy = (drifAmount: number, amountToBuyToCompensate: number | null) => {
    if (internalRebalance || amountToBuyToCompensate === null) {
      if (drifAmount > 0) {
        return ''
      } else {
        return formatMoney(Math.abs(drifAmount))
      }
    } else {
      if (drifAmount > 0) {
        return ''
      } else {
        return formatMoney(Math.abs(amountToBuyToCompensate))
      }
    }
  }

  const renderAmountToSell = (drifAmount: number, amountToBuyToCompensate: number | null) => {
    if (internalRebalance || amountToBuyToCompensate === null) {
      if (drifAmount > 0) {
        return formatMoney(Math.abs(drifAmount))
      } else {
        return ''
      }
    } else {
      return ''
    }
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Drift massimo {maxDrift}%</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <div className="flex items-center gap-2">
            {maxCurrentDrift > 0
              ? <><CircleAlertIcon className="stroke-red-500" /> Ribilanciare</>
              : <><ThumbsUpIcon className="stroke-green-500" /> Non ribilanciare</>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex items-center gap-3">
          <Checkbox id="terms" checked={internalRebalance} onClick={() => setInternalRebalance(!internalRebalance)} />
          <Label htmlFor="terms">Ribilanciamento interno</Label>
        </div>
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Asset class</TableHead>
              <TableHead>Δ % sul target</TableHead>
              <TableHead>Comprare</TableHead>
              <TableHead>Vendere</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {currentDrift.map(({ assetClass, drifAmount, amountToBuyToCompensate, percentage }) => (
              <TableRow key={assetClass} className="relative z-0">
                <TableCell>{percentage > 0
                  ? <MoveDownIcon className="size-4 stroke-red-500" />
                  : <MoveUpIcon className="size-4 stroke-green-500" />}
                </TableCell>
                <TableCell>{assetClassCategoryToString(assetClass)}</TableCell>
                <TableCell>{percentage.toFixed(0)}%</TableCell>
                <TableCell>{renderAmountToBuy(drifAmount, amountToBuyToCompensate)}</TableCell>
                <TableCell>{renderAmountToSell(drifAmount, amountToBuyToCompensate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>


      </CardFooter>
    </Card>
  )
}
