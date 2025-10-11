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
    color: "bg-blue-500",
    items: [
      "Authentication & Security",
      "Mutation Management", 
      "Project Operations",
      "Webhook Integration",
      "Rate Limiting & Best Practices"
    ],
    badge: "v2.1.0",
    href: "/docs/api-documentation"
  },
  {
    icon: Terminal,
    title: "CLI Tools",
    description: "Command-line interface for automation and CI/CD",
    color: "bg-slate-600",
    items: [
      "Installation & global flags",
      "Dry-run previews",
      "Proxy support",
      "CI usage",
      "Examples"
    ],
    badge: "v2.0.1",
    href: "/docs/cli"
  },
  {
    icon: Terminal,
    title: "VSCode Extension",
    description: "Native IDE integration for seamless development workflow",
    color: "bg-primary",
    items: [
      "Installation & Setup",
      "Code Completion & IntelliSense",
      "Real-time Validation",
      "Debugging Tools",
      "Custom Workflows"
    ],
    badge: "v1.5.2",
    href: "/docs/vscode-extension"
  },
  {
    icon: Zap,
    title: "MCP Servers",
    description: "Model Context Protocol integration for advanced workflows",
    color: "bg-green-500",
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
      "Getting Started Guide",
      "Advanced Workflows",
      "Team Collaboration",
      "CI/CD Integration",
      "Best Practices"
    ],
    badge: "Updated",
    href: "/docs/tutorials-and-guides"
  }
]

const quickStartSteps = [
  {
    title: "Install VSCode Extension",
    description: "Get the Lattice Engine extension from the VSCode Marketplace",
    icon: Code
  },
  {
    title: "Configure API Key",
    description: "Generate and configure your API key for authentication",
    icon: Terminal
  },
  {
    title: "Create First Project",
    description: "Initialize your first project with living specifications",
    icon: FileText
  },
  {
    title: "Propose Mutation",
    description: "Make your first code change and experience the workflow",
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
            Comprehensive Documentation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to master Lattice Engine. From quick start guides to advanced API references.
          </p>
        </motion.div>

        {/* Documentation Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {docCategories.map((category, index) => (
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
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-gray-900">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={category.href}>
                      View Docs
                      <ArrowRight className="h-4 w-4 ml-2" />
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
          <Card className="bg-gradient-to-r from-primary to-orange-600 border-0 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">
                🚀 Quick Start Guide
              </CardTitle>
              <CardDescription className="text-orange-100 text-lg">
                Get up and running with Lattice Engine in under 5 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {quickStartSteps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">
                      Step {index + 1}
                    </h4>
                    <p className="text-orange-100 text-sm">
                      {step.title}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
                  <Link href="/docs/quickstart">
                    Start Quick Start Guide
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
            <Card className="text-center border-0 shadow-md">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>
                  Join thousands of developers sharing tips and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Join Community
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>GitHub Discussions</CardTitle>
                <CardDescription>
                  Contribute to the project and engage with the core team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Discussions
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md">
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
                    Read Blog
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