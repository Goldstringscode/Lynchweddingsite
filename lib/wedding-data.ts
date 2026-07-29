import type { LucideIcon } from "lucide-react"
import { Church, Martini, Utensils, Music, Sparkles } from "lucide-react"

export const wedding = {
  brideFirst: "Nikkita",
  groomFirst: "Justin",
  brideName: "Nikkita Rodgers",
  groomName: "Justin Lynch",
  monogram: "N & J",
  date: "Saturday, September 26, 2026",
  dateShort: "26 . 09 . 2026",
  time: "Four O'Clock in the Afternoon",
  ceremonyVenue: "Four Seasons at Terra Lago",
  ceremonyAddress: "85-370 Terra Lago Parkway, Indio, CA 92203",
  receptionVenue: "Four Seasons at Terra Lago",
  receptionAddress: "85-370 Terra Lago Parkway, Indio, CA 92203",
  dressCode: "Black Tie Event | An Evening Draped in Black",
  registryUrl: "https://www.honeyfund.com",
  hashtag: "#NikkitaAndJustin2026",
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
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Please arrive by 4:15 PM to be seated. The ceremony will be held outdoors in the chapel garden, followed by a receiving line with the newlyweds. Unplugged ceremony, please.",
  },
  {
    time: "5:30 PM",
    title: "Cocktail Hour",
    description: "Signature drinks and hors d'oeuvres on the terrace.",
    icon: Martini,
    duration: "5:30 – 6:45 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Enjoy handcrafted signature cocktails, a champagne tower, and passed hors d'oeuvres while a live jazz trio plays on the terrace overlooking the river.",
  },
  {
    time: "7:00 PM",
    title: "Reception & Dinner",
    description: "A seated dinner beneath the magnolias.",
    icon: Utensils,
    duration: "7:00 – 8:30 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Find your seat on the escort card display and join us for a plated three-course dinner, heartfelt toasts, and the cutting of the cake beneath the magnolias.",
  },
  {
    time: "8:30 PM",
    title: "First Dance",
    description: "Our first dance as husband and wife.",
    icon: Music,
    duration: "8:30 – 8:45 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Gather around the dance floor as we share our first dance as a married couple, followed by the parent dances.",
  },
  {
    time: "9:00 PM",
    title: "Dancing & Celebration",
    description: "Let's dance the night away under the stars.",
    icon: Sparkles,
    duration: "9:00 PM – Midnight",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "The party continues with a live band and DJ, a late-night dessert bar, and a sparkler send-off at midnight to close the celebration.",
  },
]
