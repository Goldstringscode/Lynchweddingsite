"use client"

import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Floating toolbar shown only on the dedicated program tab (hidden when
 * printing). "Download PDF" triggers the browser's print-to-PDF dialog.
 */
export function ProgramActions() {
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur sm:gap-3 sm:px-6 sm:py-4">
      <Button
                type="button"
                onClick={() => window.print()}
                size="lg"
                className="h-11 w-full max-w-[260px] rounded-none bg-primary px-6 font-sans text-[10px] uppercase tracking-[0.15em] text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-10 sm:text-xs sm:tracking-[0.2em]"
              >
                <Download className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
                Download PDF
              </Button>
      <Button
        type="button"
        onClick={() => window.close()}
        variant="outline"
        size="lg"
        className="h-11 w-full max-w-[120px] rounded-none border-border px-4 font-sans text-[10px] uppercase tracking-[0.15em] text-foreground hover:bg-accent sm:w-auto sm:px-6 sm:text-xs sm:tracking-[0.2em]"
      >
        <X className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
        Close
      </Button>
    </div>
  )
}
