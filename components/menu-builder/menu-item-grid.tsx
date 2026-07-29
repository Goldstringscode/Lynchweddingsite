"use client"

import { Search, Sparkles, Plus, Salad, Beef, Cookie, Weight, Flame, Clock, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MenuItem {
  id: string
  category: string
  category_name?: string
  section: string | null
  name: string
  description: string
  price: number | null
  suggested_menu_price?: number | null
  cost_per_serving?: number | null
  is_available: boolean
  is_signature: boolean
  portion_weight_g?: number | null
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
  } | null
  difficulty?: string | null
  prep_time?: number | null
  season_tags?: string[] | null
  allergens?: string[] | null
  suggested_pairings?: string[] | null
  ingredient_list?: {
    item: string
    quantity: string
    costcoPrice?: number
    wincoPrice?: number
  }[]
  ingredient_links?: {
    costco?: { costPerServing: number; totalFor150: number }
    winco?: { costPerServing: number; totalFor150: number }
    blended?: { costPerServing: number; totalFor150: number }
    savingsPerServing?: number
    savingsPercent?: number
    menuPrice?: number
    profitMargin?: number
    lastUpdated?: string
  }
}

interface Props {
  items: MenuItem[]
  sectionFilter: string
  searchQuery: string
  onSelectItem: (item: MenuItem) => void
  onAddToMenu?: (item: MenuItem) => void
  addedItemIds?: string[]
}

const SECTION_EMOJI: Record<string, string> = {
  "hors-doeuvres": "\u{1F944}", proteins: "\u{1F969}", sides: "\u{1F957}", appetizers: "\u{1F942}", desserts: "\u{1F370}",
}

const SECTION_COLORS: Record<string, string> = {
  "hors-doeuvres": "border-l-amber-300",
  appetizers: "border-l-rose-300",
  proteins: "border-l-red-400",
  sides: "border-l-emerald-300",
  desserts: "border-l-purple-300",
}

export function MenuItemGrid({ items, sectionFilter, searchQuery, onSelectItem, onAddToMenu, addedItemIds = [] }: Props) {
  const filtered = items.filter((item) => {
    if (!item.is_available) return false
    if (sectionFilter !== "all" && item.section !== sectionFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category_name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {filtered.map((item) => {
        const weight = item.portion_weight_g
        const oz = weight ? (weight / 28.3495).toFixed(1) : null
        const price = item.suggested_menu_price ?? item.price ?? 0
        const cost = item.cost_per_serving
        const colorClass = SECTION_COLORS[item.section || ""] || "border-l-muted"
        const isAdded = addedItemIds.includes(item.id)

        return (
          <div
            key={item.id}
            className={cn(
              "relative flex flex-col rounded-lg border-l-4 bg-card transition-all hover:border-l-primary hover:bg-accent/20 text-xs",
              colorClass,
              item.is_signature && "ring-1 ring-gold/20",
              isAdded && "ring-1 ring-emerald-400/30"
            )}
          >
            {/* Main click area */}
            <button
              onClick={() => onSelectItem(item)}
              className="flex flex-col items-start gap-1.5 p-3 text-left flex-1"
            >
              {/* Header */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-base">{SECTION_EMOJI[item.section || ""] || "\u{1F37D}\u{FE0F}"}</span>
                <span className="font-medium text-sm flex-1 truncate">{item.name}</span>
                {item.is_signature && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 gap-0.5">
                    <Sparkles className="size-2" />Signature
                  </Badge>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap w-full">
                {price > 0 && (
                  <span className="text-sm font-medium tabular-nums">
                    ${price.toFixed(2)}
                  </span>
                )}
                {cost && cost > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    (${cost.toFixed(2)} cost)
                  </span>
                )}
                {weight && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                    <Weight className="size-2.5" />
                    {weight}g
                  </span>
                )}
              </div>

              {/* Nutrition pill */}
              {item.nutrition?.calories && (
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Flame className="size-2.5 text-orange-400" />
                    {item.nutrition.calories} cal
                  </span>
                  {item.nutrition.protein && (
                    <span>{item.nutrition.protein}g protein</span>
                  )}
                  {item.difficulty && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">
                      {item.difficulty}
                    </Badge>
                  )}
                </div>
              )}
            </button>

            {/* Add to Menu button */}
            {onAddToMenu && (
              <div className="px-3 pb-2 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToMenu(item)
                  }}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-all",
                    isAdded
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                  )}
                >
                  {isAdded ? (
                    <><Check className="size-3" /> Added</>
                  ) : (
                    <><Plus className="size-3" /> Add to Menu</>
                  )}
                </button>
              </div>
            )}
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="col-span-2 py-12 text-center">
          <Salad className="mx-auto size-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No items found.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Try a different filter or search term.
          </p>
        </div>
      )}
    </div>
  )
}