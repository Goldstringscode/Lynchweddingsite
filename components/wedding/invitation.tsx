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
        {value.includes(' | ') ? (
            <>
              <p className="mt-1 font-serif text-lg text-foreground">{value.split(' | ')[0]}</p>
              <p className="font-serif text-lg text-foreground text-center">{value.split(' | ')[1]}</p>
            </>
          ) : (
            <p className="mt-1 font-serif text-lg text-foreground">{value}</p>
          )}
        {sub ? (
          <p className="font-sans text-sm text-muted-foreground">{sub}</p>
        ) : null}
      </div>
    </div>
  )
}

export function Invitation() {
  return (
    <section id="details" className="bg-background px-4 py-20 sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold sm:text-xs sm:tracking-[0.4em]">
            You are cordially invited
          </p>
          <h2 className="mt-3 text-balance font-serif text-3xl font-medium text-foreground sm:text-4xl md:text-5xl">
            The Celebration
          </h2>
          <Divider className="mt-5 sm:mt-6" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-10 sm:mt-14 overflow-hidden border border-primary/30 bg-card p-3 shadow-xl sm:p-6">
            <CornerAccents />
            <div className="border border-gold/30 p-4 sm:p-10">
              <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
                {/* Framed photo */}
                <div className="relative mx-auto w-full max-w-[260px] sm:max-w-sm">
                  <div className="absolute -inset-1.5 border border-gold/50 sm:-inset-2" />
                  <img
                    src="/images/couple-portrait.png"
                    alt={`Portrait of ${wedding.brideFirst} and ${wedding.groomFirst}`}
                    className="relative aspect-[3/4] w-full object-cover sm:aspect-[4/5]"
                  />
                </div>

                {/* Details */}
                <div>
                  <p className="text-center font-serif text-xl text-foreground sm:text-2xl md:text-left">
                    {wedding.brideName}
                    <span className="mx-2 text-gold">&amp;</span>
                    {wedding.groomName}
                  </p>
                  <p className="mt-2 text-center font-sans text-sm leading-relaxed text-muted-foreground md:text-left">
                    request the honour of your presence as they exchange vows
                    and begin their life together.
                  </p>

                  <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
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