"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, UtensilsCrossed, Loader2,
} from "lucide-react"

interface MenuItem {
  id: string; category: string; name: string; description: string; price: number | null
  sort_order: number; is_available: boolean; section?: string | null
}

const CATEGORIES = ["Appetizers", "Salads & Soups", "Main Courses", "Sides", "Desserts", "Cocktails & Drinks", "Wine List", "Kids Menu"]

export function EditMenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]); const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null); const [dialogOpen, setDialogOpen] = useState(false)
  const fetchItems = useCallback(async () => {
    const r = await fetch("/api/menu"); setItems((await r.json()) || []); setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSave = async (item: Partial<MenuItem> & { id?: string }) => {
    const method = item.id ? "PUT" : "POST"
    await fetch("/api/menu", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) })
    fetchItems(); setDialogOpen(false); setEditingItem(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return
    await fetch(`/api/menu?id=${id}`, { method: "DELETE" }); fetchItems()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    items: items.filter(i => i.category === cat).sort((a, b) => a.sort_order - b.sort_order)
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="font-serif text-lg font-medium">Menu Items</h3><p className="text-sm text-muted-foreground">{items.length} items</p></div>
        <Dialog open={dialogOpen && !editingItem} onOpenChange={o => { setDialogOpen(o); if (!o) setEditingItem(null) }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" />Add Item</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg"><MenuForm onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditingItem(null) }} /></DialogContent>
        </Dialog>
      </div>

      {grouped.map(({ category, items: catItems }) => (
        <Card key={category}>
          <CardHeader className="pb-3"><CardTitle className="font-serif text-base">{category}</CardTitle><CardDescription>{catItems.length} items</CardDescription></CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border/50">
              {catItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${!item.is_available ? "line-through text-muted-foreground" : ""}`}>{item.name}</p>
                      {!item.is_available && <Badge variant="outline" className="text-[10px]">Unavailable</Badge>}
                    </div>
                    {item.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.price !== null && <span className="text-xs tabular-nums text-muted-foreground">${item.price.toFixed(2)}</span>}
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditingItem(item); setDialogOpen(true) }}><Pencil className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && <Card><CardContent className="py-12 text-center"><UtensilsCrossed className="mx-auto size-12 text-muted-foreground/40 mb-4" /><p className="text-muted-foreground">No menu items yet.</p></CardContent></Card>}

      <Dialog open={dialogOpen && !!editingItem} onOpenChange={o => { setDialogOpen(o); if (!o) setEditingItem(null) }}>
        <DialogContent className="sm:max-w-lg">
          {editingItem && <MenuForm initial={editingItem} onSave={handleSave} onCancel={() => { setDialogOpen(false); setEditingItem(null) }} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MenuForm({ initial, onSave, onCancel }: { initial?: Partial<MenuItem>; onSave: (item: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0])
  const [price, setPrice] = useState(initial?.price?.toString() || "")
  const [isAvailable, setIsAvailable] = useState(initial?.is_available ?? true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return; setSaving(true)
    await onSave({ id: initial?.id, name: name.trim(), description: description.trim(), category, price: price ? parseFloat(price) : null, is_available: isAvailable })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader><DialogTitle>{initial?.id ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle><DialogDescription>Fill in the details below.</DialogDescription></DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2"><label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name *</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Filet Mignon" required /></div>
        <div className="grid gap-2"><label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. 8oz aged prime beef with truffle butter" rows={2} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2"><label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid gap-2"><label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</label><Input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 42.00" type="number" step="0.01" /></div>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="size-4 rounded border-border accent-primary" /> Item is available</label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!name.trim() || saving}>{saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}{initial?.id ? "Save Changes" : "Add Item"}</Button>
      </DialogFooter>
    </form>
  )
}