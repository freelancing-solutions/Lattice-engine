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
  BookOpen,
  Rocket,
  Users,
  GitBranch,
  Shield,
  Clock,
  PlayCircle,
  Download,
  Star,
  CheckCircle,
  ArrowRight,
  Code,
  Terminal,
  Zap,
  Globe,
  BarChart3,
  Settings,
  Lightbulb,
  Award,
  Target
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the Tutorials & Guides page
// export const metadata: Metadata = {
//   title: "Tutorials & Guides - Lattice Engine",
//   description: "Step-by-step guides to master Lattice Engine. Learn advanced workflows, team collaboration, CI/CD integration, and best practices.",
// }

const tutorialCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Perfect for beginners. Learn the basics and get up and running quickly.",
    icon: PlayCircle,
    color: "bg-green-500",
    tutorials: [
      {
        title: "Complete Quick Start Guide",
        description: "From installation to your first deployed application in 30 minutes",
        duration: "30 min",
        difficulty: "Beginner",
        rating: 4.9,
        students: 15200,
        tags: ["installation", "setup", "basics"]
      },
      {
        title: "Understanding Lattice Architecture",
        description: "Deep dive into how Lattice Engine works under the hood",
        duration: "45 min",
        difficulty: "Beginner",
        rating: 4.7,
        students: 8900,
        tags: ["architecture", "concepts", "fundamentals"]
      },
      {
        title: "Your First Mutation",
        description: "Create, review, and deploy your first code mutation with Lattice",
        duration: "20 min",
        difficulty: "Beginner",
        rating: 4.8,
        students: 12100,
        tags: ["mutations", "first-project", "hands-on"]
      }
    ]
  },
  {
    id: "advanced-workflows",
    title: "Advanced Workflows",
    description: "Master complex patterns and advanced techniques for experienced developers.",
    icon: Rocket,
    color: "bg-primary",
    tutorials: [
      {
        title: "Custom Workflow Automation",
        description: "Build sophisticated workflows with custom logic and automation",
        duration: "60 min",
        difficulty: "Advanced",
        rating: 4.6,
        students: 3200,
        tags: ["workflows", "automation", "advanced"]
      },
      {
        title: "Advanced Mutation Patterns",
        description: "Complex mutation strategies and risk management techniques",
        duration: "45 min",
        difficulty: "Advanced",
        rating: 4.5,
        students: 2100,
        tags: ["mutations", "patterns", "risk-management"]
      },
      {
        title: "Performance Optimization",
        description: "Optimize your Lattice setup for maximum performance",
        duration: "40 min",
        difficulty: "Advanced",
        rating: 4.7,
        students: 4100,
        tags: ["performance", "optimization", "scaling"]
      }
    ]
  },
  {
    id: "team-collaboration",
    title: "Team Collaboration",
    description: "Set up collaborative workflows and manage team permissions effectively.",
    icon: Users,
    color: "bg-blue-500",
    tutorials: [
      {
        title: "Setting Up Team Workflows",
        description: "Configure collaborative development with Lattice Engine",
        duration: "35 min",
        difficulty: "Intermediate",
        rating: 4.8,
        students: 5600,
        tags: ["teams", "collaboration", "workflows"]
      },
      {
        title: "Managing Permissions and Access",
        description: "Role-based access control and permission management",
        duration: "25 min",
        difficulty: "Intermediate",
        rating: 4.6,
        students: 3400,
        tags: ["permissions", "security", "rbac"]
      },
      {
        title: "Collaborative Code Reviews",
        description: "Effective code review processes with Lattice Engine",
        duration: "30 min",
        difficulty: "Intermediate",
        rating: 4.9,
        students: 7800,
        tags: ["code-review", "collaboration", "best-practices"]
      }
    ]
  },
  {
    id: "cicd-integration",
    title: "CI/CD Integration",
    description: "Integrate Lattice Engine with your existing CI/CD pipeline.",
    icon: GitBranch,
    color: "bg-orange-500",
    tutorials: [
      {
        title: "GitHub Actions Integration",
        description: "Complete CI/CD pipeline setup with GitHub Actions",
        duration: "50 min",
        difficulty: "Advanced",
        rating: 4.7,
        students: 4200,
        tags: ["github-actions", "ci-cd", "automation"]
      },
      {
        title: "Jenkins Pipeline Setup",
        description: "Configure Jenkins for automated testing and deployment",
        duration: "45 min",
        difficulty: "Advanced",
        rating: 4.5,
        students: 2100,
        tags: ["jenkins", "ci-cd", "automation"]
      },
      {
        title: "GitLab CI/CD Integration",
        description: "Set up GitLab CI/CD with Lattice Engine",
        duration: "40 min",
        difficulty: "Advanced",
        rating: 4.6,
        students: 1800,
        tags: ["gitlab", "ci-cd", "automation"]
      }
    ]
  }
]

const learningPaths = [
  {
    title: "Beginner Path",
    description: "Start your journey with Lattice Engine",
    duration: "2 hours",
    tutorials: 5,
    icon: Target,
    color: "bg-green-500"
  },
  {
    title: "Advanced Developer",
    description: "Master advanced concepts and workflows",
    duration: "4 hours",
    tutorials: 8,
    icon: Award,
    color: "bg-primary"
  },
  {
    title: "DevOps Engineer",
    description: "Learn integration and automation",
    duration: "3 hours",
    tutorials: 6,
    icon: Settings,
    color: "bg-blue-500"
  },
  {
    title: "Team Lead",
    description: "Manage teams and collaborative workflows",
    duration: "2.5 hours",
    tutorials: 7,
    icon: Users,
    color: "bg-orange-500"
  }
]

const featuredTutorials = [
  {
    title: "Building a Complete Application with Lattice Engine",
    description: "End-to-end project from setup to production deployment",
    duration: "2 hours",
    level: "Intermediate",
    icon: Rocket,
    featured: true
  },
  {
    title: "Microservices Architecture with Lattice",
    description: "Design and implement microservices using Lattice Engine",
    duration: "1.5 hours",
    level: "Advanced",
    icon: Globe,
    featured: true
  }
]

export default function TutorialsAndGuidesPage() {
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
                  Tutorials & Guides
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Step-by-step guides to master Lattice Engine. Learn advanced workflows, team collaboration, CI/CD integration, and best practices.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Learning
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Award className="h-5 w-5 mr-2" />
                  Learning Paths
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
                {/* Learning Paths */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Learning Paths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {learningPaths.map((path, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded hover:bg-muted/50 cursor-pointer">
                          <div className={`w-10 h-10 ${path.color} rounded-lg flex items-center justify-center`}>
                            <path.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm">{path.title}</h4>
                            <p className="text-xs text-muted-foreground">{path.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-muted-foreground">{path.duration}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{path.tutorials} tutorials</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Popular Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <span>Advanced Workflows</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Team Collaboration</span>
                      </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <GitBranch className="h-4 w-4 mr-2" />
                        <span>CI/CD Integration</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Best Practices</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resources */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a href="/docs/examples" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        Code Examples
                      </a>
                      <a href="/docs/best-practices" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Star className="h-4 w-4 mr-2" />
                        Best Practices
                      </a>
                      <a href="/docs/support" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Get Help
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Tutorials */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Featured Tutorials</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredTutorials.map((tutorial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                        {tutorial.featured && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="default" className="bg-primary text-primary-foreground">
                              Featured
                            </Badge>
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                              <tutorial.icon className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl text-foreground">{tutorial.title}</CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{tutorial.duration}</span>
                                </div>
                                <Badge variant="outline" className="border-primary text-primary">
                                  {tutorial.level}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <CardDescription className="text-base">{tutorial.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Start Tutorial <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Tutorial Categories */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Browse by Category</h2>
                <div className="space-y-16">
                  {tutorialCategories.map((category, categoryIndex) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                    >
                      <div className="flex items-center mb-8">
                        <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                          <category.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
                          <p className="text-muted-foreground">{category.description}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.tutorials.map((tutorial, tutorialIndex) => (
                          <motion.div
                            key={tutorialIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: tutorialIndex * 0.1 }}
                          >
                            <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                              <CardHeader>
                                <div className="flex items-center justify-between mb-4">
                                  <Badge
                                    variant={tutorial.difficulty === 'Beginner' ? 'secondary' :
                                           tutorial.difficulty === 'Intermediate' ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {tutorial.difficulty}
                                  </Badge>
                                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span>{tutorial.rating}</span>
                                  </div>
                                </div>
                                <CardTitle className="text-lg text-foreground mb-2">{tutorial.title}</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground mb-4">
                                  {tutorial.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>{tutorial.duration}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-1" />
                                      <span>{tutorial.students.toLocaleString()} students</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {tutorial.tags.map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline" className="text-xs border-primary text-primary">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                                  Start Tutorial
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}