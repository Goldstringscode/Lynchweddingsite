"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Info, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface InflationData {
  base_year: number
  base_cpi: number
  target_year: number
  target_cpi: number
  target_multiplier: number
  cumulative_inflation_rate: number
  annualized_rate: number
  historical: { year: number; cpi: number; inflation_rate: number | null }[]
  current_inflation_rate: number | null
}

interface Props {
  currentCost: number
  guestCount: number
  onInflationUpdate: (multiplier: number, year: number, month: number) => void
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function InflationProjector({ currentCost, guestCount, onInflationUpdate }: Props) {
  const [data, setData] = useState<InflationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [targetYear, setTargetYear] = useState(2027)
  const [targetMonth, setTargetMonth] = useState(6)
  const [showProjection, setShowProjection] = useState(false)

  const fetchInflation = useCallback(async (year: number, month: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/inflation?year=${year}&month=${month}`)
      const json = await res.json()
      setData(json)
      onInflationUpdate(json.target_multiplier, year, month)
    } catch (e) {
      console.error("Inflation fetch failed", e)
    } finally {
      setLoading(false)
    }
  }, [onInflationUpdate])

  useEffect(() => {
    if (showProjection) {
      fetchInflation(targetYear, targetMonth)
    }
  }, [showProjection, targetYear, targetMonth, fetchInflation])

  const projectedTotal = data ? currentCost * data.target_multiplier * (guestCount || 150) : 0
  const projectedPP = data ? currentCost * data.target_multiplier : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-gold" />
          <h3 className="font-serif text-sm font-medium">Future Price Projection</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2 text-xs h-8", showProjection && "border-gold/50 bg-gold/5")}
          onClick={() => setShowProjection(!showProjection)}
        >
          <Calendar className="size-3.5" />
          {showProjection ? "Hide Projection" : "Show Projection"}
        </Button>
      </div>

      {showProjection && (
        <Card className="border-gold/20 bg-gradient-to-br from-gold/[0.03] to-transparent">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Target Year</Label>
                <Select value={targetYear.toString()} onValueChange={(v) => setTargetYear(parseInt(v))}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 15 }, (_, i) => {
                      const y = 2026 + i
                      return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Target Month</Label>
                <Select value={targetMonth.toString()} onValueChange={(v) => setTargetMonth(parseInt(v))}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4 text-sm text-muted-foreground animate-pulse">
                Loading inflation data...
              </div>
            ) : data ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="size-3" />
                  <span>
                    Based on CPI-U data. Current annual inflation:{" "}
                    <span className="font-medium text-foreground">
                      {data.current_inflation_rate?.toFixed(1)}%
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-background/50 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Inflation Rate
                    </p>
                    <p className="text-lg font-serif font-medium">
                      +{data.cumulative_inflation_rate.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      cumulative
                    </p>
                  </div>
                  <div className="rounded-lg border bg-background/50 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Cost Per Person
                    </p>
                    <p className="text-lg font-serif font-medium">
                      ${projectedPP.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[10px] text-muted-foreground">was</span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        ${currentCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-background/50 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Total Cost
                    </p>
                    <p className="text-lg font-serif font-medium">
                      ${projectedTotal.toFixed(0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      for {guestCount || 150} guests
                    </p>
                  </div>
                </div>

                {/* Historical breakdown */}
                <details className="group">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                    View historical CPI data
                  </summary>
                  <div className="mt-2 max-h-40 overflow-y-auto space-y-0.5">
                    {data.historical.slice().reverse().map((h) => (
                      <div key={h.year} className="flex items-center justify-between text-[11px] px-2 py-1 rounded hover:bg-muted/30">
                        <span className="text-muted-foreground">{h.year}</span>
                        <span className="font-medium tabular-nums">{h.cpi.toFixed(1)}</span>
                        {h.inflation_rate !== null && (
                          <span className={cn(
                            "tabular-nums",
                            h.inflation_rate > 3 ? "text-destructive" : h.inflation_rate > 2 ? "text-amber-600" : "text-green-600"
                          )}>
                            {h.inflation_rate >= 0 ? "+" : ""}{h.inflation_rate.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>

                <p className="text-[10px] text-muted-foreground italic">
                  {data.note}
                </p>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Click above to load inflation projections.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}