"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Rocket, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LaunchItem {
  id: string
  category: string
  task: string
  detail: string
  critical?: boolean
}

const LAUNCH_ITEMS: LaunchItem[] = [
  // Critical
  { id: "guestlist", category: "Critical", critical: true, task: "Verify guest list is clean", detail: "Seed/example guests deleted. Confirm only real guests in RSVPs tab." },
  { id: "registry", category: "Critical", critical: true, task: "Create Honeyfund registry & update link", detail: "Replace placeholder registryUrl in lib/wedding-data.ts with the real registry page." },
  { id: "a2p", category: "Critical", critical: true, task: "A2P campaign approval (SMS)", detail: "Twilio carrier review IN_PROGRESS since Aug 3. Daily 9 AM cron watches; texts blocked until APPROVED." },
  // Photo sharing
  { id: "album", category: "Photo Sharing", task: "Create WedUploader album", detail: "One-time ~$39 at weduploader.com." },
  { id: "shareurl", category: "Photo Sharing", task: "Set NEXT_PUBLIC_SHARE_URL on Vercel", detail: "Point at the real album link once created." },
  { id: "qrtest", category: "Photo Sharing", task: "Test QR end-to-end on phone", detail: "Scan houseoflynch.app/share-qr.svg → should open the album." },
  { id: "qrprint", category: "Photo Sharing", task: "Confirm QR placement in printed program", detail: "SVG in public/share-qr.svg; live on program page." },
  { id: "drive", category: "Photo Sharing", task: "Google Drive storage headroom", detail: "15 GB free; upgrade to 100 GB (~$2/mo) if needed before the wedding." },
  // Content
  { id: "date", category: "Content", task: "Date/time correct", detail: "Saturday, September 26, 2026 · 4:00 PM" },
  { id: "venue", category: "Content", task: "Venue & address correct", detail: "Four Seasons at Terra Lago, 85-370 Terra Lago Pkwy, Indio, CA 92203" },
  { id: "dress", category: "Content", task: "Dress code correct", detail: "\"Black Tie Event | An Evening Draped in Black\"" },
  { id: "hashtag", category: "Content", task: "Hashtag correct", detail: "#HouseofJusNik (updated)" },
  { id: "itinerary", category: "Content", task: "Itinerary times verified", detail: "Ceremony 4:00 · Cocktail 5:00 · Reception 5:45 · First Dance 6:30 · Dinner 7:00 · Dancing 7:30–midnight" },
  { id: "rsvpform", category: "Content", task: "RSVP form works end-to-end", detail: "Meal choice, dietary field, guest count, duplicate-email guard." },
  { id: "privacy", category: "Content", task: "Privacy & Terms pages return 200", detail: "Required for Twilio A2P compliance." },
  // SMS
  { id: "smstest", category: "SMS", task: "Test SMS to 479-530-7328 after approval", detail: "Watch for delivered badge in SMS tab." },
  { id: "templates", category: "SMS", task: "Review 3 SMS templates", detail: "Invitation / Reminder / Thank You — dates, venue, links correct." },
  { id: "thankyou", category: "SMS", task: "Confirm thank-you tracker works", detail: "Guests marked correctly in SMS tab." },
  // Security
  { id: "security1", category: "Security", critical: true, task: "Rotate leaked Supabase service-role key", detail: "Key was committed to repo history. Rotate in Supabase, update Vercel env, scrub history." },
  { id: "security2", category: "Security", critical: true, task: "Authenticate all admin API routes", detail: "Gate /api/rsvp, /api/sms/*, /api/stats, /api/invoices, /api/vendors, etc." },
  { id: "security3", category: "Security", critical: true, task: "Secure admin session cookie", detail: "No more static 'authenticated' value — real signed/random token." },
  { id: "security4", category: "Security", task: "Admin password strong", detail: "Not default, in env only." },
  { id: "security5", category: "Security", task: "Admin renders light mode", detail: "Verify all admin tabs." },
  // Money & services
  { id: "twilio", category: "Money & Services", task: "Twilio funded", detail: "Balance check via status script / SMS tab." },
  { id: "domain", category: "Money & Services", task: "Domain renewal (houseoflynch.app)", detail: "This is the QR's never-expires guarantee." },
  { id: "vercel", category: "Money & Services", task: "Vercel plan adequate", detail: "Build limits OK for launch week." },
  // Housekeeping
  { id: "mobile", category: "Housekeeping", task: "Final mobile test", detail: "Home, RSVP, program, share pages on an actual phone." },
  { id: "build", category: "Housekeeping", task: "Final npm run build + deploy", detail: "Green build, deployed, verified live." },
]

const STORAGE_KEY = "launch-checklist-state"

export function LaunchChecklistPage() {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDone(new Set(JSON.parse(raw)))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]))
    } catch {}
  }, [done, loaded])

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const categories = [...new Set(LAUNCH_ITEMS.map((i) => i.category))]
  const total = LAUNCH_ITEMS.length
  const doneCount = LAUNCH_ITEMS.filter((i) => done.has(i.id)).length
  const pct = Math.round((doneCount / total) * 100)
  const criticalTotal = LAUNCH_ITEMS.filter((i) => i.critical).length
  const criticalDone = LAUNCH_ITEMS.filter((i) => i.critical && done.has(i.id)).length

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Rocket className="size-5 text-primary" />
                Launch Readiness
              </CardTitle>
              <CardDescription>
                {doneCount} of {total} tasks complete
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={criticalDone === criticalTotal ? "default" : "destructive"}
                className="px-3 py-1 text-sm"
              >
                {criticalDone}/{criticalTotal} critical
              </Badge>
              <Badge variant={pct >= 80 ? "default" : "secondary"} className="px-3 py-1 text-sm">
                {pct}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {criticalDone < criticalTotal && (
            <p className="mt-2 text-xs text-destructive">
              ⚠️ {criticalTotal - criticalDone} critical item{criticalTotal - criticalDone > 1 ? "s" : ""} remaining — do not launch until these are done.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Groups */}
      {categories.map((category) => {
        const items = LAUNCH_ITEMS.filter((i) => i.category === category)
        const catDone = items.filter((i) => done.has(i.id)).length
        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-base">{category}</CardTitle>
                <CardDescription>
                  {catDone}/{items.length}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border/50">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 py-3 transition-colors",
                      done.has(item.id) && "opacity-60"
                    )}
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={done.has(item.id)}
                        onCheckedChange={() => toggle(item.id)}
                        className={cn("size-5", done.has(item.id) && "border-primary")}
                        aria-label={item.task}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            done.has(item.id) && "line-through text-muted-foreground"
                          )}
                        >
                          {item.task}
                        </p>
                        {item.critical && (
                          <Badge variant="destructive" className="px-2 py-0 text-[10px]">
                            Critical
                          </Badge>
                        )}
                      </div>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Reset */}
      <div className="flex justify-center pb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            if (confirm("Reset all launch checklist items to incomplete?")) setDone(new Set())
          }}
        >
          <RotateCcw className="mr-2 size-3" />
          Reset checklist
        </Button>
      </div>
    </div>
  )
}
