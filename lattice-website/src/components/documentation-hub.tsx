"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Book, Code, Terminal, Zap, ArrowRight, Star, Users, FileText } from "lucide-react"
import Link from "next/link"

const docCategories = [
  {
    icon: Code,
    title: "API Documentation",
    description: "Complete REST API reference with examples and SDKs",
    color: "bg-primary",
    items: [
      "Installation & Setup",
      "First Project Creation",
      "Basic Spec-Driven Workflow",
      "VSCode Extension Setup",
      "Your First Mutation"
    ],
    badge: "Start Here",
    href: "/docs/quickstart"
  },
  {
    icon: Terminal,
    title: "CLI Tools",
    description: "Command-line interface for automation and CI/CD",
    color: "bg-muted",
    items: [
      "Living Specifications",
      "Agentic Development Model",
      "Mutation Engine Architecture",
      "Portal & BugSage Integration",
      "Ecosystem Components"
    ],
    badge: "Essential",
    href: "/docs/core-concepts"
  },
  {
    icon: Terminal,
    title: "VSCode Extension",
    description: "Native IDE integration for seamless development workflow",
    color: "bg-primary",
    items: [
      "VSCode Extension Guide",
      "CLI Tools & Automation",
      "MCP Server Configuration",
      "CI/CD Pipeline Integration",
      "Team Collaboration Setup"
    ],
    badge: "Popular",
    href: "/docs/integration-guides"
  },
  {
    icon: Zap,
    title: "MCP Servers",
    description: "Model Context Protocol integration for advanced workflows",
    color: "bg-primary/80",
    items: [
      "Server Configuration",
      "Real-time Synchronization",
      "Multi-client Support",
      "Event Streaming",
      "State Management"
    ],
    badge: "v2.0.0",
    href: "/docs/mcp-servers"
  },
  {
    icon: Book,
    title: "Tutorials & Guides",
    description: "Step-by-step guides to master Lattice Engine",
    color: "bg-primary",
    items: [
      "Authentication & Security",
      "Mutation Management API",
      "Project Operations",
      "Webhook Integration",
      "Rate Limiting & Best Practices"
    ],
    badge: "v2.1.0",
    href: "/docs/api-reference"
  }
]

const quickStartSteps = [
  {
    title: "Install VSCode Extension",
    description: "Get the Project Lattice extension from the VSCode Marketplace",
    icon: Code
  },
  {
    title: "Create Your First Spec",
    description: "Initialize a project with living specifications",
    icon: FileText
  },
  {
    title: "Connect Your Agent",
    description: "Configure AI agents for spec-driven development",
    icon: Terminal
  },
  {
    title: "Experience Agentic Flow",
    description: "Watch as agents propose and implement mutations",
    icon: Zap
  }
]

export default function DocumentationHub() {
  return (
    <section className="py-20 bg-slate-50" id="docs">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Developer Documentation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to master spec-driven agentic development. From quick start guides to comprehensive API references.
          </p>
        </motion.div>

        {/* Documentation Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {docCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card border-border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">{category.title}</CardTitle>
                    <Badge variant="secondary" className="text-sm">
                      {category.badge}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={category.href}>
                      Explore Documentation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">
                🚀 Developer Journey
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg">
                Get up and running with Lattice Engine in under 5 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {quickStartSteps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h4 className="font-semibold text-primary-foreground mb-2">
                      Step {index + 1}
                    </h4>
                    <p className="text-primary-foreground/80 text-sm">
                      {step.title}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
                  <Link href="/docs/quickstart">
                    Start Building with Specs
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Community & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-border shadow-md">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>
                  Join thousands of developers sharing tips and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Explore the Ecosystem
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-border shadow-md">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>GitHub Discussions</CardTitle>
                <CardDescription>
                  Contribute to the project and engage with the core team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Start Building with Specs
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-border shadow-md">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Blog & Tutorials</CardTitle>
                <CardDescription>
                  Latest insights, tutorials, and product updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/blog">
                    Explore the Ecosystem
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  )
}