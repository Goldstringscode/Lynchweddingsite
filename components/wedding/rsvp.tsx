"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import QRCode from "react-qr-code"
import { Heart, Printer, Ticket as TicketIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { wedding } from "@/lib/wedding-data"
import { Divider, Reveal } from "./decor"

type Attendance = "accept" | "decline"

type RsvpData = {
  name: string
  email: string
  guests: string
  dietary: string
  attendance: Attendance
  code: string
}

function makeAccessCode(name: string) {
  const last = name.trim().split(/\s+/).pop() ?? "GUEST"
  const surname = last.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "GUEST"
  const digits = Math.floor(100000 + Math.random() * 900000)
  return `WED-${surname}-${digits}`
}

export function Rsvp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [guests, setGuests] = useState("1")
  const [dietary, setDietary] = useState("")
  const [attendance, setAttendance] = useState<Attendance>("accept")
  const [submitted, setSubmitted] = useState<RsvpData | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const accessCode = makeAccessCode(name)
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: "", guest_count: parseInt(guests), is_attending: attendance === "accept" }),
      })
      if (res.ok) {
        const data = await res.json()
        setSubmitted({ name, email, guests, dietary, attendance, code: data.access_code || accessCode })
      } else {
        setSubmitted({ name, email, guests, dietary, attendance, code: accessCode })
      }
    } catch {
      setSubmitted({ name, email, guests, dietary, attendance, code: accessCode })
    }
    setTimeout(() => {
      document
        .getElementById("rsvp-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  function reset() {
    setSubmitted(null)
    setName("")
    setEmail("")
    setGuests("1")
    setDietary("")
    setAttendance("accept")
  }

  return (
    <section id="rsvp" className="bg-secondary px-6 py-24 md:py-32">
      <div className="mx-auto max-w-xl">
        <Reveal className="text-center">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold">
            Kindly Respond
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            RSVP
          </h2>
          <Divider className="mt-6" />
          <p className="mx-auto mt-6 max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
            Please respond by August 1st, 2026. We can&apos;t wait to celebrate
            with you.
          </p>
        </Reveal>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="mt-12 space-y-6 border border-border bg-card p-6 shadow-sm sm:p-10"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="uppercase tracking-wider text-xs">
                  Full Name
                </Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amelia Rose"
                  className="rounded-none border-input focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="uppercase tracking-wider text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-none border-input focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="uppercase tracking-wider text-xs">
                  Number of Guests
                </Label>
                <select
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="flex h-10 w-full rounded-none border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {["1", "2", "3", "4", "5"].map((n) => (
                    <option key={n} value={n}>
                      {n} {Number(n) === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dietary"
                  className="uppercase tracking-wider text-xs"
                >
                  Dietary Restrictions
                </Label>
                <Textarea
                  id="dietary"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="Let us know of any allergies or preferences."
                  className="min-h-24 rounded-none border-input focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-3">
                <Label className="uppercase tracking-wider text-xs">
                  Will you attend?
                </Label>
                <RadioGroup
                  value={attendance}
                  onValueChange={(v) => setAttendance(v as Attendance)}
                  className="grid grid-cols-2 gap-3"
                >
                  {[
                    { value: "accept", label: "Joyfully Accepts" },
                    { value: "decline", label: "Regretfully Declines" },
                  ].map((opt) => (
                    <Label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors ${
                        attendance === opt.value
                          ? "border-primary bg-accent"
                          : "border-input hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={opt.value} />
                      <span className="font-sans text-sm text-foreground">
                        {opt.label}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-none bg-primary font-sans text-sm uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
              >
                Submit RSVP
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="result"
              id="rsvp-result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12"
            >
              {submitted.attendance === "accept" ? (
                <Ticket data={submitted} onReset={reset} />
              ) : (
                <div className="border border-border bg-card p-10 text-center shadow-sm">
                  <Heart className="mx-auto size-8 text-gold" aria-hidden="true" />
                  <h3 className="mt-4 font-serif text-2xl text-foreground">
                    We&apos;ll miss you, {submitted.name.split(" ")[0]}
                  </h3>
                  <p className="mt-2 font-sans text-sm text-muted-foreground">
                    Thank you for letting us know. You&apos;ll be in our hearts
                    on our special day.
                  </p>
                  <Button
                    variant="outline"
                    onClick={reset}
                    className="mt-6 rounded-none border-primary text-primary hover:bg-accent"
                  >
                    Edit Response
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Ticket({ data, onReset }: { data: RsvpData; onReset: () => void }) {
  const guestCount = Number(data.guests)
  const extra = guestCount - 1

  return (
    <div>
      <div
        id="printable-ticket"
        className="relative overflow-hidden border-2 border-primary bg-card shadow-xl"
      >
        {/* Header band */}
        <div className="bg-primary px-8 py-6 text-center text-primary-foreground">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-gold">
            Wedding Access Ticket
          </p>
          <p className="mt-2 font-serif text-3xl">{wedding.monogram}</p>
        </div>

        {/* Notch separators */}
        <div className="relative">
          <span className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-secondary" />
          <span className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-secondary" />

          <div className="grid gap-8 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="space-y-5">
              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                  Admit
                </p>
                <p className="mt-1 font-serif text-2xl text-foreground">
                  {data.name}
                  {extra > 0 ? (
                    <span className="text-gold">
                      {" "}
                      + {extra} {extra === 1 ? "Guest" : "Guests"}
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                    Date
                  </p>
                  <p className="mt-1 font-serif text-base text-foreground">
                    {wedding.dateShort}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                    Time
                  </p>
                  <p className="mt-1 font-serif text-base text-foreground">
                    4:30 PM
                  </p>
                </div>
              </div>

              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                  Venue
                </p>
                <p className="mt-1 font-serif text-base text-foreground">
                  {wedding.ceremonyVenue}
                </p>
              </div>

              <div>
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                  Access Code
                </p>
                <p className="mt-1 font-mono text-lg tracking-wider text-primary">
                  {data.code}
                </p>
              </div>
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center gap-3 sm:border-l sm:border-dashed sm:border-border sm:pl-8">
              <div className="rounded-md border border-border bg-white p-3">
                <QRCode
                  value={data.code}
                  size={128}
                  fgColor="#1a1a1a"
                  bgColor="#ffffff"
                />
              </div>
              <p className="text-center font-sans text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                Scan at entrance
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-border px-8 py-4 text-center">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-gold">
            {wedding.hashtag}
          </p>
        </div>
      </div>

      {/* Actions (hidden when printing) */}
      <div className="no-print mt-8 flex flex-col items-center gap-4">
        <p className="flex items-center gap-2 text-center font-serif text-xl text-foreground">
          <TicketIcon className="size-5 text-gold" aria-hidden="true" />
          You&apos;re on the list, {data.name.split(" ")[0]}!
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => window.print()}
            size="lg"
            className="h-12 rounded-none bg-primary px-8 font-sans text-sm uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
          >
            <Printer className="size-4" aria-hidden="true" />
            Download / Print Ticket
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            className="h-12 rounded-none border-primary px-8 font-sans text-sm uppercase tracking-[0.2em] text-primary hover:bg-accent"
          >
            Edit Response
          </Button>
        </div>
      </div>
    </div>
  )
}
