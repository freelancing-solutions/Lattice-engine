"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Code,
  Zap,
  Settings,
  User,
  Clock,
  AlertCircle,
  Info
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

const authMethods = [
  {
    id: "api-key",
    title: "API Key Authentication",
    description: "Simple and secure API key-based authentication for server-to-server communication",
    icon: Key,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    useCase: "Best for server-to-server communication and automated scripts",
    security: "High - Keys are encrypted at rest and in transit",
    setup: "Quick setup - Generate keys in dashboard"
  },
  {
    id: "oauth2",
    title: "OAuth 2.0",
    description: "Industry-standard OAuth 2.0 for user authentication and authorization",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    useCase: "Best for user-facing applications and third-party integrations",
    security: "Very High - Industry standard with token refresh",
    setup: "Requires OAuth client setup and callback configuration"
  },
  {
    id: "jwt",
    title: "JWT Tokens",
    description: "JSON Web Tokens for stateless authentication with custom claims",
    icon: Lock,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    useCase: "Best for microservices and distributed systems",
    security: "High - Cryptographically signed tokens",
    setup: "Requires JWT secret configuration"
  }
]

const apiKeySteps = [
  {
    step: 1,
    title: "Generate API Key",
    description: "Create a new API key in your Lattice dashboard",
    command: null,
    note: "Go to Settings > API Keys > Generate New Key"
  },
  {
    step: 2,
    title: "Set Environment Variable",
    description: "Store your API key securely as an environment variable",
    command: "export LATTICE_API_KEY=\"your-api-key-here\"",
    note: "Never hardcode API keys in your source code"
  },
  {
    step: 3,
    title: "Include in Requests",
    description: "Add the API key to your request headers",
    command: `curl -H "Authorization: Bearer $LATTICE_API_KEY" \\\n  https://api.lattice-engine.com/v1/specs`,
    note: "All API requests must include the Authorization header"
  }
]

const oauth2Steps = [
  {
    step: 1,
    title: "Register Application",
    description: "Register your application in the Lattice OAuth console",
    command: null,
    note: "Provide redirect URI and application details"
  },
  {
    step: 2,
    title: "Get Authorization Code",
    description: "Direct users to the authorization endpoint",
    command: `https://api.lattice-engine.com/oauth2/authorize?\n  client_id=YOUR_CLIENT_ID&\n  redirect_uri=YOUR_REDIRECT_URI&\n  response_type=code&\n  scope=read,write`,
    note: "User will be prompted to authorize your application"
  },
  {
    step: 3,
    title: "Exchange for Access Token",
    description: "Exchange the authorization code for an access token",
    command: `curl -X POST https://api.lattice-engine.com/oauth2/token \\\n  -d "grant_type=authorization_code" \\\n  -d "code=AUTH_CODE" \\\n  -d "client_id=YOUR_CLIENT_ID" \\\n  -d "client_secret=YOUR_CLIENT_SECRET"`,
    note: "Access tokens expire after 1 hour"
  },
  {
    step: 4,
    title: "Use Access Token",
    description: "Include the access token in your API requests",
    command: `curl -H "Authorization: Bearer ACCESS_TOKEN" \\\n  https://api.lattice-engine.com/v1/specs`,
    note: "Refresh tokens can be used to get new access tokens"
  }
]

const jwtSteps = [
  {
    step: 1,
    title: "Configure JWT Secret",
    description: "Set up your JWT secret in Lattice settings",
    command: null,
    note: "Use a strong, randomly generated secret"
  },
  {
    step: 2,
    title: "Generate JWT Token",
    description: "Create a JWT token with required claims",
    command: `const jwt = require('jsonwebtoken');\n\nconst token = jwt.sign({\n  sub: 'user-id',\n  iss: 'your-app-name',\n  aud: 'lattice-engine',\n  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour\n  scope: 'read,write'\n}, process.env.JWT_SECRET);`,
    note: "Include required claims: sub, iss, aud, exp, scope"
  },
  {
    step: 3,
    title: "Include in Requests",
    description: "Add the JWT token to your request headers",
    command: `curl -H "Authorization: Bearer JWT_TOKEN" \\\n  https://api.lattice-engine.com/v1/specs`,
    note: "Tokens expire based on the exp claim"
  }
]

const securityBestPractices = [
  {
    category: "API Key Security",
    practices: [
      "Never hardcode API keys in your source code",
      "Use environment variables or secure key management systems",
      "Rotate API keys regularly",
      "Use different keys for different environments",
      "Monitor API key usage and set up alerts"
    ]
  },
  {
    category: "Token Security",
    practices: [
      "Use HTTPS for all API communications",
      "Implement token expiration and refresh mechanisms",
      "Store tokens securely (never in localStorage for sensitive data)",
      "Validate tokens on every request",
      "Use appropriate token scopes"
    ]
  },
  {
    category: "Rate Limiting",
    practices: [
      "Implement rate limiting on your end",
      "Handle rate limit responses gracefully",
      "Use exponential backoff for retries",
      "Monitor your API usage",
      "Cache responses when appropriate"
    ]
  }
]

const commonErrors = [
  {
    code: "401",
    title: "Unauthorized",
    description: "Invalid or missing authentication credentials",
    solution: "Check your API key/token and ensure it's included in the Authorization header"
  },
  {
    code: "403",
    title: "Forbidden",
    description: "Valid credentials but insufficient permissions",
    solution: "Check your token scopes or API key permissions in the dashboard"
  },
  {
    code: "429",
    title: "Too Many Requests",
    description: "Rate limit exceeded",
    solution: "Implement rate limiting and use exponential backoff for retries"
  }
]

export default function AuthenticationPage() {
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
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Authentication
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Secure your API interactions with multiple authentication methods. Choose the right approach for your use case and security requirements.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">API Keys</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">OAuth 2.0</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">JWT</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">Security</Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Authentication Methods Overview */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Authentication Methods</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {authMethods.map((method, index) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border h-full">
                        <CardHeader>
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-12 h-12 ${method.bgColor} rounded-lg flex items-center justify-center`}>
                              <method.icon className={`h-6 w-6 ${method.color}`} />
                            </div>
                            <CardTitle className="text-lg text-foreground">{method.title}</CardTitle>
                          </div>
                          <CardDescription className="text-base">{method.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Use Case</h4>
                            <p className="text-sm text-muted-foreground">{method.useCase}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Security</h4>
                            <p className="text-sm text-muted-foreground">{method.security}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Setup</h4>
                            <p className="text-sm text-muted-foreground">{method.setup}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Implementation Guide */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Implementation Guide</h2>
                
                <Tabs defaultValue="api-key" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="api-key">API Key</TabsTrigger>
                    <TabsTrigger value="oauth2">OAuth 2.0</TabsTrigger>
                    <TabsTrigger value="jwt">JWT</TabsTrigger>
                  </TabsList>

                  <TabsContent value="api-key" className="space-y-6">
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">API Key Authentication</CardTitle>
                        <CardDescription>
                          Simple and secure authentication using API keys for server-to-server communication
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {apiKeySteps.map((step, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                                {step.step}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                            {step.command && (
                              <div className="bg-muted p-4 rounded-lg border border-border">
                                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{step.command}</pre>
                              </div>
                            )}
                            {step.note && (
                              <div className="flex items-start space-x-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground">{step.note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="oauth2" className="space-y-6">
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">OAuth 2.0 Authentication</CardTitle>
                        <CardDescription>
                          Industry-standard OAuth 2.0 flow for user authentication and authorization
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {oauth2Steps.map((step, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                                {step.step}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                            {step.command && (
                              <div className="bg-muted p-4 rounded-lg border border-border">
                                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{step.command}</pre>
                              </div>
                            )}
                            {step.note && (
                              <div className="flex items-start space-x-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground">{step.note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="jwt" className="space-y-6">
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">JWT Token Authentication</CardTitle>
                        <CardDescription>
                          JSON Web Tokens for stateless authentication with custom claims
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {jwtSteps.map((step, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                                {step.step}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                            {step.command && (
                              <div className="bg-muted p-4 rounded-lg border border-border">
                                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{step.command}</pre>
                              </div>
                            )}
                            {step.note && (
                              <div className="flex items-start space-x-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground">{step.note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.section>

              {/* Security Best Practices */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Security Best Practices</h2>
                <div className="space-y-6">
                  {securityBestPractices.map((category, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {category.practices.map((practice, practiceIndex) => (
                            <li key={practiceIndex} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Common Errors */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Common Authentication Errors</h2>
                <div className="space-y-4">
                  {commonErrors.map((error, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">
                              {error.code} - {error.title}
                            </CardTitle>
                            <CardDescription>{error.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{error.solution}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Links */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/docs/api-documentation" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        API Overview
                      </Link>
                      <Link href="/docs/api-documentation/rate-limiting" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Zap className="h-4 w-4 mr-2" />
                        Rate Limiting
                      </Link>
                      <Link href="/docs/api-documentation/endpoints" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        API Endpoints
                      </Link>
                      <Link href="/docs/api-documentation/webhooks" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Settings className="h-4 w-4 mr-2" />
                        Webhooks
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-foreground">Security Notice</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Always use HTTPS for API communications and never expose your API keys in client-side code.
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Security Guidelines
                    </Button>
                  </CardContent>
                </Card>

                {/* Need Help */}
                <Card className="border-border">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Having authentication issues? Check our troubleshooting guide or contact support.
                    </p>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}