import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "The Lynch's — Wedding Concierge Admin",
  description:
    'A premium concierge dashboard to manage RSVPs, guests, vendors, and invoices for your wedding.',
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="light min-h-svh bg-background">{children}</div>
}