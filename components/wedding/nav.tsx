"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import { wedding } from "@/lib/wedding-data"

const NAV_ITEMS = [
  { id: "details",       label: "Our Story" },
  { id: "itinerary",     label: "Itinerary" },
  { id: "program",       label: "Program" },
  { id: "registry",      label: "Registry" },
  { id: "accommodations",label: "Stay" },
  { id: "share-photos",  label: "Photos" },
  { id: "rsvp",          label: "RSVP" },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("")

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Track scroll position for background + active section
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)

      // Find which section is in view
      for (const item of [...NAV_ITEMS].reverse()) {
        const el = document.getElementById(item.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActive(item.id)
            break
          }
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTo = useCallback((id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  // "Download Ticket" — scroll to RSVP and open the ticket-recovery panel there.
  const openTicketRecovery = useCallback(() => {
    setOpen(false)
    const el = document.getElementById("rsvp")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    // Let the RSVP section open its recovery panel (components are decoupled).
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-ticket-recovery"))
    }, 400)
  }, [])

  const linkClass = (id: string) =>
    `relative font-sans text-[0.65rem] uppercase tracking-[0.25em] transition-colors duration-300 ${
      active === id
        ? "text-gold"
        : scrolled
          ? "text-foreground/80 hover:text-foreground"
          : "text-white/80 hover:text-white"
    }`

  return (
    <>
      {/* ── Desktop nav bar ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-border/40 bg-background/90 shadow-sm backdrop-blur-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Monogram / logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-serif text-lg tracking-wider text-gold transition-opacity hover:opacity-80"
          >
            {wedding.monogram}
          </button>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button onClick={() => scrollTo(item.id)} className={linkClass(item.id)}>
                  {item.label}
                  {active === item.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 h-px w-full bg-gold"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={openTicketRecovery}
                className={`border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.25em] transition-colors duration-300 ${
                  scrolled
                    ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    : "border-white/70 text-white hover:bg-white hover:text-primary"
                }`}
              >
                Download Ticket
              </button>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="flex size-10 items-center justify-center lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X className={`size-5 ${scrolled ? "text-foreground" : "text-white"}`} />
            ) : (
              <Menu className={`size-5 ${scrolled ? "text-foreground" : "text-white"}`} />
            )}
          </button>
        </nav>
      </header>

      {/* ── Mobile fullscreen overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/98 backdrop-blur-xl lg:hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-6 top-5 flex size-10 items-center justify-center"
              aria-label="Close menu"
            >
              <X className="size-5 text-foreground" />
            </button>

            <nav className="flex flex-col items-center gap-8">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => scrollTo(item.id)}
                  className={`group flex flex-col items-center gap-1 ${
                    active === item.id ? "text-gold" : "text-foreground"
                  }`}
                >
                  <span className="font-serif text-2xl tracking-wide transition-colors group-hover:text-gold sm:text-3xl">
                    {item.label}
                  </span>
                  {active === item.id && (
                    <motion.span
                      layoutId="mobile-underline"
                      className="h-px w-12 bg-gold"
                    />
                  )}
                </motion.button>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.4, delay: NAV_ITEMS.length * 0.06, ease: [0.22, 1, 0.36, 1] }}
                onClick={openTicketRecovery}
                className="mt-2 border border-primary px-6 py-3 font-sans text-xs uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Download Ticket
              </motion.button>
            </nav>

            {/* Footer ornament */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="absolute bottom-10 font-sans text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground"
            >
              {wedding.hashtag}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}