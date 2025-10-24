import { Metadata } from "next";
import TutorialsAndGuidesContent from "@/components/tutorials-and-guides-content"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Tutorials & Guides - Lattice Engine",
  description: "Step-by-step guides to master Lattice Engine. Learn advanced workflows, team collaboration, CI/CD integration, and best practices.",
  keywords: ["lattice engine", "tutorials", "guides", "learning", "advanced workflows", "team collaboration", "CI/CD", "best practices", "training"],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "Tutorials & Guides - Lattice Engine",
    description: "Step-by-step guides to master Lattice Engine. Learn advanced workflows, team collaboration, CI/CD integration, and best practices.",
    url: `${baseUrl}/docs/tutorials-and-guides`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine Tutorials & Guides",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutorials & Guides - Lattice Engine",
    description: "Step-by-step guides to master Lattice Engine. Learn advanced workflows, team collaboration, CI/CD integration, and best practices.",
    images: [`${baseUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${baseUrl}/docs/tutorials-and-guides`,
  },
}

export default function TutorialsAndGuidesPage() {
  return <TutorialsAndGuidesContent />
}