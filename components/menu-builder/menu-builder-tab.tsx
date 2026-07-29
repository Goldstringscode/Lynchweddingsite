"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Scale, Filter, Settings2, Menu, Check, Columns3, LayoutList } from "lucide-react"
import { cn } from "@/lib/utils"
import { MenuItemGrid, type MenuItem } from "./menu-item-grid"
import { ItemDetailModal, type MenuItemDetail } from "./item-detail-modal"
import { ComparisonModal } from "./comparison-modal"
import { MenuBar, type ActiveMenu } from "./menu-bar"
import { MenuPickerModal } from "./menu-picker-modal"
import { MenuItemList } from "./menu-item-list"
import { ComparisonView } from "./comparison-view"

export function MenuBuilderTab() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sectionFilter, setSectionFilter] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedSide, setSelectedSide] = useState<"one" | "either" | "both">("both")

  // Multi-menu state
  const [activeMenus, setActiveMenus] = useState<ActiveMenu[]>([])
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [pickerItem, setPickerItem] = useState<MenuItem | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  // View mode: single menu or compare side-by-side
  const [viewMode, setViewMode] = useState<"single" | "compare">("single")

  const activeMenu = activeMenus.find((m) => m.id === activeMenuId)

  // Load menus from API on mount
  const loadMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/menu/drafts")
      if (!res.ok) { createDefaultMenu(); return }
      const drafts = await res.json()
      if (Array.isArray(drafts) && drafts.length > 0) {
        const menus: ActiveMenu[] = drafts.map((d: any) => ({
          id: d.id,
          name: d.name,
          courses: d.courses || [],
          saved: true,
          guestCount: d.guest_count || 150,
        }))
        setActiveMenus(menus)
        setActiveMenuId(menus[0].id)
      } else {
        createDefaultMenu()
      }
    } catch {
      createDefaultMenu()
    }
  }, [])

  const createDefaultMenu = () => {
    const id = crypto.randomUUID()
    const newMenu: ActiveMenu = {
      id, name: "Menu 1", courses: [], saved: false, guestCount: 150,
    }
    setActiveMenus([newMenu])
    setActiveMenuId(id)
  }

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/menu")
      const data = await res.json()
      const parsed = (Array.isArray(data) ? data : []).map((item: any) => ({
        ...item,
        nutrition: typeof item.nutrition === "string" ? JSON.parse(item.nutrition) : item.nutrition,
        ingredient_list: typeof item.ingredient_list === "string" ? JSON.parse(item.ingredient_list) : item.ingredient_list,
        ingredient_links: typeof item.ingredient_links === "string" ? JSON.parse(item.ingredient_links) : item.ingredient_links,
      }))
      setItems(parsed)
    } catch (e) {
      console.error("Failed to fetch items:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
    loadMenus()
  }, [fetchItems, loadMenus])

  const sections = ["hors-doeuvres", "appetizers", "proteins", "sides", "desserts"].filter(
    (s) => items.some((i) => i.section === s)
  )

  const SECTION_LABELS: Record<string, string> = {
    "hors-doeuvres": "Hors d'Oeuvres",
    appetizers: "Appetizers",
    proteins: "Proteins",
    sides: "Sides",
    desserts: "Desserts",
  }

  // --- Item handlers ---

  const handleViewItem = (item: MenuItem) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  const handleAddToMenu = (item: MenuItem) => {
    if (activeMenus.length === 0) return
    if (activeMenus.length === 1) {
      addItemToMenu(item, activeMenus[0].id)
    } else {
      setPickerItem(item)
      setPickerOpen(true)
    }
  }

  const addItemToMenu = (item: MenuItem, menuId: string) => {
    setActiveMenus((prev) =>
      prev.map((menu) => {
        if (menu.id !== menuId) return menu
        if (menu.courses.some((c) => c.item_id === item.id)) return menu // already added
        const sectionMap: Record<string, string> = {
          "hors-doeuvres": "hors-doeuvres",
          appetizers: "appetizer", proteins: "protein", sides: "side", desserts: "dessert",
        }
        return {
          ...menu,
          courses: [
            ...menu.courses,
            {
              course_number: menu.courses.length + 1,
              course_type: sectionMap[item.section || ""] || "appetizer",
              item_id: item.id,
              portion_size: "regular" as const,
              notes: "",
            },
          ],
          saved: false,
        }
      })
    )
  }

  const addItemToAllMenus = (item: MenuItem) => {
    setActiveMenus((prev) =>
      prev.map((menu) => {
        if (menu.courses.some((c) => c.item_id === item.id)) return menu
        const sectionMap: Record<string, string> = {
          "hors-doeuvres": "hors-doeuvres",
          appetizers: "appetizer", proteins: "protein", sides: "side", desserts: "dessert",
        }
        return {
          ...menu,
          courses: [
            ...menu.courses,
            {
              course_number: menu.courses.length + 1,
              course_type: sectionMap[item.section || ""] || "appetizer",
              item_id: item.id,
              portion_size: "regular" as const,
              notes: "",
            },
          ],
          saved: false,
        }
      })
    )
  }

  // Remove from menu — ONLY touches courses array, NEVER deletes from catalog
  const handleRemoveFromMenu = (menuId: string, courseNumber: number) => {
    setActiveMenus((prev) =>
      prev.map((m) => {
        if (m.id !== menuId) return m
        return {
          ...m,
          courses: m.courses.filter((c) => c.course_number !== courseNumber),
          saved: false,
        }
      })
    )
  }

  // --- Menu CRUD ---

  const handleSaveMenus = async () => {
    for (const menu of activeMenus) {
      if (menu.saved) continue
      try {
        if (menu.saved) {
          await fetch("/api/menu/drafts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: menu.id, name: menu.name, courses: menu.courses, guest_count: menu.guestCount }),
          })
        } else {
          const res = await fetch("/api/menu/drafts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: menu.name, courses: menu.courses, guest_count: menu.guestCount }),
          })
          if (res.ok) {
            const saved = await res.json()
            menu.id = saved.id
          }
        }
        menu.saved = true
      } catch (e) {
        console.error("Failed to save menu:", menu.name, e)
      }
    }
    setActiveMenus([...activeMenus])
  }

  const handleCreateMenu = () => {
    if (activeMenus.length >= 3) return
    const count = activeMenus.length + 1
    const newMenu: ActiveMenu = {
      id: crypto.randomUUID(), name: `Menu ${count}`, courses: [], saved: false, guestCount: 150,
    }
    setActiveMenus([...activeMenus, newMenu])
    setActiveMenuId(newMenu.id)
  }

  const handleDeleteMenu = (menuId: string) => {
    setActiveMenus((prev) => {
      const filtered = prev.filter((m) => m.id !== menuId)
      if (activeMenuId === menuId) setActiveMenuId(filtered[0]?.id || null)
      return filtered
    })
  }

  const handleRenameMenu = (menuId: string, name: string) => {
    setActiveMenus((prev) => prev.map((m) => (m.id === menuId ? { ...m, name, saved: false } : m)))
  }

  const handleClearMenu = (menuId: string) => {
    setActiveMenus((prev) => prev.map((m) => (m.id === menuId ? { ...m, courses: [], saved: false } : m)))
  }

  // --- Render ---

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading menu catalog...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg">Menu Builder</CardTitle>
              <CardDescription>
                {items.length} items in catalog
                {activeMenu && ` · ${activeMenu.courses.length} in "${activeMenu.name}"`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-xs h-8"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className="size-3.5" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs h-8"
                onClick={() => setCompareModalOpen(true)}
                disabled={activeMenus.length < 2}
              >
                <Scale className="size-3.5" />
                Compare
              </Button>
              {activeMenus.some((m) => !m.saved) && (
                <Button size="sm" className="gap-2 text-xs h-8" onClick={handleSaveMenus}>
                  <Check className="size-3.5" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Settings Panel */}
          {showSettings && (
            <Card className="mb-4 border-gold/20 bg-gradient-to-br from-gold/[0.03] to-transparent">
              <CardContent className="p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Display Settings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["one", "either", "both"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() => setSelectedSide(side)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all text-xs",
                        "hover:border-primary/50 hover:bg-accent/20",
                        selectedSide === side && "border-primary/30 bg-primary/5"
                      )}
                    >
                      <p className="font-medium capitalize text-sm">
                        {side === "one" ? "One Side" : side === "either" ? "Either Side" : "Both Sides"}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {side === "one" && "Guests choose one side per course"}
                        {side === "either" && "Couple picks one side for all"}
                        {side === "both" && "Both sides served with each course"}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Bar */}
          <MenuBar
            menus={activeMenus}
            activeMenuId={activeMenuId}
            onSelectMenu={setActiveMenuId}
            onCreateMenu={handleCreateMenu}
            onDeleteMenu={handleDeleteMenu}
            onRenameMenu={handleRenameMenu}
            onClearMenu={handleClearMenu}
            onSaveAll={handleSaveMenus}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode("single")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "single"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                <LayoutList className="size-3.5" />
                Single Menu
              </button>
              <button
                onClick={() => setViewMode("compare")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === "compare"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                <Columns3 className="size-3.5" />
                Compare Menus
              </button>
            </div>
            {viewMode === "single" && activeMenu && (
              <Badge variant="outline" className="text-[10px] ml-auto">
                {activeMenu.courses.length} item{activeMenu.courses.length !== 1 ? "s" : ""}
                {!activeMenu.saved && " · unsaved"}
              </Badge>
            )}
          </div>

          {/* Single Menu View: Catalog + Active Menu Items */}
          {viewMode === "single" && (
            <div className="space-y-4">
              {/* Current Menu Items Panel */}
              {activeMenu && (
                <Card className="border-primary/10 bg-primary/[0.02]">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <div className="flex items-center gap-2">
                      <Menu className="size-4 text-primary" />
                      <CardTitle className="text-xs font-medium uppercase tracking-wider">
                        {activeMenu.name} — Items
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <MenuItemList
                      menu={activeMenu}
                      catalogItems={items}
                      onRemoveItem={handleRemoveFromMenu}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Catalog Grid — always shows all items from database */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1 max-w-xs">
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search catalog..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setSectionFilter("all")}
                      className={cn(
                        "px-2.5 py-1.5 text-xs rounded-md font-medium transition-colors",
                        sectionFilter === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      All
                    </button>
                    {sections.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSectionFilter(s)}
                        className={cn(
                                                    "px-2.5 py-1.5 text-xs rounded-md font-medium capitalize transition-colors",
                                                    sectionFilter === s
                                                      ? "bg-primary text-primary-foreground"
                                                      : "bg-muted text-muted-foreground hover:bg-accent"
                                                  )}
                                                >
                                                  {SECTION_LABELS[s] || s}
                      </button>
                    ))}
                  </div>
                </div>

                <MenuItemGrid
                  items={items}
                  sectionFilter={sectionFilter}
                  searchQuery={searchQuery}
                  onSelectItem={handleViewItem}
                  onAddToMenu={handleAddToMenu}
                  addedItemIds={activeMenu?.courses.map((c) => c.item_id) || []}
                />
              </div>
            </div>
          )}

          {/* Compare View: Side-by-side all menus */}
          {viewMode === "compare" && (
            <Card className="border-primary/10">
              <CardContent className="p-4">
                {activeMenus.length >= 2 ? (
                  <ComparisonView
                    menus={activeMenus}
                    catalogItems={items}
                    onRemoveItem={handleRemoveFromMenu}
                  />
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Create at least 2 menus to use comparison view.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem as MenuItemDetail | null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Menu Picker Modal */}
      <MenuPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        menus={activeMenus}
        itemName={pickerItem?.name || ""}
        onAddToMenu={(menuId) => {
          if (pickerItem) addItemToMenu(pickerItem, menuId)
          setPickerOpen(false)
        }}
        onAddToAll={() => {
          if (pickerItem) addItemToAllMenus(pickerItem)
          setPickerOpen(false)
        }}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        open={compareModalOpen}
        onOpenChange={setCompareModalOpen}
        draftIds={activeMenus.map((m) => m.id)}
      />
    </div>
  )
}