import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CornerAccents, Divider, Reveal } from "./decor"

export function Program() {
  return (
    <section id="program" className="bg-background px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="relative border border-gold/50 bg-accent/40 px-8 py-14 text-center md:px-14">
            <CornerAccents />

            <p className="font-sans text-xs uppercase tracking-[0.4em] text-primary">
              Keepsake
            </p>
            <h2 className="mt-4 text-balance font-serif text-4xl font-medium text-foreground md:text-5xl">
              The Wedding Program
            </h2>
            <Divider className="mt-6" />
            <p className="mx-auto mt-6 max-w-md text-pretty font-sans text-sm leading-relaxed text-muted-foreground">
              Take a beautifully typeset copy of our order of events and venue
              details with you. It opens in a new tab where you can download it
              as a PDF or print it to keep close.
            </p>

            <Button
              size="lg"
              nativeButton={false}
              className="mt-10 h-auto min-h-12 w-full max-w-xs rounded-none bg-primary px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-10 sm:text-sm"
              render={
                <a href="/program" target="_blank" rel="noopener noreferrer" />
              }
            >
              <Download className="size-4 shrink-0" aria-hidden="true" />
              <span>Download Wedding Program</span>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
