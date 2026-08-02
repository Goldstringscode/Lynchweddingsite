"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Search, Bell, User, LogOut, Settings2, CalendarCheck, PartyPopper, MessageSquare, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface HeaderProps {
  title: string
  subtitle: string
  onOpenMobile: () => void
  onNavigate?: (page: string) => void
}

export function Header({ title, subtitle, onOpenMobile, onNavigate }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [notifOpen])

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && searchQuery.trim()) {
      onNavigate?.("rsvps")
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('[data-rsvp-search]')
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, "value"
          )?.set
          nativeInputValueSetter?.call(input, searchQuery.trim())
          input.dispatchEvent(new Event("input", { bubbles: true }))
        }
      }, 100)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
      <button
        type="button"
        onClick={onOpenMobile}
        className="rounded-md p-1.5 text-foreground transition-colors hover:bg-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden min-w-0 flex-col lg:flex">
        <h1 className="truncate font-serif text-lg font-semibold text-foreground">
          {title}
        </h1>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative ml-auto hidden w-full max-w-xs sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search guests, vendors..."
          className="h-9 pl-8"
          aria-label="Global search"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:ml-2">
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="size-[18px]" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-gold ring-2 ring-background" />
          </Button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10">
              <div className="flex items-center justify-between border-b border-border p-4">
                <p className="font-serif text-sm font-medium text-foreground">Notifications</p>
                <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <PartyPopper className="size-8 text-gold" />
                <p className="text-sm text-muted-foreground">No new notifications</p>
                <p className="text-xs text-muted-foreground/60">You're all caught up!</p>
              </div>
            </div>
          )}
        </div>

        <Button
                  variant="ghost"
                  className="h-10 gap-2 px-1.5 sm:pr-2.5"
                  aria-label="Account menu"
                  onClick={() => { onNavigate?.("settings"); router.push("/admin") }}
                >
                  <Avatar className="size-8">
                    <AvatarImage src="/admin-avatar.png" alt="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      NJ
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-medium text-foreground">
                      Nikkita &amp; Justin
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Wedding Concierge
                    </span>
                  </span>
                </Button>
      </div>
    </header>
  )
}