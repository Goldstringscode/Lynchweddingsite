import type { Metadata } from "next"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { wedding, itinerary } from "@/lib/wedding-data"
import { ProgramActions } from "@/components/wedding/program-actions"

export const metadata: Metadata = {
  title: `${wedding.brideFirst} & ${wedding.groomFirst} — Wedding Program`,
  description: "The order of events and venue details for our celebration.",
}

function OrnamentalRule() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-16 bg-gold/70" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="h-px w-16 bg-gold/70" />
    </div>
  )
}

export default function ProgramPage() {
  return (
    <main className="min-h-screen bg-secondary px-4 py-10 pb-28 print:bg-white print:p-0 print:pb-0">
      {/* The printable sheet */}
      <article
        id="program-sheet"
        className="relative mx-auto max-w-2xl bg-background px-8 py-14 shadow-xl ring-1 ring-gold/40 print:max-w-none print:shadow-none print:ring-0 md:px-16 md:py-20"
      >
        {/* Gold inner frame */}
        <div
          className="pointer-events-none absolute inset-4 border border-gold/40 md:inset-6"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.45em] text-primary">
            Together with their families
          </p>

          <Image
            src="/images/botanical-crest.png"
            alt=""
            width={160}
            height={160}
            className="mt-6 h-28 w-auto opacity-90 mix-blend-multiply"
            aria-hidden="true"
          />

          <h1 className="mt-4 text-balance font-serif text-5xl font-semibold leading-tight text-foreground md:text-6xl">
            {wedding.brideFirst} &amp; {wedding.groomFirst}
          </h1>
          <p className="mt-3 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {wedding.date}
          </p>
          <p className="mt-1 font-serif text-lg italic text-muted-foreground">
            {wedding.time}
          </p>

          <div className="my-10">
            <OrnamentalRule />
          </div>

          <h2 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
            Order of Events
          </h2>

          <ol className="mt-8 w-full max-w-md">
            {itinerary.map((event, i) => (
              <li
                key={event.title}
                className={`flex items-start gap-6 py-4 text-left ${
                  i !== itinerary.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="w-24 shrink-0 pt-1 font-sans text-xs uppercase tracking-[0.15em] text-gold">
                  {event.time}
                </span>
                <span className="flex-1">
                  <span className="block font-serif text-lg text-foreground">
                    {event.title}
                  </span>
                  <span className="mt-1 block font-sans text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="my-10">
            <OrnamentalRule />
          </div>

          <div className="grid w-full max-w-md gap-8 sm:grid-cols-2">
            <div className="text-center sm:text-left">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-primary">
                The Ceremony
              </p>
              <p className="mt-2 flex items-start justify-center gap-2 font-serif text-base text-foreground sm:justify-start">
                <MapPin
                  className="mt-1 size-4 shrink-0 text-gold"
                  aria-hidden="true"
                />
                <span>
                  {wedding.ceremonyVenue}
                  <span className="mt-1 block font-sans text-sm text-muted-foreground">
                    {wedding.ceremonyAddress}
                  </span>
                </span>
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-primary">
                The Reception
              </p>
              <p className="mt-2 flex items-start justify-center gap-2 font-serif text-base text-foreground sm:justify-start">
                <MapPin
                  className="mt-1 size-4 shrink-0 text-gold"
                  aria-hidden="true"
                />
                <span>
                  {wedding.receptionVenue}
                  <span className="mt-1 block font-sans text-sm text-muted-foreground">
                    {wedding.receptionAddress}
                  </span>
                </span>
              </p>
            </div>
          </div>

          <div className="mt-10">
            <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-primary">
              Dress Code
            </p>
            <p className="mt-2 font-serif text-lg text-foreground">
              {wedding.dressCode}
            </p>
          </div>

          <div className="my-10">
            <OrnamentalRule />
          </div>

          <p className="font-serif text-xl italic text-foreground">
            With love and gratitude
          </p>
          <p className="mt-4 font-sans text-xs uppercase tracking-[0.35em] text-gold">
            {wedding.hashtag}
          </p>
        </div>
      </article>

      <ProgramActions />
    </main>
  )
}
