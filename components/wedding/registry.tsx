"use client"

import { Gift } from "lucide-react"
import { wedding } from "@/lib/wedding-data"
import { Divider, Reveal } from "./decor"

export function Registry() {
  return (
    <section id="registry" className="bg-background px-6 py-24 md:py-32">
      <div className="mx-auto max-w-xl text-center">
        <Reveal>
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/60">
            <Gift className="size-7 text-gold" aria-hidden="true" />
          </div>

          <p className="mt-8 font-sans text-xs uppercase tracking-[0.4em] text-gold">
            With Gratitude
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            The Registry
          </h2>
          <Divider className="mt-6" />

          <p className="mx-auto mt-8 max-w-md text-pretty font-sans leading-relaxed text-muted-foreground">
            Your presence is the greatest gift of all. However, should you wish
            to help us begin our next chapter, we have created a honeymoon fund
            to make our dream getaway unforgettable.
          </p>

          <a
              href={wedding.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex h-auto min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-none bg-primary px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-10 sm:text-sm"
            >
              <Gift className="size-4 shrink-0" aria-hidden="true" />
              <span>Visit HoneyFund</span>
            </a>
        </Reveal>
      </div>
    </section>
  )
}
