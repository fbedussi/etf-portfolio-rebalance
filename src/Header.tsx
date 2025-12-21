
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import { FileUpIcon, MenuIcon, RefreshCcwIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

function Header() {
    return (
        <header className="flex justify-between items-center p-4 border-b-accent-foreground border-1">
            <img className="w-34" src="/logo_h.png" />
            <Drawer direction="right">
                <DrawerTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Submit">
                        <MenuIcon />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Portfolio Pilot</DrawerTitle>
                            <DrawerDescription>Keep your asset class under control</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0 flex flex-col gap-4">
                            <p className="leading-7 [&:not(:first-child)]:mt-6">Portafolgio caricato: Fra</p>
                            <Button variant="outline" size="sm" aria-label="Submit">
                                <FileUpIcon /> Carica un nuovo portfolio
                            </Button>
                            <Separator className="my-4" />
                            <div>Prezzi aggiornati 22 minuti fa</div>
                            <Button variant="outline" size="sm" aria-label="Submit">
                                <RefreshCcwIcon /> Aggiorna i prezzi
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </header>
    )
}

export default Header