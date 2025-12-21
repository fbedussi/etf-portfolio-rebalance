import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CircleAlertIcon, MoveDownIcon, MoveUpIcon } from "lucide-react"
import { ValueCard } from "./value-card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2">
      <ValueCard />
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Drift massimo 10%</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <div className="flex items-center gap-2"><CircleAlertIcon /> Ribilanciare</div>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +11%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <MoveDownIcon className="size-4"/> Bond <span className="text-muted-foreground">+11% sopra il target</span> 
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            <MoveUpIcon className="size-4"/> Azioni <span className="text-muted-foreground">-11% sopra il target</span> 
          </div>
          
        </CardFooter>
      </Card>
    </div>
  )
}
