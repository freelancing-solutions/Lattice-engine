"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  BookOpen, 
  Calendar, 
  User, 
  ArrowRight, 
  Search, 
  TrendingUp, 
  Code, 
  Lightbulb,
  FileText,
  Zap,
  Users,
  Clock,
  Mail
} from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata is handled by the layout since this is a client component
//   title: "Blog - Lattice Engine",
//   description: "Stay updated with the latest news, tutorials, and insights from the Lattice Engine development team.",
// }

const featuredPost = {
  slug: "the-future-of-spec-driven-development",
  title: "The Future of Spec-Driven Development: Unified Orchestration for AI Coding Agents",
  excerpt: "Discover how Project Lattice's unified orchestration platform is revolutionizing software development through spec-driven agentic workflows. Learn about the ecosystem approach to AI-powered coding.",
  author: "Project Lattice Team",
  date: "2024-01-15",
  readTime: "8 min read",
  category: "Ecosystem",
  image: "/blog/featured-agentic-coding.jpg"
}

const blogPosts = [
  {
    slug: "getting-started-with-project-lattice",
    title: "Getting Started with Project Lattice",
    excerpt: "A comprehensive guide to setting up your first spec-driven project with Project Lattice and understanding the core concepts of unified orchestration.",
    author: "Sarah Chen",
    date: "2024-01-12",
    readTime: "5 min read",
    category: "Tutorials",
    image: "/blog/getting-started.jpg"
  },
  {
    slug: "spec-driven-workflows-explained",
    title: "Spec-Driven Workflows Explained",
    excerpt: "Deep dive into how Project Lattice's spec-driven approach works and how it enables seamless orchestration of AI coding agents across your development workflow.",
    author: "Alex Rodriguez",
    date: "2024-01-10",
    readTime: "7 min read",
    category: "Ecosystem",
    image: "/blog/code-mutations.jpg"
  },
  {
    slug: "building-scalable-agent-orchestration",
    title: "Building Scalable Agent Orchestration",
    excerpt: "Learn best practices for creating maintainable and scalable agent orchestration patterns that grow with your project requirements and team size.",
    author: "Jordan Kim",
    date: "2024-01-08",
    readTime: "6 min read",
    category: "Tutorials",
    image: "/blog/scalable-specs.jpg"
  },
  {
    slug: "vscode-extension-ecosystem-integration",
    title: "VSCode Extension: Ecosystem Integration",
    excerpt: "Explore how the Project Lattice VSCode extension seamlessly integrates with the broader ecosystem to maximize your productivity and development flow.",
    author: "Maya Patel",
    date: "2024-01-05",
    readTime: "4 min read",
    category: "Tutorials",
    image: "/blog/vscode-extension.jpg"
  },
  {
    slug: "case-study-unified-development-workflow",
    title: "Case Study: Unified Development Workflow at TechCorp",
    excerpt: "How TechCorp used Project Lattice's unified orchestration to reduce development cycle time by 80% while improving code quality and team collaboration.",
    author: "David Wilson",
    date: "2024-01-03",
    readTime: "9 min read",
    category: "Success Stories",
    image: "/blog/case-study-review.jpg"
  },
  {
    slug: "mcp-server-ecosystem-integration",
    title: "MCP Server Ecosystem Integration Guide",
    excerpt: "Step-by-step guide to integrating Model Context Protocol servers within the Project Lattice ecosystem for enhanced AI agent capabilities and workflows.",
    author: "Lisa Zhang",
    date: "2024-01-01",
    readTime: "8 min read",
    category: "Tutorials",
    image: "/blog/mcp-integration.jpg"
  }
]

const popularPosts = [
  { title: "Getting Started with Project Lattice", slug: "getting-started-with-project-lattice" },
  { title: "Spec-Driven Workflows Explained", slug: "spec-driven-workflows-explained" },
  { title: "Case Study: Unified Development Workflow at TechCorp", slug: "case-study-unified-development-workflow" },
  { title: "VSCode Extension: Ecosystem Integration", slug: "vscode-extension-ecosystem-integration" }
]

const categories = [
  { name: "All", count: blogPosts.length + 1 },
  { name: "Tutorials", count: 4 },
  { name: "Ecosystem", count: 2 },
  { name: "Success Stories", count: 1 },
  { name: "Updates", count: 0 }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Project Lattice
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent"> Blog</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover the latest insights, tutorials, and case studies about spec-driven agentic development, 
                unified orchestration for AI coding agents, and building the future of software development.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">Spec-Driven Development</Badge>
                <Badge variant="secondary" className="bg-blue-600 text-white">Ecosystem Insights</Badge>
                <Badge variant="secondary" className="bg-green-600 text-white">Success Stories</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  placeholder="Search articles, tutorials, and case studies..." 
                  className="pl-10 py-3 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Article</h2>
              <p className="text-gray-600">Our latest and most popular content</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="md:flex">
                  <div className="md:w-1/2 bg-gradient-to-br from-orange-100 to-blue-100 p-8 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-primary" />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <Badge className="mb-4 bg-primary text-primary-foreground">{featuredPost.category}</Badge>
                    <CardTitle className="text-2xl mb-4 text-gray-900">{featuredPost.title}</CardTitle>
                    <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </CardDescription>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{featuredPost.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts with Categories */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <Tabs defaultValue="All" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-8">
                      {categories.map((category) => (
                        <TabsTrigger key={category.name} value={category.name} className="text-sm">
                          {category.name} ({category.count})
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="All" className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {blogPosts.map((post, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                              <div className="aspect-video bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center">
                                <Code className="h-12 w-12 text-primary" />
                              </div>
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="secondary">{post.category}</Badge>
                                  <span className="text-xs text-gray-500">{post.readTime}</span>
                                </div>
                                <CardTitle className="text-lg text-gray-900 line-clamp-2">
                                  {post.title}
                                </CardTitle>
                                <CardDescription className="text-gray-600 line-clamp-3">
                                  {post.excerpt}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                    <Calendar className="h-4 w-4 ml-2" />
                                    <span>{post.date}</span>
                                  </div>
                                  <Link href={`/blog/${post.slug}`}>
                                    <Button variant="ghost" size="sm">
                                      Read More
                                      <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Category-specific content would be filtered versions of the above */}
                    <TabsContent value="Tutorials">
                      <div className="grid md:grid-cols-2 gap-8">
                        {blogPosts.filter(post => post.category === "Tutorials").map((post, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                                <Lightbulb className="h-12 w-12 text-green-600" />
                              </div>
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="secondary" className="bg-green-600 text-white">{post.category}</Badge>
                                  <span className="text-xs text-gray-500">{post.readTime}</span>
                                </div>
                                <CardTitle className="text-lg text-gray-900">{post.title}</CardTitle>
                                <CardDescription className="text-gray-600">{post.excerpt}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                    <Calendar className="h-4 w-4 ml-2" />
                                    <span>{post.date}</span>
                                  </div>
                                  <Link href={`/blog/${post.slug}`}>
                                    <Button variant="ghost" size="sm">
                                      Read More
                                      <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="Ecosystem">
                      <div className="grid md:grid-cols-2 gap-8">
                        {blogPosts.filter(post => post.category === "Ecosystem").map((post, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                              <div className="aspect-video bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center">
                                <Zap className="h-12 w-12 text-primary" />
                              </div>
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="secondary" className="bg-primary text-primary-foreground">{post.category}</Badge>
                                  <span className="text-xs text-gray-500">{post.readTime}</span>
                                </div>
                                <CardTitle className="text-lg text-gray-900">{post.title}</CardTitle>
                                <CardDescription className="text-gray-600">{post.excerpt}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                    <Calendar className="h-4 w-4 ml-2" />
                                    <span>{post.date}</span>
                                  </div>
                                  <Link href={`/blog/${post.slug}`}>
                                    <Button variant="ghost" size="sm">
                                      Read More
                                      <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="Success Stories">
                      <div className="grid md:grid-cols-2 gap-8">
                        {blogPosts.filter(post => post.category === "Success Stories").map((post, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                              <div className="aspect-video bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                                <TrendingUp className="h-12 w-12 text-blue-600" />
                              </div>
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="secondary" className="bg-blue-600 text-white">{post.category}</Badge>
                                  <span className="text-xs text-gray-500">{post.readTime}</span>
                                </div>
                                <CardTitle className="text-lg text-gray-900 line-clamp-2">{post.title}</CardTitle>
                                <CardDescription className="text-gray-600 line-clamp-3">{post.excerpt}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                    <Calendar className="h-4 w-4 ml-2" />
                                    <span>{post.date}</span>
                                  </div>
                                  <Link href={`/blog/${post.slug}`}>
                                    <Button variant="ghost" size="sm">
                                      Read More
                                      <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="Updates">
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Updates Yet</h3>
                        <p className="text-gray-600">Check back soon for the latest product updates and announcements.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 mt-12 lg:mt-0">
                <div className="space-y-8">
                  {/* Popular Posts */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span>Popular Posts</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {popularPosts.map((post, index) => (
                            <Link key={index} href={`/blog/${post.slug}`} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700 hover:text-primary">{post.title}</span>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Categories */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span>Categories</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {categories.filter(cat => cat.name !== "All").map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <span className="text-sm text-gray-700 hover:text-primary">{category.name}</span>
                              <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Newsletter Signup */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-gradient-to-br from-orange-50 to-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <span>Newsletter</span>
                        </CardTitle>
                        <CardDescription>
                          Get the latest articles and updates delivered to your inbox.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Input placeholder="Enter your email" />
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Subscribe
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary to-orange-600">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Building with Specs?</h2>
              <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Join thousands of developers who are already using Project Lattice's unified orchestration platform to build better software faster. 
                Start your spec-driven development journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Start Building with Specs
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Explore the Ecosystem
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}