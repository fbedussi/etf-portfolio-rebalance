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
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { assetClassCategoryToString, isNotUndefined } from "@/lib/utils"
import type { AssetClassCategory } from "@/model"
import {
  useAssetClassColors,
  useCurrentAssetClassAllocation,
  useTargetAssetClassAllocation,
} from "@/store"
import { AssetAllocationTable } from "./asset-allocation-table"

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

  const targetAllocationData = assetClasses
    .map((assetClass) =>
      targetAssetClassAllocation[assetClass]
        ? {
            assetClass,
            target: targetAssetClassAllocation[assetClass],
            fill: `var(--${colors[assetClass]})`,
          }
        : undefined,
    )
    .filter(isNotUndefined)

  const currentAllocationData = assetClasses
    .map((assetClass) =>
      currentAssetClassAllocation[assetClass]
        ? {
            assetClass,
            actual: currentAssetClassAllocation[assetClass],
            fill: `var(--${colors[assetClass]})`,
          }
        : undefined,
    )
    .filter(isNotUndefined)
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
