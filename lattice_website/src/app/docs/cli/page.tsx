import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import CLIContent from "@/components/cli-content"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "CLI Documentation - Lattice Engine | Command Line Interface",
  description: "Automate workflows and integrate with CI/CD. Learn installation, global flags, dry-run previews, environment variables, and examples for key commands with Lattice CLI tools.",
  keywords: [
    "lattice cli",
    "command line interface",
    "cli tools",
    "automation",
    "ci/cd integration",
    "npm package",
    "project initialization",
    "dry-run previews",
    "environment variables",
    "workflow automation"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "CLI Documentation - Lattice Engine",
    description: "Automate workflows and integrate with CI/CD. Learn installation, global flags, dry-run previews, environment variables, and examples for key commands.",
    url: `${baseUrl}/docs/cli`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-cli-docs.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine CLI Documentation"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "CLI Documentation - Lattice Engine",
    description: "Automate workflows and integrate with CI/CD. Learn installation, global flags, dry-run previews, environment variables, and examples for key commands.",
    images: [`${baseUrl}/og-cli-docs.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/docs/cli`
  }
}

export default function CLIDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <CLIContent />
      </main>
      <Footer />
    </div>
  )
}