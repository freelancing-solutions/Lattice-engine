import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import ValuePropositions from "@/components/value-propositions"
import InteractiveDemo from "@/components/interactive-demo"
import DeveloperFeatures from "@/components/developer-features"
import DocumentationHub from "@/components/documentation-hub"
import Footer from "@/components/footer"

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