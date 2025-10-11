"use client"

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

// Start server
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
  -e LATTICE_API_KEY=$LATTICE_API_KEY \\
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

export default function MCPServersContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mr-4">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground">
                MCP Servers
              </h1>
            </div>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Model Context Protocol integration for advanced workflows. Real-time synchronization, multi-client support, and enterprise-grade security.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Play className="h-5 w-5 mr-2" />
                Quick Start Guide
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Download className="h-5 w-5 mr-2" />
                Download v2.0.0
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Overview */}
      <motion.section
        className="py-20 bg-card"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Enterprise-Grade MCP Integration
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for scale with advanced features for real-time collaboration, security, and performance monitoring.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mcpFeatures.map((feature, index) => (
              <Card key={index} className="bg-background border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Installation & Setup */}
      <motion.section
        className="py-20 bg-background"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Installation & Setup
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your preferred installation method and get started in minutes.
            </p>
          </div>

          <Tabs defaultValue="javascript" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript/TypeScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="docker">Docker</TabsTrigger>
            </TabsList>

            {installationMethods.map((method, index) => (
              <TabsContent key={index} value={method.platform.toLowerCase().split('/')[0]} className="mt-8">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">{method.platform}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {method.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">Installation</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <code className="text-sm text-foreground">{method.command}</code>
                        <Button size="sm" variant="ghost" className="ml-2">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">Setup</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm text-foreground whitespace-pre-wrap">{method.setup}</pre>
                        <Button size="sm" variant="ghost" className="mt-2">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {method.features.map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </motion.section>

      {/* Configuration */}
      <motion.section
        className="py-20 bg-card"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Configuration Examples
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From development to production, configure MCP servers for your specific needs.
            </p>
          </div>

          <Tabs defaultValue="basic" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Setup</TabsTrigger>
              <TabsTrigger value="production">Production Setup</TabsTrigger>
            </TabsList>

            {Object.entries(configurationExamples).map(([key, config]) => (
              <TabsContent key={key} value={key} className="mt-8">
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">{config.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {config.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm text-foreground whitespace-pre-wrap overflow-x-auto">
                        {config.config}
                      </pre>
                      <Button size="sm" variant="ghost" className="mt-2">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </motion.section>

      {/* Event Streaming */}
      <motion.section
        className="py-20 bg-background"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Event Streaming & Real-time Updates
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Subscribe to real-time events and build reactive applications with MCP event streaming.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {eventTypes.map((category, index) => (
              <Card key={index} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-center text-sm">
                        <Activity className="h-4 w-4 text-primary mr-2" />
                        <code className="text-muted-foreground">{event}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Best Practices */}
      <motion.section
        className="py-20 bg-card"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Best Practices & Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow these guidelines to ensure secure, performant, and maintainable MCP server deployments.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {bestPractices.map((practice, index) => (
              <Card key={index} className="bg-background border-border">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      practice.severity === 'critical' ? 'bg-red-500' :
                      practice.severity === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <CardTitle className="text-foreground">{practice.title}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {practice.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-sm text-foreground whitespace-pre-wrap">
                      {practice.example}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-20 bg-primary text-primary-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Deploy your first MCP server in minutes and start building real-time collaborative applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Play className="h-5 w-5 mr-2" />
              Start Tutorial
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <ExternalLink className="h-5 w-5 mr-2" />
              View Examples
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}