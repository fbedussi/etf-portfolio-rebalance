import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCountryColors, useCurrentCountryAllocation, useTargetCountryAllocation } from "@/store"

export function CountryTable() {
  const targetAllocation = useTargetCountryAllocation()
  const currentAllocation = useCurrentCountryAllocation()
  const countryColors = useCountryColors()

  const countries = [
    ...new Set(Object.keys(targetAllocation).concat(Object.keys(currentAllocation))),
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Paese</TableHead>
          <TableHead>obiettivo</TableHead>
          <TableHead>corrente</TableHead>
          <TableHead className="text-right">Drift</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {countries.map((country) => (
          <TableRow key={country}>
            <TableCell className="font-medium flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `var(--${countryColors[country]})` }}
              ></div>{" "}
              {country}
            </TableCell>
            <TableCell>{targetAllocation[country]?.toFixed(0) || "0"}%</TableCell>
            <TableCell>{currentAllocation[country]?.toFixed(0) || "0"}%</TableCell>
            <TableCell className="text-right">
              {(
                (((currentAllocation[country] || 0) - (targetAllocation[country] || 0)) /
                  (targetAllocation[country] || 1)) *
                100
              ).toFixed(0)}
              %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
