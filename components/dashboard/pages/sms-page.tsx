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
  thank_you_sent: boolean | null
  thank_you_sent_at: string | null
}

interface SentMessage {
  id: number
  twilio_sid: string | null
  to_phone: string
  body: string | null
  status: string
  error_code: string | null
  error_message: string | null
  template: string | null
  guest_id: string | null
  created_at: string
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
  const [history, setHistory] = useState<SentMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  // Verification sender state
  const [testPhone, setTestPhone] = useState("")
  const [testResult, setTestResult] = useState<{ status: string; error?: string } | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetch("/api/rsvp")
      .then((r) => r.json())
      .then((data) => setGuests(data))
      .catch(() => {})
    loadHistory()
  }, [])

  async function loadHistory() {
    setLoadingHistory(true)
    try {
      const res = await fetch("/api/sms/status")
      const data = await res.json()
      setHistory(data.messages || [])
    } catch {
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  async function sendTest() {
    const phone = formatPhone(testPhone.trim())
    if (!testPhone.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: [phone],
          message:
            "✅ This is a test message from Nikkita & Justin's wedding site (houseoflynch.app). Your Twilio SMS pipeline is working! Reply STOP to opt out.",
        }),
      })
      const data = await res.json()
      const r = (data.results || [])[0]
      setTestResult(r || { status: "failed", error: "No result returned" })
      loadHistory()
    } catch (err: any) {
      setTestResult({ status: "failed", error: err.message })
    } finally {
      setTesting(false)
    }
  }

  const statusColor: Record<string, string> = {
    queued: "bg-yellow-100 text-yellow-800",
    sending: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    undelivered: "bg-red-100 text-red-800",
  }

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
    const guestIds = selectedGuests.map((g) => g.id)

    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumbers,
          guestIds,
          template: activeTemplate || null,
          message: message.trim(),
        }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (err: any) {
      setResults([{ phone: "Error", status: "failed", error: err.message }])
    } finally {
      setSending(false)
      loadHistory()
    }
  }

  const successCount = results?.filter((r) => r.status === "sent").length ?? 0
  const failCount = results?.filter((r) => r.status === "failed").length ?? 0

  // ---- Thank-you tracking (RSVP'd vs. thanked) ----
  const rsvpGuests = guests.filter((g) => g.is_attending === true)
  const rsvpCount = rsvpGuests.length
  const thankedCount = rsvpGuests.filter((g) => g.thank_you_sent === true).length
  const notThankedCount = rsvpCount - thankedCount

  // Map each guest to the messages they've been sent (by guest_id, then phone fallback)
  const messagesByGuest = useMemo(() => {
    const map = new Map<string, SentMessage[]>()
    for (const g of guests) {
      const msgs = history.filter(
        (m) =>
          (m.guest_id && m.guest_id === g.id) ||
          (!m.guest_id && g.phone && formatPhone(g.phone) === formatPhone(m.to_phone))
      )
      map.set(g.id, msgs)
    }
    return map
  }, [guests, history])

  const templateLabel = (m: SentMessage) => m.template || (m.body ? m.body.slice(0, 40) + "…" : "Untitled")

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

      {/* Thank-you tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="size-5 text-primary" />
            RSVP Thank-You Tracker
          </CardTitle>
          <CardDescription>
            Who has RSVP&rsquo;d, and who has already been sent the thank-you message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-2xl font-serif font-medium text-foreground tabular-nums">{rsvpCount}</p>
              <p className="text-xs text-muted-foreground">RSVP&rsquo;d (attending)</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-2xl font-serif font-medium text-green-700 tabular-nums">{thankedCount}</p>
              <p className="text-xs text-green-700/80">Thank-you sent</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-2xl font-serif font-medium text-amber-700 tabular-nums">{notThankedCount}</p>
              <p className="text-xs text-amber-700/80">Thank-you not sent yet</p>
            </div>
          </div>

          {rsvpCount > 0 && (
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.round((thankedCount / rsvpCount) * 100)}%` }}
              />
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Guest</th>
                  <th className="px-4 py-2.5 font-medium">RSVP</th>
                  <th className="px-4 py-2.5 font-medium">Thank-you</th>
                  <th className="px-4 py-2.5 font-medium">Messages sent to them</th>
                </tr>
              </thead>
              <tbody>
                {rsvpGuests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No RSVPs yet.
                    </td>
                  </tr>
                ) : (
                  rsvpGuests.map((g) => {
                    const sent = messagesByGuest.get(g.id) || []
                    return (
                      <tr key={g.id} className="border-t border-border">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-foreground">{g.name}</p>
                          <p className="text-xs text-muted-foreground">{g.phone || "No phone"}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Attending
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {g.thank_you_sent ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              ✓ Sent
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                              Not sent
                            </span>
                          )}
                          {g.thank_you_sent_at && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(g.thank_you_sent_at).toLocaleString()}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {sent.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <ul className="space-y-1">
                              {sent.map((m) => (
                                <li key={m.id} className="flex items-center gap-2 text-xs">
                                  <span
                                    className={`rounded-full px-2 py-0.5 font-medium ${
                                      statusColor[m.status] || "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {m.status}
                                  </span>
                                  <span className="truncate text-muted-foreground" title={m.body || ""}>
                                    {templateLabel(m)}
                                  </span>
                                  <span className="shrink-0 text-muted-foreground">
                                    {new Date(m.created_at).toLocaleDateString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Verification sender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            Verify Sender
          </CardTitle>
          <CardDescription>
            Send a test message to a phone you control to confirm the Twilio number works end-to-end.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Phone number (e.g. 555-123-4567)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="flex-1"
            />
            <Button
              disabled={!testPhone.trim() || testing}
              onClick={sendTest}
              variant="outline"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending test...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Send Test
                </>
              )}
            </Button>
          </div>
          {testResult && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                testResult.status === "failed"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
            >
              {testResult.status === "failed"
                ? `❌ Failed: ${testResult.error || "unknown error"}`
                : `✅ Message sent (${testResult.status}). Watch the delivery status below to confirm it reaches the phone.`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" />
            Delivery History
          </CardTitle>
          <CardDescription>
            Recent messages and their delivery status (updates arrive via Twilio webhook).
          </CardDescription>
          <Button variant="outline" size="sm" className="w-fit" onClick={loadHistory} disabled={loadingHistory}>
            {loadingHistory ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Check className="mr-1 size-4" />}
            Refresh
          </Button>
          <div className="pt-2"/>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {loadingHistory ? "Loading..." : "No messages sent yet. Use the composer above or the Verify box."}
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {history.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{m.to_phone}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColor[m.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {m.status}
                      </span>
                      {m.error_message && (
                        <span className="max-w-[200px] truncate text-xs text-red-600" title={m.error_message}>
                          {m.error_code ? `${m.error_code}: ` : ""}{m.error_message}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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