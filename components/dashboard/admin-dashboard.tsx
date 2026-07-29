"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { DashboardPage } from "./pages/dashboard-page"
import { RsvpsPage } from "./pages/rsvps-page"
import { VendorsPage } from "./pages/vendors-page"
import { InvoicesPage } from "./pages/invoices-page"
import { SettingsPage } from "./pages/settings-page"
import type { PageKey } from "./nav"

const pageMeta: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "A refined overview of your celebration.",
  },
  rsvps: {
    title: "RSVPs & Guests",
    subtitle: "Track responses and manage the guest list.",
  },
  vendors: {
    title: "Vendors",
    subtitle: "Coordinate every partner for the big day.",
  },
  invoices: {
    title: "Invoices",
    subtitle: "Keep payments organized and on time.",
  },
  settings: {
    title: "Settings",
    subtitle: "Tailor the concierge experience.",
  },
}

export function AdminDashboard() {
  const [page, setPage] = useState<PageKey>("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)

  const meta = pageMeta[page]

  function handleNavigate(next: PageKey) {
    setPage(next)
    setMobileOpen(false)
  }

  return (
    <div className="min-h-svh bg-background">
      <Sidebar
        current={page}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-8">
          {/* Mobile page title */}
          <div className="mb-5 lg:hidden">
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              {meta.title}
            </h1>
            <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>

          <div
            key={page}
            className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
          >
            {page === "dashboard" && <DashboardPage />}
            {page === "rsvps" && <RsvpsPage />}
            {page === "vendors" && <VendorsPage />}
            {page === "invoices" && <InvoicesPage />}
            {page === "settings" && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  )
}
