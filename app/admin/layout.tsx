import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Évora — Wedding Concierge Admin',
  description:
    'A premium concierge dashboard to manage RSVPs, guests, vendors, and invoices for your wedding.',
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}