import type { LucideIcon } from "lucide-react"
import { Church, Martini, PartyPopper, Music, Utensils, Sparkles } from "lucide-react"

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
    time: "4:00 PM",
    title: "The Ceremony",
    description: "Join us as we exchange vows in the chapel.",
    icon: Church,
    duration: "4:00 – 4:45 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Please arrive by 3:45 PM to be seated. The ceremony will be held indoors in the chapel, followed by a receiving line with the newlyweds. Unplugged ceremony, please.",
  },
  {
    time: "5:00 PM",
    title: "Cocktail Hour",
    description: "Signature drinks and hors d'oeuvres on the terrace.",
    icon: Martini,
    duration: "5:00 – 5:45 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Enjoy handcrafted signature cocktails, a champagne tower, and passed hors d'oeuvres while a live jazz trio plays on the terrace overlooking the river.",
  },
  {
    time: "5:45 PM",
    title: "Reception",
    description: "Welcome and mingling as the evening gets underway.",
    icon: PartyPopper,
    duration: "5:45 – 6:30 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Guests are invited to find their seats as the reception begins. The evening kicks off with welcoming remarks and the bridal party grand entrance.",
  },
  {
    time: "6:30 PM",
    title: "First Dance",
    description: "Our first dance as husband and wife.",
    icon: Music,
    duration: "6:30 – 6:45 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Gather around the dance floor as we share our first dance as a married couple, followed by the parent dances.",
  },
  {
    time: "7:00 PM",
    title: "Dinner",
    description: "A seated dinner beneath the magnolias.",
    icon: Utensils,
    duration: "7:00 – 7:30 PM",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "Join us for a plated three-course dinner, heartfelt toasts, and the cutting of the cake beneath the calla lillies.",
  },
  {
    time: "7:30 PM",
    title: "Dancing & Celebration",
    description: "Let's dance the night away under the stars.",
    icon: Sparkles,
    duration: "7:30 PM – Midnight",
    location: "Four Seasons at Terra Lago, Indio",
    details:
      "The party continues with a live band and DJ, a late-night dessert bar, and a sparkler send-off at midnight to close the celebration.",
  },
]