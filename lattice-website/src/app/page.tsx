import { Metadata } from "next";
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import ValuePropositions from "@/components/value-propositions"
import InteractiveDemo from "@/components/interactive-demo"
import DeveloperFeatures from "@/components/developer-features"
import DocumentationHub from "@/components/documentation-hub"
import Footer from "@/components/footer"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Lattice Engine - AI-Powered Development Platform",
  description: "Transform your development workflow with Lattice Engine's AI-powered platform. Intelligent code generation, automated testing, and seamless deployment for modern applications.",
  keywords: [
    "spec-driven development",
    "agentic development",
    "AI coding agents",
    "unified ecosystem",
    "mutation engine",
    "agentic orchestration",
    "cross-project traceability",
    "autonomous error resolution",
    "lattice portal",
    "bugsage integration",
    "MCP servers",
    "CLI tools"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "Project Lattice - Spec-Driven Development for the Agentic Era",
    description: "Unified orchestration for AI coding agents. One ecosystem, infinite coders, zero chaos.",
    url: baseUrl,
    siteName: "Project Lattice",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Project Lattice - Spec-Driven Development for the Agentic Era",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice Engine - AI-Powered Development Platform", 
    description: "Transform your development workflow with Lattice Engine's AI-powered platform. Intelligent code generation, automated testing, and seamless deployment.",
    images: [`${baseUrl}/og-image.png`],
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ValuePropositions />
        <InteractiveDemo />
        <DeveloperFeatures />
        <DocumentationHub />
      </main>
      <Footer />
    </div>
  )
}