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
    description: "The core orchestration engine that coordinates AI coding agents and transforms specifications into executable code changes",
    features: ["AI agent orchestration", "Spec-to-code transformation", "Cross-project traceability", "Autonomous error resolution"],
    status: "Core",
    link: "/docs/mutation-engine"
  },
  {
    icon: Globe,
    title: "Lattice Portal",
    description: "Centralized web interface for managing AI coding agents, specifications, and orchestrating development workflows",
    features: ["Agent management dashboard", "Spec-driven workflows", "Real-time orchestration monitoring", "Team collaboration hub"],
    status: "Core",
    link: "/portal"
  },
  {
    icon: Bug,
    title: "BugSage",
    description: "AI-powered debugging companion that provides contextual error analysis and intelligent resolution strategies",
    features: ["Intelligent error detection", "Contextual debugging assistance", "AI-driven fix suggestions", "Pattern learning and adaptation"],
    status: "Core",
    link: "/bugsage"
  },
  {
    icon: Code,
    title: "VSCode Extension",
    description: "Native IDE integration bringing AI agent orchestration and spec-driven development directly to your editor",
    features: ["Inline agent collaboration", "Spec-aware IntelliSense", "Real-time orchestration", "Integrated debugging with BugSage"],
    status: "Core",
    link: "/docs/vscode-extension"
  },
  {
    icon: Terminal,
    title: "CLI Tools",
    description: "Command-line interface for automating AI agent workflows and integrating with CI/CD pipelines",
    features: ["Agent workflow automation", "Spec-driven operations", "CI/CD integration", "Batch orchestration commands"],
    status: "Core",
    link: "/docs/cli"
  },
  {
    icon: Database,
    title: "MCP Servers",
    description: "Model Context Protocol servers enabling seamless AI agent communication and coordination across the platform",
    features: ["Agent-to-agent communication", "Real-time context sharing", "Multi-agent coordination", "Event-driven orchestration"],
    status: "Core",
    link: "/docs/mcp-servers"
  }
]

const integrationTools = [
  {
    title: "CLI Tools",
    description: "Command-line interface for orchestrating AI coding agents and automating spec-driven workflows",
    icon: Terminal,
    code: `# Install Project Lattice CLI
npm install -g @project-lattice/cli

# Initialize AI agent orchestration
lattice init --agents=coding

# Orchestrate agents with specifications
lattice orchestrate --spec=user-service.yaml --agents=all`,
    features: [
      "AI agent workflow orchestration",
      "Spec-driven project scaffolding",
      "Automated agent coordination",
      "Unified platform management"
    ]
  },
  {
    title: "VSCode Extension",
    description: "Native IDE integration with AI agent collaboration and spec-aware development assistance",
    icon: Code,
    code: `// AI agent collaboration in VSCode
const agents = await lattice.agents.getAvailable();
await lattice.orchestrate({
  specification: "user-service.yaml",
  agents: ["coder", "reviewer", "tester"]
});

// Spec-driven IntelliSense
lattice.specs.enableIntelliSense();`,
    features: [
      "Real-time AI agent collaboration",
      "Specification-driven IntelliSense",
      "Integrated orchestration panel",
      "Unified debugging with BugSage"
    ]
  },
  {
    title: "MCP Servers",
    description: "Model Context Protocol servers enabling seamless AI agent communication and coordination",
    icon: Database,
    code: `// Connect to Project Lattice MCP
const mcpClient = new LatticeClient({
  serverUrl: 'ws://localhost:8080/lattice-mcp',
  orchestration: 'unified'
});

await mcpClient.orchestrateAgents();`,
    features: [
      "Standardized agent communication",
      "Real-time context synchronization",
      "Multi-agent orchestration protocols",
      "Event-driven coordination"
    ]
  },
  {
    title: "Portal Integration",
    description: "Web-based interface for managing AI coding agents and monitoring orchestration workflows",
    icon: Webhook,
    code: `// Portal API integration
const portal = new LatticePortal({
  apiKey: process.env.LATTICE_API_KEY,
  orchestration: 'production'
});

const agents = await portal.getActiveAgents();
const status = await portal.getOrchestrationStatus();`,
    features: [
      "Unified agent management dashboard",
      "Real-time orchestration monitoring",
      "Specification workflow management",
      "Cross-component analytics"
    ]
  }
]

const ecosystemBenefits = [
  {
    title: "Unified AI Agent Orchestration",
    description: "Seamlessly coordinate AI coding agents across your entire development ecosystem with centralized control",
    icon: BarChart3,
    benefits: [
      "Centralized agent management and coordination",
      "Intelligent workflow orchestration",
      "Cross-agent communication protocols",
      "Reduced complexity through unified control"
    ]
  },
  {
    title: "Spec-Driven Agentic Development",
    description: "Build with specifications as the foundation for AI agent collaboration and automated development workflows",
    icon: Zap,
    benefits: [
      "Specification-first agentic approach",
      "AI agent-driven code generation from specs",
      "Consistent agent behavior patterns",
      "Enhanced collaboration through shared specifications"
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
                Project Lattice
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent"> Unified Orchestration Platform</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                The comprehensive platform for orchestrating AI coding agents through spec-driven agentic development. 
                Six integrated components that transform how teams build, debug, and deploy software with AI assistance.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">AI Orchestration</Badge>
                <Badge variant="secondary" className="bg-blue-600 text-white">Spec-Driven</Badge>
                <Badge variant="secondary" className="bg-green-600 text-white">Agentic Development</Badge>
                <Badge variant="secondary" className="bg-orange-600 text-white">Unified Platform</Badge>
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
                Project Lattice Components
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Six integrated components that form the unified orchestration platform for AI coding agents and spec-driven agentic development.
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
                Platform Integration
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Seamlessly integrate Project Lattice into your existing workflow with tools designed for AI agent orchestration and spec-driven agentic development.
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
                Platform Benefits
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the power of unified AI agent orchestration and spec-driven agentic development working together.
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
                Ready to Orchestrate Your AI Coding Agents?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Join the future of agentic development with Project Lattice. Start orchestrating AI coding agents 
                through unified specifications and experience the power of coordinated development workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Start with Project Lattice
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Explore the Platform
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