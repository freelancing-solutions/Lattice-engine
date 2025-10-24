"use client"

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

export default function TutorialsAndGuidesContent() {
  return (
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

      {/* Featured Tutorials */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Tutorials
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start with these comprehensive guides to get the most out of Lattice Engine.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {featuredTutorials.map((tutorial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="h-full border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <tutorial.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Featured
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-foreground">{tutorial.title}</CardTitle>
                    <CardDescription className="text-base">{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {tutorial.duration}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tutorial.level}
                        </Badge>
                      </div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Start Tutorial
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learning Paths
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Structured learning journeys tailored to your role and experience level.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {learningPaths.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${path.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <path.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg text-foreground">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {path.duration}
                      </div>
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {path.tutorials} tutorials
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Start Path
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorial Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Browse by Category
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find tutorials organized by topic and difficulty level to match your learning goals.
            </p>
          </motion.div>

          <Tabs defaultValue="getting-started" className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12">
              {tutorialCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <category.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tutorialCategories.map((category, categoryIndex) => (
              <TabsContent key={category.id} value={category.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <category.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{category.title}</h3>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.tutorials.map((tutorial, tutorialIndex) => (
                      <motion.div
                        key={tutorialIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: tutorialIndex * 0.1 }}
                      >
                        <Card className="h-full border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {tutorial.difficulty}
                              </Badge>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                {tutorial.rating}
                              </div>
                            </div>
                            <CardTitle className="text-lg text-foreground">{tutorial.title}</CardTitle>
                            <CardDescription>{tutorial.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {tutorial.duration}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {tutorial.students.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {tutorial.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                              Start Tutorial
                              <PlayCircle className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 border-t border-primary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers who are already building amazing applications with Lattice Engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4">
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Your First Tutorial
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4">
                <Download className="h-5 w-5 mr-2" />
                Download Resources
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}