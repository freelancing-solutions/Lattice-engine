"use client"

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Terminal, 
  Code, 
  Bot, 
  Globe, 
  BarChart3, 
  Zap, 
  ExternalLink, 
  Copy,
  Cog,
  Bug,
  Layers,
  Puzzle,
  Database,
  Webhook
} from 'lucide-react'
import { motion } from 'framer-motion'

// Metadata is handled by the layout or moved to a server component
// since this is a client component using framer-motion

const ecosystemComponents = [
  {
    icon: Zap,
    title: "Mutation Engine",
    description: "The core orchestration engine that transforms specifications into executable code changes",
    features: ["Spec-to-code transformation", "Cross-project traceability", "Autonomous error resolution", "Multi-agent coordination"],
    status: "Core",
    link: "/docs/mutation-engine"
  },
  {
    icon: Globe,
    title: "Lattice Portal",
    description: "Centralized web interface for managing specifications, mutations, and project orchestration",
    features: ["Unified project dashboard", "Spec management", "Real-time mutation tracking", "Team collaboration"],
    status: "Core",
    link: "/portal"
  },
  {
    icon: Bug,
    title: "BugSage",
    description: "AI-powered debugging companion that provides contextual error analysis and resolution",
    features: ["Intelligent error detection", "Contextual debugging", "Automated fix suggestions", "Learning from patterns"],
    status: "Core",
    link: "/bugsage"
  },
  {
    icon: Code,
    title: "VSCode Extension",
    description: "Native IDE integration bringing spec-driven development directly to your editor",
    features: ["Inline spec editing", "Real-time validation", "Mutation preview", "Integrated debugging"],
    status: "Core",
    link: "/docs/vscode-extension"
  },
  {
    icon: Terminal,
    title: "CLI Tools",
    description: "Command-line interface for automation and CI/CD integration",
    features: ["Spec management", "Mutation automation", "CI/CD integration", "Batch operations"],
    status: "Core",
    link: "/docs/cli"
  },
  {
    icon: Database,
    title: "MCP Servers",
    description: "Model Context Protocol servers for seamless AI agent integration",
    features: ["Real-time spec sync", "Multi-agent coordination", "Context sharing", "Event streaming"],
    status: "Core",
    link: "/docs/mcp-servers"
  }
]

const integrationTools = [
  {
    title: "CLI Tools",
    description: "Command-line interface for spec-driven development workflow",
    icon: Terminal,
    code: `# Install Project Lattice CLI
npm install -g @project-lattice/cli

# Initialize spec-driven project
lattice init --template=agentic

# Generate from specifications
lattice generate --spec=user-service.yaml`,
    features: [
      "Spec-driven project scaffolding",
      "AI agent orchestration commands",
      "Automated code generation from specs",
      "Unified ecosystem management"
    ]
  },
  {
    title: "VSCode Extension",
    description: "Native IDE integration with spec-aware AI assistance",
    icon: Code,
    code: `// Spec-aware code completion
const userService = await lattice.specs.implement({
  specification: "user-service.yaml",
  target: "typescript"
});

// AI agent collaboration
lattice.agents.collaborate(userService);`,
    features: [
      "Specification-driven IntelliSense",
      "AI agent integration panel",
      "Real-time spec validation",
      "Unified ecosystem navigation"
    ]
  },
  {
    title: "MCP Servers",
    description: "Model Context Protocol servers for AI agent orchestration",
    icon: Database,
    code: `// Connect to Project Lattice MCP
const mcpClient = new LatticeClient({
  serverUrl: 'ws://localhost:8080/lattice-mcp',
  ecosystem: 'unified'
});

await mcpClient.orchestrate();`,
    features: [
      "Standardized agent communication",
      "Spec-driven context sharing",
      "Multi-agent orchestration",
      "Ecosystem-wide collaboration"
    ]
  },
  {
    title: "Portal Integration",
    description: "Web-based interface for ecosystem management and monitoring",
    icon: Webhook,
    code: `// Portal API integration
const portal = new LatticePortal({
  apiKey: process.env.LATTICE_API_KEY,
  ecosystem: 'production'
});

const status = await portal.getEcosystemStatus();`,
    features: [
      "Unified ecosystem dashboard",
      "Real-time agent monitoring",
      "Specification management",
      "Cross-component analytics"
    ]
  }
]

const ecosystemBenefits = [
  {
    title: "Unified Orchestration",
    description: "Seamlessly coordinate AI agents across your entire development ecosystem",
    icon: BarChart3,
    benefits: [
      "Single source of truth for specifications",
      "Coordinated multi-agent workflows",
      "Consistent development patterns",
      "Reduced integration complexity"
    ]
  },
  {
    title: "Spec-Driven Architecture",
    description: "Build with specifications as the foundation for all development activities",
    icon: Zap,
    benefits: [
      "Specification-first development approach",
      "Automated code generation from specs",
      "Consistent API and service contracts",
      "Enhanced collaboration through shared specs"
    ]
  }
]

export default function EcosystemPage() {
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
                Unified Ecosystem for
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent"> Spec-Driven Development</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Six core components working in harmony to orchestrate AI coding agents, 
                synchronize specifications, and deliver coherent multi-agent development.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">Spec-Driven</Badge>
                <Badge variant="secondary" className="bg-blue-600 text-white">AI-Orchestrated</Badge>
                <Badge variant="secondary" className="bg-green-600 text-white">Unified</Badge>
                <Badge variant="secondary" className="bg-orange-600 text-white">Traceable</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Ecosystem Components */}
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
                Core Ecosystem Components
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Six interconnected components that form the foundation of spec-driven agentic development.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ecosystemComponents.map((component, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <component.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {component.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-foreground">
                        {component.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {component.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {component.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-muted-foreground text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4 border-t border-border">
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                          <a href={component.link}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Learn More
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Tools */}
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
                Integration Tools
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Seamlessly integrate Project Lattice into your existing workflow with tools designed for spec-driven development.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {integrationTools.map((tool, index) => (
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

        {/* Ecosystem Benefits */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ecosystem Benefits
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the power of unified orchestration and spec-driven architecture working together.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {ecosystemBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <benefit.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl text-gray-900">
                        {benefit.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {benefit.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {benefit.benefits?.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-gray-700 text-sm">{item}</span>
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
                Ready to Experience the Unified Ecosystem?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Join developers who are building the future with spec-driven agentic development. 
                Start orchestrating your AI coding agents today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Start Building with Specs
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Explore the Ecosystem
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