"use client"

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
import { Menu, Search, Bell, User, LogOut, Settings2 } from "lucide-react"

interface HeaderProps {
  title: string
  subtitle: string
  onOpenMobile: () => void
}

export function Header({ title, subtitle, onOpenMobile }: HeaderProps) {
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
          placeholder="Search guests, vendors..."
          className="h-9 pl-8"
          aria-label="Global search"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:ml-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-gold ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-10 gap-2 px-1.5 sm:pr-2.5"
                aria-label="Account menu"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarImage src="/admin-avatar.png" alt="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                EA
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium text-foreground">
                Elena Ashford
              </span>
              <span className="block text-xs text-muted-foreground">
                Lead Planner
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings2 />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
