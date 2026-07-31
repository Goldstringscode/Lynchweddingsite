"use client"

import { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Loader2, UtensilsCrossed, FileSpreadsheet, ChevronDown, ChevronRight } from "lucide-react"
import { CatererSheet } from "./caterer-sheet"

interface MenuItem {
  id: string; category: string; name: string; description: string; price: number | null
  is_available: boolean; sort_order: number; is_signature?: boolean
  nutrition?: Record<string, any> | null; allergens?: string[] | null
}

const CATEGORY_EMOJI: Record<string, string> = {
  "Appetizers": "🥂", "Salads & Soups": "🥗", "Main Courses": "🍽️", "Sides": "🥔", "Desserts": "🍰",
  "Cocktails & Drinks": "🍸", "Wine List": "🍷", "Kids Menu": "🧒",
}

export function PreviewExportTab() {
  const [items, setItems] = useState<MenuItem[]>([]); const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false); const previewRef = useRef<HTMLDivElement>(null)
  const [draftMenus, setDraftMenus] = useState<any[]>([]); const [showCatererSheet, setShowCatererSheet] = useState(false)
  const [catererLoading, setCatererLoading] = useState(true)

  useEffect(() => {
    fetch("/api/menu").then(r => r.json()).then(d => { setItems(d || []); setLoading(false) })
    fetch("/api/menu/drafts").then(r => r.json()).then(d => {
      setDraftMenus(Array.isArray(d) ? d : [])
      setCatererLoading(false)
    }).catch(() => setCatererLoading(false))
  }, [])

  const firstDraft = draftMenus?.[0]

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
  if (items.length === 0) return <Card><CardContent className="py-12 text-center"><UtensilsCrossed className="mx-auto size-12 text-muted-foreground/40 mb-4" /><p className="text-muted-foreground">Add menu items in the Edit Menu tab first.</p></CardContent></Card>

  const categories = [...new Set(items.map(i => i.category))].sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="font-serif text-lg font-medium">Menu Preview</h3><p className="text-sm text-muted-foreground">How your menu appears to guests.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportPNG} disabled={exporting}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}Download PNG
          </Button>
          <Button className="gap-2" onClick={handleExportPDF}><Eye className="size-4" />Print / PDF</Button>
        </div>
      </div>

      <div ref={previewRef} className="overflow-hidden rounded-lg border border-border bg-white shadow-lg mx-auto max-w-2xl">
        <div className="h-1.5 bg-gradient-to-r from-gold/60 via-gold to-gold/60" />
        <div className="px-10 pt-10 pb-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold/70 font-medium">The Lynch Wedding</p>
          <h2 className="mt-3 font-serif text-3xl text-[#1a2e1a] tracking-wide">Celebration Menu</h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gold/60" />
          <p className="mt-3 text-xs text-[#1a2e1a]/60 uppercase tracking-wider">September 14, 2026</p>
        </div>
        <div className="px-10 pb-10 space-y-8">
          {categories.map(category => {
            const catItems = items.filter(i => i.category === category && i.is_available).sort((a, b) => a.sort_order - b.sort_order)
            if (catItems.length === 0) return null
            return (
              <div key={category}>
                <div className="flex items-center gap-4 mb-3"><span className="h-px flex-1 bg-gold/30" /><h3 className="font-serif text-sm uppercase tracking-[0.3em] text-[#1a2e1a]/70">{CATEGORY_EMOJI[category] || ""} {category}</h3><span className="h-px flex-1 bg-gold/30" /></div>
                <div className="space-y-3">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#1a2e1a]">{item.name}</p>
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
        <div className="border-t border-gold/20 px-10 py-5 text-center"><p className="text-[9px] uppercase tracking-[0.4em] text-[#1a2e1a]/40">Please inform your server of any dietary restrictions</p></div>
        <div className="h-1.5 bg-gradient-to-r from-gold/60 via-gold to-gold/60" />
      </div>
      <p className="text-center text-xs text-muted-foreground">Shows only items marked as available.</p>

      {/* Caterer's Production Sheet */}
      {!catererLoading && firstDraft && firstDraft.courses?.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => setShowCatererSheet(!showCatererSheet)}
            className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg border bg-card hover:bg-accent/20 transition-colors"
          >
            <FileSpreadsheet className="size-4 text-amber-600" />
            <span className="text-sm font-medium">Caterer's Production Sheet</span>
            <span className="text-xs text-muted-foreground">— Itemized costs, weights & shopping list for {firstDraft.name}</span>
            {showCatererSheet ? <ChevronDown className="size-4 ml-auto" /> : <ChevronRight className="size-4 ml-auto" />}
          </button>
          {showCatererSheet && (
            <div className="mt-4">
              <CatererSheet
                menuName={firstDraft.name}
                courses={firstDraft.courses || []}
                catalogItems={items as any}
                defaultGuestCount={firstDraft.guest_count || 150}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}