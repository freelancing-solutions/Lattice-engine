import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import QuickStartContent from "@/components/quickstart-content"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the Quick Start Guide page
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Quick Start Guide - Lattice Engine",
  description: "Get started with Lattice Engine in under 5 minutes. Learn the basics and start building AI-powered applications today.",
  keywords: ["lattice engine", "quick start", "tutorial", "getting started", "AI development", "living specifications", "intelligent mutations", "setup guide"],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "Quick Start Guide - Lattice Engine",
    description: "Get started with Lattice Engine in under 5 minutes. Learn the basics and start building AI-powered applications today.",
    url: `${baseUrl}/docs/quickstart`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine Quick Start Guide",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick Start Guide - Lattice Engine",
    description: "Get started with Lattice Engine in under 5 minutes. Learn the basics and start building AI-powered applications today.",
    images: [`${baseUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${baseUrl}/docs/quickstart`,
  },
}

const quickSteps = [
  {
    number: 1,
    title: "Install the Tools",
    description: "Choose your preferred development environment and install the necessary tools.",
    icon: Download,
    options: [
      {
        name: "JavaScript/TypeScript",
        description: "For Node.js and browser environments",
        code: "npm install -g @lattice/cli\nnpm install @lattice/engine"
      },
      {
        name: "Python",
        description: "For Python development environments",
        code: "pip install lattice-engine\npip install lattice-cli"
      }
    ]
  },
  {
    number: 2,
    title: "Create Your Account",
    description: "Sign up for a free account and get your API key.",
    icon: BookOpen,
    actions: [
"Visit https://app.project-lattice.site/register to create your account",
      "Navigate to Settings → API Keys",
      "Generate a new API key",
      "Copy and securely store your key"
    ]
  },
  {
    number: 3,
    title: "Initialize Your Project",
    description: "Set up your first Lattice project with living specifications.",
    icon: Terminal,
    code: "lattice init\n# Follow the prompts to configure your project"
  },
  {
    number: 4,
    title: "Create Your First Specification",
    description: "Define how your application should behave with living specifications.",
    icon: Code,
    code: "lattice spec create --name user-auth --template authentication"
  },
  {
    number: 5,
    title: "Make Your First Change",
    description: "Create a mutation and experience the intelligent workflow.",
    icon: Zap,
    code: "lattice mutation propose --spec user-auth --title 'Add password hashing'"
  }
]

const whatYoullLearn = [
  "Set up Lattice Engine in your development environment",
  "Create and manage living specifications",
  "Use intelligent mutations for code changes",
  "Understand the approval workflow",
  "Deploy your first AI-powered application"
]

const prerequisites = [
  "Node.js 16+ or Python 3.8+",
  "Git version control",
  "Code editor (VSCode recommended)",
  "Basic knowledge of command line",
  "Free Lattice Engine account"
]

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <QuickStartContent />
      <Footer />
    </div>
  )
}