"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Clock, MapPin } from "lucide-react"
import { itinerary, type TimelineEvent } from "@/lib/wedding-data"
import { Divider, Reveal } from "./decor"

function EventPopover({ event }: { event: TimelineEvent }) {
  return (
    <motion.div
      role="dialog"
      aria-label={`${event.title} details`}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-0 right-0 top-0 z-30 mx-auto w-full max-w-[300px] origin-top md:left-auto md:right-full md:mr-6 md:w-72 md:origin-top-right"
    >
      <div className="relative rounded-sm border border-gold/60 bg-background p-5 text-left text-foreground shadow-2xl">
        {/* top gold rule */}
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gold" aria-hidden="true" />
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-primary">
          {event.time}
        </p>
        <h4 className="mt-1.5 font-serif text-xl text-foreground">{event.title}</h4>

        <dl className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
            <span className="font-sans">{event.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
            <span className="font-sans">{event.location}</span>
          </div>
        </dl>

        <div className="my-3 h-px w-full bg-border" aria-hidden="true" />
        <p className="font-sans text-sm leading-relaxed text-muted-foreground">
          {event.details}
        </p>
      </div>
    </motion.div>
  )
}

export function Itinerary() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section
      id="itinerary"
      className="bg-primary px-6 py-24 text-primary-foreground md:py-32"
    >
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold">
            The Wedding Day
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium md:text-5xl">
            Order of Events
          </h2>
          <Divider className="mt-6" />
          <p className="mt-6 font-sans text-sm leading-relaxed text-primary-foreground/60">
            <span className="hidden md:inline">Hover over each moment to reveal the details.</span>
            <span className="md:hidden">Click on each moment to reveal the details.</span>
          </p>
        </Reveal>

        <ol className="relative mt-16 pl-4">
          {/* vertical rail */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-[calc(1rem+1.5rem)] top-6 w-px -translate-x-1/2 bg-gold/40"
          />

          {itinerary.map((event, i) => {
            const Icon = event.icon
            const isActive = active === i
            return (
              <li key={event.title} className="relative mb-10 last:mb-0">
                <Reveal delay={i * 0.05}>
                  <div
                    className="group relative flex items-start gap-6"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive((prev) => (prev === i ? null : prev))}
                  >
                    {/* Icon node on the rail — focusable trigger for keyboard/touch */}
                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-label={`Show details for ${event.title}`}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive((prev) => (prev === i ? null : prev))}
                      onClick={() => setActive((prev) => (prev === i ? null : i))}
                      className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-gold bg-primary outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-gold group-hover:scale-110"
                    >
                      <Icon className="size-5 text-gold" aria-hidden="true" />
                    </button>

                    <div className="pt-1.5">
                      <p className="font-sans text-sm uppercase tracking-[0.2em] text-gold">
                        {event.time}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl transition-colors duration-300 group-hover:text-gold">
                        {event.title}
                      </h3>
                      <p className="mt-1 font-sans text-sm leading-relaxed text-primary-foreground/70">
                        {event.description}
                      </p>
                    </div>

                    <AnimatePresence>
                      {isActive && <EventPopover event={event} />}
                    </AnimatePresence>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
