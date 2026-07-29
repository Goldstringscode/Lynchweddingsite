"use client"

import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, DollarSign, Weight, Flame, Beef, Coffee, Droplets, Loader2, TrendingUp, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompareDraft {
  id: string
  name: string
  guest_count: number
  item_count: number
  per_person_cost: number
  total_cost: number
  total_weight_g: number
  total_weight_oz: string
  avg_weight_per_item_g: number
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  total_fiber_g: number
  courses: {
    course_number: number
    course_type: string
    portion_size: string
    item_name: string
    price: number
    weight_g: number
    weight_oz: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }[]
}

interface CompareResponse {
  drafts: CompareDraft[]
  inflation_multiplier: number
  inflation_year: number | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  draftIds: string[]
}

const COURSE_TYPE_ORDER = ["hors-doeuvres", "appetizer", "protein", "side", "dessert"]
const COURSE_TYPE_LABELS: Record<string, string> = {
  "hors-doeuvres": "Hors d'Oeuvres",
  appetizer: "Appetizer", protein: "Protein / Entrée", side: "Side", dessert: "Dessert",
}

export function ComparisonModal({ open, onOpenChange, draftIds }: Props) {
  const [data, setData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [inflationYear, setInflationYear] = useState<number>(0)
  const [viewMode, setViewMode] = useState<"cost" | "nutrition" | "weight">("cost")

  useEffect(() => {
    if (!open || draftIds.length < 2) return
    setLoading(true)
    const params = new URLSearchParams({ ids: draftIds.join(",") })
    if (inflationYear) {
      params.set("inflationYear", inflationYear.toString())
      params.set("inflationMonth", "6")
    }
    fetch(`/api/menu/compare?${params}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [open, draftIds, inflationYear])

  const getViewData = (d: CompareDraft) => {
    switch (viewMode) {
      case "cost":
        return [
          { label: "Per Person", value: `$${d.per_person_cost.toFixed(2)}`, color: "text-emerald-600" },
          { label: "Total", value: `$${d.total_cost.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Items", value: d.item_count.toString(), color: "text-blue-600" },
        ]
      case "nutrition":
        return [
          { label: "Calories", value: `${d.total_calories.toLocaleString()} kcal`, color: "text-orange-500" },
          { label: "Protein", value: `${d.total_protein_g}g`, color: "text-red-500" },
          { label: "Carbs", value: `${d.total_carbs_g}g`, color: "text-amber-500" },
          { label: "Fat", value: `${d.total_fat_g}g`, color: "text-blue-500" },
        ]
      case "weight":
        return [
          { label: "Total Weight", value: `${d.total_weight_g.toLocaleString()}g`, color: "text-purple-600" },
          { label: "In Ounces", value: `${d.total_weight_oz} oz`, color: "text-purple-600" },
          { label: "Avg/Item", value: `${d.avg_weight_per_item_g}g`, color: "text-purple-400" },
        ]
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-gold" />
            <DialogTitle>Compare Menus</DialogTitle>
          </div>
          <DialogDescription>
            Side-by-side comparison of prices, weights, nutrition, and food volume.
          </DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center gap-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">View:</span>
            <div className="flex rounded-lg border overflow-hidden">
              {(["cost", "nutrition", "weight"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    viewMode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  )}
                >
                  {m === "cost" && <DollarSign className="size-3 inline mr-1" />}
                  {m === "nutrition" && <Flame className="size-3 inline mr-1" />}
                  {m === "weight" && <Weight className="size-3 inline mr-1" />}
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <TrendingUp className="size-3.5 text-muted-foreground" />
            <Select value={inflationYear?.toString() || "0"} onValueChange={(v) => setInflationYear(parseInt(v))}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue placeholder="No inflation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Today's prices</SelectItem>
                {Array.from({ length: 10 }, (_, i) => {
                  const y = 2027 + i
                  return <SelectItem key={y} value={y.toString()}>{y} prices</SelectItem>
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            {/* Summary comparison cards */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${data.drafts.length}, minmax(0, 1fr))` }}>
              {data.drafts.map((draft, i) => (
                <Card key={draft.id} className={cn(i === 0 ? "border-gold/40 ring-1 ring-gold/20" : "")}>
                  <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-sm font-serif">{draft.name}</CardTitle>
                    {i === 0 && <Badge variant="secondary" className="text-[9px] mx-auto">Current</Badge>}
                    <p className="text-[10px] text-muted-foreground">{draft.guest_count} guests · {draft.item_count} items</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {getViewData(draft).map((d) => (
                        <div key={d.label} className="rounded-lg border bg-background/50 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{d.label}</p>
                          <p className={cn("text-lg font-serif font-medium tabular-nums", d.color)}>
                            {d.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison bars - Cost */}
            {viewMode === "cost" && data.drafts.length >= 2 && (
              <div className="space-y-3 mt-4">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <DollarSign className="size-3" /> Cost Comparison
                </h4>
                {["Per Person", "Total Cost", "Items"].map((metric) => {
                  const values = data.drafts.map((d) =>
                    metric === "Per Person" ? d.per_person_cost
                    : metric === "Total Cost" ? d.total_cost
                    : d.item_count
                  )
                  const maxVal = Math.max(...values)
                  return (
                    <div key={metric} className="space-y-1">
                      <p className="text-[11px] text-muted-foreground">{metric}</p>
                      {data.drafts.map((d, i) => {
                        const val = values[i]
                        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0
                        return (
                          <div key={d.id} className="flex items-center gap-3">
                            <span className="text-[10px] w-20 truncate shrink-0 text-right text-muted-foreground">
                              {d.name}
                            </span>
                            <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  metric === "Items" ? "bg-blue-400" : "bg-emerald-500"
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-medium tabular-nums w-20">
                              {metric === "Total Cost" ? `$${val.toLocaleString()}`
                                : metric === "Items" ? val.toString()
                                : `$${val.toFixed(2)}`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Course-by-course breakdown */}
            <details className="group mt-4">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <FileText className="size-3.5" />
                Course-by-course breakdown
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 pr-4 font-medium text-muted-foreground">Course</th>
                      {data.drafts.map((d) => (
                        <th key={d.id} className="text-left py-1.5 px-2 font-medium text-muted-foreground">
                          {d.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COURSE_TYPE_ORDER.map((type) => (
                      <tr key={type} className="border-b border-border/50">
                        <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                          {COURSE_TYPE_LABELS[type]}
                        </td>
                        {data.drafts.map((d) => {
                          const course = d.courses?.find((c) => c.course_type === type)
                          return (
                            <td key={d.id} className="py-2 px-2">
                              {course ? (
                                <div>
                                  <span className="font-medium">{course.item_name}</span>
                                  <span className="text-muted-foreground ml-1">
                                    · {course.portion_size} · ${course.price.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        ) : (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No comparison data available. Make sure you have at least 2 saved menu drafts.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}