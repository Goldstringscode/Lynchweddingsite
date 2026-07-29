"use client"

import { Trash2, Beef, Coffee, Salad, CakeSlice, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ActiveMenu } from "./menu-bar"
import type { MenuItem } from "./menu-item-grid"

interface Props {
  menu: ActiveMenu
  catalogItems: MenuItem[]
  onRemoveItem: (menuId: string, courseNumber: number) => void
}

const COURSE_ORDER = ["hors-doeuvres", "appetizer", "protein", "side", "dessert"]

const COURSE_LABELS: Record<string, string> = {
  "hors-doeuvres": "Hors d'Oeuvres",
  appetizer: "Appetizers",
  protein: "Proteins / Entrées",
  side: "Sides",
  dessert: "Desserts",
}

const COURSE_ICONS: Record<string, typeof Beef> = {
  "hors-doeuvres": Coffee,
  appetizer: Coffee,
  protein: Beef,
  side: Salad,
  dessert: CakeSlice,
}

export function MenuItemList({ menu, catalogItems, onRemoveItem }: Props) {
  const itemMap = new Map(catalogItems.map((i) => [i.id, i]))

  // Group courses by type
  const grouped: Record<string, typeof menu.courses> = {}
  for (const course of menu.courses) {
    const type = course.course_type || "appetizer"
    if (!grouped[type]) grouped[type] = []
    grouped[type].push(course)
  }

  if (menu.courses.length === 0) {
    return (
      <div className="py-8 text-center">
        <Salad className="mx-auto size-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No items in this menu yet.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Browse the catalog below and click "Add to Menu" to build your menu.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {COURSE_ORDER.map((type) => {
        const courses = grouped[type]
        if (!courses || courses.length === 0) return null
        const Icon = COURSE_ICONS[type] || Coffee

        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="size-4 text-gold" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {COURSE_LABELS[type] || type}
              </h4>
              <Badge variant="outline" className="text-[9px] px-1 h-4 ml-auto">
                {courses.length}
              </Badge>
            </div>
            <div className="space-y-1">
              {courses.map((course) => {
                const item = itemMap.get(course.item_id)
                if (!item) return null
                const price = item.suggested_menu_price ?? item.price ?? 0

                return (
                  <div
                    key={course.course_number}
                    className="flex items-center gap-2 rounded-lg border bg-card/50 px-3 py-2 text-xs group hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.name}</span>
                        {item.is_signature && (
                          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
                            Signature
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="tabular-nums">${price.toFixed(2)}</span>
                        <span>·</span>
                        <span className="capitalize">{course.portion_size}</span>
                        {item.portion_weight_g && (
                          <>
                            <span>·</span>
                            <span>{item.portion_weight_g}g</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(menu.id, course.course_number)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      title="Remove from menu"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}