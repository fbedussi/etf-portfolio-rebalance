import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RefreshCcwIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useCurrentPortfolioValue, useCurrentPortfolioCost, useCurrentPortfolioValueDate, setRefreshPrices } from "@/store"
import { formatDate, formatMoney } from "@/lib/utils"

export function ValueCard() {
  const value = useCurrentPortfolioValue()
  const date = useCurrentPortfolioValueDate()
  const cost = useCurrentPortfolioCost()
  const variation = (value - cost) / cost * 100
  const isIncreasing = variation > 0

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Valore totale</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatMoney(value)}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className={`${isIncreasing ? 'bg-green-500' : 'bg-red-500 text-white'}`}>
            {isIncreasing ? <IconTrendingUp /> : <IconTrendingDown />}
            {isIncreasing ? '+' : ''}{variation.toFixed(2)}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
          Costo: <span className="text-primary">{formatMoney(cost)}</span>
        </div>
      </CardContent>
      <CardFooter className="items-start gap-1.5 text-sm flex-1 items-end">
        <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground items-center justify-between w-full">
          {!!date && <span>Dati aggiornati al <span className="text-primary">{formatDate(date)}</span></span>}
          <Button size="icon" variant="outline" onClick={() => {
            setRefreshPrices(true)
          }}>
            <RefreshCcwIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
