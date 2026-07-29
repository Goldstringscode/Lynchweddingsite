"use client"

import type { EmailBlock } from "@/lib/email-types"
import { cn } from "@/lib/utils"

/**
 * Renders the actual email stationery. Used both at full scale (live preview)
 * and shrunk down inside the gallery cards. All styling is inline-friendly
 * Tailwind so the "email" reads like high-end wedding stationery.
 */
export function EmailDocument({
  blocks,
  className,
}: {
  blocks: EmailBlock[]
  className?: string
}) {
  return (
    <div className={cn("bg-white text-ink", className)}>
      {/* Gold top rule */}
      <div className="h-1.5 w-full bg-gold" />

      <div className="px-8 py-10 sm:px-12 sm:py-12">
        {/* Ornamental crest */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gold/70" />
          <span className="font-serif text-xs tracking-[0.35em] text-hunter">M &amp; V</span>
          <span className="h-px w-10 bg-gold/70" />
        </div>

        <div className="flex flex-col gap-7">
          {blocks.map((block) => (
            <EmailBlockView key={block.id} block={block} />
          ))}
        </div>
      </div>

      {/* Footer band */}
      <div className="bg-hunter px-8 py-6 text-center">
        <p className="font-serif text-sm tracking-[0.3em] text-gold">MAISON &amp; VOW</p>
        <p className="mt-1 text-[11px] tracking-wide text-hunter-foreground/70">
          Fine Weddings &amp; Celebrations
        </p>
      </div>
    </div>
  )
}

function EmailBlockView({ block }: { block: EmailBlock }) {
  switch (block.type) {
    case "header":
      return (
        <div className="text-center">
          {block.eyebrow ? (
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.4em] text-gold-foreground">
              {block.eyebrow}
            </p>
          ) : null}
          {block.heading ? (
            <h1 className="text-pretty font-serif text-4xl leading-tight text-hunter sm:text-5xl">
              {block.heading}
            </h1>
          ) : null}
          {block.text ? (
            <p className="mt-3 font-serif text-base italic text-ink/70">{block.text}</p>
          ) : null}
        </div>
      )

    case "text":
      return (
        <div className="whitespace-pre-line text-[15px] leading-relaxed text-ink/80">
          {block.text}
        </div>
      )

    case "details":
      return (
        <div className="border-y border-gold/40 py-2">
          {(block.rows ?? []).map((row, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-4 border-b border-gold/15 py-2.5 last:border-b-0"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-hunter">
                {row.label}
              </span>
              <span className="text-right font-serif text-sm text-ink/80">{row.value}</span>
            </div>
          ))}
        </div>
      )

    case "button":
      return (
        <div className="flex justify-center py-1">
          <span className="inline-block border border-gold bg-hunter px-8 py-3 text-[12px] font-medium uppercase tracking-[0.25em] text-hunter-foreground">
            {block.heading}
          </span>
        </div>
      )

    case "divider":
      return (
        <div className="flex items-center justify-center py-1">
          <span className="h-px w-16 bg-gold/60" />
        </div>
      )

    case "footer":
      return (
        <div className="whitespace-pre-line pt-2 text-center font-serif text-[15px] italic leading-relaxed text-hunter">
          {block.text}
        </div>
      )

    default:
      return null
  }
}
