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
  themeColor: '#fafafa',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`light bg-background ${playfair.variable} ${montserrat.variable}`}
      style={{ backgroundColor: '#fafafa' }}
    >
      {/* Critical inline CSS — loads before external CSS imports to prevent gray flash */}
      <style
        dangerouslySetInnerHTML={{
          __html: [
            'html, body, [data-nextjs-root], #__next {',
            '  background-color: #fafafa !important;',
            '}',
            ':root {',
            '  --background: oklch(0.98 0 0);',
            '  --foreground: oklch(0.15 0 0);',
            '}',
            '.dark, :root:not(.light) {',
            '  --background: oklch(0.145 0 0);',
            '  --foreground: oklch(0.985 0 0);',
            '}',
          ].join('\n'),
        }}
      />
      <body className="font-sans antialiased" style={{ backgroundColor: '#fafafa' }}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}