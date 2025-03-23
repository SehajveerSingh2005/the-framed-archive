// Group imports at the top
import "./globals.css"
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react'

export const metadata = {
  title: "The Framed Archive",
  description: "Art that speaks.",
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