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
import { Search, ChevronLeft, ChevronRight, UserCheck, Undo2 } from "lucide-react"

const PAGE_SIZE = 8

function toGuest(g: any): Guest {
  const status = g.check_in ? "Checked-In" : g.is_attending ? "Accepted" : "Declined"
  return { id: g.id, name: g.name, email: g.email, partySize: g.guest_count, dietary: "", meal: g.meal_choice || "Beef", status, submittedAt: g.created_at?.slice(0, 10) || "" }
}

export function RsvpsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch("/api/rsvp")
      .then(r => r.json())
      .then(data => setGuests(data.map(toGuest)))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return guests
    return guests.filter((g) => g.name.toLowerCase().includes(q))
  }, [guests, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const paged = filtered.slice(start, start + PAGE_SIZE)

  function toggleCheckIn(id: string) {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: g.status === "Checked-In" ? "Accepted" : "Checked-In",
            }
          : g
      )
    )
  }

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-serif text-lg">Guest List</CardTitle>
          <CardDescription>
            {filtered.length} of {guests.length} guests
          </CardDescription>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by guest name..."
            className="h-9 pl-8"
            aria-label="Search guests by name"
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="pl-4">Guest Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Party</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="pr-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No guests match &ldquo;{query}&rdquo;.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="pl-4 font-medium text-foreground">
                      {g.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {g.email}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {g.partySize}
                    </TableCell>
                    <TableCell>
                      <MealBadge meal={g.meal} />
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-muted-foreground">
                      {g.dietary}
                    </TableCell>
                    <TableCell>
                      <RsvpStatusBadge status={g.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(g.submittedAt)}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant={
                          g.status === "Checked-In" ? "ghost" : "outline"
                        }
                        size="sm"
                        disabled={g.status === "Declined"}
                        onClick={() => toggleCheckIn(g.id)}
                      >
                        {g.status === "Checked-In" ? (
                          <>
                            <Undo2 data-icon="inline-start" />
                            Undo
                          </>
                        ) : (
                          <>
                            <UserCheck data-icon="inline-start" />
                            Check In
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {paged.length === 0 ? 0 : start + 1}&ndash;
            {start + paged.length} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft data-icon="inline-start" />
              Prev
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}