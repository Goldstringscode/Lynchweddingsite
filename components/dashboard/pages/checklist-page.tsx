"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChecklistItem {
  id: string
  category: string
  task: string
  description: string
  suggested_month: number
  sort_order: number
  is_completed: boolean
  completed_at: string | null
  notes: string
  created_at: string
}

const MONTH_LABELS: Record<number, string> = {
  12: "12+ months",
  11: "11 months",
  10: "10 months",
  9: "9 months",
  8: "8 months",
  7: "7 months",
  6: "6 months",
  5: "5 months",
  4: "4 months",
  3: "3 months",
  2: "2 months",
  1: "1 month",
  0: "Wedding week",
}

const CATEGORY_ORDER = [
  "Apparel",
  "Stationery",
  "Flowers",
  "Ceremony",
  "Reception",
  "Photography",
  "Vendors",
  "Beauty",
  "Gifts",
  "Rings",
  "Honeymoon",
  "Transportation",
  "Legal & Planning",
  "Rehearsal Dinner",
]

const CATEGORY_EMOJI: Record<string, string> = {
  Apparel: "👗",
  Stationery: "✉️",
  Flowers: "💐",
  Ceremony: "⛪",
  Reception: "🎉",
  Photography: "📸",
  Vendors: "🏢",
  Beauty: "💄",
  Gifts: "🎁",
  Rings: "💍",
  Honeymoon: "✈️",
  Transportation: "🚗",
  "Legal & Planning": "📋",
  "Rehearsal Dinner": "🍽️",
}

export function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [toggling, setToggling] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all")

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/checklist")
      const data = await res.json()
      setItems(data || [])
    } catch (e) {
      console.error("Failed to load checklist:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const toggleItem = useCallback(
    async (item: ChecklistItem) => {
      setToggling(item.id)
      const newStatus = !item.is_completed

      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                is_completed: newStatus,
                completed_at: newStatus
                  ? new Date().toISOString()
                  : null,
              }
            : i
        )
      )

      try {
        const res = await fetch("/api/checklist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, is_completed: newStatus }),
        })
        if (!res.ok) {
          // Rollback on error
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, is_completed: !newStatus, completed_at: item.completed_at }
                : i
            )
          )
        }
      } catch (e) {
        console.error("Toggle failed:", e)
      } finally {
        setToggling(null)
      }
    },
    []
  )

  const toggleCategory = (category: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  // Group and filter items
  const grouped = CATEGORY_ORDER.map((cat) => {
    const catItems = items
      .filter(
        (i) =>
          i.category === cat &&
          (filter === "all" ||
            (filter === "pending" && !i.is_completed) ||
            (filter === "done" && i.is_completed))
      )
      .sort((a, b) => a.sort_order - b.sort_order)
    const total = items.filter((i) => i.category === cat).length
    const done = items.filter((i) => i.category === cat && i.is_completed).length
    return { category: cat, items: catItems, total, done }
  }).filter((g) => g.items.length > 0)

  const totalItems = items.length
  const totalDone = items.filter((i) => i.is_completed).length
  const progressPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading checklist…</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <ClipboardCheck className="size-5 text-primary" />
                Planning Progress
              </CardTitle>
              <CardDescription>
                {totalDone} of {totalItems} tasks complete
              </CardDescription>
            </div>
            <Badge
              variant={progressPct >= 80 ? "default" : progressPct >= 50 ? "secondary" : "outline"}
              className="text-sm px-3 py-1"
            >
              {progressPct}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "done"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "all"
              ? `All (${totalItems})`
              : f === "pending"
                ? `Pending (${totalItems - totalDone})`
                : `Done (${totalDone})`}
          </Button>
        ))}
      </div>

      {/* Category Groups */}
      {grouped.map(({ category, items: catItems, total, done }) => (
        <Card key={category}>
          <button
            type="button"
            onClick={() => toggleCategory(category)}
            className="w-full"
          >
            <CardHeader className="pb-3 transition-colors hover:bg-muted/30 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CATEGORY_EMOJI[category] || "📌"}</span>
                  <div className="text-left">
                    <CardTitle className="font-serif text-base">
                      {category}
                    </CardTitle>
                    <CardDescription>
                      {done}/{total} complete
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${total > 0 ? (done / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  {collapsed.has(category) ? (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </button>

          {!collapsed.has(category) && (
            <CardContent className="pt-0">
              <div className="divide-y divide-border/50">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 py-3 transition-colors",
                      item.is_completed && "opacity-60"
                    )}
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={item.is_completed}
                        disabled={toggling === item.id}
                        onCheckedChange={() => toggleItem(item)}
                        className={cn(
                          "size-5",
                          item.is_completed && "border-primary"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            item.is_completed && "line-through text-muted-foreground"
                          )}
                        >
                          {item.task}
                        </p>
                        {toggling === item.id && (
                          <Loader2 className="size-3 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px] px-2 py-0",
                        item.suggested_month >= 12 && "text-rose-500 border-rose-200",
                        item.suggested_month <= 2 &&
                          item.suggested_month > 0 &&
                          "text-amber-500 border-amber-200",
                        item.suggested_month === 0 && "text-red-500 border-red-200"
                      )}
                    >
                      {MONTH_LABELS[item.suggested_month] || `${item.suggested_month}mo`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {grouped.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ClipboardCheck className="size-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              {filter === "done"
                ? "No completed tasks yet. Start checking things off!"
                : filter === "pending"
                  ? "All tasks completed! 🎉"
                  : "No checklist items found. Run the SQL seed to populate."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reset button */}
      {totalItems > 0 && (
        <div className="flex justify-center pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={async () => {
              if (
                !confirm(
                  "Reset all checklist items to incomplete? This cannot be undone."
                )
              )
                return
              for (const item of items) {
                if (item.is_completed) {
                  await fetch("/api/checklist", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: item.id,
                      is_completed: false,
                    }),
                  })
                }
              }
              fetchItems()
            }}
          >
            <RotateCcw className="mr-2 size-3" />
            Reset all tasks
          </Button>
        </div>
      )}
    </div>
  )
}