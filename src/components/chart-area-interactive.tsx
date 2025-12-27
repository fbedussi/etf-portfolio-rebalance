import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartPie } from './pie-chart'

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { usePrices } from "@/store"
const chartConfig = {
  price: {
    label: "price",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const prices = usePrices()

  const chartData = Object.values(prices).reduce((result, { history }) => {
    history.forEach(({ date, price }) => {
      const [part1, part2] = date.split('-')
      const year = part1.substring(0, 4)
      const month = part1.substring(4, 6)
      const day = part1.substring(6, 8)
      const isoDate = `${year}-${month}-${day}T${part2}Z`
      result[isoDate] = (result[date] || 0) + price
    })
    return result
  }, {} as Record<string, number>)

  const chartDataArray = Object.entries(chartData).map(([date, price]) => ({
    date,
    price,
  })).toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const data = chartDataArray

  // const filteredData = chartDataArray.filter((item) => {
  //   const date = new Date(item.date)
  //   const referenceDate = new Date()
  //   let daysToSubtract = 90
  //   if (timeRange === "30d") {
  //     daysToSubtract = 30
  //   } else if (timeRange === "7d") {
  //     daysToSubtract = 7
  //   }
  //   const startDate = new Date(referenceDate)
  //   startDate.setDate(startDate.getDate() - daysToSubtract)
  //   return date >= startDate
  // })

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Valore portafoglio</CardTitle>
          {/* <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d">Ultimo mese</ToggleGroupItem>
              <ToggleGroupItem value="30d">Ultimo anno</ToggleGroupItem>
              <ToggleGroupItem value="7d">Dall'inizio</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Ultimo mese
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Ultimo anno
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Dall'inizio
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction> */}
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full h-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-secondary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("it-IT", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("it-IT", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="price"
                type="natural"
                fill="url(#fillValue)"
                stroke="var(--color-primary)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <ChartPie />

    </div>
  )
}
