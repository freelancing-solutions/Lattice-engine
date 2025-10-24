import { Metadata } from "next"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import FeaturesContent from "@/components/features-content"

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://lattice-engine.com' 
  : 'http://localhost:3000'

export const metadata: Metadata = {
  title: "Features | Lattice Engine - AI-Powered Development Tools",
  description: "Explore the comprehensive features of Lattice Engine, including AI-powered development tools, real-time collaboration, automated testing, and advanced debugging capabilities.",
  keywords: [
    "AI development tools",
    "code generation",
    "automated testing",
    "version control",
    "performance optimization",
    "cloud deployment",
    "team collaboration",
    "developer tools"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  creator: "Lattice Engine",
  publisher: "Lattice Engine",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features | Lattice Engine - AI-Powered Development Tools",
    description: "Explore the comprehensive features of Lattice Engine, including AI-powered development tools, real-time collaboration, and advanced debugging capabilities.",
    url: "/features",
    siteName: "Lattice Engine",
    images: [
      {
        url: "/og-features.png",
        width: 1200,
        height: 630,
        alt: "Lattice Engine Features - AI-Powered Development Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features | Lattice Engine - AI-Powered Development Tools",
    description: "Explore the comprehensive features of Lattice Engine, including AI-powered development tools, real-time collaboration, and advanced debugging capabilities.",
    images: ["/og-features.png"],
    creator: "@latticeengine",
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
  verification: {
    google: "your-google-verification-code",
  },
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <FeaturesContent />
      <Footer />
    </div>
  )
}