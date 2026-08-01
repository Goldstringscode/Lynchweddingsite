"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus, Trash2, UtensilsCrossed, Loader2, Coffee, Beef, Salad, CakeSlice, ArrowLeft,
} from "lucide-react"

interface MenuDraftCourse {
  course_number: number
  course_type: string
  item_id: string
  portion_size: string
  notes?: string
}

interface MenuDraft {
  id: string
  name: string
  description?: string
  event_type?: string
  guest_count?: number
  courses: MenuDraftCourse[]
  total_cost_per_person?: number
  total_menu_cost?: number
  created_at: string
  updated_at: string
}

interface CatalogItem {
  id: string
  name: string
  description: string
  category: string
  section: string | null
  price: number | null
  suggested_menu_price?: number | null
  cost_per_serving?: number | null
  is_available: boolean
  is_signature: boolean
  portion_weight_g?: number | null
  difficulty?: string | null
  prep_time?: number | null
}

const COURSE_ORDER_UI = ["hors-doeuvres", "appetizer", "protein", "side", "dessert"]

const COURSE_LABELS: Record<string, string> = {
  "hors-doeuvres": "Hors d'Oeuvres",
  appetizer: "Appetizers",
  protein: "Proteins / Entrées",
  side: "Sides",
  dessert: "Desserts",
}

const COURSE_ICONS: Record<string, any> = {
  "hors-doeuvres": Coffee,
  appetizer: Coffee,
  protein: Beef,
  side: Salad,
  dessert: CakeSlice,
}

export function EditMenuTab() {
  const [drafts, setDrafts] = useState<MenuDraft[]>([])
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [editIngredientOpen, setEditIngredientOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<MenuDraftCourse | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [draftsRes, catalogRes] = await Promise.all([
        fetch("/api/menu/drafts"),
        fetch("/api/menu"),
      ])
      const draftsData = await draftsRes.json()
      const catalogData = await catalogRes.json()
      setDrafts(Array.isArray(draftsData) ? draftsData : [])
      setCatalog(Array.isArray(catalogData) ? catalogData : [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const selectedDraft = drafts.find(d => d.id === selectedDraftId)

  const catalogMap = new Map(catalog.map(i => [i.id, i]))

  const handleRemoveItem = async (courseNumber: number) => {
    if (!selectedDraft) return
    const updatedCourses = selectedDraft.courses.filter(c => c.course_number !== courseNumber)
    await fetch("/api/menu/drafts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedDraft.id, courses: updatedCourses }),
    })
    fetchData()
  }

  const handleDeleteDraft = async () => {
    if (!selectedDraft || !confirm(`Delete the menu "${selectedDraft.name}"?`)) return
    await fetch(`/api/menu/drafts?id=${selectedDraft.id}`, { method: "DELETE" })
    setSelectedDraftId(null)
    fetchData()
  }

  // Group courses by type for display
  const grouped: Record<string, MenuDraftCourse[]> = {}
  if (selectedDraft) {
    for (const course of selectedDraft.courses) {
      const type = course.course_type || "appetizer"
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(course)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  }

  // Menu selector view
  if (!selectedDraftId) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-serif text-lg font-medium">Your Saved Menus</h3>
          <p className="text-sm text-muted-foreground">Select a menu to view and edit its selected items.</p>
        </div>

        {drafts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="mx-auto size-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No menus created yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Go to the Builder tab to create your first menu.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {drafts.map(draft => (
              <button
                key={draft.id}
                onClick={() => setSelectedDraftId(draft.id)}
                className="rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:bg-accent/20"
              >
                <p className="font-medium">{draft.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {draft.courses.length} item{draft.courses.length !== 1 ? "s" : ""}
                  {draft.guest_count ? ` · ${draft.guest_count} guests` : ""}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Created {new Date(draft.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Menu detail/edit view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setSelectedDraftId(null)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h3 className="font-serif text-lg font-medium">{selectedDraft?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedDraft?.courses.length ?? 0} item{(selectedDraft?.courses.length ?? 0) !== 1 ? "s" : ""}
              {selectedDraft?.guest_count ? ` · ${selectedDraft.guest_count} guests` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-destructive gap-2" onClick={handleDeleteDraft}>
          <Trash2 className="size-3.5" /> Delete Menu
        </Button>
      </div>

      {(!selectedDraft || selectedDraft.courses.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="mx-auto size-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">This menu has no items yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Go to the Builder tab to add items from the catalog.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {COURSE_ORDER_UI.map((type) => {
            const courses = grouped[type]
            if (!courses || courses.length === 0) return null
            const Icon = COURSE_ICONS[type] || Coffee

            return (
              <Card key={type}>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-gold" />
                    <CardTitle className="font-serif text-base">{COURSE_LABELS[type] || type}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{courses.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y divide-border/50">
                    {courses.map((course) => {
                      const item = catalogMap.get(course.item_id)
                      if (!item) return (
                        <div key={course.course_number} className="flex items-center py-3 text-xs text-muted-foreground italic">
                          Unknown item (ID: {course.item_id.slice(0, 8)}...)
                          <button
                            onClick={() => handleRemoveItem(course.course_number)}
                            className="ml-auto p-1 rounded hover:bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )

                      const price = item.suggested_menu_price ?? item.price ?? 0
                      const cost = item.cost_per_serving

                      return (
                        <div key={course.course_number} className="flex items-start gap-3 py-3 group">
                          {/* Item icon */}
                          <div className="mt-0.5 text-lg shrink-0">
                            {item.section === "hors-doeuvres" ? "\u{1F944}" :
                             item.section === "sides" ? "\u{1F957}" :
                             item.section === "appetizers" ? "\u{1F942}" :
                             item.section === "desserts" ? "\u{1F370}" : "\u{1F37D}\uFE0F"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{item.name}</p>
                              {item.is_signature && (
                                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">Signature</Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span className="tabular-nums">${price.toFixed(2)}</span>
                              {cost ? <span className="tabular-nums">· ${cost.toFixed(2)} cost</span> : null}
                              <span>·</span>
                              <span className="capitalize">{course.portion_size}</span>
                              {item.difficulty && (
                                <>
                                  <span>·</span>
                                  <span className="capitalize">{item.difficulty}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(course.course_number)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Remove from menu"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Summary card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="font-serif text-base">Menu Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold">{selectedDraft.courses.length}</p>
                            <p className="text-xs text-muted-foreground">Total Items</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{drafts.length}</p>
                            <p className="text-xs text-muted-foreground">Saved Menus</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{selectedDraft.guest_count || 150}</p>
                            <p className="text-xs text-muted-foreground">Guest Count</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">
                              ${(selectedDraft.courses.reduce((sum, c) => {
                                const item = catalogMap.get(c.item_id)
                                const price = item?.suggested_menu_price ?? item?.price ?? 0
                                const portionMultiplier = c.portion_size === "large" ? 1.5 : c.portion_size === "small" ? 0.67 : 1
                                return sum + (price * portionMultiplier)
                              }, 0) / (selectedDraft.guest_count || 150)).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Cost / Guest</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold">${selectedDraft.courses.reduce((sum, c) => {
                              const item = catalogMap.get(c.item_id)
                              const price = item?.suggested_menu_price ?? item?.price ?? 0
                              const portionMultiplier = c.portion_size === "large" ? 1.5 : c.portion_size === "small" ? 0.67 : 1
                              return sum + (price * portionMultiplier)
                            }, 0).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Total Menu Value</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">${selectedDraft.courses.reduce((sum, c) => {
                              const item = catalogMap.get(c.item_id)
                              return sum + (item?.cost_per_serving ?? 0)
                            }, 0).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Total Food Cost</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">
                              {selectedDraft.courses.length > 0 ? `${Math.round(
                                (1 - (selectedDraft.courses.reduce((s, c) => {
                                  const item = catalogMap.get(c.item_id)
                                  return s + (item?.cost_per_serving ?? 0)
                                }, 0) / Math.max(1, selectedDraft.courses.reduce((s, c) => {
                                  const item = catalogMap.get(c.item_id)
                                  const price = item?.suggested_menu_price ?? item?.price ?? 0
                                  const portionMultiplier = c.portion_size === "large" ? 1.5 : c.portion_size === "small" ? 0.67 : 1
                                  return s + (price * portionMultiplier)
                                }, 0)))) * 100}%` : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">Margin</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{selectedDraft.courses.filter(c => {
                              const item = catalogMap.get(c.item_id)
                              return item?.is_signature
                            }).length}</p>
                            <p className="text-xs text-muted-foreground">Signature Items</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
        </>
      )}
    </div>
  )
}