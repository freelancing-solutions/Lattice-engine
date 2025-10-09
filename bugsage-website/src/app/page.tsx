import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { ProblemSolution } from "@/components/problem-solution";
import { FeaturesGrid } from "@/components/features-grid";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSolution />
        <FeaturesGrid />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}