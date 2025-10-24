"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, PlayCircle, Download, Terminal, Code, ArrowRight, Zap, BookOpen, ExternalLink } from "lucide-react"
import Link from "next/link"

const quickSteps = [
  {
    number: 1,
    title: "Install the Tools",
    description: "Choose your preferred development environment and install the necessary tools.",
    icon: Download,
    options: [
      {
        name: "JavaScript/TypeScript",
        description: "For Node.js and browser environments",
        code: "npm install -g @lattice/cli\nnpm install @lattice/engine"
      },
      {
        name: "Python",
        description: "For Python development environments",
        code: "pip install lattice-engine\npip install lattice-cli"
      }
    ]
  },
  {
    number: 2,
    title: "Create Your Account",
    description: "Sign up for a free account and get your API key.",
    icon: BookOpen,
    actions: [
      "Visit https://app.project-lattice.site/register to create your account",
      "Navigate to Settings → API Keys",
      "Generate a new API key",
      "Copy and securely store your key"
    ]
  },
  {
    number: 3,
    title: "Initialize Your Project",
    description: "Set up your first Lattice project with living specifications.",
    icon: Terminal,
    code: "lattice init\n# Follow the prompts to configure your project"
  },
  {
    number: 4,
    title: "Create Your First Specification",
    description: "Define how your application should behave with living specifications.",
    icon: Code,
    code: "lattice spec create --name user-auth --template authentication"
  },
  {
    number: 5,
    title: "Make Your First Change",
    description: "Create a mutation and experience the intelligent workflow.",
    icon: Zap,
    code: "lattice mutation propose --spec user-auth --title 'Add password hashing'"
  }
]

const whatYoullLearn = [
  "Set up Lattice Engine in your development environment",
  "Create and manage living specifications",
  "Use intelligent mutations for code changes",
  "Understand the approval workflow",
  "Deploy your first AI-powered application"
]

const prerequisites = [
  "Node.js 16+ or Python 3.8+",
  "Git version control",
  "Code editor (VSCode recommended)",
  "Basic knowledge of command line",
  "Free Lattice Engine account"
]

export default function QuickStartContent() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <PlayCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Quick Start Guide
              </h1>
            </div>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Get started with Lattice Engine in under 5 minutes. Learn the basics and start building AI-powered applications today.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Building
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <ExternalLink className="h-5 w-5 mr-2" />
                View Examples
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
              {/* What You'll Learn */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {whatYoullLearn.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Prerequisites */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prerequisites.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Estimated Time */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Estimated Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">5 minutes</div>
                  <p className="text-sm text-muted-foreground">From setup to first deployment</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-16">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">Getting Started</h2>
                <p className="text-lg text-muted-foreground">
                  This guide will walk you through setting up Lattice Engine and creating your first AI-powered application with living specifications and intelligent mutations.
                </p>
              </div>
            </motion.section>

            {/* Steps */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-8">
                {quickSteps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="border-border hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold">
                            {step.number}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl text-foreground flex items-center gap-2">
                              <step.icon className="h-5 w-5 text-primary" />
                              {step.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-2">
                              {step.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {step.options && (
                          <div className="space-y-4">
                            {step.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="border border-border rounded-lg p-4">
                                <h4 className="font-semibold text-foreground mb-2">{option.name}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                                <div className="bg-muted p-3 rounded-md">
                                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                                    <code>{option.code}</code>
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {step.actions && (
                          <div className="space-y-2">
                            {step.actions.map((action, actionIndex) => (
                              <div key={actionIndex} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-muted-foreground">{action}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {step.code && (
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-sm text-muted-foreground overflow-x-auto">
                              <code>{step.code}</code>
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Next Steps */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">What's Next?</h2>
                <p className="text-lg text-muted-foreground">
                  Now that you have Lattice Engine set up, explore these advanced features and guides.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-foreground">Tutorials & Guides</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Deep dive into advanced workflows and best practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/docs/tutorials-and-guides">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        Explore Tutorials
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-foreground">API Documentation</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Complete reference for all Lattice Engine APIs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/docs/api-documentation">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        View API Docs
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-foreground">CLI Reference</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Master the command-line interface and automation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/docs/cli">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        CLI Commands
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-foreground">VSCode Extension</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Enhance your development experience with our IDE extension
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/docs/vscode-extension">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        Install Extension
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </motion.section>

            {/* Call to Action */}
            <motion.section
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border-border bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Ready to Build Something Amazing?
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Join thousands of developers using Lattice Engine to build the next generation of AI-powered applications.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Start Your Project
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Join Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  )
}