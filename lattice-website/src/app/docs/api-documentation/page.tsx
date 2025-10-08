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
  Code,
  Key,
  Shield,
  GitBranch,
  Database,
  Webhook,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  BookOpen,
  Zap
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the API Documentation page
// export const metadata: Metadata = {
//   title: "API Documentation v2.1.0 - Lattice Engine",
//   description: "Complete REST API reference with examples and SDK documentation. Learn how to integrate Lattice Engine into your applications.",
// }

const apiEndpoints = [
  {
    category: "Authentication",
    description: "Manage authentication and access tokens",
    icon: Key,
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/login",
        description: "Authenticate user and get access token",
        example: `{
  "email": "user@example.com",
  "password": "your-password"
}`,
        response: `{
  "token": "jwt-token-here",
  "expires_in": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}`
      },
      {
        method: "POST",
        path: "/api/v1/auth/refresh",
        description: "Refresh access token",
        example: `{
  "refresh_token": "your-refresh-token"
}`,
        response: `{
  "token": "new-jwt-token",
  "expires_in": 3600
}`
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/logout",
        description: "Logout and invalidate token",
        example: `Authorization: Bearer <token>`,
        response: `{
  "message": "Logged out successfully"
}`
      }
    ]
  },
  {
    category: "Mutations",
    description: "Manage code changes and mutations",
    icon: GitBranch,
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/mutations",
        description: "Create a new mutation",
        example: `{
  "spec_id": "user-auth",
  "title": "Add password hashing",
  "changes": {
    "type": "security-enhancement",
    "files_modified": ["src/auth.ts"]
  }
}`,
        response: `{
  "id": "mut_abc123",
  "status": "pending",
  "risk_assessment": {
    "score": "low",
    "factors": ["security_improvement"]
  },
  "created_at": "2024-01-15T10:30:00Z"
}`
      },
      {
        method: "GET",
        path: "/api/v1/mutations",
        description: "List mutations with filtering",
        example: `GET /api/v1/mutations?status=pending&limit=10`,
        response: `{
  "mutations": [...],
  "total": 150,
  "page": 1,
  "pages": 15
}`
      },
      {
        method: "POST",
        path: "/api/v1/mutations/{id}/review",
        description: "Review and approve/reject mutation",
        example: `{
  "action": "approve",
  "comment": "Looks good to me"
}`,
        response: `{
  "id": "mut_abc123",
  "status": "approved",
  "reviewed_by": "reviewer@example.com",
  "reviewed_at": "2024-01-15T11:00:00Z"
}`
      }
    ]
  },
  {
    category: "Specifications",
    description: "Manage project specifications",
    icon: BookOpen,
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/specs",
        description: "Create a new specification",
        example: `{
  "name": "user-auth",
  "version": "2.1.0",
  "requirements": [
    "Passwords must be hashed",
    "Sessions expire after 24h"
  ]
}`,
        response: `{
  "id": "spec_abc123",
  "name": "user-auth",
  "version": "2.1.0",
  "created_at": "2024-01-15T10:30:00Z"
}`
      },
      {
        method: "GET",
        path: "/api/v1/specs/{id}",
        description: "Get specification details",
        example: `GET /api/v1/specs/user-auth`,
        response: `{
  "id": "spec_abc123",
  "name": "user-auth",
  "version": "2.1.0",
  "requirements": [...],
  "validation_rules": [...]
}`
      },
      {
        method: "PUT",
        path: "/api/v1/specs/{id}",
        description: "Update specification",
        example: `{
  "version": "2.2.0",
  "requirements": [
    "Passwords must be hashed with bcrypt",
    "Sessions expire after 24h",
    "Multi-factor auth required"
  ]
}`,
        response: `{
  "id": "spec_abc123",
  "version": "2.2.0",
  "updated_at": "2024-01-15T11:00:00Z"
}`
      }
    ]
  },
  {
    category: "Projects",
    description: "Manage project configuration and settings",
    icon: Database,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/projects/{id}",
        description: "Get project information",
        example: `GET /api/v1/projects/proj_123`,
        response: `{
  "id": "proj_123",
  "name": "My Project",
  "status": "active",
  "settings": {...},
  "team": [...]
}`
      },
      {
        method: "PUT",
        path: "/api/v1/projects/{id}/settings",
        description: "Update project settings",
        example: `{
  "auto_approve": {
    "enabled": true,
    "risk_threshold": "low"
  },
  "notifications": {
    "slack": "#deployments"
  }
}`,
        response: `{
  "settings": {...},
  "updated_at": "2024-01-15T11:00:00Z"
}`
      }
    ]
  },
  {
    category: "Webhooks",
    description: "Configure webhook integrations",
    icon: Webhook,
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/webhooks",
        description: "Create a webhook",
        example: `{
  "name": "Deployment Notifications",
  "url": "https://your-app.com/webhooks",
  "events": ["mutation.approved", "deployment.completed"],
  "secret": "your-webhook-secret"
}`,
        response: `{
  "id": "webhook_abc123",
  "name": "Deployment Notifications",
  "url": "https://your-app.com/webhooks",
  "active": true
}`
      },
      {
        method: "GET",
        path: "/api/v1/webhooks",
        description: "List webhooks",
        example: `GET /api/v1/webhooks`,
        response: `{
  "webhooks": [...],
  "total": 5
}`
      }
    ]
  }
]

const sdks = [
  {
    name: "JavaScript SDK",
    description: "Full-featured SDK for Node.js and browser environments",
    install: "npm install @lattice/engine",
    example: `import { Lattice } from '@lattice/engine';

const lattice = new Lattice({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

const mutation = await lattice.mutations.create({
  specId: 'user-auth',
  changes: { /*...*/ }
});`,
    features: ["TypeScript support", "Promise-based API", "Error handling", "Retry logic"]
  },
  {
    name: "Python SDK",
    description: "Python SDK with async support and type hints",
    install: "pip install lattice-engine",
    example: `import lattice
from lattice import LatticeClient

client = LatticeClient(
    api_key='your-api-key',
    project_id='your-project-id'
)

mutation = await client.mutations.create({
    'spec_id': 'user-auth',
    'changes': {...}
})`,
    features: ["Async/await support", "Type hints", "Pydantic integration", "CLI tools"]
  }
]

const authentication = {
  bearerToken: "Authorization: Bearer your-api-key-here",
  description: "Include your API key in the Authorization header for all requests."
}

export default function ApiDocumentationPage() {
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
                  <Code className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                    API Documentation
                  </h1>
                  <Badge variant="secondary" className="mt-2">v2.1.0</Badge>
                </div>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Complete REST API reference with examples and SDK documentation. Integrate Lattice Engine into your applications.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="h-5 w-5 mr-2" />
                  Download SDK
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open API Spec
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
                          curl -X POST https://api.lattice.dev/v1/auth/login
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start with authentication to get your API token.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Authentication */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {authentication.description}
                      </p>
                      <div className="p-3 bg-muted rounded">
                        <code className="text-xs text-foreground break-all">
                          {authentication.bearerToken}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SDKs */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      SDKs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="#javascript-sdk" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        JavaScript SDK
                      </Link>
                      <Link href="#python-sdk" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        Python SDK
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Limits */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Rate Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Free Plan</span>
                        <span className="text-foreground font-medium">1,000 req/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pro Plan</span>
                        <span className="text-foreground font-medium">10,000 req/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Enterprise</span>
                        <span className="text-foreground font-medium">Unlimited</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Overview */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Overview</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    The Lattice Engine API provides programmatic access to all platform features. Use it to integrate
                    Lattice into your applications, automate workflows, and build custom tools.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">RESTful Design</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Follows REST principles with predictable URLs and HTTP methods.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">JSON Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        All responses are in JSON format with consistent error handling.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Webhooks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Receive real-time notifications about mutations and deployments.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.section>

              {/* SDKs */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">SDKs & Libraries</h2>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>

                  {sdks.map((sdk) => (
                    <TabsContent key={sdk.name} value={sdk.name.toLowerCase().split(' ')[0]} className="mt-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{sdk.name}</CardTitle>
                          <CardDescription>{sdk.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Installation</h4>
                              <div className="bg-muted p-4 rounded">
                                <code className="text-sm">{sdk.install}</code>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Example Usage</h4>
                              <div className="bg-muted p-4 rounded overflow-x-auto">
                                <pre className="text-sm">
                                  <code>{sdk.example}</code>
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Features</h4>
                              <div className="flex flex-wrap gap-2">
                                {sdk.features.map((feature, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
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

              {/* API Endpoints */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">API Endpoints</h2>
                <div className="space-y-12">
                  {apiEndpoints.map((category, categoryIndex) => (
                    <motion.div
                      key={categoryIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                          <category.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{category.category}</h3>
                          <p className="text-muted-foreground">{category.description}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {category.endpoints.map((endpoint, endpointIndex) => (
                          <Card key={endpointIndex} className="border-border">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Badge
                                    variant={endpoint.method === 'GET' ? 'secondary' :
                                           endpoint.method === 'POST' ? 'default' :
                                           endpoint.method === 'PUT' ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                                    {endpoint.path}
                                  </code>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={() => navigator.clipboard.writeText(endpoint.path)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <CardDescription className="text-base">
                                {endpoint.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {endpoint.example && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Request Example</h4>
                                    <div className="bg-muted p-4 rounded overflow-x-auto">
                                      <pre className="text-sm">
                                        <code>{endpoint.example}</code>
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {endpoint.response && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Response</h4>
                                    <div className="bg-muted p-4 rounded overflow-x-auto">
                                      <pre className="text-sm">
                                        <code>{endpoint.response}</code>
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Error Handling */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Error Handling</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Standard Error Response</h4>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "spec_id",
      "issue": "Required field is missing"
    },
    "request_id": "req_abc123"
  }
}`}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Common Error Codes</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">400</Badge>
                              <span className="text-sm font-mono text-foreground">Bad Request</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">401</Badge>
                              <span className="text-sm font-mono text-foreground">Unauthorized</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">403</Badge>
                              <span className="text-sm font-mono text-foreground">Forbidden</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">404</Badge>
                              <span className="text-sm font-mono text-foreground">Not Found</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">409</Badge>
                              <span className="text-sm font-mono text-foreground">Conflict</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">422</Badge>
                              <span className="text-sm font-mono text-foreground">Validation Error</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">429</Badge>
                              <span className="text-sm font-mono text-foreground">Rate Limit Exceeded</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">500</Badge>
                              <span className="text-sm font-mono text-foreground">Server Error</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Webhooks */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Webhooks</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Webhook Payload</h4>
                        <p className="text-muted-foreground mb-4">
                          When events trigger your webhook, you'll receive a JSON payload:
                        </p>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{`{
  "event": "mutation.approved",
  "data": {
    "mutation": {
      "id": "mut_abc123",
      "title": "Add password hashing",
      "status": "approved"
    },
    "project": {
      "id": "proj_456",
      "name": "My Project"
    },
    "reviewer": "security-team",
    "timestamp": "2024-01-15T11:00:00Z"
  }
}`}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Signature Verification</h4>
                        <p className="text-muted-foreground mb-4">
                          Verify webhook signatures using HMAC-SHA256:
                        </p>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}</code>
                          </pre>
                        </div>
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