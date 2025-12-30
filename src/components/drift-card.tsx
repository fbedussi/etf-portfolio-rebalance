import { IconTrendingUp } from "@tabler/icons-react"
import { useShallow } from 'zustand/shallow'
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CircleAlertIcon, MoveDownIcon, MoveUpIcon, ThumbsUpIcon } from "lucide-react"
import { useCurrentDrift, useMaxDrift } from "@/store"
import { assetClassCategoryToString, formatMoney } from "@/lib/utils"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { useState } from "react"

export function DriftCard() {
  const maxDrift = useMaxDrift()
  const currentDrift = useCurrentDrift()
  const [internalRebalance, setInternalRebalance] = useState(true)
  const maxCurrentDrift = Math.max(...Object.values(currentDrift).map((drift) => drift.percentage))

  const renderAmountToBuyOrSell = (amount: number, amountExternal: number) => {
    if (internalRebalance) {
      if (amount > 0) {
        return `Vendere ${formatMoney(Math.abs(amount))}`
      } else {
        return `Comprare ${formatMoney(Math.abs(amount))}`
      }
    } else {
      if (amount > 0) {
        return ''
      } else {
        return `Comprare ${formatMoney(Math.abs(amountExternal))}`
      }
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
        {currentDrift.map(({ assetClass, amount, amountExternal, percentage }) => (
          <div key={assetClass} className="line-clamp-1 flex gap-2 font-medium">
            {percentage > 0
              ? <MoveDownIcon className="size-4 stroke-red-500" />
              : <MoveUpIcon className="size-4 stroke-green-500" />}
            {assetClassCategoryToString(assetClass)}
            <span className="text-muted-foreground">
              {percentage.toFixed(0)}% {percentage > 0 ? 'sopra' : 'sotto'} il target.{' '}
              {renderAmountToBuyOrSell(amount, amountExternal)}
            </span>
          </div>
        ))}

      </CardFooter>
    </Card>
  )
}
