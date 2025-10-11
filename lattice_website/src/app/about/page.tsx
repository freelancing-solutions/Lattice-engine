"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Target, 
  Zap, 
  Heart, 
  Code, 
  Globe,
  Lightbulb,
  Shield,
  Rocket,
  Brain,
  GitBranch,
  Database
} from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the About page
export const metadata: Metadata = {
  title: "About - Lattice Engine | AI-Powered Development Platform",
  description: "Learn about Lattice Engine's mission to revolutionize software development through agentic coding and AI-powered tools. Discover our core values, technology stack, and vision for the future.",
  keywords: "about lattice engine, AI development platform, agentic coding, software development, artificial intelligence, developer tools, automation",
  authors: [{ name: "Lattice Engine Team" }],
  creator: "Lattice Engine",
  publisher: "Lattice Engine",
  robots: "index, follow",
  openGraph: {
    title: "About - Lattice Engine | AI-Powered Development Platform",
    description: "Learn about Lattice Engine's mission to revolutionize software development through agentic coding and AI-powered tools.",
    url: `${baseUrl}/about`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine - About Us"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "About - Lattice Engine | AI-Powered Development Platform",
    description: "Learn about Lattice Engine's mission to revolutionize software development through agentic coding and AI-powered tools.",
    images: [`${baseUrl}/og-image.jpg`],
    creator: "@latticeengine"
  },
  alternates: {
    canonical: `${baseUrl}/about`
  }
}

const coreValues = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We push the boundaries of what's possible in software development, constantly exploring new ways to enhance developer productivity."
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe the best solutions emerge from diverse perspectives and seamless teamwork, both within our company and with our users."
  },
  {
    icon: Shield,
    title: "Quality",
    description: "We maintain the highest standards in everything we build, ensuring reliability, security, and performance in every feature."
  },
  {
    icon: Heart,
    title: "Transparency",
    description: "We operate with openness and honesty, building trust through clear communication and ethical business practices."
  }
]

const techStack = [
  {
    icon: Brain,
    title: "AI & Machine Learning",
    technologies: ["Claude AI", "GPT Models", "Custom ML Pipelines", "Natural Language Processing"]
  },
  {
    icon: Code,
    title: "Development Platform",
    technologies: ["Next.js", "TypeScript", "Python", "Node.js"]
  },
  {
    icon: Database,
    title: "Data & Infrastructure",
    technologies: ["PostgreSQL", "Redis", "Docker", "Kubernetes"]
  },
  {
    icon: GitBranch,
    title: "DevOps & Integration",
    technologies: ["GitHub Actions", "CI/CD", "Webhooks", "REST APIs"]
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-primary rounded-full"
                initial={{
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50,
                  scale: Math.random() * 0.5 + 0.5
                }}
                transition={{
                  duration: 20 + Math.random() * 10,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                About
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 block">
                  Lattice Engine
                </span>
              </h1>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                We're building the future of software development with AI-powered agentic coding that transforms
                how developers create, collaborate, and deploy applications.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-3 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">Founded 2024</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">AI-First</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-primary text-primary">Developer-Focused</Badge>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white shadow-lg">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-3xl text-foreground">Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    To democratize software development by creating intelligent, agentic systems that understand
                    developer intent and automatically generate high-quality, maintainable code. We envision a world
                    where developers can focus on solving complex problems while AI handles the repetitive,
                    error-prone aspects of coding.
                  </p>
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                    <p className="text-foreground font-medium">
                      "Every developer should have access to AI-powered tools that amplify their creativity
                      and accelerate their impact."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide everything we do and every decision we make.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <value.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl text-foreground">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">What We Do</h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                Lattice Engine is an AI-powered development platform that revolutionizes how software is built.
                Our agentic coding system understands your requirements, generates high-quality code, and
                continuously learns from your development patterns to provide increasingly intelligent assistance.
              </p>

              <div className="grid md:grid-cols-3 gap-8 text-left">
                <Card className="bg-background border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <Zap className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-foreground">AI Code Generation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Transform natural language descriptions into production-ready code across multiple languages and frameworks.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-background border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <Rocket className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-foreground">Automated Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Streamline your development process with intelligent automation for testing, deployment, and code review.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-background border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-foreground">Team Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Enable seamless collaboration with shared specifications, real-time updates, and intelligent merge conflict resolution.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Built with Modern Technology</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We leverage cutting-edge technologies to deliver a robust, scalable, and secure platform.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <tech.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-lg text-foreground">{tech.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {tech.technologies.map((technology, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="mr-1 mb-1 text-xs">
                            {technology}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                We're a passionate team of engineers, researchers, and designers united by our vision
                to transform software development through artificial intelligence.
              </p>

              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">Join Our Growing Team</h3>
                  <p className="text-muted-foreground mb-6">
                    We're always looking for talented individuals who share our passion for innovation
                    and want to shape the future of software development.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Open Positions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-primary-foreground mb-4">Ready to Transform Your Development Workflow?</h2>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
                Join thousands of developers who are already building better software faster with Lattice Engine.
                Experience the future of agentic coding today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-background text-primary hover:bg-muted">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Contact Us
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