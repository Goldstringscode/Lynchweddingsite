"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const PopoverContext = React.createContext<PopoverContextValue>({
  open: false,
  setOpen: () => {},
})

function usePopover() {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) throw new Error("Popover components must be used within <Popover>")
  return ctx
}

export function Popover({ children, defaultOpen = false }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({
  asChild,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, setOpen } = usePopover()
  if (asChild) {
    return React.cloneElement(React.Children.only(children) as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        setOpen(!open)
        ;(children as React.ReactElement).props.onClick?.(e)
      },
      "aria-expanded": open,
    })
  }
  return (
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} {...props}>
      {children}
    </button>
  )
}

export function PopoverContent({
  children,
  className,
  align = "center",
  sideOffset = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  const { open } = usePopover()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const ctx = ref.current.closest("[data-popover-root]")
        if (ctx) {
          const setOpen = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            ?.events?.[0]?.setOpen
          // Close handled by click on trigger
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  if (!open) return null

  return (
    <div
      ref={ref}
      data-popover-content=""
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}