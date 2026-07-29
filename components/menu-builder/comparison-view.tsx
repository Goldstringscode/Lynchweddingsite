"use client"

import { Scale, Trash2, Salad, Beef, Coffee, CakeSlice } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ActiveMenu } from "./menu-bar"
import type { MenuItem } from "./menu-item-grid"

interface Props {
  menus: ActiveMenu[]
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

export function ComparisonView({ menus, catalogItems, onRemoveItem }: Props) {
  const itemMap = new Map(catalogItems.map((i) => [i.id, i]))

  // Build a grid: rows = course types, columns = menus
  interface Course { course_number: number; course_type: string; item_id: string; portion_size: string; notes: string }
  const grid: Record<string, (Course | null)[]> = {}
  for (const type of COURSE_ORDER) {
    grid[type] = menus.map((menu) => {
      return menu.courses.find((c) => c.course_type === type) || null
    })
  }

  // Menu totals
  const menuTotals = menus.map((menu) => {
    let total = 0,
      calories = 0,
      protein = 0
    for (const c of menu.courses) {
      const item = itemMap.get(c.item_id)
      if (item) {
        total += item.suggested_menu_price ?? item.price ?? 0
        calories += item.nutrition?.calories || 0
        protein += item.nutrition?.protein || 0
      }
    }
    return { total, calories, protein, count: menu.courses.length }
  })

  const maxTotal = Math.max(...menuTotals.map((t) => t.total), 1)

  return (
    <div className="space-y-4">
      {/* Menu headers */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `120px repeat(${menus.length}, minmax(0, 1fr))` }}
      >
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground self-end pb-2">
          Course
        </div>
        {menus.map((menu, i) => (
          <div key={menu.id} className="text-center pb-2 border-b-2 border-primary/20">
            <p className="text-sm font-serif font-medium">{menu.name}</p>
            <p className="text-[10px] text-muted-foreground">{menuTotals[i].count} items</p>
          </div>
        ))}
      </div>

      {/* Course rows */}
      <div className="space-y-1">
        {COURSE_ORDER.map((type) => {
          const hasAny = grid[type]?.some((c) => c !== null)
          return (
            <div
              key={type}
              className={cn(
                "grid gap-3 items-center rounded-lg py-1.5",
                !hasAny && "opacity-40"
              )}
              style={{ gridTemplateColumns: `120px repeat(${menus.length}, minmax(0, 1fr))` }}
            >
              {/* Course label */}
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {COURSE_LABELS[type]}
              </div>

              {/* Per-menu cells */}
              {menus.map((menu, colIdx) => {
                const course = grid[type]?.[colIdx]
                const item = course ? itemMap.get(course.item_id) : null

                if (!course || !item) {
                  return (
                    <div key={menu.id} className="text-center py-2 text-muted-foreground/30 text-[10px] italic">
                      —
                    </div>
                  )
                }

                const price = item.suggested_menu_price ?? item.price ?? 0

                return (
                  <div
                    key={menu.id}
                    className="group relative flex items-center justify-between rounded-md border bg-card/50 px-2.5 py-1.5 text-xs hover:bg-accent/20 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        ${price.toFixed(2)}
                        {item.portion_weight_g && ` · ${item.portion_weight_g}g`}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(menu.id, course.course_number)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0 ml-1"
                      title="Remove"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Cost comparison bars */}
      <div className="pt-4 border-t">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="size-4 text-gold" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cost Comparison
          </h4>
        </div>
        <div className="space-y-2">
          {menus.map((menu, i) => {
            const t = menuTotals[i]
            const pct = (t.total / maxTotal) * 100
            return (
              <div key={menu.id} className="flex items-center gap-3">
                <span className="text-[10px] w-16 shrink-0 text-right text-muted-foreground truncate">
                  {menu.name}
                </span>
                <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium tabular-nums w-16">
                  ${t.total.toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nutrition comparison mini row */}
      <div className="pt-2">
        <div className="grid gap-3 text-[10px] text-muted-foreground"
          style={{ gridTemplateColumns: `120px repeat(${menus.length}, minmax(0, 1fr))` }}>
          <div>Calories</div>
          {menuTotals.map((t, i) => (
            <div key={i} className="text-center font-medium tabular-nums">
              {t.calories.toLocaleString()}
            </div>
          ))}
          <div className="mt-1">Protein</div>
          {menuTotals.map((t, i) => (
            <div key={i} className="text-center font-medium tabular-nums mt-1">
              {t.protein}g
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}