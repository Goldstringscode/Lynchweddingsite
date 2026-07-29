"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Salad, Beef, Cookie, Coffee, Flame, Weight, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseSlot {
  course_number: number
  course_type: string
  item_id: string | null
  portion_size: "small" | "regular" | "large"
  notes: string
}

interface MenuItem {
  id: string
  name: string
  portion_weight_g?: number | null
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
  } | null
}

interface Props {
  courses: CourseSlot[]
  items: MenuItem[]
  className?: string
}

const PORTION_MULTIPLIERS = { small: 0.7, regular: 1.0, large: 1.35 }

export function NutritionSummary({ courses, items, className }: Props) {
  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0, sugar = 0, sodium = 0
    let totalWeight = 0
    let itemCount = 0

    for (const slot of courses) {
      if (!slot.item_id) continue
      const item = items.find((i) => i.id === slot.item_id)
      if (!item) continue
      const mult = PORTION_MULTIPLIERS[slot.portion_size] || 1
      const n = item.nutrition || {}

      calories += (n.calories || 0) * mult
      protein += (n.protein || 0) * mult
      carbs += (n.carbs || 0) * mult
      fat += (n.fat || 0) * mult
      fiber += (n.fiber || 0) * mult
      sugar += (n.sugar || 0) * mult
      sodium += (n.sodium || 0) * mult
      totalWeight += (item.portion_weight_g || 0) * mult
      itemCount++
    }

    return { calories, protein, carbs, fat, fiber, sugar, sodium, totalWeight, itemCount }
  }, [courses, items])

  if (totals.itemCount === 0) return null

  const macros = [
    { label: "Calories", value: Math.round(totals.calories), unit: "kcal", icon: Flame, color: "text-orange-500" },
    { label: "Protein", value: Math.round(totals.protein), unit: "g", icon: Beef, color: "text-red-500" },
    { label: "Carbs", value: Math.round(totals.carbs), unit: "g", icon: Coffee, color: "text-amber-500" },
    { label: "Fat", value: Math.round(totals.fat), unit: "g", icon: Droplets, color: "text-blue-500" },
    { label: "Fiber", value: Math.round(totals.fiber), unit: "g", icon: Salad, color: "text-green-500" },
    { label: "Sugar", value: Math.round(totals.sugar), unit: "g", icon: Cookie, color: "text-pink-500" },
  ]

  const weightOz = totals.totalWeight / 28.3495

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Salad className="size-4 text-primary" />
            <CardTitle className="text-xs font-medium uppercase tracking-wider">Menu Nutrition Summary</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <Weight className="size-3 mr-1" />
            {totals.totalWeight > 0 ? `${totals.totalWeight.toFixed(0)}g / ${weightOz.toFixed(1)}oz` : "—"}
          </Badge>
        </div>
        <CardDescription className="text-[10px]">
          {totals.itemCount} course{totals.itemCount !== 1 ? "s" : ""} · total nutritional profile
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {macros.map((m) => (
            <div key={m.label} className="rounded-lg border bg-background/50 p-2 text-center">
              <div className="flex justify-center mb-1">
                <m.icon className={cn("size-3.5", m.color)} />
              </div>
              <p className="text-sm font-serif font-medium tabular-nums">
                {m.value.toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                {m.unit}
              </p>
              <p className="text-[8px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        {totals.sodium > 0 && (
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground px-1">
            <span>Sodium</span>
            <span className="font-medium tabular-nums">{Math.round(totals.sodium)}mg</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}