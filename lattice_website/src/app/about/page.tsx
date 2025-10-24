import { Metadata } from "next"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import AboutContent from "@/components/about-content"

const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://lattice-engine.com' 
  : 'http://localhost:3000'

export const metadata: Metadata = {
  title: "About | Lattice Engine - AI-Powered Agentic Coding Platform",
  description: "Learn about Lattice Engine's mission to revolutionize software development with AI-powered agentic coding. Discover our team, values, and vision for the future of development.",
  keywords: [
    "about lattice engine",
    "AI development team",
    "agentic coding company",
    "software development mission",
    "AI coding platform team",
    "development automation company"
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
    canonical: "/about",
  },
  openGraph: {
    title: "About | Lattice Engine - AI-Powered Agentic Coding Platform",
    description: "Learn about Lattice Engine's mission to revolutionize software development with AI-powered agentic coding. Discover our team, values, and vision for the future of development.",
    url: "/about",
    siteName: "Lattice Engine",
    images: [
      {
        url: "/og-about.png",
        width: 1200,
        height: 630,
        alt: "About Lattice Engine - AI-Powered Development Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Lattice Engine - AI-Powered Agentic Coding Platform",
    description: "Learn about Lattice Engine's mission to revolutionize software development with AI-powered agentic coding. Discover our team, values, and vision for the future of development.",
    images: ["/og-about.png"],
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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AboutContent />
      <Footer />
    </div>
  )
}