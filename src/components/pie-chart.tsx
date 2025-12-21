import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { AssetAllocationTable } from "./asset-allocation-table"

export const description = "A pie chart with stacked sections"

const targetAllocation = [
  { assetClass: "bonds", target: 50, fill: "var(--color-bonds)" },
  { assetClass: "stocks", target: 50, fill: "var(--color-stocks)" },
]

const actualAllocation = [
  { assetClass: "bonds", actual: 60, fill: "var(--color-bonds)" },
  { assetClass: "stocks", actual: 40, fill: "var(--color-stocks)" },
]

const chartConfig = {
  allocation: {
    label: "Allocazione",
  },
  target: {
    label: "Obiettivo",
  },
  actual: {
    label: "Corrente",
  },
  bonds: {
    label: "Obbligazioni",
    color: "var(--chart-1)",
  },
  stocks: {
    label: "Azioni",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartPie() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Allocazione asset class corrente</CardTitle>
        <CardDescription>vs obiettivo</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="allocation"
                  nameKey="assetClass"
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    return chartConfig[
                      payload?.[0].dataKey as keyof typeof chartConfig
                    ].label
                  }}
                />
              }
            />
            <Pie data={targetAllocation} dataKey="target" outerRadius={60}/>
            <Pie
              data={actualAllocation}
              dataKey="actual"
              innerRadius={70}
              outerRadius={90}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <AssetAllocationTable />
      </CardFooter>
    </Card>
  )
}
