import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Store,
  ReceiptText,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type PageKey =
  | "dashboard"
  | "rsvps"
  | "menu"
  | "vendors"
  | "invoices"
  | "emails"
  | "settings"

export interface NavItem {
  key: PageKey
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "rsvps", label: "RSVPs & Guests", icon: Users },
  { key: "menu", label: "Menu & Catering", icon: UtensilsCrossed },
  { key: "vendors", label: "Vendors", icon: Store },
  { key: "invoices", label: "Invoices", icon: ReceiptText },
  { key: "emails", label: "Email Templates", icon: Mail },
  { key: "settings", label: "Settings", icon: Settings },
]
