"use client"

import type { EmailBlock } from "@/lib/email-types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Trash2, GripVertical, Type, Heading, MousePointerClick, Minus, PenSquare, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"

const BLOCK_META: Record<EmailBlock["type"], { label: string; icon: typeof Type }> = {
  header: { label: "Header", icon: Heading },
  text: { label: "Text Block", icon: Type },
  button: { label: "Button", icon: MousePointerClick },
  divider: { label: "Divider", icon: Minus },
  details: { label: "Details List", icon: ListChecks },
  footer: { label: "Footer", icon: PenSquare },
}

export function BlockEditor({
  block,
  index,
  total,
  activeField,
  onFocusField,
  onChange,
  onMove,
  onRemove,
}: {
  block: EmailBlock
  index: number
  total: number
  activeField: string | null
  onFocusField: (id: string | null) => void
  onChange: (patch: Partial<EmailBlock>) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  const meta = BLOCK_META[block.type]
  const Icon = meta.icon

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Block header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <GripVertical className="size-4 text-muted-foreground/50" />
        <Icon className="size-4 text-hunter" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {meta.label}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-hunter"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="Move block up"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-hunter"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label="Move block down"
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove block"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Block fields */}
      <div className="flex flex-col gap-3 p-3">
        {block.type === "header" && (
          <>
            <FieldInput
              id={`${block.id}-eyebrow`}
              label="Eyebrow"
              value={block.eyebrow ?? ""}
              activeField={activeField}
              onFocusField={onFocusField}
              onChange={(v) => onChange({ eyebrow: v })}
            />
            <FieldInput
              id={`${block.id}-heading`}
              label="Heading"
              value={block.heading ?? ""}
              activeField={activeField}
              onFocusField={onFocusField}
              onChange={(v) => onChange({ heading: v })}
            />
            <FieldInput
              id={`${block.id}-subhead`}
              label="Sub-line"
              value={block.text ?? ""}
              activeField={activeField}
              onFocusField={onFocusField}
              onChange={(v) => onChange({ text: v })}
            />
          </>
        )}

        {(block.type === "text" || block.type === "footer") && (
          <FieldArea
            id={`${block.id}-text`}
            label={block.type === "footer" ? "Sign-off" : "Body copy"}
            value={block.text ?? ""}
            rows={block.type === "footer" ? 3 : 5}
            activeField={activeField}
            onFocusField={onFocusField}
            onChange={(v) => onChange({ text: v })}
          />
        )}

        {block.type === "button" && (
          <FieldInput
            id={`${block.id}-label`}
            label="Button label"
            value={block.heading ?? ""}
            activeField={activeField}
            onFocusField={onFocusField}
            onChange={(v) => onChange({ heading: v })}
          />
        )}

        {block.type === "details" && (
          <div className="flex flex-col gap-2">
            {(block.rows ?? []).map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={row.label}
                  onChange={(e) => {
                    const rows = [...(block.rows ?? [])]
                    rows[i] = { ...rows[i], label: e.target.value }
                    onChange({ rows })
                  }}
                  className="h-9 flex-1 text-sm"
                  placeholder="Label"
                />
                <Input
                  id={`${block.id}-row-${i}`}
                  value={row.value}
                  onFocus={() => onFocusField(`${block.id}-row-${i}`)}
                  onChange={(e) => {
                    const rows = [...(block.rows ?? [])]
                    rows[i] = { ...rows[i], value: e.target.value }
                    onChange({ rows })
                  }}
                  className={cn(
                    "h-9 flex-[1.4] text-sm",
                    activeField === `${block.id}-row-${i}` && "ring-2 ring-hunter/40",
                  )}
                  placeholder="Value"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    const rows = (block.rows ?? []).filter((_, ri) => ri !== i)
                    onChange({ rows })
                  }}
                  aria-label="Remove row"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-1 self-start border-gold/50 text-hunter hover:bg-secondary"
              onClick={() =>
                onChange({ rows: [...(block.rows ?? []), { label: "Label", value: "Value" }] })
              }
            >
              Add Detail Row
            </Button>
          </div>
        )}

        {block.type === "divider" && (
          <p className="py-1 text-center text-xs italic text-muted-foreground">
            A slim gold divider. Nothing to edit.
          </p>
        )}
      </div>
    </div>
  )
}

function FieldInput({
  id,
  label,
  value,
  activeField,
  onFocusField,
  onChange,
}: {
  id: string
  label: string
  value: string
  activeField: string | null
  onFocusField: (id: string | null) => void
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onFocus={() => onFocusField(id)}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-9 text-sm", activeField === id && "ring-2 ring-hunter/40")}
      />
    </div>
  )
}

function FieldArea({
  id,
  label,
  value,
  rows,
  activeField,
  onFocusField,
  onChange,
}: {
  id: string
  label: string
  value: string
  rows: number
  activeField: string | null
  onFocusField: (id: string | null) => void
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Textarea
        id={id}
        value={value}
        rows={rows}
        onFocus={() => onFocusField(id)}
        onChange={(e) => onChange(e.target.value)}
        className={cn("resize-none text-sm leading-relaxed", activeField === id && "ring-2 ring-hunter/40")}
      />
    </div>
  )
}
