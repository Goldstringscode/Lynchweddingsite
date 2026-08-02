"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download, Printer, ShoppingBag, Users, Scale, DollarSign,
  ChefHat, Salad, Beef, Coffee, CakeSlice, Sparkles, TrendingDown,
  Loader2, Clock, AlertTriangle, ClipboardList, Truck,
  UtensilsCrossed, FileSpreadsheet, BookOpen, ListChecks,
  Search, Filter, Info, ChevronDown, ChevronRight, Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CatererSheet } from "./caterer-sheet"

// ---- Types ----
interface CatalogItem {
  id: string; name: string; section: string | null; category: string
  description: string; price: number | null
  suggested_menu_price?: number | null; cost_per_serving?: number | null
  portion_weight_g?: number | null; is_available: boolean; is_signature?: boolean
  difficulty?: string | null; prep_time?: number | null; season_tags?: string[] | null
  allergens?: string[] | null; suggested_pairings?: string[] | null
  nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number } | null
  ingredient_list?: any
  ingredient_links?: any
}

interface Course { course_number: number; course_type: string; item_id: string; portion_size: string; notes?: string }

interface MenuDraft {
  id: string; name: string; guest_count?: number; courses: Course[]
}

// ---- Helpers ----
function parseJSON<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback
  if (typeof val === "string") { try { return JSON.parse(val) } catch { return fallback } }
  return val as T
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

const ALL_ALLERGENS = ["dairy", "gluten", "nuts", "shellfish", "eggs", "soy", "fish", "sesame"]

const DIFFICULTY_LEVELS: Record<string, number> = { easy: 1, medium: 2, hard: 3 }

const STORE_NAMES: Record<StoreKey, string> = { costco: "Costco", winco: "WinCo", sams: "Sam's Club" }

// ---- Equipment mapping ----
function getEquipmentNeeded(section: string, count: number): string[] {
  const map: Record<string, string[]> = {
    "hors-doeuvres": ["Serving platters (small)", "Cocktail napkins", "Toothpicks/skewers", "Chafing dishes (if hot)"],
    "appetizer": ["Bread baskets", "Soup tureens", "Salad bowls", "Serving tongs"],
    "protein": ["Dinner plates (large)", "Serving platters (large)", "Steak knives", "Chafing dishes", "Gravy boats"],
    "vegan": ["Dinner plates", "Serving bowls", "Sauce ramekins", "Garnish tweezers"],
    "side": ["Serving bowls (medium)", "Serving spoons", "Warming trays"],
    "dessert": ["Dessert plates (small)", "Dessert forks", "Cake stand", "Serving spatula"],
  }
  const base = map[section] || ["Serving dishes"]
  // Scale based on item count
  if (count > 3) return [...base, "Backup serving pieces"]
  return base
}

// ---- Staffing calculator ----
function estimateStaff(items: CatalogItem[], guestCount: number): { chefs: number; servers: number; stations: number } {
  const totalDifficulty = items.reduce((sum, i) => sum + (DIFFICULTY_LEVELS[i.difficulty || "medium"] || 2), 0)
  const avgDifficulty = items.length > 0 ? totalDifficulty / items.length : 2
  const baseChefs = Math.max(1, Math.ceil(items.length / 8))
  const chefBonus = avgDifficulty > 2 ? 1 : 0
  const guestServers = Math.max(2, Math.ceil(guestCount / 25))
  const stations = Math.max(1, Math.ceil(items.length / 4))
  return { chefs: baseChefs + chefBonus, servers: guestServers, stations }
}

// ---- Main Component ----
export function CateringTab() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [drafts, setDrafts] = useState<MenuDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [guestCount, setGuestCount] = useState(80)
  const [preferredStore, setPreferredStore] = useState<StoreKey>("costco")
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/menu").then(r => r.json()),
      fetch("/api/menu/drafts").then(r => r.json()),
    ]).then(([cat, dr]) => {
      setCatalog(Array.isArray(cat) ? cat : [])
      const draftsArr = Array.isArray(dr) ? dr : []
      setDrafts(draftsArr)
      if (draftsArr.length > 0) setSelectedDraftId(draftsArr[0].id)
      if (draftsArr[0]?.guest_count) setGuestCount(draftsArr[0].guest_count)
    }).finally(() => setLoading(false))
  }, [])

  const selectedDraft = drafts.find(d => d.id === selectedDraftId)

  // Parse JSONB fields
  const parsedCatalog = useMemo(() => catalog.map(item => ({
    ...item,
    ingredient_list: parseJSON<Array<{item: string; quantity: string; costcoPrice?: number; wincoPrice?: number; samsClubPrice?: number}>>(item.ingredient_list, []),
    ingredient_links: parseJSON<Record<string, any>>(item.ingredient_links, {}),
  })), [catalog])

  const itemMap = useMemo(() => new Map(parsedCatalog.map(i => [i.id, i])), [parsedCatalog])

  const courses = selectedDraft?.courses || []

  // ---- Derived Data ----
  const menuItems = useMemo(() => {
    return courses.map(c => itemMap.get(c.item_id)).filter(Boolean) as CatalogItem[]
  }, [courses, itemMap])

  // Group by section
  const grouped = useMemo(() => {
    const g: Record<string, Course[]> = {}
    for (const c of courses) {
      const t = c.course_type || "appetizer"
      if (!g[t]) g[t] = []
      g[t].push(c)
    }
    return g
  }, [courses])

  // Aggregated ingredients
  const aggregatedIngredients = useMemo(() => {
    const agg: Record<string, { totalQty: number; unit: string; costcoTotal: number; wincoTotal: number; samsTotal: number; bestStore: StoreKey; bestPrice: number }> = {}
    for (const [, typeCourses] of Object.entries(grouped)) {
      for (const course of typeCourses) {
        const item = itemMap.get(course.item_id)
        if (!item) continue
        const ingList = item.ingredient_list
        if (!Array.isArray(ingList)) continue
        for (const ing of ingList) {
          if (!ing?.item) continue
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

  // Allergen matrix
  const allergenMatrix = useMemo(() => {
    const matrix: Record<string, string[]> = {}
    for (const item of menuItems) {
      if (item.allergens?.length) {
        for (const a of item.allergens) {
          if (!matrix[a]) matrix[a] = []
          matrix[a].push(item.name)
        }
      }
    }
    return matrix
  }, [menuItems])

  // Cost analysis
  const costAnalysis = useMemo(() => {
    let totalIngredientCost = 0
    let totalMenuPrice = 0
    let totalWeight = 0
    const sectionCosts: Record<string, { count: number; cost: number; price: number; weight: number }> = {}

    for (const course of courses) {
      const item = itemMap.get(course.item_id)
      if (!item) continue
      const type = course.course_type || "appetizer"
      if (!sectionCosts[type]) sectionCosts[type] = { count: 0, cost: 0, price: 0, weight: 0 }
      
      sectionCosts[type].count++
      const links = item.ingredient_links
      if (links && typeof links === "object") {
        const store = links[preferredStore]
        if (store?.costPerServing) {
          sectionCosts[type].cost += store.costPerServing
          totalIngredientCost += store.costPerServing
        }
      }
      const price = item.suggested_menu_price ?? item.price ?? 0
      sectionCosts[type].price += price
      totalMenuPrice += price
      if (item.portion_weight_g) {
        sectionCosts[type].weight += item.portion_weight_g
        totalWeight += item.portion_weight_g
      }
    }

    return { totalIngredientCost, totalMenuPrice, totalWeight, sections: sectionCosts }
  }, [courses, itemMap, preferredStore])

  // Prep timeline
  const prepTimeline = useMemo(() => {
    const timeline: { time: string; label: string; items: string[]; priority: "critical" | "important" | "standard" }[] = []
    
    const hardItems = menuItems.filter(i => i.difficulty === "hard")
    const mediumItems = menuItems.filter(i => i.difficulty === "medium")
    const easyItems = menuItems.filter(i => i.difficulty === "easy" || !i.difficulty)

    if (hardItems.length > 0) {
      timeline.push({
        time: "5-7 days before",
        label: "Begin prep (complex dishes)",
        items: hardItems.map(i => i.name),
        priority: "critical",
      })
    }
    if (mediumItems.length > 0) {
      timeline.push({
        time: "2-3 days before",
        label: "Mid-week prep",
        items: mediumItems.map(i => i.name),
        priority: "important",
      })
    }
    if (easyItems.length > 0) {
      timeline.push({
        time: "Day before / Morning of",
        label: "Final prep & assembly",
        items: easyItems.map(i => i.name),
        priority: "standard",
      })
    }

    // Service order based on course order
    const sortedTypes = CATEGORY_ORDER.filter(t => grouped[t]?.length > 0)
    if (sortedTypes.length > 0) {
      timeline.push({
        time: "Service day",
        label: "Service order",
        items: sortedTypes.map(t => `${CATEGORY_EMOJI[t] || ""} ${CATEGORY_LABELS[t] || t}`),
        priority: "critical",
      })
    }

    return timeline
  }, [menuItems, grouped])

  // Equipment needs
  const equipmentNeeds = useMemo(() => {
    const all: { item: string; qty: number; section: string }[] = []
    for (const [type, typeCourses] of Object.entries(grouped)) {
      const equip = getEquipmentNeeded(type, typeCourses.length)
      for (const e of equip) {
        const existing = all.find(x => x.item === e)
        if (existing) existing.qty++
        else all.push({ item: e, qty: 1, section: CATEGORY_LABELS[type] || type })
      }
    }
    return all.sort((a, b) => b.qty - a.qty)
  }, [grouped])

  // Staffing
  const staffing = useMemo(() => estimateStaff(menuItems, guestCount), [menuItems, guestCount])

  // Nutrition summary
  const nutritionSummary = useMemo(() => {
    let cal = 0, protein = 0, carbs = 0, fat = 0
    for (const item of menuItems) {
      if (item.nutrition) {
        cal += item.nutrition.calories || 0
        protein += item.nutrition.protein || 0
        carbs += item.nutrition.carbs || 0
        fat += item.nutrition.fat || 0
      }
    }
    return { cal, protein, carbs, fat, count: menuItems.length }
  }, [menuItems])

  // ---- Print handler ----
  const handlePrint = (elementId: string) => {
    const el = document.getElementById(elementId)
    if (!el) return
    const clone = el.cloneNode(true) as HTMLElement
    const styles = Array.from(document.styleSheets)
      .map(s => { try { return Array.from(s.cssRules || []).map(r => r.cssText).join("") } catch { return "" } })
      .join("")
    const pw = window.open("", "_blank")
    if (!pw) return
    pw.document.write(`
      <!DOCTYPE html><html>
      <head><title>Catering Report</title>
      <style>${styles}
        @page{margin:0.5in;size:letter portrait}
        body{margin:0;padding:20px;background:#fff;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .no-print{display:none!important}
      </style></head>
      <body>${clone.outerHTML}</body></html>
    `)
    pw.document.close()
    pw.onload = () => { pw.focus(); setTimeout(() => pw.print(), 300) }
  }

  // Export all as single print
  const handleExportAll = () => {
    handlePrint("catering-full-report")
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  }

  if (drafts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <ChefHat className="mx-auto size-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">No menus yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create a menu in the Builder tab first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6" id="catering-full-report">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          {/* Menu selector */}
          <div className="flex rounded-lg border overflow-hidden">
            {drafts.map(d => (
              <button
                key={d.id}
                onClick={() => { setSelectedDraftId(d.id); if (d.guest_count) setGuestCount(d.guest_count) }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedDraftId === d.id ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                {d.name}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-border" />
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
                {STORE_NAMES[store]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-2 text-xs h-8" onClick={handleExportAll}>
            <Printer className="size-3.5" />Print All Reports
          </Button>
        </div>
      </div>

      {/* Section: Quick Overview Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10 border-emerald-200/50">
          <CardContent className="p-3 text-center">
            <UtensilsCrossed className="size-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-xl font-bold tabular-nums">{courses.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Menu Items</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/10 border-amber-200/50">
          <CardContent className="p-3 text-center">
            <DollarSign className="size-4 mx-auto mb-1 text-amber-500" />
            <p className="text-xl font-bold tabular-nums">${costAnalysis.totalIngredientCost.toFixed(2)}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Cost / Person</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/10 border-blue-200/50">
          <CardContent className="p-3 text-center">
            <DollarSign className="size-4 mx-auto mb-1 text-blue-500" />
            <p className="text-xl font-bold tabular-nums">${(costAnalysis.totalIngredientCost * guestCount).toFixed(0)}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Food Cost</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/10 border-purple-200/50">
          <CardContent className="p-3 text-center">
            <Scale className="size-4 mx-auto mb-1 text-purple-500" />
            <p className="text-xl font-bold tabular-nums">{(costAnalysis.totalWeight * guestCount / 453.592).toFixed(1)}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Weight (lbs)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-950/10 border-rose-200/50">
          <CardContent className="p-3 text-center">
            <Users className="size-4 mx-auto mb-1 text-rose-500" />
            <p className="text-xl font-bold tabular-nums">{guestCount}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Guests</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sky-50/50 to-transparent dark:from-sky-950/10 border-sky-200/50">
          <CardContent className="p-3 text-center">
            <ChefHat className="size-4 mx-auto mb-1 text-sky-500" />
            <p className="text-xl font-bold tabular-nums">{staffing.chefs + staffing.servers}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Staff Needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Catering Content */}
      <Tabs defaultValue="production" className="space-y-4">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="production" className="gap-1.5 text-xs"><FileSpreadsheet className="size-3.5" />Production Sheet</TabsTrigger>
          <TabsTrigger value="shopping" className="gap-1.5 text-xs"><ShoppingBag className="size-3.5" />Shopping List</TabsTrigger>
          <TabsTrigger value="costs" className="gap-1.5 text-xs"><DollarSign className="size-3.5" />Cost Analysis</TabsTrigger>
          <TabsTrigger value="allergens" className="gap-1.5 text-xs"><AlertTriangle className="size-3.5" />Allergens</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5 text-xs"><Clock className="size-3.5" />Prep Timeline</TabsTrigger>
          <TabsTrigger value="equipment" className="gap-1.5 text-xs"><Truck className="size-3.5" />Equipment</TabsTrigger>
          <TabsTrigger value="nutrition" className="gap-1.5 text-xs"><ListChecks className="size-3.5" />Nutrition</TabsTrigger>
        </TabsList>

        {/* 1. Production Sheet */}
        <TabsContent value="production">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">Caterer's Production Sheet</CardTitle>
                <CardDescription>Complete itemized breakdown for the caterer</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs no-print" onClick={() => handlePrint("production-sheet")}>
                <Printer className="size-3.5" />Print
              </Button>
            </CardHeader>
            <CardContent>
              <div id="production-sheet">
                <CatererSheet
                  menuName={selectedDraft?.name || "Menu"}
                  courses={courses}
                  catalogItems={catalog}
                  defaultGuestCount={guestCount}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Shopping List */}
        <TabsContent value="shopping">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">Consolidated Shopping List</CardTitle>
                <CardDescription>All ingredients aggregated, best store per item</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs no-print" onClick={() => handlePrint("shopping-list")}>
                <Printer className="size-3.5" />Print
              </Button>
            </CardHeader>
            <CardContent id="shopping-list">
              {Object.keys(aggregatedIngredients).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <ShoppingBag className="mx-auto size-8 text-muted-foreground/30 mb-2" />
                  <p>No ingredient data available for this menu.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Items need ingredient_list data to generate a shopping list.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="size-3" />
                    Showing total quantities for <strong>{guestCount}</strong> guests. Prices from <strong>{STORE_NAMES[preferredStore]}</strong>.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Ingredient</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Total Needed</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Costco</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">WinCo</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Sam's Club</th>
                          <th className="text-right py-2 pl-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Best Store</th>
                          <th className="text-right py-2 pl-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Best Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.entries(aggregatedIngredients)
                          .sort(([, a], [, b]) => b.bestPrice - a.bestPrice)
                          .map(([key, ing]) => {
                            const name = key.split('|')[0]
                            return (
                              <tr key={key} className="hover:bg-accent/20">
                                <td className="py-2 pr-3 font-medium">{name}</td>
                                <td className="py-2 px-3 text-right tabular-nums">{ing.totalQty.toFixed(1)} {ing.unit}</td>
                                <td className={cn("py-2 px-3 text-right tabular-nums", preferredStore === "costco" ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                                  {ing.costcoTotal > 0 ? `$${ing.costcoTotal.toFixed(2)}` : "—"}
                                </td>
                                <td className={cn("py-2 px-3 text-right tabular-nums", preferredStore === "winco" ? "text-amber-600 font-medium" : "text-muted-foreground")}>
                                  {ing.wincoTotal > 0 ? `$${ing.wincoTotal.toFixed(2)}` : "—"}
                                </td>
                                <td className={cn("py-2 px-3 text-right tabular-nums", preferredStore === "sams" ? "text-blue-600 font-medium" : "text-muted-foreground")}>
                                  {ing.samsTotal > 0 ? `$${ing.samsTotal.toFixed(2)}` : "—"}
                                </td>
                                <td className="py-2 pl-3 text-right">
                                  {ing.bestPrice < Infinity && (
                                    <Badge variant="secondary" className={cn("text-[10px]", ing.bestStore === "costco" ? "bg-emerald-100 text-emerald-700" : ing.bestStore === "winco" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                                      {STORE_NAMES[ing.bestStore]}
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-2 pl-3 text-right tabular-nums font-semibold">
                                  {ing.bestPrice < Infinity ? `$${ing.bestPrice.toFixed(2)}` : "—"}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td className="py-3 pr-3 font-semibold">Total ({Object.keys(aggregatedIngredients).length} ingredients)</td>
                          <td />
                          <td className="py-3 px-3 text-right tabular-nums font-semibold text-emerald-600">
                            ${Object.values(aggregatedIngredients).reduce((s, i) => s + i.costcoTotal, 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-semibold text-amber-600">
                            ${Object.values(aggregatedIngredients).reduce((s, i) => s + i.wincoTotal, 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums font-semibold text-blue-600">
                            ${Object.values(aggregatedIngredients).reduce((s, i) => s + i.samsTotal, 0).toFixed(2)}
                          </td>
                          <td />
                          <td className="py-3 pl-3 text-right tabular-nums font-semibold">
                            ${Object.values(aggregatedIngredients).reduce((s, i) => s + i.bestPrice, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {/* Store comparison cards */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {(["costco", "winco", "sams"] as StoreKey[]).map(store => {
                      const total = Object.values(aggregatedIngredients).reduce((s, i) => {
                        const key = `${store}Total` as keyof typeof i
                        return s + (i[key] as number)
                      }, 0)
                      const colorMap = { costco: "emerald", winco: "amber", sams: "blue" }
                      const c = colorMap[store]
                      const isBest = total <= Math.min(
                        Object.values(aggregatedIngredients).reduce((s, i) => s + i.costcoTotal, 0),
                        Object.values(aggregatedIngredients).reduce((s, i) => s + i.wincoTotal, 0),
                        Object.values(aggregatedIngredients).reduce((s, i) => s + i.samsTotal, 0)
                      )
                      return (
                        <div key={store} className={cn("rounded-lg border p-4 text-center", isBest && `ring-2 ring-${c}-400`)}>
                          <p className={cn("text-sm font-semibold", `text-${c}-600`)}>{STORE_NAMES[store]}</p>
                          <p className={cn("text-2xl font-bold tabular-nums mt-1", `text-${c}-600`)}>${total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total ingredients</p>
                          {isBest && <Badge className="mt-2 text-[9px] bg-green-100 text-green-700">Best Price</Badge>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Cost Analysis */}
        <TabsContent value="costs">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">Cost Analysis</CardTitle>
                <CardDescription>Full financial breakdown for the menu</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs no-print" onClick={() => handlePrint("cost-analysis")}>
                <Printer className="size-3.5" />Print
              </Button>
            </CardHeader>
            <CardContent id="cost-analysis">
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Food Cost / Person</p>
                    <p className="text-3xl font-bold tabular-nums mt-1 text-emerald-600">${costAnalysis.totalIngredientCost.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Food Cost</p>
                    <p className="text-3xl font-bold tabular-nums mt-1 text-blue-600">${(costAnalysis.totalIngredientCost * guestCount).toFixed(0)}</p>
                  </div>
                  <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Menu Price / Person</p>
                    <p className="text-3xl font-bold tabular-nums mt-1 text-amber-600">${costAnalysis.totalMenuPrice.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Profit Margin</p>
                    <p className="text-3xl font-bold tabular-nums mt-1 text-purple-600">
                      {costAnalysis.totalMenuPrice > 0
                        ? `${(((costAnalysis.totalMenuPrice - costAnalysis.totalIngredientCost) / costAnalysis.totalMenuPrice) * 100).toFixed(0)}%`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Per-section breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Section</th>
                        <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Items</th>
                        <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Cost/Serving</th>
                        <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Menu Price</th>
                        <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Total Cost</th>
                        <th className="text-right py-2 pl-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Weight (lbs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {CATEGORY_ORDER.filter(t => costAnalysis.sections[t]).map(type => {
                        const s = costAnalysis.sections[type]
                        const totalCost = s.cost * guestCount
                        const totalW = s.weight * guestCount / 453.592
                        return (
                          <tr key={type} className="hover:bg-accent/20">
                            <td className="py-2 font-medium">{CATEGORY_EMOJI[type] || ""} {CATEGORY_LABELS[type] || type}</td>
                            <td className="py-2 px-3 text-right tabular-nums">{s.count}</td>
                            <td className="py-2 px-3 text-right tabular-nums">${s.cost.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right tabular-nums">${s.price.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right tabular-nums font-medium">${totalCost.toFixed(0)}</td>
                            <td className="py-2 pl-3 text-right tabular-nums">{totalW.toFixed(1)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td className="py-3">Total</td>
                        <td className="py-3 px-3 text-right tabular-nums">{courses.length}</td>
                        <td className="py-3 px-3 text-right tabular-nums">${costAnalysis.totalIngredientCost.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right tabular-nums">${costAnalysis.totalMenuPrice.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right tabular-nums">${(costAnalysis.totalIngredientCost * guestCount).toFixed(0)}</td>
                        <td className="py-3 pl-3 text-right tabular-nums">{(costAnalysis.totalWeight * guestCount / 453.592).toFixed(1)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Budget meter */}
                <Card className="border-gold/20 bg-gradient-to-br from-gold/[0.03] to-transparent">
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Budget Impact</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Food cost per guest</span>
                          <span className="font-medium">${costAnalysis.totalIngredientCost.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", costAnalysis.totalIngredientCost <= 15 ? "bg-emerald-500" : costAnalysis.totalIngredientCost <= 25 ? "bg-amber-500" : "bg-red-500")}
                            style={{ width: `${Math.min(100, (costAnalysis.totalIngredientCost / 40) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>$0</span>
                          <span>$15 (budget)</span>
                          <span>$40+</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">Profit Margin</p>
                        <p className={cn("text-lg font-bold", (costAnalysis.totalMenuPrice - costAnalysis.totalIngredientCost) / costAnalysis.totalMenuPrice > 0.5 ? "text-emerald-600" : "text-amber-600")}>
                          {costAnalysis.totalMenuPrice > 0
                            ? `${(((costAnalysis.totalMenuPrice - costAnalysis.totalIngredientCost) / costAnalysis.totalMenuPrice) * 100).toFixed(0)}%`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Allergen Matrix */}
        <TabsContent value="allergens">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">Allergen Matrix</CardTitle>
                <CardDescription>Cross-reference allergens across all menu items</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs no-print" onClick={() => handlePrint("allergen-matrix")}>
                <Printer className="size-3.5" />Print
              </Button>
            </CardHeader>
            <CardContent id="allergen-matrix">
              {Object.keys(allergenMatrix).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <AlertTriangle className="mx-auto size-8 text-muted-foreground/30 mb-2" />
                  <p>No allergen data available for this menu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ALL_ALLERGENS.filter(a => allergenMatrix[a]).map(a => (
                      <div key={a} className={cn(
                        "rounded-lg border p-3 text-center",
                        allergenMatrix[a]?.length > menuItems.length / 2 ? "border-red-300 bg-red-50/50" : "border-amber-200 bg-amber-50/30"
                      )}>
                        <p className="text-sm font-semibold capitalize">{a}</p>
                        <p className="text-lg font-bold tabular-nums">{allergenMatrix[a]?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground">of {menuItems.length} items</p>
                      </div>
                    ))}
                  </div>

                  {/* Detailed matrix */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Allergen</th>
                          <th className="text-left py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Affected Items</th>
                          <th className="text-right py-2 pl-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {ALL_ALLERGENS.filter(a => allergenMatrix[a]).map(a => (
                          <tr key={a} className="hover:bg-accent/20">
                            <td className="py-2 font-medium capitalize">{a}</td>
                            <td className="py-2 px-3">
                              <div className="flex flex-wrap gap-1">
                                {allergenMatrix[a].map(name => (
                                  <Badge key={name} variant="outline" className="text-[10px]">{name}</Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-2 pl-3 text-right tabular-nums">{allergenMatrix[a].length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Prep Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">Prep Timeline & Service Order</CardTitle>
                <CardDescription>Schedule for food preparation and service</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs no-print" onClick={() => handlePrint("prep-timeline")}>
                <Printer className="size-3.5" />Print
              </Button>
            </CardHeader>
            <CardContent id="prep-timeline">
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative space-y-0">
                  {prepTimeline.map((step, i) => (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "size-3 rounded-full shrink-0 ring-2 ring-background z-10",
                          step.priority === "critical" ? "bg-red-500" : step.priority === "important" ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        {i < prepTimeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={step.priority === "critical" ? "destructive" : step.priority === "important" ? "default" : "secondary"} className="text-[9px]">
                            {step.time}
                          </Badge>
                          <span className="text-sm font-medium">{step.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {step.items.map((itemName, j) => (
                            <Badge key={j} variant="outline" className="text-[9px]">
                              {itemName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Difficulty breakdown */}
                <Card className="border-muted">
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Difficulty Breakdown</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/10 p-3">
                        <p className="text-lg font-bold tabular-nums text-green-600">
                          {menuItems.filter(i => i.difficulty === "easy" || !i.difficulty).length}
                        </p>
                        <p className="text-[10px] text-green-700 font-medium">Easy</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/10 p-3">
                        <p className="text-lg font-bold tabular-nums text-amber-600">
                          {menuItems.filter(i => i.difficulty === "medium").length}
                        </p>
                        <p className="text-[10px] text-amber-700 font-medium">Medium</p>
                      </div>
                      <div className="rounded-lg bg-red-50 dark:bg-red-950/10 p-3">
                        <p className="text-lg font-bold tabular-nums text-red-600">
                          {menuItems.filter(i => i.difficulty === "hard").length}
                        </p>
                        <p className="text-[10px] text-red-700 font-medium">Hard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Equipment Guide */}
        <TabsContent value="equipment">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">Equipment & Staffing Guide</CardTitle>
                <CardDescription>Everything needed for production and service</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs no-print" onClick={() => handlePrint("equipment-guide")}>
                <Printer className="size-3.5" />Print
              </Button>
            </CardHeader>
            <CardContent id="equipment-guide">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Equipment */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Truck className="size-4 text-muted-foreground" />
                    Serving Equipment
                  </h4>
                  <div className="divide-y rounded-lg border">
                    {equipmentNeeds.map((eq, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary/30" />
                          <span>{eq.item}</span>
                          <Badge variant="outline" className="text-[8px] px-1">{eq.section}</Badge>
                        </div>
                        <span className="tabular-nums font-medium">{eq.qty}x</span>
                      </div>
                    ))}
                    {equipmentNeeds.length === 0 && (
                      <div className="px-3 py-4 text-xs text-muted-foreground text-center">No equipment data</div>
                    )}
                  </div>
                </div>

                {/* Staffing */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    Staffing Requirements
                  </h4>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChefHat className="size-4 text-muted-foreground" />
                        <span className="text-sm">Chefs</span>
                      </div>
                      <span className="text-xl font-bold tabular-nums">{staffing.chefs}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <span className="text-sm">Servers</span>
                      </div>
                      <span className="text-xl font-bold tabular-nums">{staffing.servers}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee className="size-4 text-muted-foreground" />
                        <span className="text-sm">Service Stations</span>
                      </div>
                      <span className="text-xl font-bold tabular-nums">{staffing.stations}</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-[10px] text-muted-foreground">
                      <strong>Recommendation:</strong> For a {menuItems.length}-item menu serving {guestCount} guests, we recommend
                      <strong> {staffing.chefs} chef{staffing.chefs !== 1 ? "s" : ""}</strong> and
                      <strong> {staffing.servers} server{staffing.servers !== 1 ? "s" : ""}</strong> across
                      <strong> {staffing.stations} station{staffing.stations !== 1 ? "s" : ""}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. Nutrition Summary */}
        <TabsContent value="nutrition">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">Nutrition Summary</CardTitle>
                <CardDescription>Aggregate nutrition across the entire menu</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs no-print" onClick={() => handlePrint("nutrition-summary")}>
                <Printer className="size-3.5" />Print
              </Button>
            </CardHeader>
            <CardContent id="nutrition-summary">
              {nutritionSummary.count === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <ListChecks className="mx-auto size-8 text-muted-foreground/30 mb-2" />
                  <p>No nutrition data available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border bg-orange-50/30 dark:bg-orange-950/10 p-4 text-center">
                      <FlameIcon className="size-5 mx-auto mb-1 text-orange-500" />
                      <p className="text-2xl font-bold tabular-nums">{nutritionSummary.cal.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Calories</p>
                      <p className="text-[9px] text-muted-foreground">{Math.round(nutritionSummary.cal / nutritionSummary.count)} cal / item</p>
                    </div>
                    <div className="rounded-xl border bg-red-50/30 dark:bg-red-950/10 p-4 text-center">
                      <BeefIcon className="size-5 mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold tabular-nums">{nutritionSummary.protein}g</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Protein</p>
                      <p className="text-[9px] text-muted-foreground">{Math.round(nutritionSummary.protein / nutritionSummary.count)}g / item</p>
                    </div>
                    <div className="rounded-xl border bg-amber-50/30 dark:bg-amber-950/10 p-4 text-center">
                      <CarbsIcon className="size-5 mx-auto mb-1 text-amber-500" />
                      <p className="text-2xl font-bold tabular-nums">{nutritionSummary.carbs}g</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Carbs</p>
                      <p className="text-[9px] text-muted-foreground">{Math.round(nutritionSummary.carbs / nutritionSummary.count)}g / item</p>
                    </div>
                    <div className="rounded-xl border bg-blue-50/30 dark:bg-blue-950/10 p-4 text-center">
                      <FatIcon className="size-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-2xl font-bold tabular-nums">{nutritionSummary.fat}g</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Fat</p>
                      <p className="text-[9px] text-muted-foreground">{Math.round(nutritionSummary.fat / nutritionSummary.count)}g / item</p>
                    </div>
                  </div>

                  {/* Per-item nutrition */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Item</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Calories</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Protein</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Carbs</th>
                          <th className="text-right py-2 pl-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Fat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {menuItems.filter(i => i.nutrition).map(item => (
                          <tr key={item.id} className="hover:bg-accent/20">
                            <td className="py-2 font-medium">{item.name}</td>
                            <td className="py-2 px-3 text-right tabular-nums">{item.nutrition?.calories || "—"}</td>
                            <td className="py-2 px-3 text-right tabular-nums">{item.nutrition?.protein ? `${item.nutrition.protein}g` : "—"}</td>
                            <td className="py-2 px-3 text-right tabular-nums">{item.nutrition?.carbs ? `${item.nutrition.carbs}g` : "—"}</td>
                            <td className="py-2 pl-3 text-right tabular-nums">{item.nutrition?.fat ? `${item.nutrition.fat}g` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Inline icon components to avoid missing Lucide imports
function FlameIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
}
function BeefIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 5c-1.5 0-3 .5-4.5 2-1.5-1.5-3-2-4.5-2A3.5 3.5 0 0 0 4 8.5c0 2.8 2.2 6.5 8 11.5 5.8-5 8-8.7 8-11.5A3.5 3.5 0 0 0 16.5 5z"/></svg>
}
function CarbsIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
}
function FatIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 6 4 10 4 14a8 8 0 0 0 16 0c0-4-4-8-8-12z"/><path d="M8 14c0-1.5 1.5-4 4-6 2.5 2 4 4.5 4 6a4 4 0 0 1-8 0z"/></svg>
}