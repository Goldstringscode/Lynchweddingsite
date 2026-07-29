"use client"

import { TEMPLATES, BLANK_TEMPLATE, type EmailTemplate } from "@/lib/email-types"
import { EmailDocument } from "@/components/dashboard/email-render"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, PenLine, Users, Briefcase, Sparkles, UtensilsCrossed } from "lucide-react"

const CATEGORIES = [
  {
    id: "Guest Communications" as const,
    label: "Guest Communications",
    icon: Users,
    blurb: "Save-the-dates, invitations, itineraries, and gracious thank-yous.",
  },
  {
    id: "Vendor Management" as const,
    label: "Vendor Management",
    icon: Briefcase,
    blurb: "Confirmations, payment reminders, and precise load-in instructions.",
  },
]

export function TemplateGallery({
  onSelect,
  onBlank,
}: {
  onSelect: (t: EmailTemplate) => void
  onBlank: () => void
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gold/30 bg-hunter">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-14">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-gold">
                Maison &amp; Vow Studio
              </span>
            </div>
            <h1 className="text-balance font-serif text-4xl leading-tight text-hunter-foreground sm:text-5xl">
              Email Communications
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-hunter-foreground/70">
              A curated library of high-end stationery for every touchpoint of the celebration —
              ready to personalize and send.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gold/60 px-4 text-sm font-medium text-hunter-foreground transition-colors hover:bg-hunter-dark"
            >
              <UtensilsCrossed className="size-4" />
              Catering Dashboard
            </Link>
            <Button
              onClick={onBlank}
              size="lg"
              className="gap-2 border border-gold bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <PenLine className="size-4" />
              Create Blank Email
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {CATEGORIES.map((category) => {
          const templates = TEMPLATES.filter((t) => t.category === category.id)
          const Icon = category.icon
          return (
            <section key={category.id} className="mb-16 last:mb-0">
              <div className="mb-8 flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-secondary text-hunter">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-ink">{category.label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{category.blurb}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} onSelect={onSelect} />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <footer className="border-t border-gold/30 bg-secondary py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-6 text-muted-foreground">
          <Sparkles className="size-4 text-gold-foreground" />
          <p className="text-xs tracking-wide">
            Crafted for planners who sweat the beautiful details.
          </p>
        </div>
      </footer>
    </div>
  )
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: EmailTemplate
  onSelect: (t: EmailTemplate) => void
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl">
      {/* Miniature stylized preview */}
      <div className="relative h-56 overflow-hidden border-b border-border bg-[#f3f1ea]">
        <div className="pointer-events-none absolute left-1/2 top-6 w-[300px] -translate-x-1/2 origin-top scale-[0.62] shadow-lg ring-1 ring-black/5">
          <EmailDocument blocks={template.blocks} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f3f1ea] to-transparent" />
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg text-ink">{template.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>
        <Button
          onClick={() => onSelect(template)}
          className="mt-4 w-full gap-2 bg-hunter text-hunter-foreground hover:bg-hunter-dark"
        >
          Use Template
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  )
}
