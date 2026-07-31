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
            ':root {',
                        '  --background: oklch(0.145 0 0);',
                        '  --foreground: oklch(0.985 0 0);',
                        '}',
                        ':root:not(.light) {',
                                    '  --primary: oklch(0.42 0.075 152) !important;',
                                    '  --gold: oklch(0.74 0.125 84) !important;',
                                    '}',
            '.light {',
            '  background-color: #fafafa;',
            '  color: oklch(0.15 0 0);',
            '  --background: oklch(0.98 0 0);',
            '  --foreground: oklch(0.15 0 0);',
            '  --card: oklch(1 0 0);',
            '  --card-foreground: oklch(0.15 0 0);',
            '  --muted: oklch(0.96 0 0);',
            '  --muted-foreground: oklch(0.5 0 0);',
            '  --border: oklch(0.9 0 0);',
            '  --input: oklch(0.9 0 0);',
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