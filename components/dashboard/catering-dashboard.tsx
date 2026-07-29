"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pie, PieChart, Cell, Label } from "recharts"
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
import { ArrowLeft, UtensilsCrossed, Users, MailCheck, Clock, Leaf } from "lucide-react"

const MEAL_OPTIONS = ["Beef", "Chicken", "Fish", "Pork", "Vegan"] as const

const chartConfig: ChartConfig = {
  beef: { label: "Beef", color: "var(--color-chart-1)" },
  chicken: { label: "Chicken", color: "var(--color-chart-2)" },
  fish: { label: "Fish", color: "var(--color-chart-3)" },
  pork: { label: "Pork", color: "var(--color-chart-4)" },
  vegan: { label: "Vegan", color: "var(--color-chart-5)" },
}

export function CateringDashboard() {
  const [mealCounts, setMealCounts] = useState<Record<string, number>>({})
  const [totalGuests, setTotalGuests] = useState(0)
  const [totalResponded, setTotalResponded] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/rsvp").then(r => r.json()),
    ]).then(([guests]) => {
      const arr = Array.isArray(guests) ? guests : []
      const counts: Record<string, number> = { Beef: 0, Chicken: 0, Fish: 0, Pork: 0, Vegan: 0 }
      let responded = 0
      arr.forEach((g: any) => {
        if (g.is_attending) {
          responded++
          const meal = g.meal_choice || "Beef"
          if (counts[meal] !== undefined) counts[meal]++
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
    label: meal,
    count: mealCounts[meal] || 0,
    fill: `var(--color-chart-${MEAL_OPTIONS.indexOf(meal) + 1})`,
  }))

  const maxCount = Math.max(...pieData.map((m) => m.count), 1)
  const totalMeals = pieData.reduce((s, m) => s + m.count, 0)
  const pending = totalGuests - totalResponded
  const responseRate = totalGuests > 0 ? Math.round((totalResponded / totalGuests) * 100) : 0

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-serif text-lg text-muted-foreground">Loading catering data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gold/30 bg-hunter">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-gold">
                  Admin Dashboard
                </span>
              </div>
              <h1 className="text-balance font-serif text-4xl leading-tight text-hunter-foreground sm:text-5xl">
                Menu &amp; Catering
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-hunter-foreground/70">
                Nikkita &amp; Justin · Saturday, September 26, 2026 · Four Seasons at Terra Lago
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gold/40 bg-hunter-dark/40 px-5 py-3">
              <UtensilsCrossed className="size-5 text-gold" />
              <div>
                <p className="font-serif text-2xl leading-none text-hunter-foreground">
                  {totalMeals}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-hunter-foreground/60">
                  Meals confirmed
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Guests Invited" value={totalGuests} />
          <StatCard icon={MailCheck} label="RSVP Received" value={totalResponded} accent />
          <StatCard icon={Clock} label="Awaiting Reply" value={pending} />
          <StatCard icon={Leaf} label="Response Rate" value={`${responseRate}%`} />
        </div>

        {/* Distribution + legend */}
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="font-serif text-xl text-ink">Meal Distribution</h2>
            <p className="mt-1 text-sm text-muted-foreground">Share of confirmed entrée selections.</p>
            <ChartContainer config={chartConfig} className="mx-auto mt-4 aspect-square max-h-[260px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={pieData} dataKey="count" nameKey="label" innerRadius={68} strokeWidth={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.meal} fill={entry.fill} stroke="var(--card)" />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-ink font-serif text-3xl">
                              {totalMeals}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 22}
                              className="fill-muted-foreground text-xs"
                            >
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
          </div>

          {/* Horizontal breakdown bars */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-3">
            <h2 className="font-serif text-xl text-ink">Selections by Entrée</h2>
            <p className="mt-1 text-sm text-muted-foreground">Head count per menu option.</p>
            <ul className="mt-6 flex flex-col gap-5">
              {pieData.map((m) => {
                const pct = totalMeals > 0 ? Math.round((m.count / totalMeals) * 100) : 0
                return (
                  <li key={m.meal}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-ink">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: m.fill }}
                          aria-hidden
                        />
                        {m.label}
                      </span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {m.count} <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(m.count / maxCount) * 100}%`,
                          backgroundColor: m.fill,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Dietary notes placeholder */}
        <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl text-ink">Dietary Notes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Flagged restrictions to brief the kitchen.</p>
            <p className="mt-5 text-sm italic text-muted-foreground">
              Dietary restrictions are logged per guest on the RSVP form.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gold/30 bg-secondary py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs tracking-wide text-muted-foreground">
          Figures reflect confirmed RSVPs as of the latest sync. Pending replies are excluded from meal counts.
        </div>
      </footer>
    </div>
  )
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
        accent ? "border-gold/50 bg-hunter text-hunter-foreground" : "border-border bg-card"
      }`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-full ${
          accent ? "bg-gold/20 text-gold" : "bg-secondary text-hunter"
        }`}
      >
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className={`font-serif text-3xl leading-none tabular-nums ${accent ? "" : "text-ink"}`}>
          {value}
        </p>
        <p
          className={`mt-1.5 text-xs uppercase tracking-wider ${
            accent ? "text-hunter-foreground/70" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  )
}