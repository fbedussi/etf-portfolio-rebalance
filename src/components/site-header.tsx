import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { parseFile } from "@/lib/file"
import { setPortfolio, usePortfolio } from "@/store"
import { CompassIcon, FileUpIcon } from "lucide-react"
import { useRef } from "react"
import * as Cache from "@/services/cacheService"

export function SiteHeader() {
  const portfolio = usePortfolio()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      parseFile(file)
        .then(portfolio => {
          setPortfolio(portfolio)
          Cache.savePortfolio(portfolio)
        })
        .catch(error => {
          // TODO: show an error message
          console.error(error)
        })
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          <CompassIcon className="size-5!" />
          <span className="text-base font-semibold">Portfolio Pilot</span>
        </div>
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">
          <span className="hidden md:inline">Portafoglio corrente: </span>
          <span data-test-id="portfolio-name">{portfolio?.name}</span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />
          <Button
            onClick={() => {
              fileInputRef.current?.click()
            }}
            variant="outline"
            data-test-id="open-file-btn"
            size="icon"
            aria-label="Apri file"
          >
            <FileUpIcon />
          </Button>
        </div>
      </div>
    </header>
  )
}
