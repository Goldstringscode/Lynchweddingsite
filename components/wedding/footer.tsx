import { wedding } from "@/lib/wedding-data"
import { Divider } from "./decor"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background px-6 py-16 text-center">
      <p className="font-serif text-4xl text-foreground">
        {wedding.brideFirst}
        <span className="mx-2 text-gold">&amp;</span>
        {wedding.groomFirst}
      </p>
      <Divider className="mt-6" />
      <p className="mt-6 font-sans text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {wedding.dateShort} &middot; Indio, California
      </p>
      <p className="mt-2 font-sans text-xs tracking-widest text-gold">
        {wedding.hashtag}
      </p>
      <div className="mt-8">
        <Link
          href="/admin/login"
          className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground/40 hover:text-[#355E3B] transition-colors"
        >
          Admin / Wedding Staff Login
        </Link>
      </div>
    </footer>
  )
}
