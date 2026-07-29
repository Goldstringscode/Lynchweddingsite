"use client"

import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Floating toolbar shown only on the dedicated program tab (hidden when
 * printing). "Download PDF" triggers the browser's print-to-PDF dialog.
 */
export function ProgramActions() {
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 border-t border-border bg-background/90 px-6 py-4 backdrop-blur">
      <Button
        type="button"
        onClick={() => window.print()}
        size="lg"
        className="h-11 rounded-none bg-primary px-8 font-sans text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
      >
        <Download className="size-4" aria-hidden="true" />
        Download PDF
      </Button>
      <Button
        type="button"
        onClick={() => window.close()}
        variant="outline"
        size="lg"
        className="h-11 rounded-none border-border px-6 font-sans text-xs uppercase tracking-[0.2em] text-foreground hover:bg-accent"
      >
        <X className="size-4" aria-hidden="true" />
        Close
      </Button>
    </div>
  )
}
