import {
  deleteVirtualData,
  setShowOnlyRealTransaction,
  useShowOnlyRealTransactions,
  useThereAreVirtualTrasactions,
} from "@/store"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Button } from "./ui/button"

export function VirtualDataToolbox() {
  const thereAreVirtualTransactios = useThereAreVirtualTrasactions()
  const showOnlyRealTransaction = useShowOnlyRealTransactions()

  return thereAreVirtualTransactios ? (
    <div className="flex items-center gap-3">
      <Button size='sm' variant="outline" onClick={() => deleteVirtualData()}>Cancella dati virtuali</Button>

      <div className="flex items-center gap-3">
        <Checkbox
          id="prev-data"
          checked={showOnlyRealTransaction}
          onClick={() => {
            setShowOnlyRealTransaction(!showOnlyRealTransaction)
          }}
        />
        <Label htmlFor="prev-data">Mostra solo dati reali</Label>
      </div>
    </div>
  ) : null
}
