"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  Server,
  Clock,
  Users,
  Shield,
  Database,
  Play,
  Settings,
  Code,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Terminal,
  GitBranch,
  Globe,
  Activity
} from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "MCP Servers v2.0.0 - Lattice Engine | Model Context Protocol",
  description: "Model Context Protocol integration for advanced workflows. Configure MCP servers for real-time synchronization, multi-client support, event streaming, and enterprise-grade security.",
  keywords: [
    "mcp servers",
    "model context protocol",
    "real-time synchronization",
    "multi-client support",
    "event streaming",
    "state management",
    "enterprise security",
    "oauth integration",
    "redis clustering",
    "performance monitoring"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "MCP Servers v2.0.0 - Lattice Engine",
    description: "Model Context Protocol integration for advanced workflows. Configure MCP servers for real-time synchronization and multi-client support.",
    url: `${baseUrl}/docs/mcp-servers`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-mcp-docs.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine MCP Servers Documentation"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP Servers v2.0.0 - Lattice Engine",
    description: "Model Context Protocol integration for advanced workflows. Configure MCP servers for real-time synchronization and multi-client support.",
    images: [`${baseUrl}/og-mcp-docs.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/docs/mcp-servers`
  }
}

const mcpFeatures = [
  {
    title: "Real-time Synchronization",
    description: "Automatic synchronization between all connected clients with conflict resolution",
    icon: Activity,
    color: "text-green-500"
  },
  {
    title: "Multi-client Support",
    description: "Support multiple simultaneous connections with presence awareness and cursor sharing",
    icon: Users,
    category: "Collaboration"
  },
  {
    title: "Event Streaming",
    description: "Real-time event streaming with reliable delivery and ack/nack patterns",
    icon: Activity,
    category: "Events"
  },
  {
    title: "State Management",
    description: "Centralized state management with consistency guarantees across all clients",
    icon: Database,
    category: "Data"
  },
  {
    title: "Security & Authentication",
    description: "Enterprise-grade security with OAuth, API keys, and role-based access control",
    icon: Shield,
    category: "Security"
  },
  {
    title: "High Performance",
    description: "Optimized for scale with connection pooling and intelligent caching",
    icon: Zap,
    category: "Performance"
  }
]

const installationMethods = [
  {
    platform: "JavaScript/TypeScript",
    description: "For Node.js and browser environments",
    command: "npm install @lattice/mcp-server",
    setup: `// Initialize MCP configuration
lattice mcp init

// Start the server
lattice mcp start --config ./mcp-config.json`,
    features: ["Real-time sync", "Multi-client", "Event streaming"]
  },
  {
    platform: "Python",
    description: "For Python development environments",
    command: "pip install lattice-mcp-server",
    setup: `# Create configuration file
lattice mcp init --template python

# Start server
python -m lattice_mcp_server --config config.json`,
    features: ["Async support", "Type hints", "CLI tools"]
  },
  {
    platform: "Docker",
    description: "Containerized deployment for production",
    command: "docker pull lattice/mcp-server:latest",
    setup: `# Run with Docker
docker run -d \\
  --name lattice-mcp \\
  -p 8080:8080 \\
  -e LATTICE_API_KEY=\$LATTICE_API_KEY \\
  lattice/mcp-server:latest`,
    features: ["Production ready", "Scalable", "Easy deployment"]
  }
]

const configurationExamples = {
  basic: {
    title: "Basic Configuration",
    description: "Simple setup for development",
    config: `{
  "server": {
    "name": "lattice-main",
    "version": "2.0.0",
    "host": "localhost",
    "port": 8080
  },
  "auth": {
    "type": "api_key",
    "api_key": "\${LATTICE_API_KEY}"
  },
  "sync": {
    "auto_sync": true,
    "sync_interval": 5000
  }
}`
  },
  production: {
    title: "Production Configuration",
    description: "Enterprise-grade setup with Redis and security",
    config: `{
  "server": {
    "name": "lattice-prod",
    "host": "0.0.0.0",
    "port": 8080,
    "ssl": {
      "enabled": true,
      "cert_path": "/etc/ssl/certs/lattice.crt",
      "key_path": "/etc/ssl/private/lattice.key"
    },
    "workers": 4,
    "max_connections": 1000
  },
  "auth": {
    "type": "oauth",
    "oauth": {
      "provider": "github",
      "client_id": "\${GITHUB_CLIENT_ID}",
      "client_secret": "\${GITHUB_CLIENT_SECRET}"
    }
  },
  "redis": {
    "enabled": true,
    "url": "\${REDIS_URL}",
    "cluster": true
  },
  "monitoring": {
    "metrics": {
      "enabled": true,
      "endpoint": "/metrics"
    },
    "logging": {
      "level": "info",
      "format": "json"
    }
  }
}`
  }
}

const eventTypes = [
  {
    category: "System Events",
    events: [
      "server:started",
      "server:shutdown",
      "server:maintenance",
      "client:connected",
      "client:disconnected"
    ]
  },
  {
    category: "Project Events",
    events: [
      "project:created",
      "project:updated",
      "project:deleted",
      "project:member_added",
      "project:member_removed"
    ]
  },
  {
    category: "Mutation Events",
    events: [
      "mutation:created",
      "mutation:updated",
      "mutation:approved",
      "mutation:rejected",
      "mutation:deployed"
    ]
  },
  {
    category: "Specification Events",
    events: [
      "spec:created",
      "spec:updated",
      "spec:validated",
      "spec:deleted"
    ]
  }
]

const bestPractices = [
  {
    title: "Use Environment Variables",
    description: "Never hardcode API keys or sensitive configuration in your config files",
    example: `# Use environment variables
api_key: "\${LATTICE_API_KEY}"
database_url: "\${DATABASE_URL}"`,
    severity: "critical"
  },
  {
    title: "Enable SSL in Production",
    description: "Always use HTTPS and proper SSL certificates in production environments",
    example: `"ssl": {
  "enabled": true,
  "cert_path": "/path/to/cert.pem",
  "key_path": "/path/to/key.pem"
}`,
    severity: "high"
  },
  {
    title: "Implement Connection Pooling",
    description: "Use connection pooling to manage database connections efficiently",
    example: `"redis": {
  "enabled": true,
  "connection_pool": {
    "min": 5,
    "max": 20,
    "idle_timeout": 30000
  }
}`,
    severity: "medium"
  },
  {
    title: "Monitor Performance",
    description: "Enable metrics and logging to monitor server performance and health",
    example: `"monitoring": {
  "metrics": {
    "enabled": true,
    "endpoint": "/metrics"
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}`,
    severity: "medium"
  }
]

export default function MCPServersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                    MCP Servers
                  </h1>
                  <Badge variant="secondary" className="mt-2">v2.0.0</Badge>
                </div>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Model Context Protocol integration for advanced workflows with real-time synchronization and multi-client support.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="h-5 w-5 mr-2" />
                  Download MCP Server
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Terminal className="h-5 w-5 mr-2" />
                  CLI Guide
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Start */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Quick Start</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded">
                        <code className="text-sm text-muted-foreground">
                          npm install @lattice/mcp-server
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start with the JavaScript SDK for the best developer experience.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Features */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Real-time sync
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Multi-client
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Event streaming
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        State management
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Links */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a href="/docs/quickstart" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Play className="h-4 w-4 mr-2" />
                        Quick Start Guide
                      </a>
                      <a href="/docs/examples" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        Examples
                      </a>
                      <a href="/docs/troubleshooting" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Troubleshooting
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Features */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Core Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mcpFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                              <feature.icon className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <Badge variant="outline" className="text-xs border-primary text-primary">
                              {feature.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Installation */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Installation & Setup</h2>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="docker">Docker</TabsTrigger>
                  </TabsList>

                  {installationMethods.map((method, index) => (
                    <TabsContent key={index} value={method.platform.toLowerCase().split(' ')[0]} className="mt-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{method.platform}</CardTitle>
                          <CardDescription>{method.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Installation</h4>
                              <div className="bg-muted p-4 rounded">
                                <code className="text-sm">{method.command}</code>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Setup</h4>
                              <div className="bg-muted p-4 rounded overflow-x-auto">
                                <pre className="text-sm">
                                  <code>{method.setup}</code>
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Features</h4>
                              <div className="flex flex-wrap gap-2">
                                {method.features.map((feature, featureIndex) => (
                                  <Badge key={featureIndex} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.section>

              {/* Configuration */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Configuration</h2>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="production">Production</TabsTrigger>
                  </TabsList>

                  {Object.entries(configurationExamples).map(([key, config]) => (
                    <TabsContent key={key} value={key} className="mt-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{config.title}</CardTitle>
                          <CardDescription>{config.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-6 rounded overflow-x-auto">
                            <pre className="text-sm">
                              <code>{config.config}</code>
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.section>

              {/* Events */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Event System</h2>
                <div className="space-y-6">
                  {eventTypes.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{category.category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {category.events.map((event, eventIndex) => (
                              <Badge key={eventIndex} variant="outline" className="text-xs border-primary text-primary">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Best Practices */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Best Practices</h2>
                <div className="space-y-6">
                  {bestPractices.map((practice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-foreground">{practice.title}</CardTitle>
                            <Badge
                              variant={practice.severity === 'critical' ? 'destructive' :
                                     practice.severity === 'high' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {practice.severity}
                            </Badge>
                          </div>
                          <CardDescription>{practice.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-4 rounded overflow-x-auto">
                            <pre className="text-sm">
                              <code>{practice.example}</code>
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Troubleshooting */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Troubleshooting</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="p-4 bg-muted/50 border-l-4 border-blue-500 rounded">
                        <h4 className="font-semibold text-foreground mb-2">Connection Issues</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Check your API key, network connectivity, and server status.
                        </p>
                        <code className="text-xs bg-background p-2 rounded block">
                          lattice mcp status
                        </code>
                      </div>

                      <div className="p-4 bg-muted/50 border-l-4 border-yellow-500 rounded">
                        <h4 className="font-semibold text-foreground mb-2">Performance Issues</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Enable metrics and check for bottlenecks in your setup.
                        </p>
                        <code className="text-xs bg-background p-2 rounded block">
                          lattice mcp monitor --metrics
                        </code>
                      </div>

                      <div className="p-4 bg-muted/50 border-l-4 border-green-500 rounded">
                        <h4 className="font-semibold text-foreground mb-2">Configuration Problems</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Validate your configuration file syntax and required fields.
                        </p>
                        <code className="text-xs bg-background p-2 rounded block">
                          lattice mcp validate --config ./mcp-config.json
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}