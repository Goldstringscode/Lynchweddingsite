"use client"

import { motion, AnimatePresence } from "motion/react"
import { Flame, Beef, Coffee, Droplets, Salad, Clock, ChefHat, AlertTriangle, DollarSign, Scale, ShoppingBag, TrendingDown, Sparkles, Soup, Wheat, Milk, Egg, Fish, Apple, Cherry, TreePine, Award, Timer } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SourcingSection } from "./sourcing-section"

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
      samsClubPrice?: number
    }[]
    ingredient_links?: {
      costco?: { costPerServing: number; totalFor150: number }
      winco?: { costPerServing: number; totalFor150: number }
      sams?: { costPerServing: number; totalFor150: number }
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

const DIFFICULTY_ICON: Record<string, typeof ChefHat> = {
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

/* ── Luxury quick-stat card ── */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string
}) {
  return (
    <motion.div variants={cardVariants} className="rounded-2xl border bg-card/80 p-4 sm:p-6 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <Icon className={cn("size-5 sm:size-7 mx-auto mb-2 sm:mb-3", color)} strokeWidth={1.5} />
      <p className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tabular-nums leading-none">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest mt-1.5 sm:mt-2 font-medium">
        {label}
      </p>
      {sub && (
        <p className="text-[11px] sm:text-xs text-muted-foreground/70 mt-1">{sub}</p>
              )}
            </motion.div>
  )
}

/* ── Store pricing card ── */
function StoreCard({ name, price, total, color, border }: {
  name: string; price: number; total?: number; color: string; border: string
}) {
  return (
    <motion.div variants={cardVariants} className={cn("rounded-2xl border-2 bg-card/60 p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5", border)}>
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag className={cn("size-4 sm:size-5", color)} strokeWidth={1.5} />
        <span className="text-sm sm:text-base font-semibold">{name}</span>
      </div>
      <p className="text-3xl sm:text-4xl font-serif font-bold tabular-nums leading-none">
        ${price.toFixed(2)}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1 uppercase tracking-wider">per serving</p>
      {total != null && (
        <p className="text-xs sm:text-sm text-muted-foreground/70 mt-2 border-t border-border/40 pt-2">
                  ${total.toFixed(0)} <span className="text-[11px]">for 150</span>
                </p>
              )}
            </motion.div>
  )
}

/* ── Macro badge ── */
function MacroBadge({ icon: Icon, value, unit, label, color, bg }: {
  icon: any; value: number; unit: string; label: string; color: string; bg: string
}) {
  return (
    <motion.div variants={badgeVariants} className={cn("rounded-xl border border-border/60 p-3 sm:p-4 text-center transition-colors", bg)}>
      <Icon className={cn("size-4 sm:size-5 mx-auto mb-1.5", color)} strokeWidth={1.5} />
      <p className="text-base sm:text-xl font-serif font-bold tabular-nums">{value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{unit}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 mt-0.5">{label}</p>
          </motion.div>
  )
}

/* ── Animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1], // smooth cubic-bezier
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.3, ease: "backOut" },
  },
}

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
    { label: "Calories", value: nutrition.calories, unit: "Cal", icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
    { label: "Protein", value: nutrition.protein, unit: "g", icon: Beef, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
    { label: "Carbs", value: nutrition.carbs, unit: "g", icon: Coffee, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { label: "Fat", value: nutrition.fat, unit: "g", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Fiber", value: nutrition.fiber, unit: "g", icon: Salad, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
  ].filter(m => m.value != null && m.value > 0)

  const costcoPrice = pricing.costco?.costPerServing
  const wincoPrice = pricing.winco?.costPerServing
  const samsPrice = pricing.sams?.costPerServing
  const savings = pricing.savingsPerServing
  const savingsPct = pricing.savingsPercent
  const margin = pricing.profitMargin

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        max-w-[95vw] sm:max-w-5xl lg:max-w-6xl
        max-h-[90vh] overflow-y-auto
        p-5 sm:p-8 lg:p-10
        rounded-3xl
      ">
        {/* ✦ HEADER */}
        <DialogHeader className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <DialogTitle className="font-serif text-2xl sm:text-3xl lg:text-5xl leading-tight tracking-tight">
                  {item.name}
                </DialogTitle>
                {item.is_signature && (
                  <Badge variant="secondary" className="text-xs sm:text-sm px-3 py-1 gap-1.5 rounded-full">
                    <Sparkles className="size-3.5 sm:size-4" strokeWidth={1.5} />
                    Signature
                  </Badge>
                )}
              </div>
            </div>
            {/* Description */}
            {item.description && (
              <DialogDescription className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl text-muted-foreground/90">
                {item.description}
              </DialogDescription>
            )}
            {/* Category / Section chips */}
            {(item.category_name || item.section) && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs px-3 py-1 rounded-full capitalize">
                  {item.category_name || item.category}
                </Badge>
                {item.section && (
                  <Badge variant="outline" className="text-xs px-3 py-1 rounded-full capitalize text-muted-foreground">
                    {item.section}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* ✦ CONTENT */}
                <motion.div
                  key={item.id}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex-1 space-y-8 sm:space-y-10"
                >

                  {/* ── Quick Stats Row ── */}
                  <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-3 sm:gap-5">
            <StatCard
              icon={DollarSign} label="Menu Price"
              value={`$${price.toFixed(2)}`}
              color="text-emerald-500"
            />
            {cost > 0 && (
              <StatCard
                icon={Scale} label="Cost / Serving"
                value={`$${cost.toFixed(2)}`}
                sub={margin != null ? `${margin}% margin` : undefined}
                color="text-muted-foreground"
              />
            )}
            {weightG != null && (
              <StatCard
                icon={ShoppingBag} label="Portion"
                value={`${weightG}g`}
                sub={`${weightOz} oz`}
                color="text-purple-500"
              />
            )}
            {item.difficulty && (
              <StatCard
                icon={DifficultyIcon} label={item.prep_time ? "Prep Time" : "Difficulty"}
                value={item.prep_time ? `${item.prep_time}m` : item.difficulty}
                sub={item.prep_time ? item.difficulty : undefined}
                color="text-amber-500"
              />
            )}
          </motion.div>

                    {/* ── Main 2-column grid ── */}
                    <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

            {/* ═══ LEFT COLUMN ═══ */}
            <div className="space-y-6 sm:space-y-8">

              {/* Store Pricing Comparison */}
              {costcoPrice && wincoPrice && samsPrice && (
                <section>
                  <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                    <TrendingDown className="size-5 sm:size-6 text-emerald-500" strokeWidth={1.5} />
                    <h3 className="text-sm sm:text-base font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      Sourcing Comparison
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <StoreCard name="Costco" price={costcoPrice} total={pricing.costco?.totalFor150}
                      color="text-emerald-600" border="border-emerald-200 dark:border-emerald-800/50" />
                    <StoreCard name="WinCo" price={wincoPrice} total={pricing.winco?.totalFor150}
                      color="text-amber-600" border="border-amber-200 dark:border-amber-800/50" />
                    <StoreCard name="Sam's Club" price={samsPrice} total={pricing.sams?.totalFor150}
                      color="text-blue-600" border="border-blue-200 dark:border-blue-800/50" />
                  </div>
                  {/* Savings bar */}
                  {savings != null && savingsPct != null && (
                    <div className="mt-3 flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 px-5 py-3 border border-emerald-200/50 dark:border-emerald-800/30">
                      <TrendingDown className="size-4 sm:size-5 text-emerald-500" strokeWidth={1.5} />
                      <span className="text-sm sm:text-base font-semibold text-emerald-700 dark:text-emerald-400">
                        Save ${savings.toFixed(2)}/serving ({savingsPct}%) at Costco
                      </span>
                    </div>
                  )}
                </section>
              )}

              {/* Ingredients */}
              {ingredients.length > 0 && (
                <section>
                  <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                    <Soup className="size-5 sm:size-6 text-rose-500" strokeWidth={1.5} />
                    <h3 className="text-sm sm:text-base font-semibold uppercase tracking-widest text-muted-foreground">
                      Ingredients
                    </h3>
                  </div>
                  <div className="divide-y divide-border/50 rounded-2xl border border-border/50 overflow-hidden">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="size-2 rounded-full bg-primary/40 shrink-0" />
                          <span className="truncate font-medium text-sm sm:text-base">{ing.item}</span>
                          <span className="text-muted-foreground/70 text-xs sm:text-sm shrink-0">{ing.quantity}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm mt-2 sm:mt-0 ml-5 sm:ml-0">
                          {ing.costcoPrice != null && (
                            <span className="tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                              Costco ${ing.costcoPrice.toFixed(2)}
                            </span>
                          )}
                          {ing.wincoPrice != null && (
                            <span className="tabular-nums text-amber-600 dark:text-amber-400 font-medium">
                              WinCo ${ing.wincoPrice.toFixed(2)}
                            </span>
                          )}
                          {ing.samsClubPrice != null && (
                            <span className="tabular-nums text-blue-600 dark:text-blue-400 font-medium">
                              Sam's ${ing.samsClubPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Pre-made Sourcing */}
              <SourcingSection
                itemSection={item.section}
                itemCategory={item.category}
              />
            </div>

            {/* ═══ RIGHT COLUMN ═══ */}
            <div className="space-y-6 sm:space-y-8">

              {/* Nutrition */}
              {macros.length > 0 && (
                <section>
                  <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                    <Flame className="size-5 sm:size-6 text-orange-500" strokeWidth={1.5} />
                    <h3 className="text-sm sm:text-base font-semibold uppercase tracking-widest text-muted-foreground">
                      Nutrition Facts
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {macros.map((m) => (
                      <MacroBadge key={m.label} {...m} />
                    ))}
                  </div>
                </section>
              )}

              {/* Allergens + Season + Pairings */}
              <div className="space-y-5 sm:space-y-6">
                {item.allergens && item.allergens.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="size-4 sm:size-5 text-amber-500" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground">Allergens</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.allergens.map((a) => {
                        const AllergenIcon = ALLERGEN_ICONS[a.toLowerCase()] || AlertTriangle
                        return (
                          <Badge key={a} variant="outline" className="text-xs px-3 py-1.5 gap-1.5 rounded-full h-auto">
                            <AllergenIcon className="size-3.5" />
                            {a}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {item.season_tags && item.season_tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarIcon className="size-4 sm:size-5 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground">Season</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.season_tags.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs px-3 py-1.5 gap-1.5 rounded-full capitalize h-auto">
                          <span className="size-2 rounded-full bg-primary/50" />
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {item.suggested_pairings && item.suggested_pairings.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="size-4 sm:size-5 text-gold" strokeWidth={1.5} />
                      <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground">Pairings</span>
                    </div>
                    <div className="flex-wrap flex gap-2">
                      {item.suggested_pairings.map((p, i) => (
                        <Badge key={i} variant="secondary" className="text-xs px-3 py-1.5 rounded-full h-auto">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
                  </motion.div>
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