import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { ProblemSolution } from "@/components/problem-solution";
import { LatticeSpotlight } from "@/components/lattice-spotlight";
import { FeaturesGrid } from "@/components/features-grid";
import { DemoSection } from "@/components/demo-section";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSolution />
        <LatticeSpotlight />
        <FeaturesGrid />
        <DemoSection />
        <TestimonialsCarousel />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}