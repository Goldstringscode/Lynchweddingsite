"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChefHat, Users, DollarSign, ShoppingBag, Sparkles, Soup, Flame,
  Scale, TrendingDown, Plus, X, Check, FileSpreadsheet, UtensilsCrossed,
  Beef, Cookie, Salad, Coffee, Wheat, Apple, Search, ArrowUpDown,
  ArrowUp, ArrowDown, Trash2, Copy, Eye, Info, Store, Clock, Award,
  Milk, Egg, Fish, TreePine, Cherry, AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SourcingSection } from "./sourcing-section"

/* ── Types ── */
interface BuffetItem {
  id: string
  category: string
  name: string
  description: string
  section: string | null
  price_per_person: number
  cost_per_serving: number
  portion_weight_g: number | null
  difficulty: string | null
  prep_time: number | null
  nutrition: Record<string, number> | null
  allergens: string[] | null
  season_tags: string[] | null
  dietary_labels: string[] | null
  station_type: string | null
  is_signature: boolean
  is_available: boolean
  ingredient_list: any[] | null
  ingredient_links: Record<string, any> | null
  pricing_breakdown: Record<string, any> | null
  suggested_menu_price: number | null
  guest_count_scale: number | null
}

interface BuffetStation {
  id: string
  name: string
  type: string
  items: { item: BuffetItem; portion?: string }[]
  notes?: string
}

interface BuffetMenu {
  id: string
  name: string
  guest_count: number
  stations: BuffetStation[]
  total_cost_per_person: number
  total_menu_cost: number
}

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

/* ── Constants ── */
const STATION_TYPES = ["carving", "pasta", "seafood", "salad", "dessert", "appetizer-display", "action", "self-serve"]
const STATION_ICONS: Record<string, string> = {
  carving: "🥩", pasta: "🍝", seafood: "🦐", salad: "🥗",
  dessert: "🍰", "appetizer-display": "🧀", action: "👨‍🍳", "self-serve": "🍽️",
}
const SECTION_EMOJI: Record<string, string> = {
  "hors-doeuvres": "🥂", appetizers: "🥗", proteins: "🥩", sides: "🥦", desserts: "🍰",
}
const DIET_COLORS: Record<string, string> = {
  GF: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300",
  V: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300",
  "V+": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300",
  DF: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300",
  NF: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300",
}

/* ── Buffet Item Card ── */
function BuffetItemCard({ item, onSelect, onAdd, isAdded }: {
  item: BuffetItem; onSelect: () => void; onAdd: () => void; isAdded: boolean
}) {
  const price = item.price_per_person || 0
  return (
    <motion.div variants={itemVariants} className="relative group">
      <div className={cn(
        "rounded-2xl border bg-card/80 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        isAdded && "ring-2 ring-emerald-400/40 border-emerald-300 dark:border-emerald-700",
        item.is_signature && "ring-1 ring-gold/20"
      )}>
        <button onClick={onSelect} className="w-full text-left p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl shrink-0">{SECTION_EMOJI[item.section || ""] || "🍽️"}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif text-base sm:text-lg font-semibold truncate">{item.name}</span>
                  {item.is_signature && (
                    <Sparkles className="size-3.5 text-gold shrink-0" />
                  )}
                </div>
                {item.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-3 flex-wrap mt-2.5">
            <span className="text-xl sm:text-2xl font-serif font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              ${price.toFixed(2)}
            </span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">per person</span>
            {item.cost_per_serving > 0 && (
              <span className="text-xs text-muted-foreground/70">
                (${item.cost_per_serving.toFixed(2)} cost)
              </span>
            )}
          </div>

          {/* Dietary labels */}
          {item.dietary_labels && item.dietary_labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.dietary_labels.map((d) => (
                <span key={d} className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md border", DIET_COLORS[d] || "")}>
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* Meta chips */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {item.station_type && (
              <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full capitalize">
                {STATION_ICONS[item.station_type] || "🍽️"} {item.station_type.replace("-", " ")}
              </span>
            )}
            {item.difficulty && (
              <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full capitalize">
                {item.difficulty}
              </span>
            )}
            {item.prep_time && (
              <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                {item.prep_time}min
              </span>
            )}
          </div>
        </button>

        {/* Add button */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <Button
            onClick={onAdd}
            size="sm"
            variant={isAdded ? "secondary" : "default"}
            className="w-full gap-1.5 h-8 text-xs rounded-xl"
          >
            {isAdded ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {isAdded ? "Added to Buffet" : "Add to Buffet"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Detail Modal ── */
function BuffetDetailModal({ item, open, onClose }: { item: BuffetItem | null; open: boolean; onClose: () => void }) {
  if (!item) return null
  const nutrition = item.nutrition || {}
  const ingredients = item.ingredient_list || []
  const pricing = item.ingredient_links || {}
  const price = item.suggested_menu_price ?? item.price_per_person ?? 0
  
  const macros = [
    { label: "Calories", value: nutrition.calories, unit: "Cal", icon: Flame, color: "text-orange-500" },
    { label: "Protein", value: nutrition.protein, unit: "g", icon: Beef, color: "text-red-500" },
    { label: "Carbs", value: nutrition.carbs, unit: "g", icon: Coffee, color: "text-amber-500" },
    { label: "Fat", value: nutrition.fat, unit: "g", icon: Soup, color: "text-blue-500" },
    { label: "Fiber", value: nutrition.fiber, unit: "g", icon: Salad, color: "text-green-500" },
  ].filter(m => m.value != null && m.value > 0)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/20 backdrop-blur-lg" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-popover p-6 sm:p-8 shadow-2xl border border-border/30"
          >
            {/* Close */}
            <button onClick={onClose} className="absolute top-4 right-4 size-8 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors">
              <X className="size-4" />
            </button>

            {/* Title */}
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{SECTION_EMOJI[item.section || ""] || "🍽️"}</span>
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl leading-tight">{item.name}</h2>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
            </div>

            {/* Dietary badges */}
            {item.dietary_labels && item.dietary_labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.dietary_labels.map((d) => (
                  <span key={d} className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", DIET_COLORS[d] || "")}>{d}</span>
                ))}
              </div>
            )}

            {/* Price per person */}
            <div className="flex items-center gap-4 flex-wrap mb-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-serif font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  ${item.price_per_person?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Per Person</p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-serif font-bold tabular-nums">
                  ${((item.price_per_person || 0) * 150).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">For 150 Guests</p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div className="text-center">
                <p className="text-lg font-serif font-bold tabular-nums capitalize">{item.station_type?.replace("-", " ") || "Self-serve"}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Station Type</p>
              </div>
            </div>

            {/* Store Pricing */}
            {item.ingredient_links && (item.ingredient_links as any).costco && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Store Pricing Breakdown</h4>
                <div className="grid grid-cols-3 gap-2">
                  {["costco", "winco", "sams"].map((store) => {
                    const data = (pricing as any)[store]
                    if (!data) return null
                    const colors = { costco: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400", winco: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400", sams: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400" }
                    return (
                      <div key={store} className={`rounded-xl border p-3 text-center ${colors[store as keyof typeof colors] || ""}`}>
                        <p className="text-xs font-semibold capitalize mb-1">{store === "sams" ? "Sam's" : store}</p>
                        <p className="text-lg font-serif font-bold tabular-nums">${data.costPerServing?.toFixed(2) || "0.00"}</p>
                        <p className="text-[10px] opacity-70">per serving</p>
                        {data.totalFor150 && <p className="text-[10px] opacity-70 mt-1">${data.totalFor150} total</p>}
                      </div>
                    )
                  })}
                </div>
                {(pricing as any).savingsPercent && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <TrendingDown className="size-3.5" />
                    Save ${(pricing as any).savingsPerServing?.toFixed(2)}/serving ({(pricing as any).savingsPercent}%)
                  </div>
                )}
              </div>
            )}

            {/* Nutrition */}
            {macros.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Nutrition Per Serving</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {macros.map((m) => (
                    <div key={m.label} className="rounded-xl border border-border/60 p-2.5 text-center">
                      <m.icon className={cn("size-4 mx-auto mb-1", m.color)} strokeWidth={1.5} />
                      <p className="text-sm font-serif font-bold tabular-nums">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{m.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens & Season */}
            <div className="flex flex-wrap gap-4 mb-4">
              {item.allergens && item.allergens.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Allergens</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.allergens.map((a) => (
                      <Badge key={a} variant="outline" className="text-[10px] px-2 py-0.5 gap-1 rounded-full">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {item.season_tags && item.season_tags.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Season</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.season_tags.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full capitalize">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Ingredients</h4>
                <div className="divide-y divide-border/30 rounded-xl border border-border/40 text-xs">
                  {ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2">
                      <span className="font-medium">{ing.item} <span className="text-muted-foreground">{ing.quantity}</span></span>
                      {(ing.costcoPrice != null || ing.wincoPrice != null || ing.samsClubPrice != null) && (
                        <div className="flex items-center gap-2 text-[10px] tabular-nums">
                          {ing.costcoPrice != null && <span className="text-emerald-600">C: ${ing.costcoPrice.toFixed(2)}</span>}
                          {ing.wincoPrice != null && <span className="text-amber-600">W: ${ing.wincoPrice.toFixed(2)}</span>}
                          {ing.samsClubPrice != null && <span className="text-blue-600">S: ${ing.samsClubPrice.toFixed(2)}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Main Component ── */
export function BuffetBuilderTab() {
  const [items, setItems] = useState<BuffetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sectionFilter, setSectionFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"default" | "low-high" | "high-low">("default")

  // Buffet menu state
  const [guestCount, setGuestCount] = useState(150)
  const [buffetMenus, setBuffetMenus] = useState<BuffetMenu[]>([])
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<BuffetItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showCateringSheet, setShowCateringSheet] = useState(false)

  const activeMenu = buffetMenus.find(m => m.id === activeMenuId)

  // Load items
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/buffet")
      const data = await res.json()
      const parsed = (Array.isArray(data) ? data : []).map((item: any) => ({
        ...item,
        nutrition: typeof item.nutrition === "string" ? JSON.parse(item.nutrition) : item.nutrition,
        ingredient_list: typeof item.ingredient_list === "string" ? JSON.parse(item.ingredient_list) : item.ingredient_list,
        ingredient_links: typeof item.ingredient_links === "string" ? JSON.parse(item.ingredient_links) : item.ingredient_links,
        pricing_breakdown: typeof item.pricing_breakdown === "string" ? JSON.parse(item.pricing_breakdown) : item.pricing_breakdown,
      }))
      setItems(parsed)
    } catch (e) {
      console.error("Failed to fetch buffet items:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/buffet/menus")
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const menus: BuffetMenu[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          guest_count: d.guest_count || 150,
          stations: d.stations || [],
          total_cost_per_person: d.total_cost_per_person || 0,
          total_menu_cost: d.total_menu_cost || 0,
        }))
        setBuffetMenus(menus)
        setActiveMenuId(menus[0].id)
      } else {
        createDefaultMenu()
      }
    } catch {
      createDefaultMenu()
    }
  }, [])

  const createDefaultMenu = () => {
    const id = crypto.randomUUID()
    const newMenu: BuffetMenu = {
      id, name: "Buffet Menu 1", guest_count: 150,
      stations: [], total_cost_per_person: 0, total_menu_cost: 0,
    }
    setBuffetMenus([newMenu])
    setActiveMenuId(id)
  }

  useEffect(() => {
    fetchItems()
    loadMenus()
  }, [fetchItems, loadMenus])

  // Filter & sort
  let filtered = items.filter(item => item.is_available)
  if (sectionFilter !== "all") {
    filtered = filtered.filter(i => i.section === sectionFilter || i.category === sectionFilter)
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
  }
  if (sortOrder === "low-high") {
    filtered = [...filtered].sort((a, b) => (a.price_per_person || 0) - (b.price_per_person || 0))
  } else if (sortOrder === "high-low") {
    filtered = [...filtered].sort((a, b) => (b.price_per_person || 0) - (a.price_per_person || 0))
  }

  const sections = ["hors-doeuvres", "appetizers", "proteins", "sides", "desserts"].filter(
    s => items.some(i => i.section === s || i.category === s)
  )
  const SECTION_LABELS: Record<string, string> = {
    "hors-doeuvres": "Hors d'Oeuvres", appetizers: "Appetizers",
    proteins: "Proteins", sides: "Sides", desserts: "Desserts",
  }

  // Add item to buffet
  const addToBuffet = (item: BuffetItem) => {
    if (!activeMenu) return
    // Add to first appropriate station or create one
    const stationType = item.station_type || "self-serve"
    const existingStation = activeMenu.stations.find(s => s.type === stationType)
    
    if (existingStation) {
      existingStation.items.push({ item })
    } else {
      activeMenu.stations.push({
        id: crypto.randomUUID(),
        name: stationType === "self-serve" ? `${item.category} Display` : `${stationType.charAt(0).toUpperCase() + stationType.slice(1).replace("-", " ")} Station`,
        type: stationType,
        items: [{ item }],
      })
    }
    recalculateMenu(activeMenu)
    setBuffetMenus([...buffetMenus])
  }

  const removeFromStation = (stationId: string, itemId: string) => {
    if (!activeMenu) return
    const station = activeMenu.stations.find(s => s.id === stationId)
    if (!station) return
    station.items = station.items.filter(i => i.item.id !== itemId)
    if (station.items.length === 0) {
      activeMenu.stations = activeMenu.stations.filter(s => s.id !== stationId)
    }
    recalculateMenu(activeMenu)
    setBuffetMenus([...buffetMenus])
  }

  const recalculateMenu = (menu: BuffetMenu) => {
    let totalPerPerson = 0
    for (const station of menu.stations) {
      for (const si of station.items) {
        totalPerPerson += si.item.price_per_person || 0
      }
    }
    menu.total_cost_per_person = totalPerPerson
    menu.total_menu_cost = totalPerPerson * (menu.guest_count || 150)
  }

  const isItemInMenu = (itemId: string) => {
    if (!activeMenu) return false
    return activeMenu.stations.some(s => s.items.some(i => i.item.id === itemId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <ChefHat className="size-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading buffet catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ═══ TOP BAR: Stats + Controls ═══ */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">

        {/* Guest Count + Totals */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-gold/5 border border-primary/10 dark:border-primary/20">
          <div className="flex items-center gap-3">
            <ChefHat className="size-5 sm:size-6 text-primary" strokeWidth={1.5} />
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-semibold">Buffet Service</h2>
              <p className="text-xs text-muted-foreground">Build a self-serve buffet menu for your guests</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                type="number"
                value={guestCount}
                onChange={(e) => {
                  const n = parseInt(e.target.value) || 0
                  setGuestCount(n)
                  if (activeMenu) {
                    activeMenu.guest_count = n
                    recalculateMenu(activeMenu)
                    setBuffetMenus([...buffetMenus])
                  }
                }}
                className="w-20 h-8 text-xs text-center tabular-nums rounded-xl"
                min={1}
              />
              <span className="text-xs text-muted-foreground">guests</span>
            </div>
            <div className="h-6 w-px bg-border/40" />
            <div className="text-center">
              <p className="text-lg sm:text-xl font-serif font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                ${(activeMenu?.total_cost_per_person || 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">per person</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-serif font-bold tabular-nums">
                ${(activeMenu?.total_menu_cost || 0).toFixed(0)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">total for {guestCount}</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-serif font-bold tabular-nums">
                {activeMenu?.stations.length || 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">stations</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-serif font-bold tabular-nums">
                {activeMenu?.stations.reduce((s, st) => s + st.items.length, 0) || 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">items</p>
            </div>
          </div>
        </div>

        {/* Section Filters + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={sectionFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSectionFilter("all")}
              className="h-8 text-xs rounded-xl"
            >All</Button>
            {sections.map((s) => (
              <Button
                key={s}
                variant={sectionFilter === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setSectionFilter(s)}
                className="h-8 text-xs rounded-xl gap-1.5"
              >
                <span>{SECTION_EMOJI[s]}</span>
                <span className="hidden sm:inline">{SECTION_LABELS[s]}</span>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs w-full sm:w-48 rounded-xl"
              />
            </div>
            <div className="flex rounded-xl border border-border/50 overflow-hidden">
              <button
                onClick={() => setSortOrder(sortOrder === "low-high" ? "default" : "low-high")}
                className={cn("px-2.5 py-1.5 text-[10px] font-medium transition-colors flex items-center gap-1",
                  sortOrder === "low-high" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                <ArrowUp className="size-3" /> Price
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === "high-low" ? "default" : "high-low")}
                className={cn("px-2.5 py-1.5 text-[10px] font-medium transition-colors flex items-center gap-1 border-l",
                  sortOrder === "high-low" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                <ArrowDown className="size-3" /> Price
              </button>
            </div>
          </div>
        </div>

        {/* ═══ CATALOG GRID ═══ */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ChefHat className="size-8 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">No buffet items found. Items will appear here once added.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <BuffetItemCard
                key={item.id}
                item={item}
                onSelect={() => { setSelectedItem(item); setDetailOpen(true) }}
                onAdd={() => addToBuffet(item)}
                isAdded={isItemInMenu(item.id)}
              />
            ))
          )}
        </motion.div>

        {/* ═══ STATIONS ═══ */}
        {activeMenu && activeMenu.stations.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <ChefHat className="size-5 text-primary" strokeWidth={1.5} />
              Your Buffet Stations
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {activeMenu.stations.map((station) => (
                <Card key={station.id} className="border-primary/10 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-primary/5 to-transparent px-4 sm:px-5 py-3 border-b border-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{STATION_ICONS[station.type] || "🍽️"}</span>
                        <div>
                          <h4 className="text-sm font-semibold">{station.name}</h4>
                          <p className="text-[10px] text-muted-foreground capitalize">{station.type.replace("-", " ")} · {station.items.length} item{station.items.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-serif font-bold tabular-nums">
                          ${station.items.reduce((s, i) => s + (i.item.price_per_person || 0), 0).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">per person</p>
                      </div>
                    </div>
                    <div className="divide-y divide-border/20">
                      {station.items.map((si) => (
                        <div key={si.item.id} className="flex items-center justify-between px-4 sm:px-5 py-2.5 hover:bg-muted/10 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
                            <span className="text-sm truncate">{si.item.name}</span>
                            {si.item.dietary_labels?.map((d) => (
                              <span key={d} className={cn("text-[8px] font-semibold px-1 py-px rounded border", DIET_COLORS[d]?.split(" ").slice(0, 2).join(" ") || "")}>{d}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs tabular-nums text-muted-foreground">${(si.item.price_per_person || 0).toFixed(2)}/ea</span>
                            <button
                              onClick={() => removeFromStation(station.id, si.item.id)}
                              className="size-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Totals footer */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-gold/5 border border-primary/10 p-4 sm:p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-5 text-emerald-500" strokeWidth={1.5} />
                  <span className="font-medium">Buffet Total</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-serif font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      ${(activeMenu.total_cost_per_person).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">per person</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-serif font-bold tabular-nums">
                      ${(activeMenu.total_menu_cost).toFixed(0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">total for {guestCount} guests</p>
                  </div>
                </div>
              </div>
              {/* Per-station breakdown */}
              <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                {activeMenu.stations.map((st) => (
                  <span key={st.id} className="tabular-nums">
                    {st.name}: <strong>${st.items.reduce((s, i) => s + (i.item.price_per_person || 0), 0).toFixed(2)}</strong>/pp
                  </span>
                ))}
              </div>
            </div>

            {/* Catering Sheet Button */}
            <Button
              onClick={() => setShowCateringSheet(!showCateringSheet)}
              variant="outline"
              className="w-full gap-2 rounded-xl"
            >
              <FileSpreadsheet className="size-4" />
              {showCateringSheet ? "Hide" : "Generate"} Buffet Catering Sheet
            </Button>

            {showCateringSheet && (
              <div className="rounded-2xl border border-border/40 bg-white dark:bg-card p-6 sm:p-8 text-xs sm:text-sm print:break-inside-avoid">
                <div className="text-center mb-6 pb-4 border-b border-border/30">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold">Buffet Catering Production Sheet</h2>
                  <p className="text-sm text-muted-foreground mt-1">Nikkita & Justin's Wedding</p>
                  <p className="text-xs text-muted-foreground">September 14, 2026 · {guestCount} Guests</p>
                  <div className="mt-2 grid grid-cols-3 gap-4 max-w-sm mx-auto">
                    <div><p className="text-lg font-serif font-bold">${activeMenu.total_cost_per_person.toFixed(2)}</p><p className="text-[10px] text-muted-foreground">Per Person</p></div>
                    <div><p className="text-lg font-serif font-bold">${(activeMenu.total_menu_cost / (guestCount || 1)).toFixed(2)}</p><p className="text-[10px] text-muted-foreground">Avg/Item</p></div>
                    <div><p className="text-lg font-serif font-bold">${activeMenu.total_menu_cost.toFixed(0)}</p><p className="text-[10px] text-muted-foreground">Grand Total</p></div>
                  </div>
                </div>
                {activeMenu.stations.map((station, si) => (
                  <div key={station.id} className="mb-6 print:break-inside-avoid">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{STATION_ICONS[station.type] || "🍽️"}</span>
                      <h3 className="font-serif font-semibold text-base">{station.name}</h3>
                      <span className="text-[10px] text-muted-foreground">· {station.items.length} items</span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/30 text-[10px] text-muted-foreground uppercase tracking-wider">
                          <th className="text-left py-1.5 font-medium">Item</th>
                          <th className="text-right py-1.5 font-medium">$/pp</th>
                          <th className="text-right py-1.5 font-medium">Cost</th>
                          <th className="text-right py-1.5 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {station.items.map((si) => (
                          <tr key={si.item.id} className="border-b border-border/20">
                            <td className="py-1.5">{si.item.name}</td>
                            <td className="py-1.5 text-right tabular-nums">${(si.item.price_per_person || 0).toFixed(2)}</td>
                            <td className="py-1.5 text-right tabular-nums">${(si.item.cost_per_serving || 0).toFixed(2)}</td>
                            <td className="py-1.5 text-right tabular-nums">${((si.item.price_per_person || 0) * guestCount).toFixed(0)}</td>
                          </tr>
                        ))}
                        <tr className="font-semibold text-xs">
                          <td className="py-1.5">Station Total</td>
                          <td className="py-1.5 text-right tabular-nums">${station.items.reduce((s, i) => s + (i.item.price_per_person || 0), 0).toFixed(2)}</td>
                          <td className="py-1.5 text-right tabular-nums">${station.items.reduce((s, i) => s + (i.item.cost_per_serving || 0), 0).toFixed(2)}</td>
                          <td className="py-1.5 text-right tabular-nums">${(station.items.reduce((s, i) => s + (i.item.price_per_person || 0), 0) * guestCount).toFixed(0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <BuffetDetailModal item={selectedItem} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  )
}