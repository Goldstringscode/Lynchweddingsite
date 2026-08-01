"use client"

import { Search, Sparkles, Plus, Salad, Beef, Cookie, Weight, Flame, Clock, Check, Store, X } from "lucide-react"
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
      samsClubPrice?: number
    }[]
    ingredient_links?: {
      costco?: { costPerServing: number; totalFor150: number }
      winco?: { costPerServing: number; totalFor150: number }
      sams?: { costPerServing: number; totalFor150: number }
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
  activeSections?: Set<string>
  searchQuery: string
  sortOrder?: "default" | "low-high" | "high-low"
  premadeOnly?: boolean
  premadeItemIds?: Set<string>
  onSelectItem: (item: MenuItem) => void
  onAddToMenu?: (item: MenuItem) => void
  addedItemIds?: string[]
}

const SECTION_EMOJI: Record<string, string> = {
  "hors-doeuvres": "\u{1F944}", proteins: "\u{1F969}", vegan: "\u{1F331}", sides: "\u{1F957}", appetizers: "\u{1F942}", desserts: "\u{1F370}",
}

const SECTION_COLORS: Record<string, string> = {
  "hors-doeuvres": "border-l-amber-300",
  appetizers: "border-l-rose-300",
  proteins: "border-l-red-400",
  vegan: "border-l-green-500",
  sides: "border-l-emerald-300",
  desserts: "border-l-purple-300",
}

export function MenuItemGrid({ items, sectionFilter, activeSections, searchQuery, sortOrder = "default", premadeOnly = false, premadeItemIds, onSelectItem, onAddToMenu, addedItemIds = [] }: Props) {
  let filtered = items.filter((item) => {
    if (!item.is_available) return false
    // Multi-section filter or single section filter
    if (sectionFilter === "multi" && activeSections && activeSections.size > 0) {
      if (!activeSections.has(item.section || "")) return false
    } else if (sectionFilter !== "all" && sectionFilter !== "multi") {
      if (item.section !== sectionFilter) return false
    }
    // Pre-made filter
    if (premadeOnly && premadeItemIds) {
      if (!premadeItemIds.has(item.id)) return false
    }
    // Search
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

  // Sort
  if (sortOrder === "low-high") {
    filtered = [...filtered].sort((a, b) => {
      const pa = a.suggested_menu_price ?? a.price ?? 0
      const pb = b.suggested_menu_price ?? b.price ?? 0
      return pa - pb
    })
  } else if (sortOrder === "high-low") {
    filtered = [...filtered].sort((a, b) => {
      const pa = a.suggested_menu_price ?? a.price ?? 0
      const pb = b.suggested_menu_price ?? b.price ?? 0
      return pb - pa
    })
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {filtered.map((item) => {
        const weight = item.portion_weight_g
        const oz = weight ? (weight / 28.3495).toFixed(1) : null
        const price = item.suggested_menu_price ?? item.price ?? 0
        const cost = item.cost_per_serving
        const colorClass = SECTION_COLORS[item.section || ""] || "border-l-muted"
        const isAdded = addedItemIds.includes(item.id)
        const hasPremade = premadeItemIds?.has(item.id)

        return (
          <div
            key={item.id}
            className={cn(
              "relative flex flex-col rounded-lg border-l-4 bg-card transition-all hover:border-l-primary hover:bg-accent/20 text-xs",
              colorClass,
              item.is_signature && "ring-1 ring-gold/20",
              isAdded && "ring-1 ring-emerald-400/30",
              hasPremade && premadeOnly && "ring-2 ring-amber-400/40"
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
                {hasPremade && !premadeOnly && (
                  <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 gap-0.5 border-amber-300 text-amber-600">
                    <Store className="size-2" />Pre-made
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
                          <div className="px-3 pb-2 pt-0 flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddToMenu(item)
                              }}
                              className={cn(
                                "w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-all",
                                isAdded
                                  ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                                  : "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                              )}
                            >
                              {isAdded ? (
                                <><X className="size-3" /> Remove</>
                              ) : (
                                <><Plus className="size-3" /> Add</>
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
            {premadeOnly ? "No items with pre-made alternatives match your filters." : "Try a different filter or search term."}
          </p>
        </div>
      )}
    </div>
  )
}