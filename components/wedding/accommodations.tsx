"use client"

import { useState, useCallback } from "react"
import { Hotel, Home, Phone, Wifi, Car, Dumbbell, Briefcase, Waves, Coffee, X } from "lucide-react"
import { Divider, Reveal } from "./decor"

const HOTEL_URL = "https://www.hilton.com/en/hampton/" // ← update when room block link is ready
const AIRBNB_URL = "https://www.airbnb.com/wishlists/viewonly/fd7e382a-8210-4183-a2ce-dc8156199242?s=67&unique_share_id=6d7da461-8150-424c-a46c-74d49a04456c"

const AMENITIES = [
  { icon: Coffee,      label: "Hot Breakfast" },
  { icon: Wifi,        label: "Free Wi‑Fi" },
  { icon: Car,          label: "Free Parking" },
  { icon: Dumbbell,     label: "Fitness Center" },
  { icon: Briefcase,    label: "Business Center" },
  { icon: Waves,        label: "Outdoor Pool" },
]

export function Accommodations() {
  const [modalOpen, setModalOpen] = useState(false)

  const close = useCallback(() => setModalOpen(false), [])

  return (
    <section id="accommodations" className="bg-secondary px-6 py-24 md:py-32">
      <div className="mx-auto max-w-xl text-center">
        <Reveal>
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/60">
            <Hotel className="size-7 text-gold" aria-hidden="true" />
          </div>

          <p className="mt-8 font-sans text-xs uppercase tracking-[0.4em] text-gold">
            Rest &amp; Refresh
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            Accommodations
          </h2>
          <Divider className="mt-6" />

          <p className="mx-auto mt-8 max-w-md text-pretty font-sans leading-relaxed text-muted-foreground">
            A room block has been reserved at the Hampton Inn just minutes from
            the venue. Book by August 30, 2026 to secure the special group rate.
          </p>

          {/* ── Hotel button with hover modal ── */}
          <div className="relative mt-10 inline-block">
            <button
              onMouseEnter={() => setModalOpen(true)}
              onMouseLeave={() => setModalOpen(false)}
              onClick={() => setModalOpen(!modalOpen)}
              className="inline-flex h-auto min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-none bg-primary px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-10 sm:text-sm"
              aria-haspopup="dialog"
              aria-expanded={modalOpen}
            >
              <Hotel className="size-4 shrink-0" aria-hidden="true" />
              <span>Book Hotel Room</span>
            </button>

            {/* ── Modal ── */}
            {modalOpen && (
              <div
                onMouseEnter={() => setModalOpen(true)}
                onMouseLeave={() => setModalOpen(false)}
                className="absolute left-1/2 top-full z-50 mt-3 w-[22rem] max-w-[calc(100vw-3rem)] -translate-x-1/2 border border-gold/30 bg-card shadow-2xl sm:w-[26rem]"
              >
                {/* Close button (mobile tap-to-dismiss) */}
                <button
                  onClick={close}
                  className="absolute right-3 top-3 flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground sm:hidden"
                  aria-label="Close hotel details"
                >
                  <X className="size-4" />
                </button>

                <div className="border-l-4 border-gold p-6">
                  {/* Header */}
                  <div className="text-center">
                    <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-gold">
                      Room Block
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-medium text-foreground">
                      Hampton Inn &amp; Suites
                    </h3>
                    <p className="mt-0.5 font-sans text-xs text-muted-foreground">
                      42261 Spectrum Street, Indio, CA 92203
                    </p>
                  </div>

                  {/* Key details */}
                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-center">
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Dates</p>
                      <p className="mt-0.5 font-serif text-sm text-foreground">Sep 25 – 27, 2026</p>
                    </div>
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Rate</p>
                      <p className="mt-0.5 font-serif text-sm text-foreground">$125 / night</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Room Types</p>
                      <p className="mt-0.5 font-serif text-sm text-foreground">One King &bull; Two Queens</p>
                    </div>
                  </div>

                  {/* Phone CTA */}
                  <div className="mt-4 text-center">
                    <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      Reserve by Phone
                    </p>
                    <a
                      href="tel:+17602271900"
                      className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm tracking-wide text-primary transition-colors hover:text-primary/80"
                    >
                      <Phone className="size-3.5 shrink-0" />
                      760-227-1900
                    </a>
                    <p className="mt-1 font-sans text-[0.6rem] text-muted-foreground">
                      Mention &ldquo;Rodgers/Lynch Wedding Block&rdquo;
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-center font-sans text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
                      Complimentary Amenities
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-x-1 gap-y-2">
                      {AMENITIES.map((a) => (
                        <div key={a.label} className="flex flex-col items-center gap-1 text-center">
                          <a.icon className="size-3.5 text-gold/80" aria-hidden="true" />
                          <span className="font-sans text-[0.6rem] leading-tight text-muted-foreground">{a.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Online booking coming soon */}
                  <p className="mt-4 text-center font-sans text-[0.6rem] italic text-muted-foreground/70">
                    Online booking link coming soon
                  </p>

                  {/* Deadline reminder */}
                  <p className="mt-3 text-center font-sans text-[0.6rem] font-medium uppercase tracking-[0.15em] text-gold">
                    Book by August 30, 2026
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AirBnB button */}
          <a
            href={AIRBNB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-auto min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-none border border-primary bg-transparent px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-accent sm:w-auto sm:px-10 sm:text-sm"
          >
            <Home className="size-4 shrink-0" aria-hidden="true" />
            <span>Book AirBnB</span>
          </a>

          <p className="mt-6 font-sans text-xs text-muted-foreground">
            Hampton Inn &amp; Suites &bull; Indio, CA
          </p>
        </Reveal>
      </div>
    </section>
  )
}