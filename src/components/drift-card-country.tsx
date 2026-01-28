import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertCircleIcon,
  CircleAlertIcon,
  MoveDownIcon,
  MoveUpIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { useCountryDriftData, useMaxDrift } from "@/store"
import { formatMoney } from "@/lib/utils"
import { Label } from "./ui/label"
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export function DriftCardCountry() {
  const maxDrift = useMaxDrift()
  const currentDrift = useCountryDriftData()
  const [rebalanceStrategy, setRebalanceStrategy] = useState<"buyAndSell" | "buy" | "sell">("buy")
  const maxCurrentDrift = Math.max(...Object.values(currentDrift).map((drift) => drift.percentage))

  const renderAmountToBuy = (drifAmount: number, amountToBuyToCompensate: number | null) => {
    if (drifAmount > 0) {
      return ""
    }
    if (rebalanceStrategy === "buyAndSell" || amountToBuyToCompensate === null) {
      return formatMoney(Math.abs(drifAmount))
    } else if (rebalanceStrategy === "buy") {
      return formatMoney(Math.abs(amountToBuyToCompensate))
    } else {
      return ""
    }
  }

  const renderAmountToSell = (drifAmount: number, amountToSellToCompensate: number | null) => {
    if (rebalanceStrategy === "buyAndSell") {
      if (drifAmount > 0) {
        return formatMoney(Math.abs(drifAmount))
      } else {
        return ""
      }
    } else if (rebalanceStrategy === "sell" && amountToSellToCompensate !== null) {
      return formatMoney(Math.abs(amountToSellToCompensate))
    } else {
      return ""
    }
  }

  const sellStrategyIsNotPossible = currentDrift.some(
    (drift) => drift.amountToSellToCompensate === null,
  )
  const buyStrategyIsNotPossible = currentDrift.some(
    (drift) => drift.amountToBuyToCompensate === null,
  )
  const showSellStrategyAlert = rebalanceStrategy === "sell" && sellStrategyIsNotPossible
  const showBuyStrategyAlert = rebalanceStrategy === "buy" && buyStrategyIsNotPossible
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Drift massimo {maxDrift}%</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <div className="flex items-center gap-2">
            {maxCurrentDrift > maxDrift ? (
              <>
                <CircleAlertIcon className="stroke-red-500" /> Ribilanciare
              </>
            ) : (
              <>
                <ThumbsUpIcon className="stroke-green-500" /> Non ribilanciare
              </>
            )}
          </div>
        </CardTitle>
        <RadioGroup
          value={rebalanceStrategy}
          orientation="horizontal"
          className="flex gap-5"
          onValueChange={(val) => {
            switch (val) {
              case "buyAndSell":
                setRebalanceStrategy("buyAndSell")
                break
              case "buy":
                setRebalanceStrategy("buy")
                break
              case "sell":
                setRebalanceStrategy("sell")
                break
            }
          }}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="buyAndSell" id="r1" />
            <Label htmlFor="r1">Acquisto/Vendita</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="buy" id="r2" />
            <Label htmlFor="r2">Acquisto</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sell" id="r3" />
            <Label htmlFor="r3">Vendita</Label>
          </div>
        </RadioGroup>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {showSellStrategyAlert && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Impossibile ribilanciare vendendo</AlertTitle>
            <AlertDescription>
              <p>
                Il tuo portafoglio non può essere ribilanciato vendendo perché alcune asset class
                mancano nel portafoglio e devono quindi essere necessariamente acquistate:
              </p>
              <ul className="list-inside list-disc text-sm">
                {currentDrift
                  .filter((drift) => drift.amountToSellToCompensate === null)
                  .map((drift) => (
                    <li key={drift.country}>{drift.country}</li>
                  ))}
              </ul>
              <p>
                Se desideri ribilanciare il portafoglio, seleziona "Acquisto/Vendita" o "Acquisto".
              </p>
            </AlertDescription>
          </Alert>
        )}
        {showBuyStrategyAlert && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Impossibile ribilanciare acquistando</AlertTitle>
            <AlertDescription>
              <p>
                Il tuo portafoglio non può essere ribilanciato acquistando perché alcune asset class
                presenti nel portafoglio non sono presenti nell'obbiettivo e devono quindi essere
                necessariamente vendute:
              </p>
              <ul className="list-inside list-disc text-sm">
                {currentDrift
                  .filter((drift) => drift.amountToBuyToCompensate === null)
                  .map((drift) => (
                    <li key={drift.country}>{drift.country}</li>
                  ))}
              </ul>
              <p>
                Se desideri ribilanciare il portafoglio, seleziona "Acquisto/Vendita" o "Vendita".
              </p>
            </AlertDescription>
          </Alert>
        )}
        {!showSellStrategyAlert && !showBuyStrategyAlert && (
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Asset class</TableHead>
                <TableHead>Δ % sul target</TableHead>
                <TableHead>Comprare</TableHead>
                <TableHead>Vendere</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {currentDrift.map(
                ({
                  country,
                  driftAmount,
                  amountToBuyToCompensate,
                  amountToSellToCompensate,
                  percentage,
                }) => (
                  <TableRow key={country} className="relative z-0">
                    <TableCell>
                      {percentage > 0 ? (
                        <MoveDownIcon className="size-4 stroke-red-500" />
                      ) : (
                        <MoveUpIcon className="size-4 stroke-green-500" />
                      )}
                    </TableCell>
                    <TableCell>{country}</TableCell>
                    <TableCell>{percentage.toFixed(0)}%</TableCell>
                    <TableCell>{renderAmountToBuy(driftAmount, amountToBuyToCompensate)}</TableCell>
                    <TableCell>
                      {renderAmountToSell(driftAmount, amountToSellToCompensate)}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        )}
      </CardFooter>
    </Card>
  )
}
