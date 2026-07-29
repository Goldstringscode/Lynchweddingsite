import { wedding } from "@/lib/wedding-data"
import { Divider } from "./decor"

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
        {wedding.dateShort} &middot; Charleston, SC
      </p>
      <p className="mt-2 font-sans text-xs tracking-widest text-gold">
        {wedding.hashtag}
      </p>
    </footer>
  )
}
