import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import { setPortfolio, setPrice } from "./store"

export default function App() {
  setPortfolio({
    name: 'Fra2',
    targetAllocation: {
      stocks: 50,
      bonds: 50,
    },
    maxDrift: 10,
    etfs: {
      IE00B4L5Y983: {
        isin: 'IE00B4L5Y983',
        name: 'iShares Core MSCI World UCITS',
        assetClass: {
          name: "Global developed stocks markets",
          category: "stocks",
        },
        transactions: [{
          date: "2025-10-28",
          quantity: 14,
          price: 111,
        }],
      },
      LU0478205379: {
        isin: 'LU0478205379',
        name: 'Xtrackers II EUR Corporate Bond UCITS ETF 1C',
        assetClass: {
          name: "Eur Corporate Bonds",
          category: "bonds",
        },
        transactions: [{
          date: "2024-11-15",
          quantity: 15,
          price: 163,
        }],
      }
    },
  })

  setPrice('IE00B4L5Y983', 100)
  setPrice('LU0478205379', 190)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <main className="bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <ChartAreaInteractive />
              <DataTable />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
