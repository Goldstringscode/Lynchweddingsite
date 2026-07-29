"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { VendorStatusBadge } from "../status-badge"
import { formatCurrency, vendorCategories, type Vendor, type VendorCategory, type VendorStatus } from "@/lib/data"
import { Plus } from "lucide-react"

const emptyForm = {
  name: "",
  category: "Photography" as VendorCategory,
  contact: "",
  status: "Pending" as VendorStatus,
  cost: "",
}

function toVendor(v: any): Vendor {
  return { id: v.id, name: v.name, category: v.category as VendorCategory, contact: v.contact || v.email || "—", status: v.status === "confirmed" ? "Confirmed" : "Pending", cost: v.fee || 0 }
}

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetch("/api/vendors")
      .then(r => r.json())
      .then(data => setVendors(data.map(toVendor)))
  }, [])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        category: form.category,
        contact: form.contact.trim() || null,
        status: form.status.toLowerCase(),
        fee: Number(form.cost) || 0,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to add vendor")
        return r.json()
      })
      .then((saved) => {
        setVendors((prev) => [toVendor(saved), ...prev])
      })
      .catch((err) => {
        alert("Failed to add vendor: " + err.message)
      })
    setForm(emptyForm)
    setOpen(false)
  }

  const totalCost = vendors.reduce((sum, v) => sum + v.cost, 0)

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-serif text-lg">Vendors</CardTitle>
          <CardDescription>
            {vendors.length} vendors &middot; {formatCurrency(totalCost)} total
            spend
          </CardDescription>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus data-icon="inline-start" />
          Add Vendor
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="pl-4 whitespace-nowrap">Vendor Name</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Contact</TableHead>
                <TableHead className="text-right whitespace-nowrap">Fee</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="pr-4 text-right whitespace-nowrap">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="pl-4 font-medium text-foreground">
                    {v.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.category}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.contact}
                  </TableCell>
                  <TableCell>
                    <VendorStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right font-medium tabular-nums text-foreground">
                    {formatCurrency(v.cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">
                Add a Vendor
              </DialogTitle>
              <DialogDescription>
                Add a new vendor to your wedding roster.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="my-5 gap-4">
              <Field>
                <FieldLabel htmlFor="vendor-name">Vendor Name</FieldLabel>
                <Input
                  id="vendor-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Aurelia Studios"
                  required
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="vendor-category">Category</FieldLabel>
                  <select
                    id="vendor-category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value as VendorCategory,
                      }))
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {vendorCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="vendor-status">Booking Status</FieldLabel>
                  <select
                    id="vendor-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as VendorStatus,
                      }))
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="vendor-contact">Contact Info</FieldLabel>
                <Input
                  id="vendor-contact"
                  value={form.contact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contact: e.target.value }))
                  }
                  placeholder="email@vendor.com"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="vendor-cost">Total Cost (USD)</FieldLabel>
                <Input
                  id="vendor-cost"
                  type="number"
                  min="0"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cost: e.target.value }))
                  }
                  placeholder="0"
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Vendor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
