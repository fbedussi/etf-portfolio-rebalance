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
import { assetClassCategoryToString } from "@/lib/utils"

export function DriftCard() {
    const maxDrift = useMaxDrift()
    const currentDrift = useCurrentDrift()

    const maxCurrentDrift = Math.max(...Object.values(currentDrift))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Drift massimo {maxDrift}%</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <div className="flex items-center gap-2">
            {maxCurrentDrift > 0 
              ? <><CircleAlertIcon className="stroke-red-500"/> Ribilanciare</> 
              : <><ThumbsUpIcon className="stroke-green-500"/> Non ribilanciare</>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {Object.entries(currentDrift).map(([assetClassCategory, drift]) => (
          <div key={assetClassCategory} className="line-clamp-1 flex gap-2 font-medium">
            {drift > 0 ? <MoveDownIcon className="size-4 stroke-red-500" /> : <MoveUpIcon className="size-4 stroke-green-500"/>}
            {assetClassCategoryToString(assetClassCategory)}
            <span className="text-muted-foreground">{drift.toFixed(0)}% {drift > 0 ? 'sopra' : 'sotto'} il target</span>
          </div>
        ))}

      </CardFooter>
    </Card>
  )
}
