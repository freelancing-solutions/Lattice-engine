"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Lightbulb,
  Settings,
  Code,
  GitBranch,
  Layers,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronRight,
  Database,
  Workflow,
  Target,
  Users,
  Clock,
  Download
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

const coreConcepts = [
  {
    id: "mutations",
    title: "Mutations",
    description: "AI-powered code transformations that understand context and intent",
    icon: GitBranch,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    concepts: [
      {
        title: "What are Mutations?",
        description: "Mutations are AI-powered code transformations that can understand context, intent, and project structure. They go beyond simple text replacement to provide intelligent code modifications."
      },
      {
        title: "Context Awareness",
        description: "Mutations understand your codebase, dependencies, and coding patterns to make intelligent changes that maintain consistency."
      },
      {
        title: "Safety First",
        description: "Each mutation includes validation, testing, and rollback capabilities to ensure code integrity."
      }
    ],
    example: {
      title: "Example: Add TypeScript Types",
      description: "Automatically add TypeScript type definitions to existing JavaScript code",
      before: `function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`,
      after: `interface Item {
  price: number;
  name: string;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum: number, item: Item) => sum + item.price, 0);
}`
    }
  },
  {
    id: "specifications",
    title: "Specifications",
    description: "Structured requirements that define what changes should be made",
    icon: Target,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    concepts: [
      {
        title: "Structured Requirements",
        description: "Specifications define changes in a machine-readable format that AI can understand and execute reliably."
      },
      {
        title: "Validation Rules",
        description: "Include constraints, validation rules, and acceptance criteria to ensure changes meet requirements."
      },
      {
        title: "Version Control",
        description: "Track specification changes over time and understand the evolution of your requirements."
      }
    ],
    example: {
      title: "Example: API Specification",
      description: "Define requirements for adding a new REST API endpoint",
      specification: `{
  "type": "add_api_endpoint",
  "endpoint": "/api/users/{id}",
  "method": "GET",
  "description": "Get user by ID",
  "parameters": {
    "id": {
      "type": "string",
      "required": true,
      "format": "uuid"
    }
  },
  "response": {
    "200": {
      "schema": "UserResponse",
      "description": "User found"
    },
    "404": {
      "schema": "ErrorResponse",
      "description": "User not found"
    }
  },
  "validation": {
    "authenticate": true,
    "rate_limit": "100/hour"
  }
}`
    }
  },
  {
    id: "approvals",
    title: "Approvals",
    description: "Human-in-the-loop review process for critical changes",
    icon: Shield,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    concepts: [
      {
        title: "Review Process",
        description: "Critical changes require human approval before execution, ensuring oversight and quality control."
      },
      {
        title: "Approval Workflows",
        description: "Configure multi-stage approval processes with different reviewers for different types of changes."
      },
      {
        title: "Audit Trail",
        description: "Complete audit trail of all approvals, rejections, and modifications for compliance and debugging."
      }
    ],
    example: {
      title: "Example: Production Deployment Approval",
      description: "Multi-stage approval process for deploying to production",
      workflow: [
        "1. Developer submits deployment request",
        "2. Code review by team lead",
        "3. Security review by security team",
        "4. Final approval by release manager",
        "5. Automated deployment execution"
      ]
    }
  },
  {
    id: "sync",
    title: "Real-time Sync",
    description: "Keep your specifications and code synchronized across all environments",
    icon: Globe,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    concepts: [
      {
        title: "Bidirectional Sync",
        description: "Changes in code are automatically reflected in specifications and vice versa."
      },
      {
        title: "Conflict Resolution",
        description: "Intelligent conflict detection and resolution when changes occur in multiple places."
      },
      {
        title: "Environment Consistency",
        description: "Ensure all environments (dev, staging, production) stay synchronized."
      }
    ],
    example: {
      title: "Example: Database Schema Sync",
      description: "Keep database schema changes synchronized across environments",
      scenario: "When a developer adds a new column to a table in the development environment, Lattice automatically:"
    }
  }
]

const architectureConcepts = [
  {
    title: "Event-Driven Architecture",
    description: "Lattice uses an event-driven architecture to handle mutations, approvals, and synchronization in real-time.",
    icon: Zap,
    details: [
      "Events trigger mutations and sync operations",
      "Asynchronous processing for better performance",
      "Real-time notifications and updates"
    ]
  },
  {
    title: "Plugin System",
    description: "Extensible plugin architecture allows custom mutations and integrations.",
    icon: Layers,
    details: [
      "Custom mutation types",
      "Third-party integrations",
      "Language-specific plugins"
    ]
  },
  {
    title: "State Management",
    description: "Centralized state management ensures consistency across all operations.",
    icon: Database,
    details: [
      "Distributed state coordination",
      "Conflict resolution",
      "Rollback capabilities"
    ]
  }
]

const bestPractices = [
  {
    category: "Specifications",
    practices: [
      "Write clear, specific requirements",
      "Include validation rules and constraints",
      "Use version control for specifications",
      "Document business logic and intent"
    ]
  },
  {
    category: "Mutations",
    practices: [
      "Test mutations in development first",
      "Use incremental changes when possible",
      "Always include rollback procedures",
      "Monitor mutation success rates"
    ]
  },
  {
    category: "Approvals",
    practices: [
      "Define clear approval workflows",
      "Use appropriate reviewers for each change type",
      "Document approval decisions",
      "Regular review of approval processes"
    ]
  }
]

const learningPath = [
  {
    step: 1,
    title: "Understanding Mutations",
    description: "Learn how AI-powered mutations work and their benefits",
    duration: "15 min",
    icon: GitBranch
  },
  {
    step: 2,
    title: "Creating Specifications",
    description: "Master the art of writing effective specifications",
    duration: "20 min",
    icon: Target
  },
  {
    step: 3,
    title: "Approval Workflows",
    description: "Set up and manage approval processes",
    duration: "15 min",
    icon: Shield
  },
  {
    step: 4,
    title: "Real-world Examples",
    description: "Apply concepts to real development scenarios",
    duration: "30 min",
    icon: Code
  }
]

export default function CoreConceptsPage() {
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
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Core Concepts
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Master the fundamental concepts that power Lattice Engine. Understand how AI-driven development works and how to leverage it effectively.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">Fundamentals</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">AI-Powered</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">Best Practices</Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Core Concepts */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Core Concepts</h2>
                <div className="space-y-12">
                  {coreConcepts.map((concept, index) => (
                    <motion.div
                      key={concept.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border">
                        <CardHeader>
                          <div className="flex items-center space-x-4 mb-4">
                            <div className={`w-12 h-12 ${concept.bgColor} rounded-lg flex items-center justify-center`}>
                              <concept.icon className={`h-6 w-6 ${concept.color}`} />
                            </div>
                            <div>
                              <CardTitle className="text-2xl text-foreground">{concept.title}</CardTitle>
                              <CardDescription className="text-base">{concept.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Concept Details */}
                          <div className="space-y-4">
                            {concept.concepts.map((item, itemIndex) => (
                              <div key={itemIndex} className="space-y-2">
                                <h4 className="font-semibold text-foreground">{item.title}</h4>
                                <p className="text-muted-foreground">{item.description}</p>
                              </div>
                            ))}
                          </div>

                          {/* Example */}
                          {concept.example && (
                            <div className="bg-muted p-6 rounded-lg border border-border">
                              <h4 className="font-semibold text-foreground mb-2">{concept.example.title}</h4>
                              <p className="text-muted-foreground mb-4">{concept.example.description}</p>
                              
                              {concept.example.before && concept.example.after && (
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Before</h5>
                                    <pre className="bg-background p-3 rounded text-xs font-mono overflow-x-auto border border-border">
                                      <code>{concept.example.before}</code>
                                    </pre>
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium text-muted-foreground mb-2">After</h5>
                                    <pre className="bg-background p-3 rounded text-xs font-mono overflow-x-auto border border-border">
                                      <code>{concept.example.after}</code>
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {concept.example.specification && (
                                <pre className="bg-background p-3 rounded text-xs font-mono overflow-x-auto border border-border">
                                  <code>{concept.example.specification}</code>
                                </pre>
                              )}

                              {concept.example.workflow && (
                                <ol className="space-y-2">
                                  {concept.example.workflow.map((step, stepIndex) => (
                                    <li key={stepIndex} className="text-sm text-muted-foreground">{step}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Architecture Concepts */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Architecture Concepts</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {architectureConcepts.map((arch, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-4">
                          <arch.icon className="h-6 w-6 text-primary" />
                          <CardTitle className="text-lg text-foreground">{arch.title}</CardTitle>
                        </div>
                        <CardDescription>{arch.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {arch.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Best Practices */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Best Practices</h2>
                <div className="space-y-6">
                  {bestPractices.map((category, index) => (
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
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Learning Path */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Learning Path</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {learningPath.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                            {step.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                            <Badge variant="outline" className="text-xs mt-1">{step.duration}</Badge>
                          </div>
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
                      <Link href="/docs/quickstart" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Zap className="h-4 w-4 mr-2" />
                        Quick Start
                      </Link>
                      <Link href="/docs/installation" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Installation
                      </Link>
                      <Link href="/docs/api-documentation" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        API Reference
                      </Link>
                      <Link href="/docs/tutorials" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tutorials
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Help */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have questions about core concepts? Our community is here to help.
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