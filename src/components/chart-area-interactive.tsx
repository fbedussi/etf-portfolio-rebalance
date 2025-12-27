import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
const chartConfig = {
  price: {
    label: "price",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("1y")
  const prices = usePrices()

  const chartData = Object.values(prices).reduce((result, { history }) => {
    history.forEach(({ date, price }) => {
      result[date] = (result[date] || 0) + price
    })
    return result
  }, {} as Record<string, number>)

  const chartDataArray = Object.entries(chartData).map(([date, price]) => ({
    date,
    price,
  })).toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("6m")
    }
  }, [isMobile])

  const data = chartDataArray.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "1m") {
      daysToSubtract = 30
    } else if (timeRange === "6m") {
      daysToSubtract = 180
    } else if (timeRange === "1y") {
      daysToSubtract = 365
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Valore portafoglio</CardTitle>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="1m">Ultimo mese</ToggleGroupItem>
              <ToggleGroupItem value="6m">Ultimi 6 mesi</ToggleGroupItem>
              <ToggleGroupItem value="1y">Ultimo anno</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Ultimo mese" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="1m" className="rounded-lg">
                  Ultimo mese
                </SelectItem>
                <SelectItem value="6m" className="rounded-lg">
                  Ultimi 6 mesi
                </SelectItem>
                <SelectItem value="1y" className="rounded-lg">
                  Ultimo anno
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
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
              <YAxis domain={["dataMin", "auto"]} hide />
              <Area
                dataKey="price"
                type="natural"
                fill="url(#fillValue)"
                stroke="var(--color-primary)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <ChartPie />

    </div>
  )
}
