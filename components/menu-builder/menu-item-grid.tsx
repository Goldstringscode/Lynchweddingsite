"use client"

import { Search, Sparkles, Plus, Salad, Beef, Cookie } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface MenuItem {
  id: string
  category: string
  section: string | null
  name: string
  description: string
  price: number | null
  is_available: boolean
  is_signature: boolean
}

interface Props {
  items: MenuItem[]
  sectionFilter: string
  searchQuery: string
  onSelectItem: (item: MenuItem) => void
}

const SECTION_EMOJI: Record<string, string> = {
  proteins: "\u{1F969}", sides: "\u{1F957}", appetizers: "\u{1F942}", desserts: "\u{1F370}",
}

export function MenuItemGrid({ items, sectionFilter, searchQuery, onSelectItem }: Props) {
  const filtered = items.filter((item) => {
    if (!item.is_available) return false
    if (sectionFilter !== "all" && item.section !== sectionFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {filtered.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectItem(item)}
          className={cn(
            "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-accent/30 text-xs",
            item.is_signature && "border-gold/50"
          )}
        >
          <div className="flex items-center gap-2 w-full">
            <span className="text-lg">{SECTION_EMOJI[item.section || ""] || "\u{1F37D}\u{FE0F}"}</span>
            <span className="font-medium text-sm flex-1 truncate">{item.name}</span>
          </div>
          {item.price && (
            <span className="text-xs font-medium text-muted-foreground">${item.price.toFixed(2)} / person</span>
          )}
          {item.is_signature && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              <Sparkles className="size-2.5 mr-0.5" />Signature
            </Badge>
          )}
        </button>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">No items found.</div>
      )}
    </div>
  )
}