import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const assetClasses = [
  {
    name: "Azioni",
    target: 50,
    actual: 60,
  },
  {
    name: "Obligazioni",
    target: 50,
    actual: 40,
  },
]

export function AssetAllocationTable() {
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
          <TableRow key={assetClass.name}>
            <TableCell className="font-medium">{assetClass.name}</TableCell>
            <TableCell>{assetClass.target}%</TableCell>
            <TableCell>{assetClass.actual}%</TableCell>
            <TableCell className="text-right">{((assetClass.target-assetClass.actual)/assetClass.target*100).toFixed(0)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
