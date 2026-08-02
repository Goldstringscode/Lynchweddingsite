'use client'

export default function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-svh bg-background">{children}</div>
}