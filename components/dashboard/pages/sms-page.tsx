"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Send, MessageSquare, Check, X, Loader2 } from "lucide-react"

interface Guest {
  id: string
  name: string
  email: string
  phone: string | null
  is_attending: boolean | null
  guest_count: number
  status: string
}

const TEMPLATES = [
  {
    name: "RSVP Invitation",
    message:
      "Hi [Guest Name]! 💍 You're invited to Nikkita & Justin's wedding on Sept 26, 2026 at Four Seasons Terra Lago. Please RSVP at https://houseoflynch.app. Reply STOP to opt out. Msg & data rates may apply.",
  },
  {
    name: "Wedding Reminder",
    message:
      "Reminder! Nikkita & Justin's wedding is this Saturday at 4 PM. Ceremony at Four Seasons Terra Lago, 85-370 Terra Lago Pkwy, Indio. Seating begins at 3:35 PM. Full details: https://houseoflynch.app. Reply STOP to opt out.",
  },
  {
    name: "RSVP Thank You",
    message:
      "Thank you for your RSVP! 💛 We're so excited to celebrate with you on Sept 26 at 4 PM. Visit https://houseoflynch.app for full event details and updates. Reply STOP to opt out. Msg & data rates may apply.",
  },
]

function formatPhone(phone: string): string {
  // Strip any non-digit characters and ensure +1 prefix
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return phone.startsWith("+") ? phone : `+1${digits}`
}

export function SmsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<{ phone: string; status: string; error?: string }[] | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((data) => setGuests(data))
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return guests
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        (g.phone && g.phone.includes(q))
    )
  }, [guests, query])

  const guestsWithPhone = guests.filter((g) => g.phone)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(filtered.filter((g) => g.phone).map((g) => g.id)))
  }

  function deselectAll() {
    setSelected(new Set())
  }

  function applyTemplate(template: (typeof TEMPLATES)[0]) {
    setMessage(template.message)
    setActiveTemplate(template.name)
  }

  async function sendMessages() {
    if (selected.size === 0 || !message.trim()) return

    setSending(true)
    setResults(null)

    const selectedGuests = guests.filter((g) => selected.has(g.id) && g.phone)
    const phoneNumbers = selectedGuests.map((g) => formatPhone(g.phone!))

    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phoneNumbers, message: message.trim() }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (err: any) {
      setResults([{ phone: "Error", status: "failed", error: err.message }])
    } finally {
      setSending(false)
    }
  }

  const successCount = results?.filter((r) => r.status === "sent").length ?? 0
  const failCount = results?.filter((r) => r.status === "failed").length ?? 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center gap-6 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="size-7 text-primary" />
        </div>
        <div>
          <p className="text-3xl font-serif font-medium text-foreground tabular-nums">
            {guestsWithPhone.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Guests with phone numbers
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Guest Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Guests</CardTitle>
            <CardDescription>
              Choose who to send a message to
            </CardDescription>
            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search guests..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                None
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No guests found
              </p>
            ) : (
              <div className="space-y-1">
                {filtered.map((g) => {
                  const hasPhone = !!g.phone
                  return (
                    <label
                      key={g.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                        !hasPhone
                          ? "border-dashed border-muted opacity-50"
                          : selected.has(g.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(g.id)}
                        disabled={!hasPhone}
                        onChange={() => toggleSelect(g.id)}
                        className="size-4 accent-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {g.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {g.phone || "No phone number"} {g.is_attending === true ? "• Attending" : g.is_attending === false ? "• Declined" : ""}
                        </p>
                      </div>
                      {selected.has(g.id) && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Message Composer */}
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              Write your message or use a template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Templates */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Templates
              </p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <Button
                    key={t.name}
                    variant={activeTemplate === t.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message */}
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setActiveTemplate(null)
              }}
              rows={6}
              className="resize-none"
            />

            <p className="text-xs text-muted-foreground">
              {message.length} characters &middot; Selected: {selected.size} guest{selected.size !== 1 ? "s" : ""}
            </p>

            {/* Send */}
            <Button
              className="w-full"
              disabled={selected.size === 0 || !message.trim() || sending}
              onClick={sendMessages}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Send to {selected.size} Guest{selected.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>

            {/* Results */}
            {results && (
              <div
                className={`rounded-lg border p-4 text-sm ${
                  failCount > 0
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-green-200 bg-green-50 text-green-800"
                }`}
              >
                <p className="font-medium">
                  {successCount > 0
                    ? `✅ ${successCount} message${successCount !== 1 ? "s" : ""} sent successfully`
                    : ""}
                  {failCount > 0
                    ? `${successCount > 0 ? " • " : ""}❌ ${failCount} failed`
                    : ""}
                </p>
                {failCount > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                    {results
                      .filter((r) => r.status === "failed")
                      .map((r, i) => (
                        <li key={i}>
                          {r.phone}: {r.error}
                        </li>
                      ))}
                  </ul>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto p-0 text-xs underline"
                  onClick={() => setResults(null)}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}