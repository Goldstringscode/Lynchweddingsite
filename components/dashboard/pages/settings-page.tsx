"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Bell, Moon, CalendarHeart } from "lucide-react"
import type { LucideIcon } from "lucide-react"

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-[18px]" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [weddingDate, setWeddingDate] = useState("2026-09-26")
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/wedding-settings")
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          setEmailNotifs(data.email_notifications ?? true)
          setWeddingDate(data.wedding_date || "2026-09-26")
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/wedding-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_notifications: emailNotifs, wedding_date: weddingDate }),
      })
      if (res.ok) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings.")
      }
    } catch {
      alert("Failed to save settings.")
    }
    setSaving(false)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Preferences</CardTitle>
          <CardDescription>
            Manage how the concierge dashboard behaves.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ToggleRow
            icon={Bell}
            title="Email Notifications"
            description="Get notified about new RSVPs and vendor updates."
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Separator />
          <ToggleRow
            icon={Moon}
            title="Dark Mode"
            description="Use a darker theme for low-light planning sessions."
            checked={darkMode}
            onChange={setDarkMode}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Event Details</CardTitle>
          <CardDescription>
            Core information about the celebration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="wedding-date">
                <CalendarHeart className="size-4 text-gold" />
                Wedding Date
              </FieldLabel>
              <Input
                id="wedding-date"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="h-9"
              />
            </Field>
            <div>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
