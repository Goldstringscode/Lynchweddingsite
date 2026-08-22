"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RsvpStatusBadge, MealBadge } from "../status-badge"
import { formatDate, type Guest } from "@/lib/data"
import {
  Search, ChevronLeft, ChevronRight, UserCheck, Undo2,
  Users, Trash2, UserPlus, X,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const PAGE_SIZE = 8
const MEAL_OPTIONS = ["Beef", "Chicken", "Fish", "Pork", "Vegan"]

function toGuest(g: any): Guest {
  const status = g.check_in ? "Checked-In" : g.is_attending ? "Accepted" : "Declined"
  return {
    id: g.id,
    name: g.name,
    email: g.email,
    partySize: g.guest_count,
    dietary: g.dietary || "",
    meal: g.meal_choice || "Beef",
    guestMeal: g.guest_meal || null,
    status,
    submittedAt: g.created_at?.slice(0, 10) || "",
  }
}

export function RsvpsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)

  // Add form state
  const [addName, setAddName] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addPhone, setAddPhone] = useState("")
  const [addGuests, setAddGuests] = useState("1")
  const [addMeal, setAddMeal] = useState("Beef")
  const [addGuestMeal, setAddGuestMeal] = useState("Beef")
  const [addDietary, setAddDietary] = useState("")
  const [addAttending, setAddAttending] = useState("accept")

  function loadGuests() {
    fetch("/api/rsvp")
      .then(r => r.json())
      .then(data => setGuests(Array.isArray(data) ? data.map(toGuest) : []))
      .catch(() => setGuests([]))
  }

  useEffect(() => { loadGuests() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return guests
    return guests.filter((g) => g.name.toLowerCase().includes(q))
  }, [guests, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const paged = filtered.slice(start, start + PAGE_SIZE)
  const totalHeadCount = guests.reduce((sum, g) => sum + g.partySize, 0)
  const attendingHeadCount = guests
    .filter((g) => g.status !== "Declined")
    .reduce((sum, g) => sum + g.partySize, 0)

  function toggleCheckIn(id: string) {
    const guest = guests.find((g) => g.id === id)
    if (!guest) return
    const newStatus = guest.status !== "Checked-In"
    fetch(`/api/rsvp/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ check_in: newStatus }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed")
        setGuests((prev) =>
          prev.map((g) =>
            g.id === id
              ? { ...g, status: newStatus ? "Checked-In" : "Accepted" }
              : g
          )
        )
      })
      .catch(() => alert("Failed to update check-in"))
  }

  function deleteGuest(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    fetch(`/api/rsvp/${id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed")
        setGuests((prev) => prev.filter((g) => g.id !== id))
      })
      .catch(() => alert("Failed to delete guest"))
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addName || !addEmail) {
      alert("Name and email are required.")
      return
    }
    fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addName,
        email: addEmail,
        phone: addPhone || null,
        guest_count: parseInt(addGuests) || 1,
        meal_choice: addMeal,
        guest_meal: addGuests === "2" ? addGuestMeal : null,
        dietary: addDietary || null,
        is_attending: addAttending === "accept",
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then(err => { throw new Error(err.error || "Failed") })
        return r.json()
      })
      .then(() => {
        loadGuests()
        setShowAddForm(false)
        setAddName(""); setAddEmail(""); setAddPhone("")
        setAddGuests("1"); setAddMeal("Beef"); setAddGuestMeal("Beef")
        setAddDietary(""); setAddAttending("accept")
      })
      .catch(err => alert(err.message))
  }

  return (
    <>
      {/* Big counter + Add button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Users className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-serif font-medium text-foreground tabular-nums">
              {attendingHeadCount}
            </p>
            <p className="text-sm text-muted-foreground">
              Total Guests{attendingHeadCount !== totalHeadCount ? ` (${totalHeadCount} including declined)` : ""}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="lg"
          className="h-12 rounded-none bg-primary font-sans text-sm uppercase tracking-[0.2em]">
          <UserPlus className="size-4" />
          {showAddForm ? "Cancel" : "Add Guest"}
        </Button>
      </div>

      {/* Add Guest Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Add Guest Manually</CardTitle>
            <CardDescription>Enter guest details below. They will receive an access code.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider">Full Name</Label>
                  <Input required value={addName} onChange={e => setAddName(e.target.value)}
                    placeholder="First and Last Name"
                    className="rounded-none border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider">Email</Label>
                  <Input required type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="rounded-none border-input" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider">Phone</Label>
                  <Input value={addPhone} onChange={e => setAddPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="rounded-none border-input" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider">Party Size</Label>
                  <select value={addGuests} onChange={e => setAddGuests(e.target.value)}
                    className="flex h-10 w-full rounded-none border border-input bg-transparent px-3 text-sm">
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider">Dietary</Label>
                  <Input value={addDietary} onChange={e => setAddDietary(e.target.value)}
                    placeholder="Allergies, preferences..."
                    className="rounded-none border-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Your Meal Selection</Label>
                <div className="grid grid-cols-5 gap-2">
                  {MEAL_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => setAddMeal(opt)}
                      className={`px-3 py-2 text-sm font-medium border transition-colors ${
                        addMeal === opt ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-transparent hover:border-primary/50"}`}>{opt}</button>
                  ))}
                </div>
              </div>
              {addGuests === "2" && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Guest's Meal</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {MEAL_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => setAddGuestMeal(opt)}
                        className={`px-3 py-2 text-sm font-medium border transition-colors ${
                          addGuestMeal === opt ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-transparent hover:border-primary/50"}`}>{opt}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Attendance</Label>
                <RadioGroup value={addAttending} onValueChange={setAddAttending} className="flex gap-3">
                  {[
                    { value: "accept", label: "Accept" },
                    { value: "decline", label: "Decline" },
                  ].map(opt => (
                    <Label key={opt.value} className={`flex cursor-pointer items-center gap-2 border p-3 ${
                      addAttending === opt.value ? "border-primary bg-accent" : "border-input hover:border-primary/50"}`}>
                      <RadioGroupItem value={opt.value} />
                      <span className="font-sans text-sm">{opt.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="h-12 rounded-none bg-primary font-sans text-sm uppercase tracking-[0.2em]">
                  <UserPlus className="size-4" />
                  Add Guest
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}
                  className="h-12 rounded-none font-sans text-sm uppercase tracking-[0.2em]">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Guest List */}
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="font-serif text-lg">Guest List</CardTitle>
            <CardDescription>{filtered.length} of {guests.length} guests</CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search by name..."
              className="h-9 pl-8" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-4 whitespace-nowrap">Guest Name</TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Party</TableHead>
                  <TableHead className="whitespace-nowrap">Meal</TableHead>
                  <TableHead className="whitespace-nowrap">Dietary</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Submitted</TableHead>
                  <TableHead className="pr-4 text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No guests match &ldquo;{query}&rdquo;.
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="pl-4 font-medium text-foreground">{g.name}</TableCell>
                      <TableCell className="text-muted-foreground">{g.email}</TableCell>
                      <TableCell className="text-center tabular-nums">{g.partySize}</TableCell>
                      <TableCell>
                        <MealBadge meal={g.meal} />
                        {g.partySize > 1 && g.guestMeal && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            Guest: <MealBadge meal={g.guestMeal} />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-40 truncate text-muted-foreground">{g.dietary}</TableCell>
                      <TableCell><RsvpStatusBadge status={g.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(g.submittedAt)}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant={g.status === "Checked-In" ? "ghost" : "outline"}
                            size="sm"
                            disabled={g.status === "Declined"}
                            onClick={() => toggleCheckIn(g.id)}>
                            {g.status === "Checked-In" ? (
                              <><Undo2 className="size-3.5" /> Undo</>
                            ) : (
                              <><UserCheck className="size-3.5" /> Check In</>
                            )}
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => deleteGuest(g.id, g.name)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Showing {paged.length === 0 ? 0 : start + 1}&ndash;{start + paged.length} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="size-4" /> Prev
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}