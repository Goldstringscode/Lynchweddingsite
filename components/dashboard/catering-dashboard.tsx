"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Pie,
  PieChart,
  Cell,
  Label,
  ResponsiveContainer,
} from "recharts"
import { toPng } from "html-to-image"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UtensilsCrossed,
  Users,
  MailCheck,
  Clock,
  Leaf,
  Plus,
  Pencil,
  Trash2,
  Download,
  Eye,
  ArrowUp,
  ArrowDown,
  Loader2,
  Check,
  X,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string
  category: string
  name: string
  description: string
  price: number | null
  sort_order: number
  is_available: boolean
  created_at: string
}

interface GuestRsvp {
  id: string
  is_attending: boolean
  meal_choice: string | null
  guest_meal: string | null
}

const MEAL_OPTIONS = ["Beef", "Chicken", "Fish", "Pork", "Vegan"] as const

const DEFAULT_CATEGORIES = [
  "Appetizers",
  "Salads & Soups",
  "Main Courses",
  "Sides",
  "Desserts",
  "Cocktails & Drinks",
  "Wine List",
  "Kids Menu",
]

const CATEGORY_EMOJI: Record<string, string> = {
  "Appetizers": "🥂",
  "Salads & Soups": "🥗",
  "Main Courses": "🍽️",
  "Sides": "🥔",
  "Desserts": "🍰",
  "Cocktails & Drinks": "🍸",
  "Wine List": "🍷",
  "Kids Menu": "🧒",
}

const chartConfig: ChartConfig = {
  beef: { label: "Beef", color: "var(--color-chart-1)" },
  chicken: { label: "Chicken", color: "var(--color-chart-2)" },
  fish: { label: "Fish", color: "var(--color-chart-3)" },
  pork: { label: "Pork", color: "var(--color-chart-4)" },
  vegan: { label: "Vegan", color: "var(--color-chart-5)" },
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-5 shadow-sm ${
        accent ? "border-gold/50 bg-[#1a2e1a] text-[#f5f0e8]" : "border-border bg-card"
      }`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-full ${
          accent ? "bg-gold/20 text-gold" : "bg-secondary text-[#1a2e1a]"
        }`}
      >
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className={`font-serif text-3xl leading-none tabular-nums ${accent ? "" : "text-foreground"}`}>
          {value}
        </p>
        <p className={`mt-1.5 text-xs uppercase tracking-wider ${accent ? "text-[#f5f0e8]/70" : "text-muted-foreground"}`}>
          {label}
        </p>
      </div>
    </div>
  )
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────

function AnalyticsTab() {
  const [mealCounts, setMealCounts] = useState<Record<string, number>>({})
  const [totalGuests, setTotalGuests] = useState(0)
  const [totalResponded, setTotalResponded] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((guests) => {
        const arr = Array.isArray(guests) ? guests : []
        const counts: Record<string, number> = { Beef: 0, Chicken: 0, Fish: 0, Pork: 0, Vegan: 0 }
        let responded = 0
        arr.forEach((g: GuestRsvp) => {
          if (g.is_attending) {
            responded++
            const meal = g.meal_choice || "Beef"
            if (counts[meal] !== undefined) counts[meal]++
            if (g.guest_meal && counts[g.guest_meal] !== undefined) counts[g.guest_meal]++
          }
        })
        setMealCounts(counts)
        setTotalGuests(arr.length)
        setTotalResponded(responded)
        setLoading(false)
      })
  }, [])

  const pieData = MEAL_OPTIONS.map((meal) => ({
    meal,
    count: mealCounts[meal] || 0,
    fill: `var(--color-chart-${MEAL_OPTIONS.indexOf(meal) + 1})`,
  }))

  const maxCount = Math.max(...pieData.map((m) => m.count), 1)
  const totalMeals = pieData.reduce((s, m) => s + m.count, 0)
  const pending = totalGuests - totalResponded
  const responseRate = totalGuests > 0 ? Math.round((totalResponded / totalGuests) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Guests Invited" value={totalGuests} />
        <StatCard icon={MailCheck} label="RSVP Received" value={totalResponded} accent />
        <StatCard icon={Clock} label="Awaiting Reply" value={pending} />
        <StatCard icon={Leaf} label="Response Rate" value={`${responseRate}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Meal Distribution</CardTitle>
            <CardDescription>Entrée selections from confirmed guests.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-w-[260px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={pieData} dataKey="count" nameKey="meal" innerRadius={68} strokeWidth={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.meal} fill={entry.fill} stroke="var(--card)" />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-serif text-3xl">
                              {totalMeals}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-xs">
                              entrées
                            </tspan>
                          </text>
                        )
                      }
                      return null
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Selections by Entrée</CardTitle>
            <CardDescription>Head count per menu option.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-5">
              {pieData.map((m) => {
                const pct = totalMeals > 0 ? Math.round((m.count / totalMeals) * 100) : 0
                return (
                  <li key={m.meal}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="size-3 rounded-full" style={{ backgroundColor: m.fill }} aria-hidden />
                        {m.meal}
                      </span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {m.count} <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(m.count / maxCount) * 100}%`, backgroundColor: m.fill }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Dietary Notes</CardTitle>
          <CardDescription>Flagged restrictions to brief the kitchen.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic text-muted-foreground">
            Dietary restrictions are logged per guest on the RSVP form.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Edit Menu Tab ───────────────────────────────────────────────────────────

function EditMenuTab() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategory, setShowNewCategory] = useState(false)

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/menu")
    const data = await res.json()
    setItems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const categories = [...new Set(items.map((i) => i.category))]
  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])]

  const handleSave = async (item: Partial<MenuItem> & { id?: string }) => {
    if (item.id) {
      await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
    } else {
      await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
    }
    fetchItems()
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return
    await fetch(`/api/menu?id=${id}`, { method: "DELETE" })
    fetchItems()
  }

  const handleMove = async (id: string, direction: "up" | "down") => {
    const cat = items.find((i) => i.id === id)?.category
    const catItems = items.filter((i) => i.category === cat).sort((a, b) => a.sort_order - b.sort_order)
    const idx = catItems.findIndex((i) => i.id === id)
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === catItems.length - 1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const current = catItems[idx]
    const swap = catItems[swapIdx]
    const temp = current.sort_order
    await handleSave({ id: current.id, sort_order: swap.sort_order })
    await handleSave({ id: swap.id, sort_order: temp })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-medium">Menu Items</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} across {allCategories.length} categories
          </p>
        </div>
        <Dialog open={isDialogOpen && !editingItem} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditingItem(null) }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <MenuForm
              categories={allCategories}
              showNewCategory={showNewCategory}
              setShowNewCategory={setShowNewCategory}
              newCategory={newCategory}
              setNewCategory={setNewCategory}
              onSave={handleSave}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null) }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {allCategories.map((category) => {
        const catItems = items
          .filter((i) => i.category === category)
          .sort((a, b) => a.sort_order - b.sort_order)

        if (catItems.length === 0) return null

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{CATEGORY_EMOJI[category] || "📋"}</span>
                <div>
                  <CardTitle className="font-serif text-base">{category}</CardTitle>
                  <CardDescription>{catItems.length} item{catItems.length !== 1 ? "s" : ""}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border/50">
                {catItems.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-3 py-3">
                    <div className="flex flex-col gap-0.5 pt-1">
                      <button onClick={() => handleMove(item.id, "up")} disabled={idx === 0} className="text-muted-foreground/40 hover:text-foreground disabled:opacity-20" aria-label="Move up">
                        <ArrowUp className="size-3" />
                      </button>
                      <button onClick={() => handleMove(item.id, "down")} disabled={idx === catItems.length - 1} className="text-muted-foreground/40 hover:text-foreground disabled:opacity-20" aria-label="Move down">
                        <ArrowDown className="size-3" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${!item.is_available ? "line-through text-muted-foreground" : ""}`}>
                          {item.name}
                        </p>
                        {!item.is_available && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">Unavailable</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.price !== null && (
                        <span className="text-xs tabular-nums text-muted-foreground">${item.price.toFixed(2)}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => { setEditingItem(item); setIsDialogOpen(true) }}
                        aria-label="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="mx-auto size-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No menu items yet. Click &quot;Add Item&quot; to start building your menu.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={isDialogOpen && !!editingItem} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditingItem(null) }}>
        <DialogContent className="sm:max-w-lg">
          {editingItem && (
            <MenuForm
              initial={editingItem}
              categories={allCategories}
              showNewCategory={showNewCategory}
              setShowNewCategory={setShowNewCategory}
              newCategory={newCategory}
              setNewCategory={setNewCategory}
              onSave={handleSave}
              onCancel={() => { setIsDialogOpen(false); setEditingItem(null) }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MenuForm({
  initial,
  categories,
  showNewCategory,
  setShowNewCategory,
  newCategory,
  setNewCategory,
  onSave,
  onCancel,
}: {
  initial?: Partial<MenuItem>
  categories: string[]
  showNewCategory: boolean
  setShowNewCategory: (v: boolean) => void
  newCategory: string
  setNewCategory: (v: string) => void
  onSave: (item: Partial<MenuItem> & { id?: string }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [category, setCategory] = useState(initial?.category || categories[0] || "")
  const [price, setPrice] = useState(initial?.price?.toString() || "")
  const [isAvailable, setIsAvailable] = useState(initial?.is_available ?? true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      id: initial?.id,
      name: name.trim(),
      description: description.trim(),
      category: showNewCategory ? newCategory.trim() : category,
      price: price ? parseFloat(price) : null,
      is_available: isAvailable,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{initial?.id ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        <DialogDescription>
          {initial?.id ? "Update the details below." : "Fill in the details for the new menu item."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Filet Mignon" required />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 8oz aged prime beef with truffle butter" rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
            {!showNewCategory ? (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => setShowNewCategory(true)} aria-label="New category">
                  <Plus className="size-4" />
                </Button>
              </div>
            ) : (
              <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" autoFocus />
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 42.00" type="number" step="0.01" min="0" />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="size-4 rounded border-border accent-primary"
          />
          Item is available
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!name.trim() || saving}>
          {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          {initial?.id ? "Save Changes" : "Add Item"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Preview & Export Tab ─────────────────────────────────────────────────────

function PreviewExportTab() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => { setItems(data || []); setLoading(false) })
  }, [])

  const categories = [...new Set(items.map((i) => i.category))].sort()

  const handleExportPNG = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = "the-lynchs-wedding-menu.png"
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error("Export failed:", e)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = () => {
    if (!previewRef.current) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const clone = previewRef.current.cloneNode(true) as HTMLElement
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules || []).map((r) => r.cssText).join("")
        } catch { return "" }
      })
      .join("")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>The Lynch's Wedding Menu</title>
        <style>
          ${styles}
          @page { margin: 0; size: letter portrait; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body>${clone.outerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <UtensilsCrossed className="mx-auto size-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Add menu items in the &quot;Edit Menu&quot; tab first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-medium">Menu Preview</h3>
          <p className="text-sm text-muted-foreground">This is how your menu will appear to guests.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportPNG} disabled={exporting}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Download PNG
          </Button>
          <Button className="gap-2" onClick={handleExportPDF}>
            <Eye className="size-4" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Menu preview card */}
      <div ref={previewRef} className="overflow-hidden rounded-lg border border-border bg-white shadow-lg mx-auto max-w-2xl">
        {/* Gold top bar */}
        <div className="h-1.5 bg-gradient-to-r from-gold/60 via-gold to-gold/60" />

        {/* Header */}
        <div className="px-10 pt-10 pb-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold/70 font-medium">The Lynch Wedding</p>
          <h2 className="mt-3 font-serif text-3xl text-[#1a2e1a] tracking-wide">Celebration Menu</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gold/60" />
          <p className="mt-3 text-xs text-[#1a2e1a]/60 uppercase tracking-wider">
            September 14, 2026
          </p>
        </div>

        {/* Items by category */}
        <div className="px-10 pb-10 space-y-8">
          {categories.map((category) => {
            const catItems = items
              .filter((i) => i.category === category && i.is_available)
              .sort((a, b) => a.sort_order - b.sort_order)
            if (catItems.length === 0) return null

            return (
              <div key={category}>
                <div className="flex items-center gap-4 mb-3">
                  <span className="h-px flex-1 bg-gold/30" />
                  <h3 className="font-serif text-sm uppercase tracking-[0.3em] text-[#1a2e1a]/70">
                    {CATEGORY_EMOJI[category] || ""} {category}
                  </h3>
                  <span className="h-px flex-1 bg-gold/30" />
                </div>

                <div className="space-y-3">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#1a2e1a]">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-[#1a2e1a]/60 mt-0.5 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                      {item.price !== null && (
                        <span className="text-sm tabular-nums text-[#1a2e1a] font-medium shrink-0">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gold/20 px-10 py-5 text-center">
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#1a2e1a]/40">
            Please inform your server of any dietary restrictions
          </p>
        </div>
        <div className="h-1.5 bg-gradient-to-r from-gold/60 via-gold to-gold/60" />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        The menu preview shows only items marked as available.
      </p>
    </div>
  )
}

// ─── Main Catering Dashboard ──────────────────────────────────────────────────

export function CateringDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="analytics" className="gap-2">
            <Users className="size-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <Pencil className="size-4" />
            <span className="hidden sm:inline">Edit Menu</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="size-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="edit">
          <EditMenuTab />
        </TabsContent>

        <TabsContent value="preview">
          <PreviewExportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}