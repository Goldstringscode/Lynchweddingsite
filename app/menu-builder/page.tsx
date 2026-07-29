"use client"

import { useState } from "react"
import { MenuBuilderTab } from "@/components/menu-builder/menu-builder-tab"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UtensilsCrossed, Lock, Heart, Sparkles } from "lucide-react"

const WEDDING_CODE = "JNLynch26"

export default function MenuBuilderStandalone() {
  const [authenticated, setAuthenticated] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === WEDDING_CODE) {
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-svh bg-[#fafafa] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Decorative */}
          <div className="space-y-3">
            <div className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-gold/20 to-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="size-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Build Your Menu
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Nikkita &amp; Justin invite you to curate the perfect wedding dinner.
              Enter your code below to begin.
            </p>
          </div>

          {/* Lock decorative */}
          <div className="flex justify-center gap-1.5">
            {[Heart, Sparkles, Heart].map((Icon, i) => (
              <div key={i} className={cn(
                "size-8 rounded-full flex items-center justify-center",
                i === 1 ? "bg-primary/10" : "bg-muted/30"
              )}>
                <Icon className={cn(
                  "size-3.5",
                  i === 1 ? "text-primary" : "text-muted-foreground/40"
                )} />
              </div>
            ))}
          </div>

          {/* Code form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false) }}
                placeholder="Enter wedding code"
                className="pl-10 h-11 text-center text-sm tracking-widest"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-destructive text-center">
                Invalid code. Please try again.
              </p>
            )}
            <Button type="submit" className="w-full h-11 gap-2" disabled={!code.trim()}>
              <UtensilsCrossed className="size-4" />
              Enter Menu Builder
            </Button>
          </form>

          <p className="text-[10px] text-muted-foreground">
            This portal is private. If you do not have the code, please contact the wedding planner.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#fafafa]">
      {/* Couple header */}
      <div className="border-b border-border/40 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="size-4 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-medium leading-tight">
                Nikkita &amp; Justin
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Wedding Menu Builder
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            September 14, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="rounded-lg bg-white/50 p-1 sm:p-2">
          <MenuBuilderTab />
        </div>
      </div>
    </div>
  )
}