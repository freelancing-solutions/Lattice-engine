import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import MCPServersContent from "@/components/mcp-servers-content"

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
      <MCPServersContent />
      <Footer />
    </div>
  )
}