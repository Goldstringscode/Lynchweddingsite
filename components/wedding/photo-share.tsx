"use client"

import { Camera } from "lucide-react"
import { Divider, Reveal } from "./decor"

const SHARE_URL = "/share" // redirects to WedUploader via app/share/route.ts

export function PhotoShare() {
  return (
    <section id="share-photos" className="bg-background px-6 py-24 md:py-32">
      <div className="mx-auto max-w-xl text-center">
        <Reveal>
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/60">
            <Camera className="size-7 text-gold" aria-hidden="true" />
          </div>

          <p className="mt-8 font-sans text-xs uppercase tracking-[0.4em] text-gold">
            Capture the Moment
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
            Share Your Photos
          </h2>
          <Divider className="mt-6" />

          <p className="mx-auto mt-8 max-w-md text-pretty font-sans leading-relaxed text-muted-foreground">
            Help us remember every smile, every dance, and every candid moment.
            Upload your photos and videos from the celebration so we can relive
            the day together.
          </p>

          <p className="mt-4 font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Snap &bull; Scan &bull; Share
          </p>

          <a
            href={SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex h-auto min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-none bg-primary px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-10 sm:text-sm"
          >
            <Camera className="size-4 shrink-0" aria-hidden="true" />
            <span>Upload Photos &amp; Videos</span>
          </a>

          <p className="mt-6 font-sans text-xs text-muted-foreground">
            Hosted on WedUploader
          </p>
        </Reveal>
      </div>
    </section>
  )
}