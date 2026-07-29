"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { InvoiceStatusBadge } from "../status-badge"
import { formatCurrency, formatDate, type Invoice } from "@/lib/data"
import { Download } from "lucide-react"

function toInvoice(i: any): Invoice {
  const today = new Date()
  const due = new Date(i.due_date)
  const status = i.status === "paid" ? "Paid" : due < today ? "Overdue" : "Unpaid"
  return { id: i.id, number: `INV-${i.id.slice(0, 4).toUpperCase()}`, vendor: i.vendor, amount: Number(i.amount), dueDate: i.due_date?.slice(0, 10) || "", status }
}

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    fetch("/api/invoices")
      .then(r => r.json())
      .then(data => setInvoices(data.map(toInvoice)))
  }, [])

  const outstanding = invoices
    .filter((i) => i.status !== "Paid")
    .reduce((sum, i) => sum + i.amount, 0)

  function handleDownload(invoice: Invoice) {
    // Front-end only placeholder. Replace with a real download endpoint later.
    console.log("[v0] Download invoice:", invoice.number)
    window.alert(`Downloading ${invoice.number} for ${invoice.vendor}…`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Invoices</CardTitle>
        <CardDescription>
          {formatCurrency(outstanding)} outstanding across{" "}
          {invoices.filter((i) => i.status !== "Paid").length} invoices
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="pl-4 whitespace-nowrap">Invoice #</TableHead>
                <TableHead className="whitespace-nowrap">Vendor Name</TableHead>
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Due Date</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="pr-4 text-right whitespace-nowrap">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-4 font-medium tabular-nums text-foreground">
                    {inv.number}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {inv.vendor}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-foreground">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(inv)}
                    >
                      <Download data-icon="inline-start" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
