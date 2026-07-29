"use client"

import { useEffect, useState } from "react"
import {
  Pie,
  PieChart,
  Cell,
  Label,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MailCheck, Clock, Leaf, Loader2 } from "lucide-react"

const MEAL_OPTIONS = ["Beef", "Chicken", "Fish", "Pork", "Vegan"] as const

const chartConfig: ChartConfig = {
  beef: { label: "Beef", color: "var(--color-chart-1)" },
  chicken: { label: "Chicken", color: "var(--color-chart-2)" },
  fish: { label: "Fish", color: "var(--color-chart-3)" },
  pork: { label: "Pork", color: "var(--color-chart-4)" },
  vegan: { label: "Vegan", color: "var(--color-chart-5)" },
}

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
      <div className={`flex size-9 items-center justify-center rounded-full ${accent ? "bg-gold/20 text-gold" : "bg-secondary text-[#1a2e1a]"}`}>
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className={`font-serif text-3xl leading-none tabular-nums ${accent ? "" : "text-foreground"}`}>{value}</p>
        <p className={`mt-1.5 text-xs uppercase tracking-wider ${accent ? "text-[#f5f0e8]/70" : "text-muted-foreground"}`}>{label}</p>
      </div>
    </div>
  )
}

export function AnalyticsTab() {
  const [mealCounts, setMealCounts] = useState<Record<string, number>>({})
  const [totalGuests, setTotalGuests] = useState(0)
  const [totalResponded, setTotalResponded] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/rsvp").then((r) => r.json()).then((guests) => {
      const arr = Array.isArray(guests) ? guests : []
      const counts: Record<string, number> = { Beef: 0, Chicken: 0, Fish: 0, Pork: 0, Vegan: 0 }
      let responded = 0
      arr.forEach((g: any) => {
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
    meal, count: mealCounts[meal] || 0,
    fill: `var(--color-chart-${MEAL_OPTIONS.indexOf(meal) + 1})`,
  }))

  const maxCount = Math.max(...pieData.map((m) => m.count), 1)
  const totalMeals = pieData.reduce((s, m) => s + m.count, 0)
  const pending = totalGuests - totalResponded
  const responseRate = totalGuests > 0 ? Math.round((totalResponded / totalGuests) * 100) : 0

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

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
          <CardHeader><CardTitle className="font-serif text-lg">Meal Distribution</CardTitle><CardDescription>Entrée selections from confirmed guests.</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-w-[260px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={pieData} dataKey="count" nameKey="meal" innerRadius={68} strokeWidth={3}>
                  {pieData.map((e) => <Cell key={e.meal} fill={e.fill} stroke="var(--card)" />)}
                  <Label content={({ viewBox }) => viewBox && "cx" in viewBox ? <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle"><tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-serif text-3xl">{totalMeals}</tspan><tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-xs">entrées</tspan></text> : null} />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="font-serif text-lg">Selections by Entrée</CardTitle><CardDescription>Head count per menu option.</CardDescription></CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-5">
              {pieData.map((m) => {
                const pct = totalMeals > 0 ? Math.round((m.count / totalMeals) * 100) : 0
                return (
                  <li key={m.meal}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="size-3 rounded-full" style={{ backgroundColor: m.fill }} aria-hidden />{m.meal}
                      </span>
                      <span className="text-sm tabular-nums text-muted-foreground">{m.count} <span className="text-xs">({pct}%)</span></span>
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
        <CardHeader><CardTitle className="font-serif text-lg">Dietary Notes</CardTitle><CardDescription>Flagged restrictions to brief the kitchen.</CardDescription></CardHeader>
        <CardContent><p className="text-sm italic text-muted-foreground">Dietary restrictions are logged per guest on the RSVP form.</p></CardContent>
      </Card>
    </div>
  )
}