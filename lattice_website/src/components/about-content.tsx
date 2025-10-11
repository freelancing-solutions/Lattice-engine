"use client"

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

export default function AboutContent() {
  return (
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
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                <Rocket className="mr-2 h-5 w-5" />
                Join Our Mission
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Globe className="mr-2 h-5 w-5" />
                Explore Platform
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              To democratize software development by creating intelligent, autonomous coding agents that amplify human creativity and eliminate repetitive tasks.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                A world where every developer has access to AI-powered tools that enhance their capabilities and accelerate innovation.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Impact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reducing development time by 70% while improving code quality and enabling developers to focus on creative problem-solving.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Reach</h3>
              <p className="text-muted-foreground leading-relaxed">
                Empowering developers worldwide, from individual creators to enterprise teams, with cutting-edge AI development tools.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The principles that guide everything we do and shape our approach to building the future of development.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => {
              const IconComponent = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="text-center">
                      <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center leading-relaxed">
                        {value.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Technology Stack
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built with cutting-edge technologies to deliver exceptional performance, scalability, and developer experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techStack.map((category, index) => {
              const IconComponent = category.icon
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="text-center">
                      <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {category.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A diverse group of engineers, designers, and AI researchers united by our passion for transforming software development.
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-primary/10 rounded-2xl p-12 max-w-2xl mx-auto">
              <Users className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                We're Growing!
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our team is expanding rapidly as we build the future of AI-powered development. 
                We're always looking for talented individuals who share our vision.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Heart className="mr-2 h-5 w-5" />
                Join Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Development?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of developers who are already using Lattice Engine to build better software faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Today
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Code className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}