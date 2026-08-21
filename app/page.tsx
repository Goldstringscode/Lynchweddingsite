import { Hero } from "@/components/wedding/hero"
import { Invitation } from "@/components/wedding/invitation"
import { Itinerary } from "@/components/wedding/itinerary"
import { Program } from "@/components/wedding/program"
import { Registry } from "@/components/wedding/registry"
import { Accommodations } from "@/components/wedding/accommodations"
import { PhotoShare } from "@/components/wedding/photo-share"
import { Rsvp } from "@/components/wedding/rsvp"
import { Footer } from "@/components/wedding/footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Invitation />
      <Itinerary />
      <Program />
      <Registry />
      <Accommodations />
      <PhotoShare />
      <Rsvp />
      <Footer />
    </main>
  )
}