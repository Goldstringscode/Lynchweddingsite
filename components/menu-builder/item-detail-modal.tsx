"use client"

import { Flame, Beef, Coffee, Droplets, Salad, Clock, ChefHat, AlertTriangle, DollarSign, Scale, ShoppingBag, TrendingDown, Sparkles, Soup, Wheat, Milk, Egg, Fish, Apple, Cherry, TreePine } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MenuItemDetail {
  id: string
  name: string
  description: string
  category: string
  category_name?: string
  section: string | null
  is_signature: boolean
  is_available: boolean
  difficulty?: string | null
  prep_time?: number | null
  season_tags?: string[] | null
  allergens?: string[] | null
  suggested_pairings?: string[] | null
  portion_weight_g?: number | null
  cost_per_serving?: number | null
  suggested_menu_price?: number | null
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
  } | null
  ingredient_list?: {
    item: string
    quantity: string
    costcoPrice?: number
    wincoPrice?: number
  }[]
  ingredient_links?: {
    costco?: { costPerServing: number; totalFor150: number }
    winco?: { costPerServing: number; totalFor150: number }
    blended?: { costPerServing: number; totalFor150: number }
    savingsPerServing?: number
    savingsPercent?: number
    menuPrice?: number
    profitMargin?: number
    lastUpdated?: string
  }
}

interface Props {
  item: MenuItemDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DIFFICULTY_ICON = {
  easy: ChefHat,
  medium: Clock,
  hard: Sparkles,
}

const ALLERGEN_ICONS: Record<string, typeof AlertTriangle> = {
  dairy: Milk,
  gluten: Wheat,
  nuts: TreePine,
  shellfish: Fish,
  eggs: Egg,
  soy: Apple,
}

const SEASON_ICONS: Record<string, typeof Cherry> = {
  spring: Cherry,
  summer: Apple,
  fall: TreePine,
  winter: Snowflake,
}

function Snowflake(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg> }

export function ItemDetailModal({ item, open, onOpenChange }: Props) {
  if (!item) return null

  const nutrition = item.nutrition || {}
  const ingredients = item.ingredient_list || []
  const pricing = item.ingredient_links || {}
  const price = item.suggested_menu_price ?? 0
  const cost = item.cost_per_serving ?? 0
  const weightG = item.portion_weight_g
  const weightOz = weightG ? (weightG / 28.3495).toFixed(1) : null
  const DifficultyIcon = DIFFICULTY_ICON[item.difficulty as keyof typeof DIFFICULTY_ICON] || ChefHat

  const macros = [
    { label: "Calories", value: nutrition.calories, unit: "kcal", icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
    { label: "Protein", value: nutrition.protein, unit: "g", icon: Beef, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
    { label: "Carbs", value: nutrition.carbs, unit: "g", icon: Coffee, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { label: "Fat", value: nutrition.fat, unit: "g", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Fiber", value: nutrition.fiber, unit: "g", icon: Salad, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
  ].filter(m => m.value != null && m.value > 0)

  const costcoPrice = pricing.costco?.costPerServing
  const wincoPrice = pricing.winco?.costPerServing
  const savings = pricing.savingsPerServing
  const savingsPct = pricing.savingsPercent
  const margin = pricing.profitMargin

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="font-serif text-xl">{item.name}</DialogTitle>
                {item.is_signature && (
                  <Badge variant="secondary" className="text-[10px] px-2 gap-1">
                    <Sparkles className="size-3" /> Signature
                  </Badge>
                )}
              </div>
              {item.description && (
                <DialogDescription className="text-sm leading-relaxed">
                  {item.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-xl border bg-card p-3 text-center">
              <DollarSign className="size-4 mx-auto mb-1 text-emerald-500" />
              <p className="text-lg font-serif font-medium tabular-nums">${price.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Menu Price</p>
            </div>
            {cost > 0 && (
              <div className="rounded-xl border bg-card p-3 text-center">
                <Scale className="size-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-serif font-medium tabular-nums">${cost.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cost/Serving</p>
              </div>
            )}
            {weightG && (
              <div className="rounded-xl border bg-card p-3 text-center">
                <ShoppingBag className="size-4 mx-auto mb-1 text-purple-500" />
                <p className="text-lg font-serif font-medium tabular-nums">{weightG}g</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{weightOz} oz</p>
              </div>
            )}
            {item.difficulty && (
              <div className="rounded-xl border bg-card p-3 text-center">
                <DifficultyIcon className="size-4 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-serif font-medium capitalize">{item.difficulty}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {item.prep_time ? `${item.prep_time} min` : 'Difficulty'}
                </p>
              </div>
            )}
          </div>

          {/* Costco vs WinCo Pricing */}
          {costcoPrice && wincoPrice && (
            <Card className="border-emerald-200 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="size-4 text-emerald-500" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Costco vs WinCo Pricing
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Costco */}
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="size-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Costco</span>
                    </div>
                    <p className="text-xl font-serif font-medium tabular-nums">${costcoPrice.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">per serving</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      ${pricing.costco?.totalFor150?.toFixed(0)} for 150 guests
                    </p>
                  </div>

                  {/* WinCo */}
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-950/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="size-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">WinCo</span>
                    </div>
                    <p className="text-xl font-serif font-medium tabular-nums">${wincoPrice.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">per serving</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      ${pricing.winco?.totalFor150?.toFixed(0)} for 150 guests
                    </p>
                  </div>
                </div>

                {savings != null && savingsPct != null && (
                  <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20 px-3 py-2">
                    <TrendingDown className="size-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Save ${savings.toFixed(2)} per serving ({savingsPct}%) by choosing Costco
                    </span>
                  </div>
                )}

                {margin != null && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <span>Menu Price: ${price.toFixed(2)}</span>
                    <span className={cn("font-medium", margin >= 60 ? "text-emerald-600" : margin >= 40 ? "text-amber-600" : "text-red-600")}>
                      {margin}% profit margin
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Soup className="size-4 text-rose-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingredients & Sourcing</h4>
              </div>
              <div className="divide-y divide-border/50 rounded-xl border">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="size-1.5 rounded-full bg-primary/30 shrink-0" />
                      <span className="truncate font-medium">{ing.item}</span>
                      <span className="text-muted-foreground shrink-0">{ing.quantity}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3 text-[10px]">
                      {ing.costcoPrice != null && (
                        <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                          Costco: ${ing.costcoPrice.toFixed(2)}
                        </span>
                      )}
                      {ing.wincoPrice != null && (
                        <span className="tabular-nums text-amber-600 dark:text-amber-400">
                          WinCo: ${ing.wincoPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition */}
          {macros.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-orange-500" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nutrition Facts</h4>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {macros.map((m) => (
                  <div key={m.label} className={cn("rounded-xl border p-2.5 text-center", m.bg)}>
                    <m.icon className={cn("size-4 mx-auto mb-1", m.color)} />
                    <p className="text-sm font-serif font-medium tabular-nums">
                      {m.value}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.unit}</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allergens + Season + Tags row */}
          <div className="flex flex-wrap gap-4">
            {item.allergens && item.allergens.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="size-3 text-amber-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Allergens</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.allergens.map((a) => {
                    const AllergenIcon = ALLERGEN_ICONS[a.toLowerCase()] || AlertTriangle
                    return (
                      <Badge key={a} variant="outline" className="text-[10px] gap-1 px-2 py-0.5 h-5">
                        <AllergenIcon className="size-2.5" />
                        {a}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {item.season_tags && item.season_tags.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3 text-muted-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Season</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.season_tags.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] capitalize gap-1 px-2 py-0.5 h-5">
                      <span className="size-1.5 rounded-full bg-primary/40" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CalendarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}