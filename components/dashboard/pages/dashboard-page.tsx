"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "../stat-card"
import { RsvpStatusBadge } from "../status-badge"
import { useEffect, useState } from "react"
import { formatDate, type Guest, type Vendor, type Invoice, type VendorDeadline } from "@/lib/data"
import { Users, UserCheck, Store, ReceiptText, CalendarClock } from "lucide-react"

function initials(name: string) {
  return name
    .replace(/&.*/, "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function toGuest(g: any): Guest {
  const status = g.check_in ? "Checked-In" : g.is_attending ? "Accepted" : "Declined"
  return { id: g.id, name: g.name, email: g.email, partySize: g.guest_count, dietary: "", meal: g.meal_choice || "Beef", status, submittedAt: g.created_at?.slice(0, 10) || "" }
}
function toVendor(v: any): Vendor {
  return { id: v.id, name: v.name, category: v.category as any, contact: v.contact || v.email || "", status: v.status === "confirmed" ? "Confirmed" : "Pending", cost: v.fee || 0 }
}
function toInvoice(i: any): Invoice {
  const today = new Date()
  const due = new Date(i.due_date)
  const status = i.status === "paid" ? "Paid" : due < today ? "Overdue" : "Unpaid"
  return { id: i.id, number: `INV-${i.id.slice(0, 4).toUpperCase()}`, vendor: i.vendor, amount: Number(i.amount), dueDate: i.due_date?.slice(0, 10) || "", status }
}
function toDeadline(d: any): VendorDeadline {
  return { id: d.id, vendor: d.vendor, task: d.task, dueDate: d.due_date?.slice(0, 10) || "" }
}

export function DashboardPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [vendorDeadlines, setDeadlines] = useState<VendorDeadline[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/rsvp").then(r => r.json()),
      fetch("/api/vendors").then(r => r.json()),
      fetch("/api/invoices").then(r => r.json()),
    ]).then(([g, v, i]) => {
      const guestsArr = Array.isArray(g) ? g : []
      const vendorsArr = Array.isArray(v) ? v : []
      const invoicesArr = Array.isArray(i) ? i : []
      setGuests(guestsArr.map(toGuest))
      setVendors(vendorsArr.map(toVendor))
      setInvoices(invoicesArr.map(toInvoice))
      const exts = vendorsArr.flatMap((v: any) => (v.extensions || []).map((e: any) => ({ ...e, vendor: v.name })))
      setDeadlines(exts.length ? exts.map(toDeadline) : [])
    })
  }, [])

  const totalRsvps = guests.length
  const totalGuests = guests
    .filter((g) => g.status !== "Declined")
    .reduce((sum, g) => sum + g.partySize, 0)
  const confirmedVendors = vendors.filter((v) => v.status === "Confirmed").length
  const outstanding = invoices.filter((i) => i.status !== "Paid").length

  const recent = [...guests]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total RSVPs"
          value={String(totalRsvps)}
          hint="Responses received"
          icon={Users}
          accent="green"
        />
        <StatCard
          label="Guests Expected"
          value={String(totalGuests)}
          hint="Across all accepted parties"
          icon={UserCheck}
          accent="gold"
        />
        <StatCard
          label="Confirmed Vendors"
          value={`${confirmedVendors} / ${vendors.length}`}
          hint="Bookings secured"
          icon={Store}
          accent="green"
        />
        <StatCard
          label="Outstanding Invoices"
          value={String(outstanding)}
          hint="Awaiting payment"
          icon={ReceiptText}
          accent="gold"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Recent RSVPs</CardTitle>
            <CardDescription>
              The five most recent guest submissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            {recent.map((g, i) => (
              <div key={g.id}>
                <div className="flex items-center gap-3 py-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                      {initials(g.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {g.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Party of {g.partySize} &middot; {formatDate(g.submittedAt)}
                    </p>
                  </div>
                  <RsvpStatusBadge status={g.status} />
                </div>
                {i < recent.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <CalendarClock className="size-[18px] text-gold" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Vendor tasks needing attention.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {vendorDeadlines.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3"
              >
                <span className="mt-1 size-2 shrink-0 rounded-full bg-gold" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {d.task}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.vendor}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-primary">
                  {formatDate(d.dueDate)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
