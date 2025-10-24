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
  Download,
  Package,
  Settings,
  CheckCircle,
  AlertCircle,
  Terminal,
  Code,
  BookOpen,
  ExternalLink,
  Copy,
  ChevronRight,
  Zap,
  Shield,
  Globe
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

const installationMethods = [
  {
    id: "npm",
    title: "NPM (Recommended)",
    description: "Install via npm for Node.js projects",
    icon: Package,
    commands: [
      "npm install -g @lattice/cli",
      "npm install @lattice/engine",
      "npm install @lattice/sdk"
    ],
    verification: "lattice --version"
  },
  {
    id: "yarn",
    title: "Yarn",
    description: "Install via Yarn for faster dependency resolution",
    icon: Package,
    commands: [
      "yarn global add @lattice/cli",
      "yarn add @lattice/engine",
      "yarn add @lattice/sdk"
    ],
    verification: "lattice --version"
  },
  {
    id: "pip",
    title: "Python Pip",
    description: "Install Python SDK and CLI tools",
    icon: Code,
    commands: [
      "pip install lattice-engine",
      "pip install lattice-cli",
      "pip install lattice-sdk"
    ],
    verification: "lattice --version"
  },
  {
    id: "docker",
    title: "Docker",
    description: "Run Lattice in a containerized environment",
    icon: Globe,
    commands: [
      "docker pull lattice/engine:latest",
      "docker run -d -p 8000:8000 lattice/engine",
      "docker exec -it <container-id> lattice --version"
    ],
    verification: "docker ps | grep lattice"
  }
]

const systemRequirements = [
  {
    category: "Node.js Environment",
    requirements: [
      "Node.js 16.0.0 or higher",
      "npm 7.0.0 or higher (or Yarn 1.22+)",
      "Git 2.20.0 or higher",
      "At least 2GB RAM",
      "500MB disk space"
    ]
  },
  {
    category: "Python Environment",
    requirements: [
      "Python 3.8.0 or higher",
      "pip 20.0.0 or higher",
      "Git 2.20.0 or higher",
      "At least 2GB RAM",
      "500MB disk space"
    ]
  },
  {
    category: "Docker Environment",
    requirements: [
      "Docker 20.10.0 or higher",
      "Docker Compose 1.29.0 or higher",
      "At least 4GB RAM allocated to Docker",
      "2GB disk space for images"
    ]
  }
]

const configurationSteps = [
  {
    step: 1,
    title: "Create Account",
    description: "Sign up for a free Lattice Engine account",
    action: "Visit https://app.project-lattice.site/register",
    details: "You'll receive an API key after email verification"
  },
  {
    step: 2,
    title: "Configure API Key",
    description: "Set up your API key for authentication",
    action: "lattice config set-api-key YOUR_API_KEY",
    details: "Store your API key securely in your environment"
  },
  {
    step: 3,
    title: "Initialize Project",
    description: "Create your first Lattice project",
    action: "lattice init my-project",
    details: "This creates a .lattice directory with configuration"
  },
  {
    step: 4,
    title: "Verify Installation",
    description: "Test your installation with a simple command",
    action: "lattice status",
    details: "Should show 'Connected' and your account details"
  }
]

const commonIssues = [
  {
    issue: "Command not found: lattice",
    solution: "Ensure the global installation completed successfully. Try reinstalling with sudo/admin privileges."
  },
  {
    issue: "Permission denied during installation",
    solution: "Use sudo for global installations or install locally in your project directory."
  },
  {
    issue: "API key authentication failed",
    solution: "Verify your API key is correct and has the necessary permissions. Check your account status."
  },
  {
    issue: "Node.js version incompatible",
    solution: "Update Node.js to version 16.0.0 or higher using nvm or your package manager."
  }
]

const nextSteps = [
  {
    title: "Quick Start Guide",
    description: "Learn the basics in 5 minutes",
    link: "/docs/quickstart",
    icon: Zap
  },
  {
    title: "Core Concepts",
    description: "Understand mutations and specifications",
    link: "/docs/concepts",
    icon: BookOpen
  },
  {
    title: "API Documentation",
    description: "Explore the complete API reference",
    link: "/docs/api-documentation",
    icon: Code
  },
  {
    title: "VSCode Extension",
    description: "Install the IDE extension for better experience",
    link: "/docs/vscode-extension",
    icon: ExternalLink
  }
]

export default function InstallationPage() {
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
                  <Download className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Installation & Setup
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Get Lattice Engine up and running in minutes. Choose your preferred installation method and start building AI-powered applications.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">10 minutes</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">Beginner friendly</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">Multiple platforms</Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* System Requirements */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">System Requirements</h2>
                <div className="space-y-6">
                  {systemRequirements.map((category, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-center space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Installation Methods */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Installation Methods</h2>
                <Tabs defaultValue="npm" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                    {installationMethods.map((method) => (
                      <TabsTrigger key={method.id} value={method.id} className="flex items-center space-x-2">
                        <method.icon className="h-4 w-4" />
                        <span>{method.title}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {installationMethods.map((method) => (
                    <TabsContent key={method.id} value={method.id}>
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{method.title}</CardTitle>
                          <CardDescription>{method.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Installation Commands</h4>
                            <div className="space-y-3">
                              {method.commands.map((command, index) => (
                                <div key={index} className="relative">
                                  <pre className="bg-muted p-4 rounded text-sm font-mono overflow-x-auto border border-border">
                                    <code>{command}</code>
                                  </pre>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                                    onClick={() => navigator.clipboard.writeText(command)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Verify Installation</h4>
                            <div className="relative">
                              <pre className="bg-muted p-4 rounded text-sm font-mono overflow-x-auto border border-border">
                                <code>{method.verification}</code>
                              </pre>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                                onClick={() => navigator.clipboard.writeText(method.verification)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.section>

              {/* Configuration Steps */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Configuration Steps</h2>
                <div className="space-y-6">
                  {configurationSteps.map((step, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                            {step.step}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">{step.title}</CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-4 bg-muted rounded border border-border">
                            <code className="text-sm text-foreground">{step.action}</code>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.details}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Troubleshooting */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Common Issues</h2>
                <div className="space-y-4">
                  {commonIssues.map((issue, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <CardTitle className="text-base text-foreground flex items-center">
                          <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                          {issue.issue}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{issue.solution}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Next Steps */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Next Steps</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {nextSteps.map((step, index) => (
                    <Card key={index} className="border-border hover:shadow-lg transition-all duration-300 group">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-2">
                          <step.icon className="h-6 w-6 text-primary" />
                          <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                            {step.title}
                          </CardTitle>
                        </div>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link href={step.link}>
                          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground group-hover:translate-x-1 transition-transform">
                            Learn More
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
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
                      <Link href="/docs/quickstart" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Zap className="h-4 w-4 mr-2" />
                        Quick Start
                      </Link>
                      <Link href="/docs/concepts" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Core Concepts
                      </Link>
                      <Link href="/docs/api-documentation" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        API Reference
                      </Link>
                      <Link href="/docs/support" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Shield className="h-4 w-4 mr-2" />
                        Get Support
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Help */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Having trouble with installation? Our community is here to help.
                    </p>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Join Community
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