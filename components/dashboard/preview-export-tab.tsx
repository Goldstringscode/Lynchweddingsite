"use client"

import { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Loader2, UtensilsCrossed, FileSpreadsheet, ChevronDown, ChevronRight, ChefHat, ClipboardList, Menu } from "lucide-react"
import { CatererSheet } from "./caterer-sheet"

interface MenuItem {
  id: string; category: string; name: string; description: string; price: number | null
  is_available: boolean; sort_order: number; is_signature?: boolean
  nutrition?: Record<string, any> | null; allergens?: string[] | null
}

interface DraftMenu {
  id: string; name: string; courses: any[]; guest_count?: number
}

const CATEGORY_EMOJI: Record<string, string> = {
  "Appetizers": "🥂", "Salads & Soups": "🥗", "Main Courses": "🍽️", "Sides": "🥔", "Desserts": "🍰",
  "Cocktails & Drinks": "🍸", "Wine List": "🍷", "Kids Menu": "🧒",
}

export function PreviewExportTab() {
  const [items, setItems] = useState<MenuItem[]>([]); const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false); const previewRef = useRef<HTMLDivElement>(null)
  const [draftMenus, setDraftMenus] = useState<DraftMenu[]>([]); const [showCatererSheet, setShowCatererSheet] = useState(false)
  const [catererLoading, setCatererLoading] = useState(true)
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/menu").then(r => r.json()),
      fetch("/api/menu/drafts").then(r => r.json()),
    ]).then(([menuData, draftData]) => {
      setItems(menuData || [])
      const drafts = Array.isArray(draftData) ? draftData : []
      setDraftMenus(drafts)
      if (drafts.length > 0) setSelectedDraftId(drafts[0].id)
      setLoading(false)
      setCatererLoading(false)
    }).catch(() => { setLoading(false); setCatererLoading(false) })
  }, [])

  const selectedDraft = draftMenus.find(d => d.id === selectedDraftId)

  // Build preview items from selected draft's courses
  const previewItems = selectedDraft?.courses?.map(c => {
    const item = items.find(i => i.id === c.item_id)
    return item ? { ...item } : null
  }).filter(Boolean) as MenuItem[] || []

  const totalItemsAcrossMenus = draftMenus.reduce((sum, d) => sum + (d.courses?.length || 0), 0)

  const handleExportPNG = async () => {
    if (!previewRef.current) return; setExporting(true)
    try { const url = await toPng(previewRef.current, { quality: 1, pixelRatio: 2 }); const a = document.createElement("a"); a.download = "the-lynchs-wedding-menu.png"; a.href = url; a.click() }
    catch (e) { console.error("Export failed:", e) } finally { setExporting(false) }
  }

  const handleExportPDF = () => {
    if (!previewRef.current) return
    const pw = window.open("", "_blank"); if (!pw) return
    const clone = previewRef.current.cloneNode(true) as HTMLElement
    const styles = Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules || []).map(r => r.cssText).join("") } catch { return "" } }).join("")
    pw.document.write(`<!DOCTYPE html><html><head><title>The Lynch's Wedding Menu</title><style>${styles}@page{margin:0;size:letter portrait}body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${clone.outerHTML}</body></html>`)
    pw.document.close(); pw.onload = () => pw.print()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <ClipboardList className="size-4 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
            <p className="text-xl sm:text-2xl font-serif font-bold tabular-nums">{draftMenus.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Menus Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Menu className="size-4 mx-auto mb-1.5 text-amber-500" strokeWidth={1.5} />
            <p className="text-xl sm:text-2xl font-serif font-bold tabular-nums">{totalItemsAcrossMenus}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UtensilsCrossed className="size-4 mx-auto mb-1.5 text-emerald-500" strokeWidth={1.5} />
            <p className="text-xl sm:text-2xl font-serif font-bold tabular-nums">{items.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Plated Catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ChefHat className="size-4 mx-auto mb-1.5 text-rose-500" strokeWidth={1.5} />
            <p className="text-xl sm:text-2xl font-serif font-bold tabular-nums">{items.filter(i => i.is_signature).length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Signature Items</p>
          </CardContent>
        </Card>
      </div>

      {draftMenus.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="mx-auto size-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No menus created yet. Build one in the Builder tab first.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Menu selector */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-medium">Menu Preview</h3>
              <p className="text-sm text-muted-foreground">How your menu appears to guests.</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Draft selector */}
              <select
                value={selectedDraftId || ""}
                onChange={e => setSelectedDraftId(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium tabular-nums"
              >
                {draftMenus.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.courses?.length || 0} items)
                  </option>
                ))}
              </select>
              <Button variant="outline" className="gap-2 h-9" onClick={handleExportPNG} disabled={exporting}>
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                <span className="hidden sm:inline">Download PNG</span>
              </Button>
              <Button className="gap-2 h-9" onClick={handleExportPDF}>
                <Eye className="size-4" /><span className="hidden sm:inline">Print / PDF</span>
              </Button>
            </div>
          </div>

          {previewItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-sm">This menu has no items. Add items in the Builder tab.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Premium menu preview */}
              <div ref={previewRef} className="overflow-hidden rounded-lg border border-border bg-white shadow-lg mx-auto max-w-2xl">
                <div className="h-1.5 bg-gradient-to-r from-gold/60 via-gold to-gold/60" />
                <div className="px-10 pt-10 pb-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gold/70 font-medium">The Lynch Wedding</p>
                  <h2 className="mt-3 font-serif text-3xl text-[#1a2e1a] tracking-wide">{selectedDraft?.name || "Celebration Menu"}</h2>
                  <div className="mx-auto mt-4 h-px w-16 bg-gold/60" />
                  <p className="mt-3 text-xs text-[#1a2e1a]/60 uppercase tracking-wider">September 14, 2026 · {selectedDraft?.guest_count || 150} Guests</p>
                </div>
                <div className="px-10 pb-10 space-y-8">
                  {[...new Set(previewItems.map(i => i.category))].sort().map(category => {
                    const catItems = previewItems.filter(i => i.category === category && i.is_available)
                    if (catItems.length === 0) return null
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="h-px flex-1 bg-gold/30" />
                          <h3 className="font-serif text-sm uppercase tracking-[0.3em] text-[#1a2e1a]/70">
                            {CATEGORY_EMOJI[category] || ""} {category}
                          </h3>
                          <span className="h-px flex-1 bg-gold/30" />
                        </div>
                        <div className="space-y-3">
                          {catItems.map(item => (
                            <div key={item.id} className="flex items-baseline justify-between gap-4">
                              <div>
                                <p className="text-sm font-medium text-[#1a2e1a]">
                                  {item.name}
                                  {item.is_signature && <span className="ml-1.5 text-gold text-[10px]">✦</span>}
                                </p>
                                {item.description && <p className="text-xs text-[#1a2e1a]/60 mt-0.5 leading-relaxed">{item.description}</p>}
                                <div className="flex gap-2 mt-1">
                                  {item.allergens?.map(a => <Badge key={a} variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-amber-600 border-amber-200">{a}</Badge>)}
                                  {item.nutrition?.calories && <span className="text-[9px] text-muted-foreground">~{item.nutrition.calories} cal</span>}
                                </div>
                              </div>
                              {item.price !== null && <span className="text-sm tabular-nums text-[#1a2e1a] font-medium shrink-0">${item.price.toFixed(2)}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-gold/20 px-10 py-5 text-center">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-[#1a2e1a]/40">Please inform your server of any dietary restrictions</p>
                </div>
                <div className="h-1.5 bg-gradient-to-r from-gold/60 via-gold to-gold/60" />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Previewing {selectedDraft?.name} · {previewItems.length} items for {selectedDraft?.guest_count || 150} guests
              </p>

              {/* Caterer's Production Sheet */}
              {selectedDraft && selectedDraft.courses?.length > 0 && (
                <div className="pt-4">
                  <button
                    onClick={() => setShowCatererSheet(!showCatererSheet)}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg border bg-card hover:bg-accent/20 transition-colors"
                  >
                    <FileSpreadsheet className="size-4 text-amber-600" />
                    <span className="text-sm font-medium">Caterer's Production Sheet</span>
                    <span className="text-xs text-muted-foreground">— Itemized costs, weights & shopping list for {selectedDraft.name}</span>
                    {showCatererSheet ? <ChevronDown className="size-4 ml-auto" /> : <ChevronRight className="size-4 ml-auto" />}
                  </button>
                  {showCatererSheet && (
                    <div className="mt-4">
                      <CatererSheet
                        menuName={selectedDraft.name}
                        courses={selectedDraft.courses || []}
                        catalogItems={items as any}
                        defaultGuestCount={selectedDraft.guest_count || 150}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}