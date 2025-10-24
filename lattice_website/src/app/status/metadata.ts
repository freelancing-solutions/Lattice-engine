import { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  title: "System Status - Lattice Engine",
  description: "Real-time status monitoring for Lattice Engine services. Check system health, service availability, and incident reports for our AI-powered development platform.",
  keywords: [
    "system status",
    "service monitoring", 
    "uptime tracking",
    "incident reports",
    "service health",
    "system availability",
    "lattice engine status",
    "platform monitoring",
    "service dashboard",
    "system metrics"
  ],
  openGraph: {
    title: "System Status - Lattice Engine",
    description: "Real-time status monitoring for Lattice Engine services. Check system health, service availability, and incident reports.",
    url: `${baseUrl}/status`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-status.png`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine System Status Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "System Status - Lattice Engine",
    description: "Real-time status monitoring for Lattice Engine services. Check system health, service availability, and incident reports.",
    images: [`${baseUrl}/twitter-status.png`],
  },
  alternates: {
    canonical: `${baseUrl}/status`,
  },
  robots: {
    index: true,
    follow: true,
  },
}