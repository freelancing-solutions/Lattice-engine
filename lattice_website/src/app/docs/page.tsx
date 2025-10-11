import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import DocsHero from "@/components/docs-hero"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Code,
  Terminal,
  Zap,
  Search,
  FileText,
  Download,
  ExternalLink,
  Users,
  MessageCircle,
  Star,
  Clock,
  ArrowRight,
  GitBranch,
  Database,
  Shield,
  Rocket,
  Globe,
  CheckCircle,
  Lightbulb,
  HelpCircle,
  PlayCircle,
  BookMarked,
  Video,
  Podcast,
  Github,
  Twitter,
  Mail,
  ChevronRight
} from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Documentation - Lattice Engine | AI-Powered Development Platform",
  description: "Comprehensive documentation for Lattice Engine. Learn how to build, deploy, and scale AI-powered applications with our detailed guides, API references, and tutorials.",
  keywords: [
    "lattice engine documentation",
    "ai development platform docs",
    "agentic coding guides",
    "api documentation",
    "vscode extension guide",
    "mcp servers documentation",
    "developer tutorials",
    "mutation tracking guides"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "Documentation - Lattice Engine",
    description: "Comprehensive documentation for Lattice Engine. Learn how to build, deploy, and scale AI-powered applications with our detailed guides and API references.",
    url: `${baseUrl}/docs`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-docs.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine Documentation"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation - Lattice Engine",
    description: "Comprehensive documentation for Lattice Engine. Learn how to build, deploy, and scale AI-powered applications with our detailed guides and API references.",
    images: [`${baseUrl}/og-docs.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/docs`
  }
}

const documentationCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New to Lattice? Start here with our beginner guides and quick start tutorials.",
    icon: PlayCircle,
    color: "bg-green-500",
    items: [
      {
        title: "Quick Start Guide",
        description: "Get up and running in under 5 minutes",
        link: "/docs/quickstart",
        type: "guide",
        difficulty: "beginner",
        readTime: "5 min"
      },
      {
        title: "Installation & Setup",
        description: "Install Lattice Engine and configure your environment",
        link: "/docs/installation",
        type: "guide",
        difficulty: "beginner",
        readTime: "10 min"
      },
      {
        title: "Core Concepts",
        description: "Understand mutations, specifications, and workflows",
        link: "/docs/concepts",
        type: "guide",
        difficulty: "beginner",
        readTime: "15 min"
      }
    ]
  },
  {
    id: "api-documentation",
    title: "API Documentation",
    description: "Complete REST API reference with examples and SDK documentation.",
    icon: Code,
    color: "bg-blue-500",
    items: [
      {
        title: "API Reference v2.1.0",
        description: "Complete REST API documentation with examples",
        link: "/docs/api-documentation",
        type: "api",
        difficulty: "intermediate",
        readTime: "30 min"
      },
      {
        title: "Authentication & Security",
        description: "Secure your API connections and handle authentication",
        link: "/docs/authentication",
        type: "guide",
        difficulty: "intermediate",
        readTime: "20 min"
      },
      {
        title: "Rate Limiting & Best Practices",
        description: "Understand API limits and optimization techniques",
        link: "/docs/rate-limiting",
        type: "guide",
        difficulty: "advanced",
        readTime: "15 min"
      }
    ]
  },
  {
    id: "vscode-extension",
    title: "VSCode Extension",
    description: "Native IDE integration with IntelliSense support and real-time validation.",
    icon: Code,
    color: "bg-primary",
    items: [
      {
        title: "Extension Guide v1.5.2",
        description: "Complete VSCode extension documentation",
        link: "/docs/vscode-extension",
        type: "guide",
        difficulty: "beginner",
        readTime: "25 min"
      },
      {
        title: "Code Completion & IntelliSense",
        description: "Master intelligent code completion and suggestions",
        link: "/docs/intellisense",
        type: "guide",
        difficulty: "beginner",
        readTime: "15 min"
      },
      {
        title: "Real-time Validation",
        description: "Configure and use live code validation features",
        link: "/docs/validation",
        type: "guide",
        difficulty: "intermediate",
        readTime: "20 min"
      }
    ]
  },
  {
    id: "mcp-servers",
    title: "MCP Servers",
    description: "Model Context Protocol integration for advanced workflows and real-time synchronization.",
    icon: Zap,
    color: "bg-green-500",
    items: [
      {
        title: "MCP Server Guide v2.0.0",
        description: "Complete MCP server configuration and usage",
        link: "/docs/mcp-servers",
        type: "guide",
        difficulty: "advanced",
        readTime: "45 min"
      },
      {
        title: "Real-time Synchronization",
        description: "Set up real-time sync between multiple clients",
        link: "/docs/realtime-sync",
        type: "guide",
        difficulty: "advanced",
        readTime: "30 min"
      },
      {
        title: "Event Streaming",
        description: "Implement event-driven architectures with MCP",
        link: "/docs/event-streaming",
        type: "guide",
        difficulty: "advanced",
        readTime: "35 min"
      }
    ]
  },
  {
    id: "tutorials",
    title: "Tutorials & Guides",
    description: "Step-by-step guides to master Lattice Engine and implement advanced workflows.",
    icon: BookOpen,
    color: "bg-primary",
    items: [
      {
        title: "Complete Tutorial Collection",
        description: "All tutorials in one comprehensive guide",
        link: "/docs/tutorials-and-guides",
        type: "tutorial",
        difficulty: "mixed",
        readTime: "2 hours"
      },
      {
        title: "Advanced Workflows",
        description: "Master complex development patterns",
        link: "/docs/advanced-workflows",
        type: "tutorial",
        difficulty: "advanced",
        readTime: "60 min"
      },
      {
        title: "Team Collaboration",
        description: "Set up collaborative development workflows",
        link: "/docs/team-collaboration",
        type: "tutorial",
        difficulty: "intermediate",
        readTime: "40 min"
      },
      {
        title: "CI/CD Integration",
        description: "Integrate Lattice with your CI/CD pipeline",
        link: "/docs/cicd-integration",
        type: "tutorial",
        difficulty: "advanced",
        readTime: "50 min"
      }
    ]
  }
]

const quickLinks = [
  {
    title: "Popular Guides",
    items: [
      { title: "Getting Started", link: "/docs/quickstart", icon: PlayCircle },
      { title: "API Reference", link: "/docs/api-documentation", icon: Code },
      { title: "VSCode Extension", link: "/docs/vscode-extension", icon: Terminal },
      { title: "Troubleshooting", link: "/docs/troubleshooting", icon: HelpCircle }
    ]
  },
  {
    title: "Developer Tools",
    items: [
      { title: "JavaScript SDK", link: "/docs/sdk/javascript", icon: Code },
      { title: "Python SDK", link: "/docs/sdk/python", icon: Terminal },
      { title: "CLI Tools", link: "/docs/cli", icon: GitBranch },
      { title: "Webhooks", link: "/docs/webhooks", icon: ExternalLink }
    ]
  },
  {
    title: "Resources",
    items: [
      { title: "Examples", link: "/docs/examples", icon: Lightbulb },
      { title: "Best Practices", link: "/docs/best-practices", icon: Star },
      { title: "Community", link: "/docs/community", icon: Users },
      { title: "Support", link: "/docs/support", icon: MessageCircle }
    ]
  }
]

const recentUpdates = [
  {
    type: "updated",
    title: "API Documentation v2.1.0",
    description: "Added new endpoints for batch operations and improved error handling.",
    date: "2024-01-15",
    link: "/docs/api-documentation"
  },
  {
    type: "new",
    title: "MCP Servers Guide",
    description: "Complete guide to setting up and configuring MCP servers for real-time synchronization.",
    date: "2024-01-12",
    link: "/docs/mcp-servers"
  },
  {
    type: "updated",
    title: "VSCode Extension v1.5.2",
    description: "Enhanced IntelliSense support and new debugging features.",
    date: "2024-01-10",
    link: "/docs/vscode-extension"
  }
]

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <DocsHero />

          {/* Search Section */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  className="pl-12 py-4 text-lg bg-background border-border focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">mutations</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">API</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">VSCode</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">getting started</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">examples</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {quickLinks.map((section, index) => (
                  <Card key={index} className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-foreground">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <a
                            key={itemIndex}
                            href={item.link}
                            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-muted/50"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Main Documentation Content */}
            <div className="lg:col-span-3">
              {/* Documentation Categories */}
              <div className="space-y-16">
                {documentationCategories.map((category, index) => (
                  <motion.section
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="mb-8">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                          <category.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-foreground">{category.title}</h2>
                          <p className="text-muted-foreground mt-1">{category.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.items.map((item, itemIndex) => (
                        <Card key={itemIndex} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md group">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                variant={item.difficulty === 'beginner' ? 'secondary' :
                                       item.difficulty === 'intermediate' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {item.difficulty}
                              </Badge>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.readTime}
                              </div>
                            </div>
                            <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.type}
                              </Badge>
                              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 p-2">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>

              {/* Recent Updates */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-16"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">Recent Updates</h2>
                  <p className="text-muted-foreground">Stay up to date with the latest documentation changes and improvements.</p>
                </div>

                <div className="space-y-4">
                  {recentUpdates.map((update, index) => (
                    <Card key={index} className="border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            update.type === 'new' ? 'bg-green-500' :
                            update.type === 'updated' ? 'bg-blue-500' : 'bg-orange-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-foreground">{update.title}</h3>
                              <span className="text-sm text-muted-foreground">{update.date}</span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{update.description}</p>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 p-0 h-auto">
                              Read more <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
        </div>

        {/* Community & Support */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Need Help?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get support from our community and team members.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Community Forum</CardTitle>
                  <CardDescription>
                    Connect with other developers and share your experiences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Join Community
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Discord Server</CardTitle>
                  <CardDescription>
                    Real-time chat with the Lattice team and community members.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Join Discord
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Email Support</CardTitle>
                  <CardDescription>
                    Get help from our support team for technical questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}