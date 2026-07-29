"use client"

import { motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { wedding } from "@/lib/wedding-data"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background photo */}
      <img
        src="/images/hero-couple.png"
        alt={`${wedding.brideFirst} and ${wedding.groomFirst} embracing at golden hour`}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-sans text-xs uppercase tracking-[0.5em] text-gold sm:text-sm"
        >
          Together with their families
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="mt-6 text-balance font-serif text-6xl font-medium leading-none sm:text-7xl md:text-8xl"
        >
          {wedding.brideFirst}
          <span className="mx-3 inline-block text-gold">&amp;</span>
          {wedding.groomFirst}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <span className="h-px w-10 bg-white/50" />
          <p className="font-sans text-sm uppercase tracking-[0.3em] sm:text-base">
            {wedding.dateShort}
          </p>
          <span className="h-px w-10 bg-white/50" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.55 }}
          className="mt-3 font-sans text-sm tracking-wide text-white/80"
        >
          Charleston, South Carolina
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#details"
        aria-label="Scroll to explore"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center text-white"
      >
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-white/80">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
          className="mt-2 flex justify-center"
        >
          <ChevronDown className="size-5 text-gold" />
        </motion.div>
      </motion.a>
    </section>
  )
}
