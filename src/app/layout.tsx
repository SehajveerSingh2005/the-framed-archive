// Group imports at the top
import "./globals.css"
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react'

export const metadata = {
  title: "The Framed Archive",
  description: "Art that speaks. Discover and shop unique art prints, posters, and framed artwork from The Framed Archive collection.",
  keywords: "art prints, posters, framed artwork, wall art, home decor, art collection",
  metadataBase: new URL('https://theframedarchive.com'),
  // Add these new fields
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-us',
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  authors: [{ name: 'The Framed Archive' }],
  creator: 'The Framed Archive',
  publisher: 'The Framed Archive',
  openGraph: {
    title: 'The Framed Archive',
    description: 'Art that speaks. Discover and shop unique art prints, posters, and framed artwork.',
    url: 'https://theframedarchive.com',
    siteName: 'The Framed Archive',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Framed Archive',
    description: 'Art that speaks. Discover and shop unique art prints, posters, and framed artwork.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-title" content="The Framed Archive" />
      </head>
      <body>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}