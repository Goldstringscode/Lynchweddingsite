import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nikkita & Justin — Wedding',
  description:
    'Join us as we celebrate the wedding of Nikkita & Justin. View the details, itinerary, and RSVP to our special day.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      {/* Inline CSS to prevent gray flash — paints bg before external CSS loads */}
      <style
        dangerouslySetInnerHTML={{
          __html: [
            'html { background-color: #0a0a0f; }',
            'body { background-color: #0a0a0f; margin: 0; padding: 0; }',
            /* Default: dark mode with green/gold theme */
            ':root {',
            '  --background: oklch(0.145 0 0);',
            '  --foreground: oklch(0.985 0 0);',
            '  --card: oklch(0.185 0 0);',
            '  --card-foreground: oklch(0.985 0 0);',
            '  --popover: oklch(0.185 0 0);',
            '  --popover-foreground: oklch(0.985 0 0);',
            '  --primary: oklch(0.42 0.075 152);',
            '  --primary-foreground: oklch(0.985 0 0);',
            '  --gold: oklch(0.74 0.125 84);',
            '  --gold-foreground: oklch(0.22 0.02 84);',
            '  --secondary: oklch(0.25 0 0);',
            '  --secondary-foreground: oklch(0.985 0 0);',
            '  --muted: oklch(0.25 0 0);',
            '  --muted-foreground: oklch(0.78 0 0);',
            '  --accent: oklch(0.25 0.02 152);',
            '  --accent-foreground: oklch(0.985 0 0);',
            '  --destructive: oklch(0.704 0.191 22.216);',
            '  --border: oklch(1 0 0 / 12%);',
            '  --input: oklch(1 0 0 / 15%);',
            '  --ring: oklch(0.42 0.075 152);',
            '}',
            /* Override globals.css @media (prefers-color-scheme: dark) which sets primary to gray */
            ':root:not(.light) {',
            '  --primary: oklch(0.42 0.075 152) !important;',
            '  --primary-foreground: oklch(0.985 0 0) !important;',
            '  --gold: oklch(0.74 0.125 84) !important;',
            '  --gold-foreground: oklch(0.22 0.02 84) !important;',
            '  --muted-foreground: oklch(0.78 0 0) !important;',
            '  --card: oklch(0.185 0 0) !important;',
            '  --card-foreground: oklch(0.985 0 0) !important;',
            '  --popover: oklch(0.185 0 0) !important;',
            '  --popover-foreground: oklch(0.985 0 0) !important;',
            '  --secondary: oklch(0.25 0 0) !important;',
            '  --secondary-foreground: oklch(0.985 0 0) !important;',
            '  --muted: oklch(0.25 0 0) !important;',
            '  --accent: oklch(0.25 0.02 152) !important;',
            '  --accent-foreground: oklch(0.985 0 0) !important;',
            '  --border: oklch(1 0 0 / 12%) !important;',
            '  --input: oklch(1 0 0 / 15%) !important;',
            '  --ring: oklch(0.42 0.075 152) !important;',
            '  --background: oklch(0.145 0 0) !important;',
            '  --foreground: oklch(0.985 0 0) !important;',
            '}',
            '.light {',
            '  background-color: #fafafa;',
            '  color: oklch(0.15 0 0);',
            '  --background: oklch(0.98 0 0);',
            '  --foreground: oklch(0.15 0 0);',
            '  --card: oklch(1 0 0);',
            '  --card-foreground: oklch(0.15 0 0);',
            '  --popover: oklch(1 0 0);',
            '  --popover-foreground: oklch(0.15 0 0);',
            '  --primary: oklch(0.42 0.075 152);',
            '  --primary-foreground: oklch(0.985 0 0);',
            '  --gold: oklch(0.74 0.125 84);',
            '  --gold-foreground: oklch(0.22 0.02 84);',
            '  --secondary: oklch(0.96 0 0);',
            '  --secondary-foreground: oklch(0.2 0 0);',
            '  --muted: oklch(0.96 0 0);',
            '  --muted-foreground: oklch(0.5 0 0);',
            '  --accent: oklch(0.95 0.02 150);',
            '  --accent-foreground: oklch(0.42 0.075 152);',
            '  --border: oklch(0.9 0 0);',
            '  --input: oklch(0.9 0 0);',
            '  --ring: oklch(0.42 0.075 152);',
            '  --destructive: oklch(0.577 0.245 27.325);',
            '}',
          ].join('\n'),
        }}
      />
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}