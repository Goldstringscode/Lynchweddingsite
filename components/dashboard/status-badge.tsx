import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  Beef,
  Ham,
  Drumstick,
  Fish,
  Leaf,
  type LucideIcon,
} from "lucide-react"
import type {
  RsvpStatus,
  VendorStatus,
  InvoiceStatus,
  MealChoice,
} from "@/lib/data"

const mealMeta: Record<MealChoice, LucideIcon> = {
  Beef,
  Pork: Ham,
  Chicken: Drumstick,
  Fish,
  Vegan: Leaf,
}

export function MealBadge({ meal }: { meal: MealChoice }) {
  const Icon = mealMeta[meal]
  return (
    <Badge
      variant="outline"
      className="border-border bg-secondary text-secondary-foreground"
    >
      <Icon className="text-gold-foreground" />
      {meal}
    </Badge>
  )
}

export function RsvpStatusBadge({ status }: { status: RsvpStatus }) {
  if (status === "Accepted") {
    return (
      <Badge className="border border-primary/20 bg-primary/10 text-primary">
        <CheckCircle2 />
        Accepted
      </Badge>
    )
  }
  if (status === "Checked-In") {
    return (
      <Badge className="border border-gold/40 bg-gold/15 text-gold-foreground">
        <UserCheck />
        Checked-In
      </Badge>
    )
  }
  return (
    <Badge variant="destructive">
      <XCircle />
      Declined
    </Badge>
  )
}

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  if (status === "Confirmed") {
    return (
      <Badge className="border border-primary/20 bg-primary/10 text-primary">
        <CheckCircle2 />
        Confirmed
      </Badge>
    )
  }
  return (
    <Badge className="border border-gold/40 bg-gold/15 text-gold-foreground">
      <Clock />
      Pending
    </Badge>
  )
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const map = {
    Paid: {
      className: "border border-primary/20 bg-primary/10 text-primary",
      Icon: CheckCircle2,
    },
    Unpaid: {
      className: "border border-gold/40 bg-gold/15 text-gold-foreground",
      Icon: Clock,
    },
    Overdue: {
      className: "",
      Icon: AlertCircle,
    },
  } as const
  const { className, Icon } = map[status]
  return (
    <Badge
      variant={status === "Overdue" ? "destructive" : "default"}
      className={cn(className)}
    >
      <Icon />
      {status}
    </Badge>
  )
}
