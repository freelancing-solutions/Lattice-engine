"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, PlayCircle, Download, Terminal, Code, ArrowRight, Zap, BookOpen, ExternalLink } from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the Quick Start Guide page
// export const metadata: Metadata = {
//   title: "Quick Start Guide - Lattice Engine",
//   description: "Get started with Lattice Engine in under 5 minutes. Learn the basics and start building AI-powered applications today.",
// }

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
      "Visit lattice.dev/signup to create your account",
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

export default function QuickStartPage() {
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
                  <PlayCircle className="h-8 w-8 text-primary-foreground" />
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
                Get up and running with Lattice Engine in under 5 minutes. Start building AI-powered applications today.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">5 minutes</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">Beginner friendly</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">No credit card</Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Prerequisites */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Prerequisites</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      {prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Quick Steps */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Getting Started in 5 Steps</h2>
                <div className="space-y-12">
                  {quickSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex gap-8"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <step.icon className="h-6 w-6 text-primary mr-3" />
                          <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-6">{step.description}</p>

                        {step.options && (
                          <div className="space-y-4">
                            {step.options.map((option, optionIndex) => (
                              <Card key={optionIndex} className="border-border">
                                <CardHeader>
                                  <CardTitle className="text-lg text-foreground">{option.name}</CardTitle>
                                  <CardDescription>{option.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <pre className="bg-muted p-4 rounded text-sm font-mono overflow-x-auto border border-border">
                                    <code>{option.code}</code>
                                  </pre>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {step.code && (
                          <Card className="border-border">
                            <CardContent className="p-4">
                              <pre className="bg-muted p-4 rounded text-sm font-mono overflow-x-auto border border-border">
                                <code>{step.code}</code>
                              </pre>
                            </CardContent>
                          </Card>
                        )}

                        {step.actions && (
                          <Card className="border-border">
                            <CardContent className="p-4">
                              <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                                {step.actions.map((action, actionIndex) => (
                                  <li key={actionIndex} className="text-sm">{action}</li>
                                ))}
                              </ol>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* What You'll Learn */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">What You'll Learn</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      {whatYoullLearn.map((item, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Next Steps */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Next Steps</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-border hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl text-foreground">Explore Core Concepts</CardTitle>
                      <CardDescription>Learn about mutations, specifications, and workflows.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/docs/concepts">
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          Learn More <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border-border hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl text-foreground">Browse Examples</CardTitle>
                      <CardDescription>Check out real-world examples and use cases.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/docs/examples">
                        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          View Examples <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </motion.section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Progress Card */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quickSteps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {step.number}
                          </div>
                          <span className="text-sm text-muted-foreground">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a href="/docs/api-documentation" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        API Documentation
                      </a>
                      <a href="/docs/vscode-extension" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Terminal className="h-4 w-4 mr-2" />
                        VSCode Extension
                      </a>
                      <a href="/docs/troubleshooting" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Troubleshooting
                      </a>
                      <a href="/docs/support" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Get Help
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our community is here to help you get started.
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