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
import {
  useAssetClassColors,
  useCurrentAssetClassAllocation,
  useTargetAssetClassAllocation,
} from "@/store"
import type { AssetClassCategory } from "@/model"
import { assetClassCategoryToString } from "@/lib/utils"

export function ChartPie() {
  const targetAssetClassAllocation = useTargetAssetClassAllocation()
  const currentAssetClassAllocation = useCurrentAssetClassAllocation()
  const colors = useAssetClassColors()

  const assetClasses = [
    ...new Set(
      Object.keys(targetAssetClassAllocation).concat(Object.keys(currentAssetClassAllocation)),
    ),
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
    ...assetClasses.reduce(
      (result, assetClass) => {
        result[assetClass] = {
          label: assetClassCategoryToString(assetClass),
          color: `var(--${colors[assetClass]})`,
        }
        return result
      },
      {} as Record<AssetClassCategory, { label: string; color: string }>,
    ),
  } satisfies ChartConfig

  const targetAllocationData = Object.entries(targetAssetClassAllocation).map(
    ([assetClass, target]) => ({
      assetClass,
      target,
      fill: `var(--${colors[assetClass]})`,
    }),
  )

  const currentAllocationData = Object.entries(currentAssetClassAllocation).map(
    ([assetClass, actual]) => ({
      assetClass,
      actual,
      fill: `var(--${colors[assetClass]})`,
    }),
  )
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Allocazione asset class corrente</CardTitle>
        <CardDescription>vs obiettivo</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="allocation"
                  nameKey="assetClass"
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    return chartConfig[payload?.[0].dataKey as keyof typeof chartConfig].label
                  }}
                />
              }
            />
            <Pie data={targetAllocationData} dataKey="target" outerRadius={60} />
            <Pie data={currentAllocationData} dataKey="actual" innerRadius={70} outerRadius={90} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <AssetAllocationTable />
      </CardFooter>
    </Card>
  )
}
