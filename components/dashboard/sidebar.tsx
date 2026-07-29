"use client"

import { cn } from "@/lib/utils"
import { navItems, type PageKey } from "./nav"
import { Gem, X } from "lucide-react"

interface SidebarProps {
  current: PageKey
  onNavigate: (page: PageKey) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  current,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Gem className="size-4 text-gold" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-lg font-semibold tracking-wide">
                The Lynch&#39;s
              </p>
              <p className="text-[11px] tracking-widest text-sidebar-foreground/50 uppercase">
                Concierge
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-4">
          <p className="px-3 pb-2 text-[11px] font-medium tracking-widest text-sidebar-foreground/40 uppercase">
            Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = current === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] transition-colors",
                    active
                      ? "text-gold"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                  )}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer card */}
        <div className="p-4">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-4">
            <p className="font-serif text-sm text-sidebar-foreground">
              Nikkita &amp; Justin
            </p>
            <p className="mt-0.5 text-xs text-sidebar-foreground/50">
              September 14, 2026
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border">
              <div className="h-full w-3/4 rounded-full bg-gold" />
            </div>
            <p className="mt-2 text-[11px] text-sidebar-foreground/50">
              75% planning complete
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
