import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PricingClient } from "@/components/pricing-client";
import { Star, Zap, Shield } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - BugSage AI-Powered Debugging",
  description: "Simple, developer-friendly pricing for BugSage. Free tier for individuals, Pro for teams, and Enterprise for large organizations. Start with unlimited diagnostics and autonomous error resolution.",
  keywords: ["BugSage pricing", "AI debugging cost", "autonomous debugging pricing", "error resolution pricing", "developer tools pricing"],
  openGraph: {
    title: "BugSage Pricing - Simple & Developer-Friendly",
    description: "Choose the perfect plan for your needs. Free tier available, with advanced features for Pro and Enterprise users.",
    url: "https://bugsage.site/pricing",
  },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out BugSage",
    icon: <Star className="w-6 h-6" />,
    badge: null,
    features: [
      "100 diagnostics/month",
      "Single project",
      "VSCode extension",
      "Community support",
      ".lattice/ integration",
      "Basic error detection"
    ],
    limitations: [
      "No team collaboration",
      "Limited to 100 errors/month",
      "Community support only"
    ],
    cta: "Sign Up Free",
    ctaLink: "/beta-signup",
    popular: false
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For professional developers and teams",
    icon: <Zap className="w-6 h-6" />,
    badge: "Most Popular",
    features: [
      "Unlimited diagnostics",
      "Unlimited projects",
      "Team collaboration",
      "Priority support",
      "Advanced AI models",
      "Cloud sync & backup",
      "Custom integrations",
      "Advanced safety rules",
      "Historical pattern learning"
    ],
    limitations: [],
    cta: "Start Free Trial",
    ctaLink: "/beta-signup",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with special needs",
    icon: <Shield className="w-6 h-6" />,
    badge: "Advanced",
    features: [
      "Everything in Pro, plus:",
      "Self-hosted option",
      "SSO/SAML integration",
      "SLA guarantees",
      "Dedicated support",
      "Custom AI training",
      "Multi-region deployment",
      "Advanced compliance",
      "Custom integrations",
      "White-label options"
    ],
    limitations: [],
    cta: "Contact Sales",
    ctaLink: "/contact",
    popular: false
  }
];

const faqs = [
  {
    question: "What counts as a diagnostic?",
    answer: "A diagnostic is counted when BugSage analyzes an error and generates a report. This includes production errors from Sentry, development errors from VSCode, and CI/CD failures. Each error instance counts as one diagnostic."
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount for the remainder of your billing cycle. When downgrading, the change takes effect at the next billing cycle."
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes! We offer a 14-day free trial for the Pro plan with full access to all features. No credit card required to start your trial."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise customers. All payments are processed securely through Stripe."
  },
  {
    question: "Do you offer educational/OSS discounts?",
    answer: "Yes! We offer special pricing for educational institutions, students, and open source projects. Please contact our sales team with your .edu email or OSS project details for more information."
  }
];

const comparisonFeatures = [
  { name: "Diagnostics per month", free: "100", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Projects", free: "1", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Team members", free: "1", pro: "5", enterprise: "Unlimited" },
  { name: "VSCode extension", free: "✓", pro: "✓", enterprise: "✓" },
  { name: ".lattice/ integration", free: "✓", pro: "✓", enterprise: "✓" },
  { name: "Sentry MCP integration", free: "✓", pro: "✓", enterprise: "✓" },
  { name: "Team collaboration", free: "✗", pro: "✓", enterprise: "✓" },
  { name: "Priority support", free: "✗", pro: "✓", enterprise: "✓" },
  { name: "Cloud sync & backup", free: "✗", pro: "✓", enterprise: "✓" },
  { name: "Custom integrations", free: "✗", pro: "✓", enterprise: "✓" },
  { name: "Self-hosted option", free: "✗", pro: "✗", enterprise: "✓" },
  { name: "SSO/SAML", free: "✗", pro: "✗", enterprise: "✓" },
  { name: "SLA guarantees", free: "✗", pro: "✗", enterprise: "✓" },
  { name: "Dedicated support", free: "✗", pro: "✗", enterprise: "✓" }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <PricingClient 
          plans={plans}
          faqs={faqs}
          comparisonFeatures={comparisonFeatures}
        />
      </main>
      
      <Footer />
    </div>
  );
}