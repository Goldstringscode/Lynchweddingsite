// ---------------------------------------------------------------------------
// Placeholder data for the Wedding Concierge Admin dashboard.
//
// This file is intentionally the single source of truth for all mock data.
// It is front-end only — replace each exported array with a real API call
// (e.g. inside a server component or SWR hook) without touching the UI.
// ---------------------------------------------------------------------------

export type RsvpStatus = "Accepted" | "Declined" | "Checked-In"

export type MealChoice = "Beef" | "Pork" | "Chicken" | "Fish" | "Vegan"

export const mealChoices: MealChoice[] = [
  "Beef",
  "Pork",
  "Chicken",
  "Fish",
  "Vegan",
]

export interface Guest {
  id: string
  name: string
  email: string
  partySize: number
  dietary: string
  meal: MealChoice
  status: RsvpStatus
  submittedAt: string
}

export type VendorStatus = "Confirmed" | "Pending"

export type VendorCategory =
  | "Photography"
  | "Catering"
  | "Florist"
  | "DJ"
  | "Venue"
  | "Bakery"
  | "Planner"
  | "Videography"

export interface Vendor {
  id: string
  name: string
  category: VendorCategory
  contact: string
  status: VendorStatus
  cost: number
}

export type InvoiceStatus = "Paid" | "Unpaid" | "Overdue"

export interface Invoice {
  id: string
  number: string
  vendor: string
  amount: number
  dueDate: string
  status: InvoiceStatus
}

export interface VendorDeadline {
  id: string
  vendor: string
  task: string
  dueDate: string
}

export const guests: Guest[] = [
  {
    id: "g1",
    name: "Charlotte & James Whitfield",
    email: "charlotte.whitfield@gmail.com",
    partySize: 2,
    dietary: "Vegetarian",
    meal: "Vegan",
    status: "Accepted",
    submittedAt: "2026-07-24",
  },
  {
    id: "g2",
    name: "Marcus Delacroix",
    email: "m.delacroix@outlook.com",
    partySize: 1,
    dietary: "None",
    meal: "Beef",
    status: "Accepted",
    submittedAt: "2026-07-23",
  },
  {
    id: "g3",
    name: "Priya & Arjun Nair",
    email: "priya.nair@gmail.com",
    partySize: 4,
    dietary: "No nuts, Vegan",
    meal: "Vegan",
    status: "Accepted",
    submittedAt: "2026-07-22",
  },
  {
    id: "g4",
    name: "Eleanor Ashworth",
    email: "eleanor.ashworth@icloud.com",
    partySize: 2,
    dietary: "Gluten-free",
    meal: "Chicken",
    status: "Declined",
    submittedAt: "2026-07-21",
  },
  {
    id: "g5",
    name: "Theodore Bennett",
    email: "theo.bennett@gmail.com",
    partySize: 1,
    dietary: "None",
    meal: "Pork",
    status: "Accepted",
    submittedAt: "2026-07-20",
  },
  {
    id: "g6",
    name: "Sofia & Luca Romano",
    email: "sofia.romano@gmail.com",
    partySize: 3,
    dietary: "Pescatarian",
    meal: "Fish",
    status: "Accepted",
    submittedAt: "2026-07-19",
  },
  {
    id: "g7",
    name: "Grace Okafor",
    email: "grace.okafor@outlook.com",
    partySize: 2,
    dietary: "Dairy-free",
    meal: "Chicken",
    status: "Declined",
    submittedAt: "2026-07-18",
  },
  {
    id: "g8",
    name: "Nathaniel & Ava Cross",
    email: "nate.cross@gmail.com",
    partySize: 2,
    dietary: "None",
    meal: "Beef",
    status: "Accepted",
    submittedAt: "2026-07-17",
  },
  {
    id: "g9",
    name: "Isabella Fontaine",
    email: "isabella.fontaine@gmail.com",
    partySize: 1,
    dietary: "Vegetarian",
    meal: "Vegan",
    status: "Accepted",
    submittedAt: "2026-07-16",
  },
  {
    id: "g10",
    name: "Oliver & Mia Sinclair",
    email: "oliver.sinclair@icloud.com",
    partySize: 5,
    dietary: "2 Vegan, 1 Gluten-free",
    meal: "Vegan",
    status: "Accepted",
    submittedAt: "2026-07-15",
  },
  {
    id: "g11",
    name: "Harper Lindqvist",
    email: "harper.lindqvist@gmail.com",
    partySize: 2,
    dietary: "None",
    meal: "Beef",
    status: "Declined",
    submittedAt: "2026-07-14",
  },
  {
    id: "g12",
    name: "Sebastian Vø",
    email: "sebastian.vo@gmail.com",
    partySize: 3,
    dietary: "Shellfish allergy",
    meal: "Chicken",
    status: "Accepted",
    submittedAt: "2026-07-13",
  },
  {
    id: "g13",
    name: "Amara & Kofi Mensah",
    email: "amara.mensah@outlook.com",
    partySize: 4,
    dietary: "None",
    meal: "Beef",
    status: "Accepted",
    submittedAt: "2026-07-12",
  },
  {
    id: "g14",
    name: "Clara Beaumont",
    email: "clara.beaumont@gmail.com",
    partySize: 1,
    dietary: "Vegan",
    meal: "Vegan",
    status: "Accepted",
    submittedAt: "2026-07-11",
  },
  {
    id: "g15",
    name: "Rafael & Lucia Ortega",
    email: "rafael.ortega@gmail.com",
    partySize: 2,
    dietary: "Gluten-free",
    meal: "Fish",
    status: "Declined",
    submittedAt: "2026-07-10",
  },
]

export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "Aurelia Studios",
    category: "Photography",
    contact: "hello@aureliastudios.com",
    status: "Confirmed",
    cost: 6800,
  },
  {
    id: "v2",
    name: "Maison Verte Catering",
    category: "Catering",
    contact: "events@maisonverte.com",
    status: "Confirmed",
    cost: 18500,
  },
  {
    id: "v3",
    name: "Wildbloom Florals",
    category: "Florist",
    contact: "studio@wildbloom.co",
    status: "Pending",
    cost: 4200,
  },
  {
    id: "v4",
    name: "The Gilded Note",
    category: "DJ",
    contact: "bookings@gildednote.com",
    status: "Confirmed",
    cost: 3100,
  },
  {
    id: "v5",
    name: "Château Lumière",
    category: "Venue",
    contact: "reservations@chateaulumiere.com",
    status: "Confirmed",
    cost: 24000,
  },
  {
    id: "v6",
    name: "Sugar & Laurel",
    category: "Bakery",
    contact: "orders@sugarlaurel.com",
    status: "Pending",
    cost: 1450,
  },
  {
    id: "v7",
    name: "Everly Events Co.",
    category: "Planner",
    contact: "team@everlyevents.com",
    status: "Confirmed",
    cost: 9500,
  },
  {
    id: "v8",
    name: "Lantern & Lens Films",
    category: "Videography",
    contact: "info@lanternlens.film",
    status: "Pending",
    cost: 5400,
  },
]

export const invoices: Invoice[] = [
  {
    id: "i1",
    number: "INV-1042",
    vendor: "Château Lumière",
    amount: 24000,
    dueDate: "2026-08-01",
    status: "Paid",
  },
  {
    id: "i2",
    number: "INV-1043",
    vendor: "Maison Verte Catering",
    amount: 18500,
    dueDate: "2026-08-15",
    status: "Unpaid",
  },
  {
    id: "i3",
    number: "INV-1044",
    vendor: "Aurelia Studios",
    amount: 6800,
    dueDate: "2026-07-20",
    status: "Overdue",
  },
  {
    id: "i4",
    number: "INV-1045",
    vendor: "Everly Events Co.",
    amount: 9500,
    dueDate: "2026-08-10",
    status: "Paid",
  },
  {
    id: "i5",
    number: "INV-1046",
    vendor: "Wildbloom Florals",
    amount: 4200,
    dueDate: "2026-08-22",
    status: "Unpaid",
  },
  {
    id: "i6",
    number: "INV-1047",
    vendor: "The Gilded Note",
    amount: 3100,
    dueDate: "2026-07-18",
    status: "Overdue",
  },
  {
    id: "i7",
    number: "INV-1048",
    vendor: "Sugar & Laurel",
    amount: 1450,
    dueDate: "2026-08-28",
    status: "Unpaid",
  },
]

export const vendorDeadlines: VendorDeadline[] = [
  {
    id: "d1",
    vendor: "Wildbloom Florals",
    task: "Final bouquet selection",
    dueDate: "2026-08-02",
  },
  {
    id: "d2",
    vendor: "Maison Verte Catering",
    task: "Confirm final headcount",
    dueDate: "2026-08-05",
  },
  {
    id: "d3",
    vendor: "Sugar & Laurel",
    task: "Cake tasting appointment",
    dueDate: "2026-08-08",
  },
  {
    id: "d4",
    vendor: "The Gilded Note",
    task: "Submit music playlist",
    dueDate: "2026-08-12",
  },
]

export const vendorCategories: VendorCategory[] = [
  "Photography",
  "Catering",
  "Florist",
  "DJ",
  "Venue",
  "Bakery",
  "Planner",
  "Videography",
]

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

export type EmailVariableKey =
  | "recipientName"
  | "eventDate"
  | "venueName"
  | "amountDue"
  | "vendorName"
  | "rsvpDeadline"

export interface EmailVariable {
  key: EmailVariableKey
  label: string
  placeholder: string
  defaultValue: string
}

export type EmailTemplateId =
  | "rsvp-reminder"
  | "vendor-payment"
  | "welcome-guest"
  | "save-the-date"

export interface EmailTemplate {
  id: EmailTemplateId
  name: string
  description: string
  icon: string
  subject: string
  // Body uses {{variableKey}} tokens replaced at render time.
  body: string
  variables: EmailVariable[]
}

export interface SentEmail {
  id: string
  templateName: string
  recipientName: string
  subject: string
  sentAt: string
}

const VAR: Record<EmailVariableKey, EmailVariable> = {
  recipientName: {
    key: "recipientName",
    label: "Recipient Name",
    placeholder: "Charlotte Whitfield",
    defaultValue: "Charlotte Whitfield",
  },
  eventDate: {
    key: "eventDate",
    label: "Event Date",
    placeholder: "September 12, 2026",
    defaultValue: "September 12, 2026",
  },
  venueName: {
    key: "venueName",
    label: "Venue Name",
    placeholder: "Château Lumière",
    defaultValue: "Château Lumière",
  },
  amountDue: {
    key: "amountDue",
    label: "Amount Due",
    placeholder: "$4,200",
    defaultValue: "$4,200",
  },
  vendorName: {
    key: "vendorName",
    label: "Vendor Name",
    placeholder: "Wildbloom Florals",
    defaultValue: "Wildbloom Florals",
  },
  rsvpDeadline: {
    key: "rsvpDeadline",
    label: "RSVP Deadline",
    placeholder: "August 15, 2026",
    defaultValue: "August 15, 2026",
  },
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "save-the-date",
    name: "Save the Date",
    description: "A first, elegant note to reserve the day in their calendar.",
    icon: "CalendarHeart",
    subject: "Save the Date — {{eventDate}}",
    body: "Dear {{recipientName}},\n\nWe are delighted to share that our wedding will take place on {{eventDate}} at {{venueName}}. A formal invitation with every detail will follow in the coming weeks.\n\nUntil then, we simply ask that you save the date — we cannot imagine the day without you.\n\nWith love,\nThe Couple",
    variables: [VAR.recipientName, VAR.eventDate, VAR.venueName],
  },
  {
    id: "rsvp-reminder",
    name: "RSVP Reminder",
    description: "A gentle nudge for guests who have not yet responded.",
    icon: "MailQuestion",
    subject: "A gentle reminder to RSVP",
    body: "Dear {{recipientName}},\n\nWe are so looking forward to celebrating with you on {{eventDate}} at {{venueName}}. Our records show we have not yet received your response.\n\nWhen you have a quiet moment, kindly reply by {{rsvpDeadline}} so we may finalize seating and catering arrangements.\n\nWarmly,\nThe Couple",
    variables: [VAR.recipientName, VAR.eventDate, VAR.venueName, VAR.rsvpDeadline],
  },
  {
    id: "welcome-guest",
    name: "Welcome Guest Info",
    description: "Everything a guest needs to know before the celebration.",
    icon: "PartyPopper",
    subject: "Your guide to our celebration at {{venueName}}",
    body: "Dear {{recipientName}},\n\nWe are thrilled to welcome you to our wedding on {{eventDate}}. The celebration will be held at {{venueName}}, with the ceremony beginning promptly in the early evening.\n\nDress is formal, and we kindly ask guests to arrive thirty minutes early. Valet parking and accommodation details are enclosed.\n\nWe cannot wait to celebrate with you.\n\nWith gratitude,\nThe Couple",
    variables: [VAR.recipientName, VAR.eventDate, VAR.venueName],
  },
  {
    id: "vendor-payment",
    name: "Vendor Payment Follow-up",
    description: "A polished, professional note regarding an outstanding balance.",
    icon: "ReceiptText",
    subject: "Payment follow-up — {{vendorName}}",
    body: "Dear {{vendorName}} team,\n\nThank you for your wonderful work in preparing for our wedding on {{eventDate}}. We are writing regarding the outstanding balance of {{amountDue}} associated with your services.\n\nKindly confirm your preferred method of payment at your earliest convenience, and we will settle the invoice promptly.\n\nWith appreciation,\n{{recipientName}}",
    variables: [VAR.vendorName, VAR.eventDate, VAR.amountDue, VAR.recipientName],
  },
]

export function renderTemplate(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = values[key]
    return value && value.length > 0 ? value : `{{${key}}}`
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
