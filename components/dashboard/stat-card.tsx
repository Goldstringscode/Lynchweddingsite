import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent?: "green" | "gold"
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "green",
}: StatCardProps) {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-serif text-3xl font-semibold text-foreground">
            {value}
          </p>
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accent === "green"
              ? "bg-primary/10 text-primary"
              : "bg-gold/15 text-gold-foreground"
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}
