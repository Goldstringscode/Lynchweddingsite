"use client"

import { Hotel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Divider, Reveal } from "./decor"

const HOTEL_URL = "https://www.hilton.com/en/hampton/" // ← update when room block link is ready

export function Accommodations() {
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
            the venue. Book by August 26, 2026 to secure the special group rate.
          </p>

          <Button
            size="lg"
            nativeButton={false}
            className="mt-10 h-auto min-h-12 w-full max-w-xs rounded-none bg-primary px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-10 sm:text-sm"
            render={
              <a
                href={HOTEL_URL}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Hotel className="size-4 shrink-0" aria-hidden="true" />
            <span>Book Hotel Room</span>
          </Button>

          <p className="mt-6 font-sans text-xs text-muted-foreground">
            Hampton Inn &amp; Suites &bull; Indio, CA
          </p>
        </Reveal>
      </div>
    </section>
  )
}