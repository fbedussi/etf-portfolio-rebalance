import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { assetClassCategoryToString } from "@/lib/utils"
import { useCurrentAllocation, useTargetAllocation } from "@/store"

export function AssetAllocationTable() {
    const targetAllocation = useTargetAllocation()
    const currentAllocation = useCurrentAllocation()

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
                        <TableCell className="font-medium">{assetClassCategoryToString(assetClass)}</TableCell>
                        <TableCell>{targetAllocation[assetClass].toFixed(0) || '0'}%</TableCell>
                        <TableCell>{currentAllocation[assetClass].toFixed(0) || '0'}%</TableCell>
                        <TableCell className="text-right">{((targetAllocation[assetClass] || 0 - currentAllocation[assetClass] || 0) / (targetAllocation[assetClass] || 0) * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
