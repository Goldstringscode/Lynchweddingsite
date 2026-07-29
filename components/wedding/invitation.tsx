"use client"

import { Clock, MapPin, Calendar, Shirt } from "lucide-react"
import { wedding } from "@/lib/wedding-data"
import { CornerAccents, Divider, Reveal } from "./decor"

function DetailRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Clock
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="mt-1 size-5 shrink-0 text-gold" aria-hidden="true" />
      <div>
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-serif text-lg text-foreground">{value}</p>
        {sub ? (
          <p className="font-sans text-sm text-muted-foreground">{sub}</p>
        ) : null}
      </div>
    </div>
  )
}

export function Invitation() {
  return (
    <section id="details" className="bg-background px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold">
            You are cordially invited
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            The Celebration
          </h2>
          <Divider className="mt-6" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-14 overflow-hidden border border-primary/40 bg-card p-4 shadow-xl sm:p-6">
            <CornerAccents />
            <div className="border border-gold/40 p-6 sm:p-10">
              <div className="grid items-center gap-10 md:grid-cols-2">
                {/* Framed photo */}
                <div className="relative mx-auto w-full max-w-sm">
                  <div className="absolute -inset-2 border border-gold/50" />
                  <img
                    src="/images/couple-portrait.png"
                    alt={`Portrait of ${wedding.brideFirst} and ${wedding.groomFirst}`}
                    className="relative aspect-[4/5] w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div>
                  <p className="text-center font-serif text-2xl text-foreground md:text-left">
                    {wedding.brideName}
                    <span className="mx-2 text-gold">&amp;</span>
                    {wedding.groomName}
                  </p>
                  <p className="mt-2 text-center font-sans text-sm leading-relaxed text-muted-foreground md:text-left">
                    request the honour of your presence as they exchange vows
                    and begin their life together.
                  </p>

                  <div className="mt-8 space-y-6">
                    <DetailRow
                      icon={Calendar}
                      label="Date"
                      value={wedding.date}
                    />
                    <DetailRow
                      icon={Clock}
                      label="Time"
                      value={wedding.time}
                    />
                    <DetailRow
                      icon={MapPin}
                      label="Ceremony"
                      value={wedding.ceremonyVenue}
                      sub={wedding.ceremonyAddress}
                    />
                    <DetailRow
                      icon={MapPin}
                      label="Reception"
                      value={wedding.receptionVenue}
                      sub={wedding.receptionAddress}
                    />
                    <DetailRow
                      icon={Shirt}
                      label="Dress Code"
                      value={wedding.dressCode}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
