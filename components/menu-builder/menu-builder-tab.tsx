"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Save,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  DollarSign,
  Users,
  RotateCcw,
  Sparkles,
  X,
  Check,
  Loader2,
  Salad,
  Beef,
  Fish,
  Cookie,
  Wine,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string
  category: string
  section: string | null
  name: string
  description: string
  price: number | null
  cost_per_serving: number | null
  suggested_menu_price: number | null
  nutrition: Record<string, any> | null
  allergens: string[] | null
  season_tags: string[] | null
  difficulty: string | null
  pairing_group: string | null
  suggested_pairings: string[] | null
  has_small_portion: boolean
  has_large_portion: boolean
  portion_weight_g: number | null
  is_available: boolean
  is_signature: boolean
  image_url: string | null
  sort_order: number
}

interface CourseSlot {
  course_number: number
  course_type: "appetizer" | "protein" | "side" | "dessert"
  item_id: string | null
  portion_size: "small" | "regular" | "large"
  notes: string
  item_name?: string
  item_price?: number
}

interface MenuDraft {
  id: string
  name: string
  description: string
  event_type: string
  guest_count: number
  target_budget_per_person: number | null
  courses: CourseSlot[]
  total_cost_per_person: number
  total_menu_cost: number
  is_locked: boolean
  created_at: string
  updated_at: string
}

const COURSE_TYPES: CourseSlot["course_type"][] = [
  "appetizer",
  "protein",
  "side",
  "dessert",
]

const COURSE_LABELS: Record<CourseSlot["course_type"], string> = {
  appetizer: "Appetizer",
  protein: "Protein / Entrée",
  side: "Side",
  dessert: "Dessert",
}

const COURSE_ICONS: Record<CourseSlot["course_type"], React.ComponentType<{ className?: string }>> = {
  appetizer: Salad,
  protein: Beef,
  side: Salad,
  dessert: Cookie,
}

const SECTION_EMOJI: Record<string, string> = {
  proteins: "🥩",
  sides: "🥗",
  appetizers: "🥂",
  desserts: "🍰",
}

const PORTION_MULTIPLIERS: Record<string, number> = {
  small: 0.7,
  regular: 1.0,
  large: 1.35,
}

// ─── Menu Builder Tab ────────────────────────────────────────────────────────

export function MenuBuilderTab() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [drafts, setDrafts] = useState<MenuDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDraft, setActiveDraft] = useState<MenuDraft | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [guestCount, setGuestCount] = useState(150)
  const [budgetPerPerson, setBudgetPerPerson] = useState<number | null>(null)
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sectionFilter, setSectionFilter] = useState<string>("all")
  const [saving, setSaving] = useState(false)
  const [draftName, setDraftName] = useState("")

  // Fetch data
  const fetchAll = useCallback(async () => {
    const [itemsRes, draftsRes] = await Promise.all([
      fetch("/api/menu"),
      fetch("/api/menu/drafts"),
    ])
    setItems(await itemsRes.json())
    setDrafts(await draftsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Initialize or reset active draft
  const resetDraft = useCallback(() => {
    setActiveDraft({
      id: "",
      name: "Untitled Menu",
      description: "",
      event_type: "wedding",
      guest_count: guestCount,
      target_budget_per_person: budgetPerPerson,
      courses: [],
      total_cost_per_person: 0,
      total_menu_cost: 0,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setDraftName("")
  }, [guestCount, budgetPerPerson])

  useEffect(() => {
    if (!loading && !activeDraft) resetDraft()
  }, [loading, activeDraft, resetDraft])

  // Calculate budget
  const { costPerPerson, totalCost } = useMemo(() => {
    if (!activeDraft) return { costPerPerson: 0, totalCost: 0 }
    const perPerson = activeDraft.courses.reduce((sum, slot) => {
      if (!slot.item_id) return sum
      const item = items.find((i) => i.id === slot.item_id)
      if (!item) return sum
      const basePrice = item.suggested_menu_price || item.price || 0
      const multiplier = PORTION_MULTIPLIERS[slot.portion_size] || 1
      return sum + basePrice * multiplier
    }, 0)
    return {
      costPerPerson: Math.round(perPerson * 100) / 100,
      totalCost: Math.round(perPerson * activeDraft.guest_count * 100) / 100,
    }
  }, [activeDraft, items])

  // Add course slot
  const addCourse = useCallback((type: CourseSlot["course_type"]) => {
    setActiveDraft((prev) => {
      if (!prev) return prev
      const maxNum = prev.courses.reduce((max, c) => Math.max(max, c.course_number), 0)
      return {
        ...prev,
        courses: [
          ...prev.courses,
          {
            course_number: maxNum + 1,
            course_type: type,
            item_id: null,
            portion_size: "regular" as const,
            notes: "",
          },
        ],
      }
    })
  }, [])

  // Remove course slot
  const removeCourse = useCallback((courseNumber: number) => {
    setActiveDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        courses: prev.courses.filter((c) => c.course_number !== courseNumber),
      }
    })
  }, [])

  // Select item for a course
  const selectItem = useCallback(
    (courseNumber: number, itemId: string) => {
      setActiveDraft((prev) => {
        if (!prev) return prev
        const item = items.find((i) => i.id === itemId)
        return {
          ...prev,
          courses: prev.courses.map((c) =>
            c.course_number === courseNumber
              ? {
                  ...c,
                  item_id: itemId,
                  item_name: item?.name || "",
                  item_price: item?.suggested_menu_price || item?.price || 0,
                }
              : c
          ),
        }
      })
    },
    [items]
  )

  // Set portion size
  const setPortion = useCallback(
    (courseNumber: number, portion: "small" | "regular" | "large") => {
      setActiveDraft((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          courses: prev.courses.map((c) =>
            c.course_number === courseNumber ? { ...c, portion_size: portion } : c
          ),
        }
      })
    },
    []
  )

  // Set guest count
  const updateGuestCount = useCallback((count: number) => {
    setGuestCount(count)
    setActiveDraft((prev) => (prev ? { ...prev, guest_count: count } : prev))
  }, [])

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!activeDraft) return
    setSaving(true)
    const payload = {
      name: draftName || activeDraft.name,
      description: activeDraft.description,
      guest_count: activeDraft.guest_count,
      target_budget_per_person: budgetPerPerson,
      courses: activeDraft.courses,
    }

    try {
      if (activeDraft.id) {
        await fetch("/api/menu/drafts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: activeDraft.id }),
        })
      } else {
        const res = await fetch("/api/menu/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const created = await res.json()
        setActiveDraft((prev) =>
          prev ? { ...prev, id: created.id } : prev
        )
      }
      await fetchAll()
      setShowSaveDialog(false)
    } catch (e) {
      console.error("Save failed:", e)
    } finally {
      setSaving(false)
    }
  }, [activeDraft, draftName, budgetPerPerson, fetchAll])

  // Load draft
  const loadDraft = useCallback(
    (draft: MenuDraft) => {
      setActiveDraft(draft)
      setGuestCount(draft.guest_count)
      setBudgetPerPerson(draft.target_budget_per_person)
      setShowLoadDialog(false)
    },
    []
  )

  // Delete draft
  const deleteDraft = useCallback(
    async (id: string) => {
      await fetch(`/api/menu/drafts?id=${id}`, { method: "DELETE" })
      fetchAll()
    },
    [fetchAll]
  )

  // Filter items for browser
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.is_available) return false
      if (sectionFilter !== "all" && item.section !== sectionFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [items, sectionFilter, searchQuery])

  // Get suggested items for a course type
  const getItemsForType = useCallback(
    (type: CourseSlot["course_type"]) => {
      const sectionMap: Record<string, string> = {
        appetizer: "appetizers",
        protein: "proteins",
        side: "sides",
        dessert: "desserts",
      }
      return filteredItems.filter((i) => i.section === sectionMap[type])
    },
    [filteredItems]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <Input
                type="number"
                value={guestCount}
                onChange={(e) => updateGuestCount(parseInt(e.target.value) || 0)}
                className="h-9 w-20"
                min={1}
                aria-label="Guest count"
              />
              <span className="text-xs text-muted-foreground">guests</span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <Input
                type="number"
                value={budgetPerPerson ?? ""}
                onChange={(e) => setBudgetPerPerson(e.target.value ? parseFloat(e.target.value) : null)}
                className="h-9 w-24"
                min={0}
                step={5}
                placeholder="Budget"
                aria-label="Budget per person"
              />
              <span className="text-xs text-muted-foreground">/person</span>
            </div>

            <Separator orientation="vertical" className="h-8 hidden sm:block" />

            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowLoadDialog(true)}>
              <Save className="size-3.5" />
              Load
            </Button>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Copy className="size-3.5" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Save Menu Draft</DialogTitle>
                  <DialogDescription>
                    Give your menu a name to save it for later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    value={draftName || activeDraft?.name || ""}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="e.g., Menu A - Classic Elegance"
                  />
                  <Button
                    className="w-full"
                    onClick={saveDraft}
                    disabled={saving || !(draftName || activeDraft?.name)}
                  >
                    {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                    Save Draft
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" className="gap-2" onClick={resetDraft}>
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Item Browser */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-base">Menu Catalog</CardTitle>
              <Badge variant="outline" className="text-xs">
                {filteredItems.length} items
              </Badge>
            </div>
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {["all", "appetizers", "proteins", "sides", "desserts"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSectionFilter(s)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    sectionFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {SECTION_EMOJI[s] || ""}{" "}
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-0 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filteredItems.map((item) => {
                const ItemIcon = COURSE_ICONS[
                  (Object.entries({
                    appetizers: "appetizer",
                    proteins: "protein",
                    sides: "side",
                    desserts: "dessert",
                  } as Record<string, CourseSlot["course_type"]>).find(
                    ([k]) => k === item.section
                  )?.[1] || "appetizer"
                ]
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      // Find an empty slot of matching type and add it
                      const sectionTypeMap: Record<string, CourseSlot["course_type"]> = {
                        appetizers: "appetizer",
                        proteins: "protein",
                        sides: "side",
                        desserts: "dessert",
                      }
                      const courseType = item.section ? sectionTypeMap[item.section] : null
                      if (courseType && activeDraft) {
                        const emptySlot = activeDraft.courses.find(
                          (c) => c.course_type === courseType && !c.item_id
                        )
                        if (emptySlot) {
                          selectItem(emptySlot.course_number, item.id)
                        } else {
                          addCourse(courseType)
                          // Will select after state update - use setTimeout
                          setTimeout(() => {
                            setActiveDraft((prev) => {
                              if (!prev) return prev
                              const newSlot = prev.courses.find(
                                (c) => c.course_type === courseType && !c.item_id
                              )
                              if (newSlot) {
                                selectItem(newSlot.course_number, item.id)
                              }
                              return prev
                            })
                          }, 0)
                        }
                      }
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-accent/30 text-xs",
                      item.is_signature && "border-gold/50"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-lg">{SECTION_EMOJI[item.section || ""] || "🍽️"}</span>
                      <span className="font-medium text-sm flex-1 truncate">{item.name}</span>
                    </div>
                    {(item.suggested_menu_price || item.price) && (
                      <span className="text-xs font-medium text-muted-foreground">
                        ${(item.suggested_menu_price || item.price)?.toFixed(2)} / person
                      </span>
                    )}
                    {item.is_signature && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        <Sparkles className="size-2.5 mr-0.5" />
                        Signature
                      </Badge>
                    )}
                  </button>
                )
              })}
              {filteredItems.length === 0 && (
                <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                  No items found matching your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Builder Canvas */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">
                  {activeDraft?.name || "Menu Builder"}
                </CardTitle>
                <CardDescription>
                  Build your perfect menu course by course
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {suggestionsEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => setSuggestionsEnabled(false)}
                  >
                    <Sparkles className="size-3" />
                    Suggestions On
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8 text-muted-foreground"
                    onClick={() => setSuggestionsEnabled(true)}
                  >
                    <X className="size-3" />
                    Suggestions Off
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {activeDraft && activeDraft.courses.length === 0 && (
              <div className="py-8 text-center">
                <UtensilsCrossed className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Your menu is empty. Add courses below to start building.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {activeDraft?.courses.map((slot) => {
                const item = items.find((i) => i.id === slot.item_id)
                const Icon = COURSE_ICONS[slot.course_type]
                return (
                  <Card key={slot.course_number} className="overflow-hidden">
                    <div className={cn(
                      "flex items-start gap-3 p-4",
                      slot.item_id ? "" : "border-2 border-dashed border-muted-foreground/20"
                    )}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon className="size-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Course {slot.course_number} — {COURSE_LABELS[slot.course_type]}
                          </p>
                          {item ? (
                            <div>
                              <p className="font-medium text-sm mt-0.5">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                              {/* Nutrition + Allergens */}
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {item.allergens?.map((a) => (
                                  <Badge key={a} variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-amber-600 border-amber-200">
                                    {a}
                                  </Badge>
                                ))}
                                {item.nutrition?.calories && (
                                  <span className="text-[10px] text-muted-foreground">
                                    ~{item.nutrition.calories} cal
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic mt-0.5">
                              Select an item from the catalog
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Portion selector */}
                        <Select
                          value={slot.portion_size}
                          onValueChange={(v) => setPortion(slot.course_number, v as any)}
                        >
                          <SelectTrigger className="h-8 w-20 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Price */}
                        {item && (
                          <span className="text-sm font-medium tabular-nums w-16 text-right">
                            ${((item.suggested_menu_price || item.price || 0) * PORTION_MULTIPLIERS[slot.portion_size]).toFixed(2)}
                          </span>
                        )}

                        {/* Swap button - opens dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7" aria-label="Swap item">
                              <RotateCcw className="size-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Select {COURSE_LABELS[slot.course_type]}</DialogTitle>
                              <DialogDescription>
                                Browse and select from available items.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
                              {getItemsForType(slot.course_type).map((swapItem) => (
                                <button
                                  key={swapItem.id}
                                  onClick={() => {
                                    selectItem(slot.course_number, swapItem.id)
                                    // Close dialog via click on backdrop
                                  }}
                                  className={cn(
                                    "flex items-center justify-between rounded-lg border p-3 text-left hover:border-primary/50 hover:bg-accent/30 transition-colors",
                                    swapItem.id === slot.item_id && "border-primary bg-primary/5"
                                  )}
                                >
                                  <div>
                                    <p className="text-sm font-medium">{swapItem.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{swapItem.description}</p>
                                    {swapItem.allergens && swapItem.allergens.length > 0 && (
                                      <div className="flex gap-1 mt-1">
                                        {swapItem.allergens.map((a) => (
                                          <span key={a} className="text-[9px] text-amber-600 bg-amber-50 px-1 rounded">{a}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm font-medium shrink-0 ml-4">
                                    ${(swapItem.suggested_menu_price || swapItem.price || 0).toFixed(2)}
                                  </span>
                                </button>
                              ))}
                              {getItemsForType(slot.course_type).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No items available in this category.
                                </p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => removeCourse(slot.course_number)}
                          aria-label="Remove course"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Add Course Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {COURSE_TYPES.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => addCourse(type)}
                >
                  <Plus className="size-3.5" />
                  Add {COURSE_LABELS[type]}
                </Button>
              ))}
            </div>

            {/* Suggested Pairings (when protein selected + suggestions on) */}
            {suggestionsEnabled && activeDraft && activeDraft.courses.some(
              (c) => c.course_type === "protein" && c.item_id
            ) && (
              <Card className="mt-4 border-gold/30 bg-gold/5">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-gold" />
                    <CardTitle className="text-xs font-medium text-gold uppercase tracking-wider">
                      Suggested Pairings
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0">
                  <p className="text-xs text-muted-foreground mb-2">
                    Based on your protein selection, these sides pair well:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeDraft.courses
                      .filter((c) => c.course_type === "protein" && c.item_id)
                      .flatMap((c) => {
                        const proteinItem = items.find((i) => i.id === c.item_id)
                        return proteinItem?.suggested_pairings || []
                      })
                      .slice(0, 4)
                      .map((pairingId) => {
                        const pairingItem = items.find((i) => i.id === pairingId)
                        if (!pairingItem) return null
                        return (
                          <Button
                            key={pairingId}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs h-8"
                            onClick={() => {
                              const sideSlot = activeDraft.courses.find(
                                (s) => s.course_type === "side" && !s.item_id
                              )
                              if (sideSlot) {
                                selectItem(sideSlot.course_number, pairingId)
                              } else {
                                addCourse("side")
                                setTimeout(() => {
                                  selectItem(
                                    (activeDraft.courses.length + 1),
                                    pairingId
                                  )
                                }, 0)
                              }
                            }}
                          >
                            <Plus className="size-3" />
                            {pairingItem.name}
                          </Button>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Bar */}
      <Card className={cn(
        "sticky bottom-0 transition-all",
        budgetPerPerson !== null && costPerPerson > budgetPerPerson
          ? "border-red-300 bg-red-50 dark:bg-red-950/20"
          : budgetPerPerson !== null && costPerPerson > budgetPerPerson * 0.85
            ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
            : "border-border"
      )}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Per Person</p>
                <p className="text-2xl font-serif font-medium">${costPerPerson.toFixed(2)}</p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total ({guestCount} guests)</p>
                <p className="text-2xl font-serif font-medium">${totalCost.toFixed(2)}</p>
              </div>
              {budgetPerPerson !== null && (
                <>
                  <div className="hidden sm:block h-10 w-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Budget</p>
                    <p className="text-2xl font-serif font-medium">${(budgetPerPerson * guestCount).toFixed(2)}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {budgetPerPerson !== null && (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        costPerPerson > budgetPerPerson
                          ? "bg-destructive"
                          : costPerPerson > budgetPerPerson * 0.85
                            ? "bg-amber-500"
                            : "bg-primary"
                      )}
                      style={{
                        width: `${Math.min((costPerPerson / budgetPerPerson) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    costPerPerson > budgetPerPerson
                      ? "text-destructive"
                      : costPerPerson > budgetPerPerson * 0.85
                        ? "text-amber-600"
                        : "text-primary"
                  )}>
                    {Math.round((costPerPerson / budgetPerPerson) * 100)}%
                  </span>
                </div>
              )}
              <Button className="gap-2" onClick={() => setShowSaveDialog(true)}>
                <Save className="size-4" />
                Save Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Draft Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Menu Draft</DialogTitle>
            <DialogDescription>
              Select a previously saved menu to continue editing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
            {drafts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No saved drafts yet. Build a menu and save it!
              </p>
            )}
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{draft.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {draft.courses.length} courses · {draft.guest_count} guests · ${draft.total_cost_per_person?.toFixed(2) || "0.00"}/person
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Updated {new Date(draft.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => loadDraft(draft)}>
                    <Check className="size-3.5 mr-1" />
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => deleteDraft(draft.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}