"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Edit3, Trash2, Menu, Check, RotateCcw, Save } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ActiveMenu {
  id: string
  name: string
  courses: {
    course_number: number
    course_type: string
    item_id: string
    portion_size: "small" | "regular" | "large"
    notes: string
  }[]
  saved: boolean
  guestCount: number
}

interface Props {
  menus: ActiveMenu[]
  activeMenuId: string | null
  onSelectMenu: (id: string) => void
  onCreateMenu: () => void
  onDeleteMenu: (id: string) => void
  onRenameMenu: (id: string, name: string) => void
  onClearMenu: (id: string) => void
  onSaveAll: () => void
}

export function MenuBar({
  menus,
  activeMenuId,
  onSelectMenu,
  onCreateMenu,
  onDeleteMenu,
  onRenameMenu,
  onClearMenu,
  onSaveAll,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const startEdit = (menu: ActiveMenu) => {
    setEditingId(menu.id)
    setEditName(menu.name)
  }

  const confirmEdit = () => {
    if (editingId && editName.trim()) {
      onRenameMenu(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className={cn(
              "group relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
              "hover:border-primary/50",
              activeMenuId === menu.id
                ? "border-primary/50 bg-primary/5 shadow-sm"
                : "border-border bg-card"
            )}
          >
            <button
              className="flex items-center gap-1.5 min-w-0"
              onClick={() => onSelectMenu(menu.id)}
            >
              <Menu className="size-3 shrink-0 text-muted-foreground" />
              {editingId === menu.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={confirmEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit()
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="h-6 w-28 text-xs px-1.5"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="font-medium truncate max-w-24">{menu.name}</span>
              )}
              {!menu.saved && (
                <span className="size-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
              )}
              <Badge variant="outline" className="text-[9px] px-1 h-4 ml-0.5">
                {menu.courses.length}
              </Badge>
            </button>

            {/* Hover actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); startEdit(menu) }}
                className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                title="Rename"
              >
                <Edit3 className="size-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClearMenu(menu.id) }}
                className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                title="Clear items"
              >
                <RotateCcw className="size-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteMenu(menu.id) }}
                className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive"
                title="Delete menu"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}

        {menus.length < 3 && (
          <button
            onClick={onCreateMenu}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
          >
            <Plus className="size-3" />
            New Menu
          </button>
        )}
      </div>
    </div>
  )
}