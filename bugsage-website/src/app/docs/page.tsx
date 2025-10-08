import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { DocsClient } from "@/components/docs-client";
import { Book, Code, GitBranch, Shield, Zap, FileText, MessageSquare, Settings } from "lucide-react";

const docCategories = [
  {
    title: "Getting Started",
    description: "Quick start guides and installation instructions",
    icon: <Zap className="w-6 h-6" />,
    color: "text-blue-400",
    articles: [
      { title: "Installation Guide", description: "Get BugSage running in 5 minutes", href: "/docs/installation" },
      { title: "Quick Start", description: "Your first autonomous fix", href: "/docs/quickstart" },
      { title: "Configuration", description: "Set up your workspace", href: "/docs/configuration" }
    ]
  },
  {
    title: "Integration Guides",
    description: "Connect BugSage with your favorite tools",
    icon: <GitBranch className="w-6 h-6" />,
    color: "text-green-400",
    articles: [
      { title: "Project Lattice Integration", description: "Deep integration with Lattice", href: "/docs/lattice-integration" },
      { title: "Sentry MCP Setup", description: "Production error monitoring", href: "/docs/sentry-mcp" },
      { title: "VSCode Extension", description: "Development workflow integration", href: "/docs/vscode-extension" }
    ]
  },
  {
    title: "Features",
    description: "Detailed feature documentation",
    icon: <Code className="w-6 h-6" />,
    color: "text-purple-400",
    articles: [
      { title: "Autonomous Error Resolution", description: "How automatic fixing works", href: "/docs/autonomous-fixes" },
      { title: "Safety Rules", description: "Configure autonomous behavior", href: "/docs/safety-rules" },
      { title: "Spec Mutation Engine", description: "Automatic spec evolution", href: "/docs/spec-mutations" }
    ]
  },
  {
    title: "API Reference",
    description: "Technical documentation for developers",
    icon: <FileText className="w-6 h-6" />,
    color: "text-orange-400",
    articles: [
      { title: "REST API", description: "API endpoints and usage", href: "/docs/api" },
      { title: "Webhooks", description: "Event-driven integrations", href: "/docs/webhooks" },
      { title: "MCP Protocol", description: "Model Context Protocol", href: "/docs/mcp" }
    ]
  },
  {
    title: "Troubleshooting",
    description: "Common issues and solutions",
    icon: <Shield className="w-6 h-6" />,
    color: "text-red-400",
    articles: [
      { title: "Common Issues", description: "Frequently encountered problems", href: "/docs/troubleshooting" },
      { title: "Debug Mode", description: "Enable diagnostic logging", href: "/docs/debug-mode" },
      { title: "Performance Tuning", description: "Optimize BugSage performance", href: "/docs/performance" }
    ]
  },
  {
    title: "Support",
    description: "Get help and connect with the community",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "text-cyan-400",
    articles: [
      { title: "FAQ", description: "Frequently asked questions", href: "/docs/faq" },
      { title: "Community Forum", description: "Join the discussion", href: "/docs/community" },
      { title: "Contact Support", description: "Get direct help", href: "/docs/support" }
    ]
  }
];

const quickLinks = [
  { title: "Installation", href: "/docs/installation", icon: <Zap className="w-4 h-4" /> },
  { title: "Quick Start", href: "/docs/quickstart", icon: <Book className="w-4 h-4" /> },
  { title: "Lattice Integration", href: "/docs/lattice-integration", icon: <GitBranch className="w-4 h-4" /> },
  { title: "API Reference", href: "/docs/api", icon: <Code className="w-4 h-4" /> }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <DocsClient 
          docCategories={docCategories}
          quickLinks={quickLinks}
        />
      </main>
      
      <Footer />
    </div>
  );
}