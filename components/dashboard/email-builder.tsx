"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { EmailBlock, EmailTemplate, BlockType } from "@/lib/email-types"
import { VARIABLES } from "@/lib/email-types"
import { EmailDocument } from "@/components/dashboard/email-render"
import { BlockEditor } from "@/components/dashboard/block-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Braces,
  Heading,
  Type,
  MousePointerClick,
  Minus,
  ListChecks,
  PenSquare,
  Pencil,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

let idCounter = 1000
const newId = () => `blk-${idCounter++}`

const ADD_OPTIONS: { type: BlockType; label: string; icon: typeof Type }[] = [
  { type: "header", label: "Header Image", icon: Heading },
  { type: "text", label: "Text Block", icon: Type },
  { type: "button", label: "Button", icon: MousePointerClick },
  { type: "details", label: "Details List", icon: ListChecks },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "footer", label: "Footer", icon: PenSquare },
]

function blankBlock(type: BlockType): EmailBlock {
  switch (type) {
    case "header":
      return { id: newId(), type, eyebrow: "AN INVITATION", heading: "{{Couple Names}}", text: "A new heading" }
    case "button":
      return { id: newId(), type, heading: "Click Here" }
    case "details":
      return { id: newId(), type, rows: [{ label: "Date", value: "{{Event Date}}" }] }
    case "footer":
      return { id: newId(), type, text: "With love,\n{{Couple Names}}" }
    case "divider":
      return { id: newId(), type }
    default:
      return { id: newId(), type: "text", text: "Add your message here." }
  }
}

export function EmailBuilder({
  template,
  onBack,
  onSent,
}: {
  template: EmailTemplate
  onBack: () => void
  onSent: () => void
}) {
  const [to, setTo] = useState("")
  const [ccBcc, setCcBcc] = useState("")
  const [subject, setSubject] = useState(template.subject)
  const [blocks, setBlocks] = useState<EmailBlock[]>(() =>
    template.blocks.map((b) => ({ ...b, id: newId() })),
  )
  const [activeField, setActiveField] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit")

  const patchBlock = (id: string, patch: Partial<EmailBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))

  const moveBlock = (id: string, dir: -1 | 1) =>
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id))

  const addBlock = (type: BlockType) => setBlocks((prev) => [...prev, blankBlock(type)])

  const insertVariable = (variable: string) => {
    // Insert into the currently focused field if it's a textarea/input we can find.
    if (!activeField) {
      toast.info("Click into a text field first, then insert a variable.")
      return
    }
    const el = document.getElementById(activeField) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const nextVal = el.value.slice(0, start) + variable + el.value.slice(end)

    // Fire native setter so React picks up the change.
    const proto =
      el instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set
    setter?.call(el, nextVal)
    el.dispatchEvent(new Event("input", { bubbles: true }))
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + variable.length
      el.setSelectionRange(pos, pos)
    })
  }

  const handleSend = () => {
    toast.success("Email sent successfully!", {
      description: to ? `Delivered to ${to}` : "Your beautiful email is on its way.",
    })
    onSent()
  }

  const previewBlocks = useMemo(() => blocks, [blocks])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="z-10 flex items-center gap-3 border-b border-gold/30 bg-hunter px-4 py-3 sm:px-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-hunter-foreground hover:bg-white/10 hover:text-hunter-foreground"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back to Templates</span>
        </Button>

        <div className="mx-auto hidden text-center sm:block">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Composing</p>
          <p className="font-serif text-sm text-hunter-foreground">{template.name}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Draft saved", { description: "You can pick up where you left off." })}
            className="gap-2 border-gold/50 bg-transparent text-hunter-foreground hover:bg-white/10 hover:text-hunter-foreground"
          >
            <Save className="size-4" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
          <Button
            onClick={handleSend}
            className="gap-2 border border-gold bg-gold text-gold-foreground hover:bg-gold/90"
          >
            <Send className="size-4" />
            Send Email
          </Button>
        </div>
      </header>

      {/* Mobile view toggle */}
      <div className="flex border-b border-border bg-card lg:hidden">
        <button
          onClick={() => setMobileView("edit")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium",
            mobileView === "edit" ? "border-b-2 border-hunter text-hunter" : "text-muted-foreground",
          )}
        >
          <Pencil className="size-4" /> Editor
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium",
            mobileView === "preview" ? "border-b-2 border-hunter text-hunter" : "text-muted-foreground",
          )}
        >
          <Eye className="size-4" /> Preview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Editor */}
        <section
          className={cn(
            "flex w-full flex-col overflow-y-auto border-r border-border bg-secondary/40 lg:w-[46%] lg:max-w-2xl",
            mobileView === "preview" && "hidden lg:flex",
          )}
        >
          <div className="flex flex-col gap-5 p-4 sm:p-6">
            {/* Recipients & subject */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-3">
                <Row label="To">
                  <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="guest@example.com"
                    className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </Row>
                <Row label="Cc / Bcc">
                  <Input
                    value={ccBcc}
                    onChange={(e) => setCcBcc(e.target.value)}
                    placeholder="planner@maisonvow.com"
                    className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </Row>
                <Row label="Subject">
                  <Input
                    id="field-subject"
                    value={subject}
                    onFocus={() => setActiveField("field-subject")}
                    onChange={(e) => setSubject(e.target.value)}
                    className={cn(
                      "h-9 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0",
                      activeField === "field-subject" && "text-hunter",
                    )}
                  />
                </Row>
              </div>
            </div>

            {/* Variable injector */}
            <div className="rounded-lg border border-gold/40 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Braces className="size-4 text-gold-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
                  Insert Variable
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-auto inline-flex h-7 items-center gap-1 rounded-md px-2 text-sm font-medium text-hunter transition-colors hover:bg-secondary">
                    All <Plus className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Dynamic Fields</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {VARIABLES.map((v) => (
                      <DropdownMenuItem key={v} onClick={() => insertVariable(v)}>
                        {v}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="rounded-full border border-gold/50 bg-secondary px-3 py-1 font-mono text-xs text-hunter transition-colors hover:border-hunter hover:bg-hunter hover:text-hunter-foreground"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Content blocks */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
                  Content Blocks
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md bg-hunter px-3 text-sm font-medium text-hunter-foreground transition-colors hover:bg-hunter-dark">
                    <Plus className="size-4" /> Add Block
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Add a block</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ADD_OPTIONS.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <DropdownMenuItem key={opt.type} onClick={() => addBlock(opt.type)}>
                          <Icon className="size-4 text-hunter" />
                          {opt.label}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {blocks.map((block, i) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  index={i}
                  total={blocks.length}
                  activeField={activeField}
                  onFocusField={setActiveField}
                  onChange={(patch) => patchBlock(block.id, patch)}
                  onMove={(dir) => moveBlock(block.id, dir)}
                  onRemove={() => removeBlock(block.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT — Live preview */}
        <section
          className={cn(
            "flex-1 overflow-y-auto bg-[#e9e6dd] p-4 sm:p-8",
            mobileView === "edit" && "hidden lg:block",
          )}
        >
          <div className="mx-auto max-w-[640px]">
            {/* Mock mail client frame */}
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-black/10 bg-[#f5f3ef] px-4 py-3">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 truncate text-xs font-medium text-ink/50">
                  Inbox — Maison &amp; Vow
                </span>
              </div>

              {/* Mail meta */}
              <div className="border-b border-black/10 px-6 py-4">
                <p className="text-pretty font-serif text-lg text-ink">
                  {subject || "(no subject)"}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-hunter font-serif text-sm text-hunter-foreground">
                    M
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Maison &amp; Vow Studio</p>
                    <p className="truncate text-xs text-ink/50">
                      to {to || "your guest"}
                      {ccBcc ? `, ${ccBcc}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rendered email body */}
              <div className="bg-[#f3f1ea] p-4 sm:p-6">
                <div className="mx-auto max-w-[600px] overflow-hidden rounded-sm shadow-md ring-1 ring-black/5">
                  <EmailDocument blocks={previewBlocks} />
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs italic text-ink/40">
              Live preview · updates as you type
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  )
}
