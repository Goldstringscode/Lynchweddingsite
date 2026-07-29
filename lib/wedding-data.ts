import type { LucideIcon } from "lucide-react"
import { Church, Martini, Utensils, Music, Sparkles } from "lucide-react"

export const wedding = {
  brideFirst: "Amelia",
  groomFirst: "James",
  brideName: "Amelia Rose",
  groomName: "James Whitmore",
  monogram: "A & J",
  date: "Saturday, September 20, 2026",
  dateShort: "20 . 09 . 2026",
  time: "Half past four in the afternoon",
  ceremonyVenue: "St. Augustine's Chapel",
  ceremonyAddress: "142 Ivy Lane, Charleston, SC",
  receptionVenue: "The Magnolia Estate",
  receptionAddress: "8 Riverside Terrace, Charleston, SC",
  dressCode: "Black Tie Optional",
  registryUrl: "https://www.honeyfund.com",
  hashtag: "#AmeliaAndJames2026",
}

export type TimelineEvent = {
  time: string
  title: string
  description: string
  icon: LucideIcon
  /** Extended details shown in the hover modal. */
  duration: string
  location: string
  details: string
}

export const itinerary: TimelineEvent[] = [
  {
    time: "4:30 PM",
    title: "The Ceremony",
    description: "Join us as we exchange vows in the garden chapel.",
    icon: Church,
    duration: "4:30 – 5:15 PM",
    location: "St. Augustine's Chapel Garden",
    details:
      "Please arrive by 4:15 PM to be seated. The ceremony will be held outdoors in the chapel garden, followed by a receiving line with the newlyweds. Unplugged ceremony, please.",
  },
  {
    time: "5:30 PM",
    title: "Cocktail Hour",
    description: "Signature drinks and hors d'oeuvres on the terrace.",
    icon: Martini,
    duration: "5:30 – 6:45 PM",
    location: "The Magnolia Estate Terrace",
    details:
      "Enjoy handcrafted signature cocktails, a champagne tower, and passed hors d'oeuvres while a live jazz trio plays on the terrace overlooking the river.",
  },
  {
    time: "7:00 PM",
    title: "Reception & Dinner",
    description: "A seated dinner beneath the magnolias.",
    icon: Utensils,
    duration: "7:00 – 8:30 PM",
    location: "The Magnolia Estate Ballroom",
    details:
      "Find your seat on the escort card display and join us for a plated three-course dinner, heartfelt toasts, and the cutting of the cake beneath the magnolias.",
  },
  {
    time: "8:30 PM",
    title: "First Dance",
    description: "Our first dance as husband and wife.",
    icon: Music,
    duration: "8:30 – 8:45 PM",
    location: "The Ballroom Dance Floor",
    details:
      "Gather around the dance floor as we share our first dance as a married couple, followed by the parent dances.",
  },
  {
    time: "9:00 PM",
    title: "Dancing & Celebration",
    description: "Let's dance the night away under the stars.",
    icon: Sparkles,
    duration: "9:00 PM – Midnight",
    location: "The Garden Pavilion",
    details:
      "The party continues with a live band and DJ, a late-night dessert bar, and a sparkler send-off at midnight to close the celebration.",
  },
]
