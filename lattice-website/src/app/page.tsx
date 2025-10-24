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
  title: "Project Lattice - Spec-Driven Development for the Agentic Era",
  description: "Unified orchestration for AI coding agents. Project Lattice is a unified ecosystem for spec-driven agentic development that brings order, traceability, and coherence to multi-agent software development.",
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
  openGraph: {
    title: "Project Lattice - Spec-Driven Development for the Agentic Era",
    description: "Unified orchestration for AI coding agents. One ecosystem, infinite coders, zero chaos.",
    url: baseUrl,
    siteName: "Project Lattice",
    images: [
      {
        url: `${baseUrl}/og-home.png`,
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
    title: "Project Lattice - Spec-Driven Development for the Agentic Era", 
    description: "Unified orchestration for AI coding agents. One ecosystem, infinite coders, zero chaos.",
    images: [`${baseUrl}/twitter-home.png`],
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