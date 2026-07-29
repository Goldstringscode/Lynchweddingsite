"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Plus, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveMenu } from "./menu-bar"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  menus: ActiveMenu[]
  itemName: string
  onAddToMenu: (menuId: string) => void
  onAddToAll: () => void
}

export function MenuPickerModal({
  open,
  onOpenChange,
  menus,
  itemName,
  onAddToMenu,
  onAddToAll,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            <DialogTitle className="font-serif text-lg">Add to Menu</DialogTitle>
          </div>
          <DialogDescription>
            Add <span className="font-medium text-foreground">{itemName}</span> to which menu?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-1">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => onAddToMenu(menu.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all",
                "hover:border-primary/50 hover:bg-accent/20"
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-full border bg-muted/30">
                <Menu className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{menu.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {menu.courses.length} item{menu.courses.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                + Add
              </Badge>
            </button>
          ))}

          {menus.length > 1 && (
            <>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <button
                onClick={onAddToAll}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg border-2 border-dashed p-3 text-left text-sm transition-all",
                  "hover:border-primary/50 hover:bg-accent/20 border-primary/20"
                )}
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Layers className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">All Menus</p>
                  <p className="text-[11px] text-muted-foreground">
                    Add to all {menus.length} menus
                  </p>
                </div>
                <Badge className="text-[10px]">+ Add</Badge>
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}