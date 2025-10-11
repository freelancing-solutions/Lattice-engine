"use client"

import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lattice-engine.com";

// Metadata for the Features page
export const metadata: Metadata = {
  title: "Features - Lattice Engine | AI-Powered Development Tools",
  description: "Explore the comprehensive features of Lattice Engine, including AI-powered development tools, real-time collaboration, automated testing, and advanced debugging capabilities.",
  keywords: "AI development tools, code generation, automated testing, version control, performance optimization, cloud deployment, team collaboration, developer tools",
  authors: [{ name: "Lattice Engine Team" }],
  creator: "Lattice Engine",
  publisher: "Lattice Engine",
  robots: "index, follow",
  openGraph: {
    title: "Features - Lattice Engine | AI-Powered Development Tools",
    description: "Explore the comprehensive features of Lattice Engine, including AI-powered development tools, real-time collaboration, and advanced debugging capabilities.",
    url: `${baseUrl}/features`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine - Features"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Features - Lattice Engine | AI-Powered Development Tools",
    description: "Explore the comprehensive features of Lattice Engine, including AI-powered development tools, real-time collaboration, and advanced debugging capabilities.",
    images: [`${baseUrl}/og-image.jpg`],
    creator: "@latticeengine"
  },
  alternates: {
    canonical: `${baseUrl}/features`
  }
}
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Terminal, 
  Code, 
  Webhook, 
  Database, 
  Copy, 
  ExternalLink,
  Zap,
  Shield,
  GitBranch,
  Cpu,
  Cloud,
  Users,
  BarChart3,
  Puzzle
} from "lucide-react"

const coreFeatures = [
  {
    icon: Zap,
    title: "AI-Powered Code Generation",
    description: "Generate high-quality code from natural language descriptions",
    features: ["Natural language to code", "Context-aware suggestions", "Multi-language support", "Smart refactoring"]
  },
  {
    icon: Shield,
    title: "Automated Testing",
    description: "Comprehensive test generation and execution",
    features: ["Unit test generation", "Integration testing", "Performance testing", "Security scanning"]
  },
  {
    icon: GitBranch,
    title: "Version Control Integration",
    description: "Seamless Git workflow integration",
    features: ["Branch management", "Merge conflict resolution", "Code review automation", "Release management"]
  },
  {
    icon: Cpu,
    title: "Performance Optimization",
    description: "Intelligent performance analysis and optimization",
    features: ["Code profiling", "Memory optimization", "Database query optimization", "Bundle size analysis"]
  },
  {
    icon: Cloud,
    title: "Cloud Deployment",
    description: "One-click deployment to multiple cloud providers",
    features: ["Multi-cloud support", "Auto-scaling", "Load balancing", "Environment management"]
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Built-in tools for team productivity",
    features: ["Real-time collaboration", "Code sharing", "Team analytics", "Permission management"]
  }
]

const developerTools = [
  {
    icon: Terminal,
    title: "CLI Integration",
    description: "Powerful command-line tools for automation",
    code: "npx lattice mutation propose --spec user-auth",
    features: ["Automation scripts", "CI/CD integration", "Batch operations", "Custom workflows"]
  },
  {
    icon: Code,
    title: "VSCode Extension",
    description: "Native IDE integration with IntelliSense",
    code: "// Auto-complete for Lattice APIs\nlattice.mutation.create({...})",
    features: ["Real-time validation", "Code completion", "Integrated debugging", "Live preview"]
  },
  {
    icon: Webhook,
    title: "REST API",
    description: "Full programmatic access to all features",
    code: "POST /api/v1/mutations\n{\n  \"spec_id\": \"user-auth\",\n  \"changes\": {...}\n}",
    features: ["RESTful design", "Webhook support", "Rate limiting", "OAuth 2.0 security"]
  },
  {
    icon: Database,
    title: "MCP Servers",
    description: "Model Context Protocol integration",
    code: "https://mcp.project-lattice.site/specs/user-management",
    features: ["Real-time sync", "Multi-client support", "Event streaming", "State management"]
  }
]

const analyticsFeatures = [
  {
    icon: BarChart3,
    title: "Development Analytics",
    description: "Comprehensive insights into your development process",
    metrics: ["Code quality scores", "Development velocity", "Bug detection rates", "Team productivity"]
  },
  {
    icon: Puzzle,
    title: "Integration Ecosystem",
    description: "Connect with your favorite development tools",
    integrations: ["GitHub/GitLab", "Jira/Linear", "Slack/Discord", "Docker/Kubernetes"]
  }
]

export default function FeaturesPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Powerful Features for
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent"> Modern Development</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover the comprehensive suite of AI-powered tools and features that make Lattice Engine 
                the ultimate development platform for teams of all sizes.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">AI-Powered</Badge>
                <Badge variant="secondary" className="bg-blue-600 text-white">Cloud-Native</Badge>
                <Badge variant="secondary" className="bg-green-600 text-white">Team-Ready</Badge>
                <Badge variant="secondary" className="bg-orange-600 text-white">Enterprise-Grade</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Core Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to accelerate your development workflow and build better software faster.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl text-foreground">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-muted-foreground text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Tools */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Developer Tools
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Integrate Lattice seamlessly into your existing workflow with tools designed for how you actually work.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {developerTools.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-background border-border hover:border-primary transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <tool.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-foreground">
                            {tool.title}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {tool.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded text-muted-foreground font-mono text-sm overflow-x-auto border border-border">
                          <code>{tool.code}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(tool.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">Key Features:</h4>
                        <ul className="space-y-2">
                          {tool.features.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-muted-foreground text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Documentation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics & Integrations */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Analytics & Integrations
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get insights into your development process and connect with your favorite tools.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {analyticsFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl text-foreground">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(feature.metrics || feature.integrations)?.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-muted-foreground text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-orange-600">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Experience These Features?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Join thousands of developers who are already building better software with Lattice Engine. 
                Start your free trial today - no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Schedule Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}