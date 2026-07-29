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
      // Solid background color on <html> bypasses CSS variable resolution delay,
      // preventing the gray-flash-of-unstyled-content (FOUC)
      style={{ backgroundColor: '#0a0a0f' }}
      suppressHydrationWarning
    >
      {/* Inline CSS to paint the background instantly — before external CSS loads */}
      <style
        dangerouslySetInnerHTML={{
          __html: [
            'html, body {',
            '  background-color: #0a0a0f !important;',
            '  margin: 0;',
            '  padding: 0;',
            '}',
            ':root {',
            '  --background: oklch(0.145 0 0);',
            '  --foreground: oklch(0.985 0 0);',
            '}',
            // Light mode override — only applied when explicitly requested
            '.light {',
            '  --background: oklch(0.98 0 0);',
            '  --foreground: oklch(0.15 0 0);',
            '}',
            '.light, .light body {',
            '  background-color: #fafafa !important;',
            '}',
          ].join('\n'),
        }}
      />
      <body className="font-sans antialiased" style={{ backgroundColor: '#0a0a0f' }}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}