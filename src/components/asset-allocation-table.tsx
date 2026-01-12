import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { assetClassCategoryToString } from "@/lib/utils"
import { useAssetClassColors, useCurrentAssetClassAllocation, useTargetAssetClassAllocation } from "@/store"

export function AssetAllocationTable() {
    const targetAllocation = useTargetAssetClassAllocation()
    const currentAllocation = useCurrentAssetClassAllocation()
    const assetClassColors = useAssetClassColors()

    const assetClasses = [...new Set(Object.keys(targetAllocation).concat(Object.keys(currentAllocation)))]

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Asset class</TableHead>
                    <TableHead>obiettivo</TableHead>
                    <TableHead>corrente</TableHead>
                    <TableHead className="text-right">Drift</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {assetClasses.map((assetClass) => (
                    <TableRow key={assetClass}>
                        <TableCell className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--${assetClassColors[assetClass]})` }}></div> {assetClassCategoryToString(assetClass)}</TableCell>
                        <TableCell>{targetAllocation[assetClass]?.toFixed(0) || '0'}%</TableCell>
                        <TableCell>{currentAllocation[assetClass]?.toFixed(0) || '0'}%</TableCell>
                        <TableCell className="text-right">
                            {(((currentAllocation[assetClass] || 0) - (targetAllocation[assetClass] || 0)) / (targetAllocation[assetClass] || 1) * 100).toFixed(0)}%
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
