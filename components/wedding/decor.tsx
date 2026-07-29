"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

/** A gold ornamental divider with a centered diamond. */
export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-12 bg-gold/60 sm:w-20" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="h-px w-12 bg-gold/60 sm:w-20" />
    </div>
  )
}

/** Decorative gold corner brackets used to frame the invitation card. */
export function CornerAccents() {
  const base = "pointer-events-none absolute size-10 border-gold/80"
  return (
    <>
      <span className={cn(base, "left-3 top-3 border-l-2 border-t-2")} />
      <span className={cn(base, "right-3 top-3 border-r-2 border-t-2")} />
      <span className={cn(base, "bottom-3 left-3 border-b-2 border-l-2")} />
      <span className={cn(base, "bottom-3 right-3 border-b-2 border-r-2")} />
    </>
  )
}

/** Fades and lifts children into view when scrolled into the viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
