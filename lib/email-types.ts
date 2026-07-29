export type BlockType = "header" | "text" | "button" | "divider" | "footer" | "details"

export type EmailBlock = {
  id: string
  type: BlockType
  /** Small overline / eyebrow text shown above a header */
  eyebrow?: string
  /** Main heading text (header block) or button label (button block) */
  heading?: string
  /** Body copy for text/footer blocks, or the sub-line for a header */
  text?: string
  /** For details blocks: label/value rows */
  rows?: { label: string; value: string }[]
}

export type EmailTemplate = {
  id: string
  category: "Guest Communications" | "Vendor Management"
  name: string
  description: string
  /** Accent used for the miniature preview swatch */
  subject: string
  blocks: EmailBlock[]
}

export const VARIABLES = [
  "{{Guest Name}}",
  "{{Couple Names}}",
  "{{Event Date}}",
  "{{Venue Name}}",
  "{{RSVP Date}}",
  "{{Amount Due}}",
  "{{Vendor Name}}",
  "{{Load-in Time}}",
] as const

let counter = 0
const uid = (seed: string) => `${seed}-${counter++}`

export const BLANK_TEMPLATE: EmailTemplate = {
  id: "blank",
  category: "Guest Communications",
  name: "Blank Email",
  description: "Start from a clean, elegant canvas.",
  subject: "A note from {{Couple Names}}",
  blocks: [
    {
      id: uid("b"),
      type: "header",
      eyebrow: "MAISON & VOW",
      heading: "{{Couple Names}}",
      text: "A moment worth remembering",
    },
    {
      id: uid("b"),
      type: "text",
      text: "Dear {{Guest Name}},\n\nWe are so delighted to share this note with you. Begin writing your message here.",
    },
    { id: uid("b"), type: "footer", text: "With love,\n{{Couple Names}}" },
  ],
}

export const TEMPLATES: EmailTemplate[] = [
  {
    id: "save-the-date",
    category: "Guest Communications",
    name: "Save the Date",
    description: "A refined first announcement to reserve the day in guests' hearts and calendars.",
    subject: "Save the Date — {{Couple Names}}",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "SAVE THE DATE",
        heading: "{{Couple Names}}",
        text: "are getting married",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Guest Name}},\n\nWith hearts full of joy, we invite you to hold a place in your calendar. The celebration of a lifetime is on its way, and it simply would not be the same without you.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "The Date", value: "{{Event Date}}" },
          { label: "The Place", value: "{{Venue Name}}" },
          { label: "Formal Invitation", value: "To Follow" },
        ],
      },
      { id: uid("b"), type: "footer", text: "Kindly save the date. Details to follow soon.\n\n{{Couple Names}}" },
    ],
  },
  {
    id: "official-invitation",
    category: "Guest Communications",
    name: "Official Invitation",
    description: "The formal invitation — elegant typography and all the essential ceremony details.",
    subject: "You are cordially invited — {{Couple Names}}",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "TOGETHER WITH THEIR FAMILIES",
        heading: "{{Couple Names}}",
        text: "request the pleasure of your company",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dearest {{Guest Name}},\n\nAs two families become one, we would be honored by your presence at our wedding celebration. Please join us for an evening of vows, feasting, and dancing beneath the stars.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "Ceremony", value: "{{Event Date}} · Four in the Afternoon" },
          { label: "Venue", value: "{{Venue Name}}" },
          { label: "Reception", value: "Dinner & Dancing to Follow" },
          { label: "Attire", value: "Black Tie" },
        ],
      },
      { id: uid("b"), type: "button", heading: "RSVP by {{RSVP Date}}" },
      { id: uid("b"), type: "footer", text: "We cannot wait to celebrate with you.\n\n{{Couple Names}}" },
    ],
  },
  {
    id: "rsvp-reminder",
    category: "Guest Communications",
    name: "RSVP Reminder",
    description: "A gentle, gracious nudge for guests who have not yet responded.",
    subject: "A gentle reminder — kindly RSVP",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "A GENTLE REMINDER",
        heading: "Will You Join Us?",
        text: "{{Couple Names}}",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Guest Name}},\n\nWe are finalizing the last beautiful details of our celebration and would be ever so grateful to know if you will be able to join us. Our planner is holding a seat with your name on it.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "Please Respond By", value: "{{RSVP Date}}" },
          { label: "Celebration", value: "{{Event Date}}" },
        ],
      },
      { id: uid("b"), type: "button", heading: "Respond Now" },
      { id: uid("b"), type: "footer", text: "Warmly,\n{{Couple Names}}" },
    ],
  },
  {
    id: "welcome-packet",
    category: "Guest Communications",
    name: "Welcome Packet & Itinerary",
    description: "Everything guests need for the weekend — travel, timing, and a warm welcome.",
    subject: "Welcome! Your weekend itinerary inside",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "WELCOME TO THE WEEKEND",
        heading: "{{Couple Names}}",
        text: "Your celebration itinerary",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Guest Name}},\n\nWelcome! We are overjoyed you have traveled to celebrate with us. Below you will find everything you need for a seamless and joyful weekend at {{Venue Name}}.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "Friday · Welcome Soirée", value: "7:00 PM · The Garden Terrace" },
          { label: "Saturday · Ceremony", value: "4:00 PM · The Grand Lawn" },
          { label: "Saturday · Reception", value: "6:00 PM · The Ballroom" },
          { label: "Sunday · Farewell Brunch", value: "10:00 AM · The Orangery" },
        ],
      },
      { id: uid("b"), type: "button", heading: "View Full Itinerary" },
      { id: uid("b"), type: "footer", text: "With gratitude,\n{{Couple Names}}" },
    ],
  },
  {
    id: "day-of-timeline",
    category: "Guest Communications",
    name: "Day-Of Timeline Update",
    description: "A crisp same-day schedule so every guest arrives at the right moment.",
    subject: "Today's timeline — see you soon!",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "THE DAY IS HERE",
        heading: "Today's Timeline",
        text: "{{Couple Names}} · {{Event Date}}",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Guest Name}},\n\nThe day we have all been waiting for has arrived. Here is the flow of the evening so you never miss a moment.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "3:30 PM", value: "Guest Arrival & Seating" },
          { label: "4:00 PM", value: "Ceremony Begins" },
          { label: "5:00 PM", value: "Cocktail Hour" },
          { label: "6:30 PM", value: "Dinner Served" },
          { label: "8:00 PM", value: "First Dance & Celebration" },
        ],
      },
      { id: uid("b"), type: "footer", text: "See you very soon at {{Venue Name}}.\n\n{{Couple Names}}" },
    ],
  },
  {
    id: "thank-you",
    category: "Guest Communications",
    name: "Post-Wedding Thank You",
    description: "A heartfelt closing note to thank guests for sharing the celebration.",
    subject: "Thank you, from the bottom of our hearts",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "WITH ALL OUR LOVE",
        heading: "Thank You",
        text: "{{Couple Names}}",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Guest Name}},\n\nWords can hardly capture our gratitude. Thank you for celebrating with us, for the laughter, the dancing, and the love you brought to {{Venue Name}}. Our hearts are full.",
      },
      { id: uid("b"), type: "button", heading: "View the Gallery" },
      { id: uid("b"), type: "footer", text: "Forever grateful,\n{{Couple Names}}" },
    ],
  },
  {
    id: "vendor-booking",
    category: "Vendor Management",
    name: "Vendor Booking Confirmation",
    description: "A polished confirmation that locks in the vendor and outlines the engagement.",
    subject: "Booking confirmed — {{Event Date}}",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "BOOKING CONFIRMED",
        heading: "You're Booked",
        text: "{{Couple Names}} · {{Event Date}}",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Vendor Name}},\n\nWe are thrilled to confirm your services for the wedding of {{Couple Names}}. This note serves as your official booking confirmation and a summary of the engagement.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "Event Date", value: "{{Event Date}}" },
          { label: "Venue", value: "{{Venue Name}}" },
          { label: "Deposit Received", value: "Confirmed" },
          { label: "Balance Due", value: "{{Amount Due}}" },
        ],
      },
      { id: uid("b"), type: "button", heading: "Review Contract" },
      { id: uid("b"), type: "footer", text: "Delighted to work together,\nThe Maison & Vow Team" },
    ],
  },
  {
    id: "vendor-payment",
    category: "Vendor Management",
    name: "Vendor Payment Reminder",
    description: "A courteous reminder of an upcoming balance with clear payment details.",
    subject: "Friendly reminder: balance due",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "PAYMENT REMINDER",
        heading: "Balance Due",
        text: "{{Amount Due}}",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Vendor Name}},\n\nWe hope this note finds you well. This is a courteous reminder that a balance is due ahead of the celebration for {{Couple Names}}. Please find the details below.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "Amount Due", value: "{{Amount Due}}" },
          { label: "Due Date", value: "{{RSVP Date}}" },
          { label: "Event", value: "{{Event Date}} · {{Venue Name}}" },
        ],
      },
      { id: uid("b"), type: "button", heading: "Submit Payment" },
      { id: uid("b"), type: "footer", text: "With thanks,\nThe Maison & Vow Team" },
    ],
  },
  {
    id: "final-details",
    category: "Vendor Management",
    name: "Final Details & Load-in",
    description: "The definitive load-in brief with timing, access, and point-of-contact.",
    subject: "Final details & load-in instructions",
    blocks: [
      {
        id: uid("b"),
        type: "header",
        eyebrow: "FINAL DETAILS",
        heading: "Load-In Instructions",
        text: "{{Event Date}} · {{Venue Name}}",
      },
      {
        id: uid("b"),
        type: "text",
        text: "Dear {{Vendor Name}},\n\nWe are one week away! Below are your final load-in instructions to ensure a smooth and seamless set-up. Please review carefully and reach out with any questions.",
      },
      {
        id: uid("b"),
        type: "details",
        rows: [
          { label: "Load-in Time", value: "{{Load-in Time}}" },
          { label: "Access Point", value: "North Service Entrance" },
          { label: "On-site Contact", value: "Planner · Maison & Vow" },
          { label: "Breakdown", value: "By 12:00 AM" },
        ],
      },
      { id: uid("b"), type: "button", heading: "Download Floor Plan" },
      { id: uid("b"), type: "footer", text: "Thank you for your partnership,\nThe Maison & Vow Team" },
    ],
  },
]
