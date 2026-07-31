"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Store, ExternalLink, Soup, ChefHat, Timer, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SourcingItem {
  name: string
  store: string
  price: number | null
  unit: string
  size: string
  url: string
  heatingInstructions: string
  nutrition: Record<string, any>
  notes: string
}

interface SourcingData {
  metadata: { reportDate: string; storeLocations: string[]; sourceUrls: Record<string, string[]> }
  categories: Record<string, SourcingItem[]>
  notFound: string[]
}

interface Props {
  itemSection: string | null
  itemCategory: string
}

const SECTION_TO_CATEGORY: Record<string, string[]> = {
  "hors-doeuvres": ["appetizers"],
  "appetizers": ["appetizers"],
  "appetizer": ["appetizers"],
  "proteins": ["proteins"],
  "protein": ["proteins"],
  "vegan": ["proteins", "sides"],
  "sides": ["sides"],
  "side": ["sides"],
  "desserts": ["desserts"],
  "dessert": ["desserts"],
}

const STORE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  costco: { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200", label: "Costco" },
  winco: { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200", label: "WinCo" },
  sams: { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200", label: "Sam's Club" },
}

export function SourcingSection({ itemSection, itemCategory }: Props) {
  const [data, setData] = useState<SourcingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedStore, setExpandedStore] = useState<string | null>(null)

  useEffect(() => {
    fetch("/data/premade-sourcing.json")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const relevantCategories = SECTION_TO_CATEGORY[itemSection || ""] || SECTION_TO_CATEGORY[itemCategory?.toLowerCase()] || []
  
  const relevantItems: SourcingItem[] = []
  if (data) {
    for (const cat of relevantCategories) {
      const items = data.categories[cat]
      if (items) relevantItems.push(...items)
    }
  }

  if (relevantItems.length === 0) return null

  // Group by store
  const byStore: Record<string, SourcingItem[]> = {}
  for (const item of relevantItems) {
    if (!byStore[item.store]) byStore[item.store] = []
    byStore[item.store].push(item)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Store className="size-6 text-amber-500" />
        <h4 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
          Pre-made Sourcing
        </h4>
        <Badge variant="outline" className="text-xs px-2 py-0.5">
          {relevantItems.length} items
        </Badge>
      </div>

      <div className="space-y-2">
        {Object.entries(byStore).map(([store, items]) => {
          const colors = STORE_COLORS[store] || STORE_COLORS.costco
          const isExpanded = expandedStore === store || Object.keys(byStore).length <= 1
          return (
            <div key={store} className={cn("rounded-lg border overflow-hidden", colors.border)}>
              <button
                onClick={() => setExpandedStore(isExpanded ? null : store)}
                className={cn("w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors", colors.bg)}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className={cn("size-4", colors.text)} />
                  <span className={cn("text-sm font-semibold", colors.text)}>{colors.label}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                    {items.length}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {isExpanded && (
                <div className="divide-y divide-border/50">
                  {items.map((item, i) => (
                    <div key={i} className="px-4 py-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{item.name}</p>
                        {item.price != null ? (
                          <span className="text-sm font-bold tabular-nums shrink-0">${item.price.toFixed(2)}</span>
                        ) : (
                          <Badge variant="outline" className="text-[9px] shrink-0 text-muted-foreground border-dashed">
                            In-store price
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.size && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 h-4 gap-1">
                            <Soup className="size-2.5" />{item.size}
                          </Badge>
                        )}
                        {item.heatingInstructions && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 h-4 gap-1">
                            <Timer className="size-2.5" />{item.heatingInstructions}
                          </Badge>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-muted-foreground italic">{item.notes}</p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 hover:underline"
                        >
                          <ExternalLink className="size-2.5" />View product
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}