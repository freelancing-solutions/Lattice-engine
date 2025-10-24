import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PricingContent from "@/components/pricing-content"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Pricing Plans - Lattice Engine | AI-Powered Development Platform",
  description: "Choose the perfect plan for your team. From individual developers to enterprise organizations, find flexible pricing for AI-powered agentic coding with Lattice Engine.",
  keywords: [
    "lattice engine pricing",
    "ai development platform pricing", 
    "agentic coding plans",
    "developer tools pricing",
    "team collaboration pricing",
    "enterprise development platform",
    "ai coding assistant pricing",
    "mutation tracking pricing"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "Pricing Plans - Lattice Engine",
    description: "Choose the perfect plan for your team. From individual developers to enterprise organizations, find flexible pricing for AI-powered agentic coding.",
    url: `${baseUrl}/pricing`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-pricing.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine Pricing Plans"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans - Lattice Engine",
    description: "Choose the perfect plan for your team. From individual developers to enterprise organizations, find flexible pricing for AI-powered agentic coding.",
    images: [`${baseUrl}/og-pricing.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/pricing`
  }
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PricingContent />
      <Footer />
    </div>
  )
}