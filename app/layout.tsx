import type React from "react"
import type { Metadata } from "next"
// import { Geist, Geist_Mono } from "next/font/google"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Your News Site - Latest News & Updates",
    template: "%s | Your News Site",
  },
  description: "Stay informed with the latest news, breaking stories, and in-depth analysis from around the world.",
  keywords: ["news", "breaking news", "world news", "politics", "technology", "sports", "business"],
  authors: [{ name: "News Team" }],
  creator: "Your News Site",
  publisher: "Your News Site",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://your-news-site.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Your News Site",
    title: "Your News Site - Latest News & Updates",
    description: "Stay informed with the latest news, breaking stories, and in-depth analysis from around the world.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Your News Site",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your News Site - Latest News & Updates",
    description: "Stay informed with the latest news, breaking stories, and in-depth analysis from around the world.",
    images: ["/og-default.jpg"],
    creator: "@yournewssite",
    site: "@yournewssite",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>

        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
      </body>
    </html>
  )
}
