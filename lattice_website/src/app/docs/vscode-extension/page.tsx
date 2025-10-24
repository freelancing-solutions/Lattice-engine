import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import VSCodeExtensionContent from "@/components/vscode-extension-content"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the VSCode Extension page
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "VSCode Extension v1.5.2 - Lattice Engine",
  description: "Native VSCode integration with IntelliSense support, real-time validation, and debugging tools. Install and configure the Lattice Engine extension.",
  keywords: ["lattice engine", "vscode extension", "intellisense", "code completion", "debugging", "real-time validation", "IDE integration", "development tools"],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "VSCode Extension v1.5.2 - Lattice Engine",
    description: "Native VSCode integration with IntelliSense support, real-time validation, and debugging tools. Install and configure the Lattice Engine extension.",
    url: `${baseUrl}/docs/vscode-extension`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine VSCode Extension",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "VSCode Extension v1.5.2 - Lattice Engine",
    description: "Native VSCode integration with IntelliSense support, real-time validation, and debugging tools. Install and configure the Lattice Engine extension.",
    images: [`${baseUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${baseUrl}/docs/vscode-extension`,
  },
}



export default function VSCodeExtensionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <VSCodeExtensionContent />
      </main>
      <Footer />
    </div>
  )
}