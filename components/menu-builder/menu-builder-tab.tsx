"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, Trash2, Copy, Save, RotateCcw, Sparkles, UtensilsCrossed, Users, DollarSign, Loader2, Check, Salad, Beef, Cookie, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MenuItemGrid, type MenuItem } from "./menu-item-grid"

const COURSE_TYPES = ["appetizer", "protein", "side", "dessert"] as const
type CourseType = typeof COURSE_TYPES[number]
const COURSE_LABELS: Record<CourseType, string> = { appetizer: "Appetizer", protein: "Protein / Entree", side: "Side", dessert: "Dessert" }
const PORTION_MULTIPLIERS = { small: 0.7, regular: 1.0, large: 1.35 }
const SECTION_FILTERS = ["all", "appetizers", "proteins", "sides", "desserts"]
const SECTION_EMOJI: Record<string, string> = { appetizers: "\u{1F942}", proteins: "\u{1F969}", sides: "\u{1F957}", desserts: "\u{1F370}" }
const COURSE_ICONS: Record<CourseType, any> = { appetizer: Salad, protein: Beef, side: Salad, dessert: Cookie }

interface CourseSlot {
  course_number: number
  course_type: CourseType
  item_id: string | null
  portion_size: "small" | "regular" | "large"
  notes: string
}

interface MenuDraft {
  id: string
  name: string
  guest_count: number
  target_budget_per_person: number | null
  courses: CourseSlot[]
}

export function MenuBuilderTab() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDraft, setActiveDraft] = useState<MenuDraft | null>(null)
  const [guestCount, setGuestCount] = useState(150)
  const [budgetPP, setBudgetPP] = useState<number | null>(null)
  const [suggestionsOn, setSuggestionsOn] = useState(true)
  const [search, setSearch] = useState("")
  const [sectionFilter, setSectionFilter] = useState("all")
  const [saveDialog, setSaveDialog] = useState(false)
  const [loadDialog, setLoadDialog] = useState(false)
  const [swapDialog, setSwapDialog] = useState<{ open: boolean; courseNumber: number; courseType: CourseType }>({ open: false, courseNumber: 0, courseType: "appetizer" })
  const [draftName, setDraftName] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    const [ir, dr] = await Promise.all([fetch("/api/menu"), fetch("/api/menu/drafts")])
    setItems(await ir.json())
    setDrafts(await dr.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const resetDraft = useCallback(() => {
    setActiveDraft({ id: "", name: "Untitled Menu", guest_count: guestCount, target_budget_per_person: budgetPP, courses: [] })
    setDraftName("")
  }, [guestCount, budgetPP])

  useEffect(() => { if (!loading && !activeDraft) resetDraft() }, [loading, activeDraft, resetDraft])

  const calcCost = useMemo(() => {
    if (!activeDraft || !activeDraft.courses.length) return { pp: 0, total: 0 }
    const pp = activeDraft.courses.reduce((sum, slot) => {
      if (!slot.item_id) return sum
      const item = items.find((i) => i.id === slot.item_id)
      if (!item || !item.price) return sum
      return sum + item.price * (PORTION_MULTIPLIERS[slot.portion_size] || 1)
    }, 0)
    return { pp: Math.round(pp * 100) / 100, total: Math.round(pp * activeDraft.guest_count * 100) / 100 }
  }, [activeDraft, items])

  const addCourse = (type: CourseType) => {
    setActiveDraft((prev) => {
      if (!prev) return prev
      const maxNum = prev.courses.reduce((m, c) => Math.max(m, c.course_number), 0)
      return { ...prev, courses: [...prev.courses, { course_number: maxNum + 1, course_type: type, item_id: null, portion_size: "regular" as const, notes: "" }] }
    })
  }

  const removeCourse = (num: number) => {
    setActiveDraft((prev) => prev ? { ...prev, courses: prev.courses.filter((c) => c.course_number !== num) } : prev)
  }

  const selectItem = (num: number, itemId: string) => {
    setActiveDraft((prev) => prev ? { ...prev, courses: prev.courses.map((c) => c.course_number === num ? { ...c, item_id: itemId } : c) } : prev)
  }

  const setPortion = (num: number, portion: "small" | "regular" | "large") => {
    setActiveDraft((prev) => prev ? { ...prev, courses: prev.courses.map((c) => c.course_number === num ? { ...c, portion_size: portion } : c) } : prev)
  }

  const handleCatalogSelect = (item: MenuItem) => {
    if (!activeDraft) return
    const sectionMap: Record<string, CourseType> = { appetizers: "appetizer", proteins: "protein", sides: "side", desserts: "dessert" }
    const ct = item.section ? sectionMap[item.section] : null
    if (!ct) return
    const empty = activeDraft.courses.find((c) => c.course_type === ct && !c.item_id)
    if (empty) { selectItem(empty.course_number, item.id); return }
    addCourse(ct)
    setTimeout(() => {
      setActiveDraft((prev) => {
        if (!prev) return prev
        const newSlot = prev.courses.find((c) => c.course_type === ct && !c.item_id)
        if (newSlot) selectItem(newSlot.course_number, item.id)
        return prev
      })
    }, 50)
  }

  const saveDraft = async () => {
    if (!activeDraft) return
    setSaving(true)
    const payload = { name: draftName || activeDraft.name, guest_count: activeDraft.guest_count, target_budget_per_person: budgetPP, courses: activeDraft.courses }
    try {
      if (activeDraft.id) {
        await fetch("/api/menu/drafts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, id: activeDraft.id }) })
      } else {
        const res = await fetch("/api/menu/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        const d = await res.json()
        setActiveDraft((prev) => prev ? { ...prev, id: d.id } : prev)
      }
      fetchAll()
      setSaveDialog(false)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  const loadDraft = (d: any) => {
    setActiveDraft({ id: d.id, name: d.name, guest_count: d.guest_count, target_budget_per_person: d.target_budget_per_person, courses: d.courses || [] })
    setGuestCount(d.guest_count); setBudgetPP(d.target_budget_per_person); setLoadDialog(false)
  }

  const deleteDraft = async (id: string) => { await fetch("/api/menu/drafts?id=" + id, { method: "DELETE" }); fetchAll() }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  const sectionToType: Record<string, CourseType> = { appetizers: "appetizer", proteins: "protein", sides: "side", desserts: "dessert" }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <Input type="number" value={guestCount} onChange={(e) => { const v = parseInt(e.target.value) || 0; setGuestCount(v); setActiveDraft((prev) => prev ? { ...prev, guest_count: v } : prev) }} className="h-9 w-20" min={1} />
              <span className="text-xs text-muted-foreground">guests</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <Input type="number" value={budgetPP ?? ""} onChange={(e) => setBudgetPP(e.target.value ? parseFloat(e.target.value) : null)} className="h-9 w-24" min={0} step={5} placeholder="Budget" />
              <span className="text-xs text-muted-foreground">/person</span>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setLoadDialog(true)}><Copy className="size-3.5" />Load</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setSaveDialog(true)}><Save className="size-3.5" />Save</Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={resetDraft}><RotateCcw className="size-3.5" />Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Main */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Browser */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-base">Menu Catalog</CardTitle>
              <Badge variant="outline" className="text-xs">{items.filter((i) => i.is_available).length} items</Badge>
            </div>
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {SECTION_FILTERS.map((s) => (
                <button key={s} onClick={() => setSectionFilter(s)}
                  className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors", sectionFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
                  {SECTION_EMOJI[s] || ""} {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-0 max-h-[500px] overflow-y-auto">
            <MenuItemGrid items={items} sectionFilter={sectionFilter} searchQuery={search} onSelectItem={handleCatalogSelect} />
          </CardContent>
        </Card>

        {/* Builder Canvas */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base">{activeDraft?.name || "Menu Builder"}</CardTitle>
                <CardDescription>Build your menu course by course</CardDescription>
              </div>
              <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs h-8", suggestionsOn ? "" : "text-muted-foreground")} onClick={() => setSuggestionsOn(!suggestionsOn)}>
                {suggestionsOn ? <Sparkles className="size-3" /> : <X className="size-3" />}
                {suggestionsOn ? "Suggestions On" : "Suggestions Off"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {activeDraft && activeDraft.courses.length === 0 && (
              <div className="py-8 text-center">
                <UtensilsCrossed className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Your menu is empty. Add courses below to start building.</p>
              </div>
            )}
            <div className="space-y-3">
              {activeDraft?.courses.map((slot) => {
                const item = items.find((i) => i.id === slot.item_id)
                const Icon = COURSE_ICONS[slot.course_type]
                const isFilled = !!slot.item_id
                return (
                  <Card key={slot.course_number} className={cn("overflow-hidden", !isFilled && "border-2 border-dashed border-muted-foreground/20")}>
                    <div className="flex items-start gap-3 p-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon className="size-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Course {slot.course_number} &mdash; {COURSE_LABELS[slot.course_type]}</p>
                          {item ? (
                            <div>
                              <p className="font-medium text-sm mt-0.5">{item.name}</p>
                              {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                            </div>
                          ) : <p className="text-sm text-muted-foreground italic mt-0.5">Select an item from the catalog</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select value={slot.portion_size} onValueChange={(v) => setPortion(slot.course_number, v as any)}>
                          <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                        {item && item.price && (
                          <span className="text-sm font-medium tabular-nums w-16 text-right">${(item.price * PORTION_MULTIPLIERS[slot.portion_size]).toFixed(2)}</span>
                        )}
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => setSwapDialog({ open: true, courseNumber: slot.course_number, courseType: slot.course_type })} aria-label="Swap">
                          <RotateCcw className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => removeCourse(slot.course_number)} aria-label="Remove">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {COURSE_TYPES.map((type) => (
                <Button key={type} variant="outline" size="sm" className="gap-1.5" onClick={() => addCourse(type)}>
                  <Plus className="size-3.5" />Add {COURSE_LABELS[type]}
                </Button>
              ))}
            </div>

            {/* Suggestions */}
            {suggestionsOn && activeDraft?.courses.some((c) => c.course_type === "protein" && c.item_id) && (
              <Card className="mt-4 border-gold/30 bg-gold/5">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center gap-2"><Sparkles className="size-3.5 text-gold" /><CardTitle className="text-xs font-medium text-gold uppercase tracking-wider">Suggested Pairings</CardTitle></div>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0">
                  <p className="text-xs text-muted-foreground mb-2">Based on your protein selection, these pair well:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeDraft.courses.filter((c) => c.course_type === "protein" && c.item_id).flatMap((c) => {
                      const protein = items.find((i) => i.id === c.item_id)
                      return protein?.suggested_pairings || []
                    }).slice(0, 4).map((pid) => {
                      const pairing = items.find((i) => i.id === pid)
                      if (!pairing) return null
                      return (
                        <Button key={pid} variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => { handleCatalogSelect(pairing) }}>
                          <Plus className="size-3" />{pairing.name}
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
      <Card className={cn("sticky bottom-0 transition-all", budgetPP !== null && calcCost.pp > budgetPP ? "border-red-300 bg-red-50" : budgetPP !== null && calcCost.pp > budgetPP * 0.85 ? "border-amber-300 bg-amber-50" : "border-border")}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Per Person</p><p className="text-2xl font-serif font-medium">${calcCost.pp.toFixed(2)}</p></div>
              <div className="hidden sm:block h-10 w-px bg-border" />
              <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Total ({activeDraft?.guest_count || 0} guests)</p><p className="text-2xl font-serif font-medium">${calcCost.total.toFixed(2)}</p></div>
              {budgetPP !== null && (
                <>
                  <div className="hidden sm:block h-10 w-px bg-border" />
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Budget</p><p className="text-2xl font-serif font-medium">${(budgetPP * guestCount).toFixed(2)}</p></div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {budgetPP !== null && (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-32 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full transition-all", calcCost.pp > budgetPP ? "bg-destructive" : calcCost.pp > budgetPP * 0.85 ? "bg-amber-500" : "bg-primary")}
                      style={{ width: Math.min((calcCost.pp / budgetPP) * 100, 100) + "%" }} />
                  </div>
                  <span className={cn("text-xs font-medium", calcCost.pp > budgetPP ? "text-destructive" : calcCost.pp > budgetPP * 0.85 ? "text-amber-600" : "text-primary")}>
                    {Math.round((calcCost.pp / budgetPP) * 100)}%
                  </span>
                </div>
              )}
              <Button className="gap-2" onClick={() => setSaveDialog(true)}><Save className="size-4" />Save Menu</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={saveDialog} onOpenChange={setSaveDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Save Menu Draft</DialogTitle><DialogDescription>Name your menu to save it.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={draftName || activeDraft?.name || ""} onChange={(e) => setDraftName(e.target.value)} placeholder="e.g., Menu A - Classic Elegance" />
            <Button className="w-full" onClick={saveDraft} disabled={saving || !(draftName || activeDraft?.name)}>
              {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}Save Draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialog} onOpenChange={setLoadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Load Menu Draft</DialogTitle><DialogDescription>Select a saved menu to continue editing.</DialogDescription></DialogHeader>
          <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
            {drafts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No saved drafts yet.</p>}
            {drafts.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.courses?.length || 0} courses &middot; {d.guest_count} guests</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Updated {new Date(d.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => loadDraft(d)}><Check className="size-3.5 mr-1" />Load</Button>
                  <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => deleteDraft(d.id)}><Trash2 className="size-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Dialog */}
      <Dialog open={swapDialog.open} onOpenChange={(o) => setSwapDialog((prev) => ({ ...prev, open: o }))}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Select {COURSE_LABELS[swapDialog.courseType]}</DialogTitle><DialogDescription>Browse and select from available items.</DialogDescription></DialogHeader>
          <div className="grid gap-2 py-4">
            {items.filter((i) => sectionToType[i.section || ""] === swapDialog.courseType && i.is_available).map((si) => (
              <button key={si.id} onClick={() => { selectItem(swapDialog.courseNumber, si.id); setSwapDialog((prev) => ({ ...prev, open: false })) }}
                className={"flex items-center justify-between rounded-lg border p-3 text-left hover:border-primary/50 hover:bg-accent/30 transition-colors"}>
                <div>
                  <p className="text-sm font-medium">{si.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{si.description}</p>
                </div>
                <span className="text-sm font-medium shrink-0 ml-4">${(si.price || 0).toFixed(2)}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}