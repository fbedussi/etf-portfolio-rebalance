import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RefreshCcwIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useStore, useCurrentPortfolioValue, useCurrentPortfolioCost, usePriceUpdateTime } from "@/store"
import { formatPrice } from "@/lib/utils"
import { useEffect, useState } from "react"

export function ValueCard() {
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    setTimeout(() => {
      setRefresh(counter => counter + 1)
    }, 60000)
  })
  const currentValue = useCurrentPortfolioValue()
  const cost = useCurrentPortfolioCost()
  const variation = (currentValue - cost) / cost * 100
  const isIncreasing = variation > 0
  const updateTime = usePriceUpdateTime()

  return (
    <Card className="@container/card" key={refresh}>
      <CardHeader>
        <CardDescription>Valore totale</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatPrice(currentValue)}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className={`${isIncreasing ? 'bg-green-500' : 'bg-red-500 text-white'}`}>
            {isIncreasing ? <IconTrendingUp /> : <IconTrendingDown />}
            {isIncreasing ? '+' : ''}{variation.toFixed(2)}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
          Costo: <span className="text-primary">{formatPrice(cost)}</span>
        </div>
        <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground items-center justify-between w-full">
          <span>Dati aggiornati a <span className="text-primary">{updateTime}</span></span>
          <Button size="icon" variant="outline">
            <RefreshCcwIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
