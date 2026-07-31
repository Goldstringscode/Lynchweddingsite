"use client"

import { useRef, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Download, Printer, ShoppingBag, Users, Scale, DollarSign,
  ChefHat, Salad, Beef, Coffee, CakeSlice,
  FileSpreadsheet, TrendingDown, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  id: string; name: string; section: string | null
  description: string; price: number | null
  suggested_menu_price?: number | null; cost_per_serving?: number | null
  portion_weight_g?: number | null; is_available: boolean; is_signature?: boolean
  ingredient_list?: any
  ingredient_links?: any
}

interface Course { course_number: number; course_type: string; item_id: string; portion_size: string; notes?: string }

interface Props {
  menuName: string
  courses: Course[]
  catalogItems: MenuItem[]
  defaultGuestCount?: number
}

type StoreKey = "costco" | "winco" | "sams"

const CATEGORY_ORDER = ["hors-doeuvres", "appetizer", "protein", "vegan", "side", "dessert"]
const CATEGORY_LABELS: Record<string, string> = {
  "hors-doeuvres": "Hors d'Oeuvres", appetizer: "Appetizers", protein: "Proteins",
  vegan: "Vegan Entrées", side: "Sides", dessert: "Desserts",
}
const CATEGORY_ICONS: Record<string, typeof Beef> = {
  "hors-doeuvres": Coffee, appetizer: Coffee, protein: Beef,
  vegan: Salad, side: Salad, dessert: CakeSlice,
}
const CATEGORY_EMOJI: Record<string, string> = {
  "hors-doeuvres": "🥂", appetizer: "🥗", protein: "🥩",
  vegan: "🌱", side: "🥔", dessert: "🍰",
}
const STORE_INFO: Record<StoreKey, { label: string; color: string; border: string; bg: string; text: string }> = {
  costco: { label: "Costco", color: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400" },
  winco: { label: "WinCo", color: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400" },
  sams: { label: "Sam's Club", color: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400" },
}

function parseJSON<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback
  if (typeof val === "string") { try { return JSON.parse(val) } catch { return fallback } }
  return val as T
}

export function CatererSheet({ menuName, courses, catalogItems, defaultGuestCount = 150 }: Props) {
  const [guestCount, setGuestCount] = useState(defaultGuestCount)
  const [preferredStore, setPreferredStore] = useState<StoreKey>("costco")
  const [exporting, setExporting] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  const parsedItems = useMemo(() => {
    return catalogItems.map(item => ({
      ...item,
      ingredient_list: parseJSON<Array<{item: string; quantity: string; costcoPrice?: number; wincoPrice?: number; samsClubPrice?: number}>>(item.ingredient_list, []),
      ingredient_links: parseJSON<Record<string, any>>(item.ingredient_links, {}),
    }))
  }, [catalogItems])

  const itemMap = useMemo(() => new Map(parsedItems.map(i => [i.id, i])), [parsedItems])

  const grouped = useMemo(() => {
    const g: Record<string, Course[]> = {}
    for (const c of courses) {
      const t = c.course_type || "appetizer"
      if (!g[t]) g[t] = []
      g[t].push(c)
    }
    return g
  }, [courses])

  const getStoreCostPerServing = (item: typeof parsedItems[0]): number | null => {
    const links = item.ingredient_links
    if (!links || typeof links !== "object") return null
    const store = links[preferredStore]
    return store?.costPerServing ?? null
  }

  const getStoreTotalForGuests = (item: typeof parsedItems[0]): number | null => {
    const links = item.ingredient_links
    if (!links || typeof links !== "object") return null
    const store = links[preferredStore]
    if (!store) return null
    return (store.totalFor150 / 150) * guestCount
  }

  const categoryTotals = useMemo(() => {
    const totals: Record<string, { items: Course[]; totalCost: number; totalWeight: number; itemCount: number }> = {}
    for (const [type, typeCourses] of Object.entries(grouped)) {
      let totalCost = 0; let totalWeight = 0
      for (const course of typeCourses) {
        const item = itemMap.get(course.item_id)
        if (!item) continue
        const cost = getStoreTotalForGuests(item)
        if (cost) totalCost += cost
        if (item.portion_weight_g) totalWeight += item.portion_weight_g * guestCount
      }
      totals[type] = { items: typeCourses, totalCost, totalWeight, itemCount: typeCourses.length }
    }
    return totals
  }, [grouped, guestCount, preferredStore, itemMap])

  const aggregatedIngredients = useMemo(() => {
    const agg: Record<string, { totalQty: number; unit: string; costcoTotal: number; wincoTotal: number; samsTotal: number; bestStore: StoreKey; bestPrice: number }> = {}
    for (const [, typeCourses] of Object.entries(grouped)) {
      for (const course of typeCourses) {
        const item = itemMap.get(course.item_id)
        if (!item) continue
        const ingList = item.ingredient_list
        if (!Array.isArray(ingList) || ingList.length === 0) continue
        for (const ing of ingList) {
          if (!ing || !ing.item) continue
          const key = `${ing.item}|${(ing.quantity || '').replace(/[0-9.]/g, '').trim() || 'unit'}`
          if (!agg[key]) {
            agg[key] = { totalQty: 0, unit: (ing.quantity || '').replace(/[0-9.]/g, '').trim() || 'unit', costcoTotal: 0, wincoTotal: 0, samsTotal: 0, bestStore: 'costco', bestPrice: Infinity }
          }
          const qtyMatch = (ing.quantity || '').match(/^([\d.]+)/)
          const qtyNum = qtyMatch ? parseFloat(qtyMatch[1]) : 1
          agg[key].totalQty += qtyNum * guestCount
          if (ing.costcoPrice) agg[key].costcoTotal += ing.costcoPrice * qtyNum * guestCount
          if (ing.wincoPrice) agg[key].wincoTotal += ing.wincoPrice * qtyNum * guestCount
          if (ing.samsClubPrice) agg[key].samsTotal += ing.samsClubPrice * qtyNum * guestCount
        }
      }
    }
    for (const key of Object.keys(agg)) {
      const a = agg[key]
      const prices: [StoreKey, number][] = [
        ['costco', a.costcoTotal],
        ['winco', a.wincoTotal],
        ['sams', a.samsTotal],
      ].filter(([, p]) => (p as number) > 0) as [StoreKey, number][]
      if (prices.length > 0) {
        const best = prices.sort(([, a], [, b]) => a - b)[0]
        a.bestStore = best[0]
        a.bestPrice = best[1]
      }
    }
    return agg
  }, [grouped, guestCount, itemMap])

  const grandTotal = useMemo(() => {
    let total = 0
    for (const [, t] of Object.entries(categoryTotals)) total += t.totalCost
    return total
  }, [categoryTotals])

  const sortedCategories = CATEGORY_ORDER.filter(t => grouped[t]?.length > 0)

  const handlePrint = () => {
    if (!sheetRef.current) return
    const clone = sheetRef.current.cloneNode(true) as HTMLElement
    const styles = Array.from(document.styleSheets)
      .map(s => { try { return Array.from(s.cssRules || []).map(r => r.cssText).join("") } catch { return "" } })
      .join("")
    const pw = window.open("", "_blank")
    if (!pw) return
    pw.document.write(`
      <!DOCTYPE html><html>
      <head><title>Caterer Sheet - ${menuName}</title>
      <style>${styles}
        @page{margin:0.5in;size:letter portrait}
        body{margin:0;padding:20px;background:#fff;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .no-print{display:none!important}
        table{page-break-inside:auto}
        tr{page-break-inside:avoid;page-break-after:auto}
        thead{display:table-header-group}
        tfoot{display:table-footer-group}
      </style></head>
      <body>${clone.outerHTML}</body></html>
    `)
    pw.document.close()
    pw.onload = () => { pw.focus(); setTimeout(() => pw.print(), 300) }
  }

  const handleExportPNG = async () => {
    if (!sheetRef.current) return
    setExporting(true)
    try {
      const { toPng } = await import("html-to-image")
      const url = await toPng(sheetRef.current, { quality: 1, pixelRatio: 2 })
      const a = document.createElement("a")
      a.download = `caterer-sheet-${menuName.replace(/\s+/g, '-').toLowerCase()}.png`
      a.href = url; a.click()
    } catch (e) { console.error("Export failed:", e) }
    finally { setExporting(false) }
  }

  if (sortedCategories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ChefHat className="mx-auto size-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No menu items to generate a caterer sheet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Add items to your menu first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls - no-print */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <Input
              type="number" min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 h-8 text-sm text-center"
            />
            <span className="text-xs text-muted-foreground">guests</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex rounded-lg border overflow-hidden">
            {(["costco", "winco", "sams"] as StoreKey[]).map((store) => (
              <button
                key={store}
                onClick={() => setPreferredStore(store)}
                className={cn(
                  "px-2.5 py-1.5 text-[10px] font-medium transition-colors",
                  preferredStore === store
                    ? cn("text-white", store === "costco" ? "bg-emerald-600" : store === "winco" ? "bg-amber-600" : "bg-blue-600")
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                {STORE_INFO[store].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs h-8" onClick={handleExportPNG} disabled={exporting}>
            {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}PNG
          </Button>
          <Button size="sm" className="gap-2 text-xs h-8" onClick={handlePrint}>
            <Printer className="size-3.5" />Print / PDF
          </Button>
        </div>
      </div>

      {/* The Sheet — LARGE TEXT for gorgeous multi-page printout */}
      <div
        ref={sheetRef}
        className="overflow-hidden rounded-xl border bg-white shadow-lg mx-auto"
        style={{ maxWidth: 1100, fontFamily: "'Times New Roman', 'Playfair Display', Georgia, serif" }}
      >
        {/* Gold accent bar */}
        <div className="h-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />

        {/* HEADER — large & elegant */}
        <div className="px-10 pt-10 pb-6 text-center border-b border-amber-200/50">
          <p className="text-sm uppercase tracking-[0.5em] text-amber-600/70 font-semibold">The Lynch Wedding</p>
          <h2 className="mt-3 font-serif text-4xl text-[#1a2e1a] tracking-wide">Caterer's Production Sheet</h2>
          <div className="mx-auto mt-4 h-px w-24 bg-amber-400/60" />
          <p className="mt-4 text-lg text-[#1a2e1a]/60 uppercase tracking-wider">
            {menuName} · September 14, 2026 · <strong>{guestCount} Guests</strong>
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            Pricing based on <strong>{STORE_INFO[preferredStore].label}</strong>
          </p>
        </div>

        {/* BODY */}
        <div className="px-10 py-8 space-y-10">
          {sortedCategories.map(type => {
            const typeCourses = grouped[type]
            const t = categoryTotals[type]
            const Icon = CATEGORY_ICONS[type] || ChefHat
            if (!t) return null

            return (
              <div key={type} className="page-break-inside-avoid">
                {/* Section header — larger */}
                <div className="flex items-center gap-4 mb-4 pb-3 border-b border-amber-200/40">
                  <Icon className="size-6 text-amber-600" />
                  <h3 className="font-serif text-lg uppercase tracking-[0.3em] text-[#1a2e1a]/80 font-semibold">
                    {CATEGORY_EMOJI[type] || ""} {CATEGORY_LABELS[type] || type}
                  </h3>
                  <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 ml-auto text-amber-700 border-amber-300">
                    {t.itemCount} item{t.itemCount !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Items table — LARGER TEXT */}
                <div className="overflow-x-auto">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b border-amber-100">
                        <th className="text-left py-2 pr-3 font-semibold text-sm uppercase tracking-wider text-[#1a2e1a]/60">Item</th>
                        <th className="text-right py-2 px-3 font-semibold text-sm uppercase tracking-wider text-[#1a2e1a]/60">Portion</th>
                        <th className="text-right py-2 px-3 font-semibold text-sm uppercase tracking-wider text-[#1a2e1a]/60">Qty Needed</th>
                        <th className="text-right py-2 px-3 font-semibold text-sm uppercase tracking-wider text-[#1a2e1a]/60">Unit Cost</th>
                        <th className="text-right py-2 pl-3 font-semibold text-sm uppercase tracking-wider text-[#1a2e1a]/60">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeCourses.map(course => {
                        const item = itemMap.get(course.item_id)
                        if (!item) return null
                        const cost = getStoreCostPerServing(item)
                        const totalCost = getStoreTotalForGuests(item)
                        const weightG = item.portion_weight_g
                        const weightOz = weightG ? (weightG / 28.3495).toFixed(1) : null
                        const totalWeight = weightG ? (weightG * guestCount / 453.592).toFixed(1) : null
                        return (
                          <tr key={course.course_number} className="border-b border-amber-50">
                            <td className="py-3 pr-3">
                              <p className="font-medium text-base text-[#1a2e1a]">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-[#1a2e1a]/50 italic mt-0.5">{item.description}</p>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right tabular-nums text-base text-[#1a2e1a]/70">
                              {weightG ? `${weightG}g` : "—"}
                              {weightOz && <span className="text-xs text-muted-foreground"> / {weightOz} oz</span>}
                            </td>
                            <td className="py-3 px-3 text-right tabular-nums text-base text-[#1a2e1a]/70">
                              {totalWeight ? `${totalWeight} lbs` : "—"}
                            </td>
                            <td className="py-3 px-3 text-right tabular-nums text-base text-[#1a2e1a] font-medium">
                              {cost ? `$${cost.toFixed(2)}` : "—"}
                            </td>
                            <td className="py-3 pl-3 text-right tabular-nums text-base text-[#1a2e1a] font-medium">
                              {totalCost ? `$${totalCost.toFixed(2)}` : "—"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-amber-300/60">
                        <td className="py-3 pr-3 font-semibold text-base text-[#1a2e1a]">Section Total</td>
                        <td />
                        <td className="py-3 px-3 text-right tabular-nums text-base text-[#1a2e1a]/70">
                          {t.totalWeight > 0 ? `${(t.totalWeight / 453.592).toFixed(1)} lbs` : "—"}
                        </td>
                        <td />
                        <td className="py-3 pl-3 text-right tabular-nums font-semibold text-lg text-[#1a2e1a]">
                          ${t.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )
          })}
        </div>

        {/* CONSOLIDATED INGREDIENTS — large text */}
        {Object.keys(aggregatedIngredients).length > 0 && (
          <div className="px-10 pb-8 page-break-before">
            <div className="border-t border-amber-200/40 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="size-6 text-amber-600" />
                <h3 className="font-serif text-lg uppercase tracking-[0.3em] text-[#1a2e1a]/80 font-semibold">
                  Consolidated Ingredient Shopping List
                </h3>
                <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 ml-auto text-amber-700 border-amber-300">
                  {Object.keys(aggregatedIngredients).length} ingredients
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-100">
                      <th className="text-left py-2 pr-3 font-semibold text-xs uppercase tracking-wider text-[#1a2e1a]/60">Ingredient</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-[#1a2e1a]/60">Total Needed</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-[#1a2e1a]/60">Costco</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-[#1a2e1a]/60">WinCo</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-[#1a2e1a]/60">Sam's Club</th>
                      <th className="text-right py-2 pl-3 font-semibold text-xs uppercase tracking-wider text-[#1a2e1a]/60">Best Store</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(aggregatedIngredients)
                      .sort(([, a], [, b]) => b.bestPrice - a.bestPrice)
                      .map(([key, ing]) => {
                        const name = key.split('|')[0]
                        return (
                          <tr key={key} className="border-b border-amber-50">
                            <td className="py-2 pr-3 font-medium text-[#1a2e1a]">{name}</td>
                            <td className="py-2 px-3 text-right tabular-nums text-[#1a2e1a]/70">{ing.totalQty.toFixed(1)} {ing.unit}</td>
                            <td className="py-2 px-3 text-right tabular-nums text-emerald-600">{ing.costcoTotal > 0 ? `$${ing.costcoTotal.toFixed(2)}` : "—"}</td>
                            <td className="py-2 px-3 text-right tabular-nums text-amber-600">{ing.wincoTotal > 0 ? `$${ing.wincoTotal.toFixed(2)}` : "—"}</td>
                            <td className="py-2 px-3 text-right tabular-nums text-blue-600">{ing.samsTotal > 0 ? `$${ing.samsTotal.toFixed(2)}` : "—"}</td>
                            <td className="py-2 pl-3 text-right">
                              {ing.bestPrice < Infinity && (
                                <span className={cn("text-xs font-semibold", STORE_INFO[ing.bestStore].color)}>
                                  {STORE_INFO[ing.bestStore].label}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER — large, bold, gorgeous */}
        <div className="border-t border-amber-200/40 px-10 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-[#1a2e1a]/40">
                All costs based on {STORE_INFO[preferredStore].label} pricing
              </p>
              <p className="text-xs text-[#1a2e1a]/30 italic">
                This sheet is for catering production purposes. Multiple pages may print.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1a2e1a]/50">Grand Total</p>
              <p className="font-serif text-4xl text-[#1a2e1a] font-bold tabular-nums">${grandTotal.toFixed(2)}</p>
              <p className="text-sm text-[#1a2e1a]/40">for {guestCount} guests</p>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />
      </div>
    </div>
  )
}