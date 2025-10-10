import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Users,
  Home,
  TrendingUp,
  Heart,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Rocket,
  Target,
  Code
} from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Careers - Join BugSage",
  description: "Join BugSage in building the future of autonomous debugging. Explore career opportunities in AI, development tools, and spec-driven software engineering.",
  openGraph: {
    title: "Careers - Join BugSage",
    description: "Join BugSage in building the future of autonomous debugging. Explore career opportunities in AI, development tools, and spec-driven software engineering.",
    type: "website",
  },
};

const values = [
  {
    icon: Zap,
    title: "Cutting-Edge Technology",
    description: "Work with AI, autonomous systems, and the future of software development",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    icon: Target,
    title: "Impact",
    description: "Help millions of developers debug faster and build better software",
    gradient: "from-green-500 to-teal-600",
  },
  {
    icon: Home,
    title: "Remote-First",
    description: "Work from anywhere with flexible hours and work-life balance",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    description: "Learn and grow with a team passionate about autonomous development",
    gradient: "from-purple-500 to-pink-600",
  },
];

const openPositions = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build the core BugSage platform, working with React, Node.js, and AI APIs to create seamless debugging experiences.",
    requirements: ["5+ years experience", "React/Node.js expertise", "AI/ML interest"],
  },
  {
    title: "AI/ML Engineer",
    department: "Research",
    location: "Remote",
    type: "Full-time",
    description: "Develop and improve our AI models for code analysis, error detection, and automated fix generation.",
    requirements: ["ML/DL background", "Python expertise", "Code analysis experience"],
  },
  {
    title: "Developer Advocate",
    department: "Community",
    location: "Remote",
    type: "Full-time",
    description: "Create content, build community, and help developers succeed with BugSage and Project Lattice.",
    requirements: ["Developer background", "Strong communication", "Community experience"],
  },
];

const culturePoints = [
  "Developer-first mindset - we build tools we want to use ourselves",
  "Transparent communication and open collaboration",
  "Work-life balance with flexible schedules and unlimited PTO",
  "Continuous learning with conference budget and learning resources",
  "Inclusive environment where diverse perspectives are valued",
  "Autonomous work with trust and ownership",
  "Regular team meetups and virtual social events",
  "Competitive compensation and equity packages",
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Join Us in Building the
              <br />
              Future of Debugging
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Help us eliminate manual debugging through intelligent AI-powered solutions.
              Work with a passionate team building tools that developers actually love to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#open-positions">View Open Positions</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:careers@bugsage.site">
                  <Mail className="w-5 h-5 mr-2" />
                  Speculative Application
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Why BugSage Section */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why BugSage?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join a team that's redefining how developers approach debugging
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 text-center">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mx-auto mb-4`}>
                        <value.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Open Positions */}
          <motion.section
            id="open-positions"
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
              <p className="text-muted-foreground mb-6">
                We're growing! Check back soon for more opportunities.
              </p>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Actively Hiring
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openPositions.map((position, index) => (
                <motion.div
                  key={position.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {position.department}
                        </Badge>
                        <Badge variant="outline">
                          {position.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">{position.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{position.location}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        {position.description}
                      </p>
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                        <ul className="space-y-1">
                          {position.requirements.map((req, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center space-x-1">
                              <div className="w-1 h-1 bg-primary rounded-full"></div>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button className="w-full" asChild>
                        <a href={`mailto:careers@bugsage.site?subject=Application: ${position.title}`}>
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Our Culture */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Culture</h2>
                <p className="text-muted-foreground mb-8">
                  We believe great products are built by happy, empowered teams. Our culture is
                  built on trust, autonomy, and a shared passion for solving difficult problems.
                </p>
                <div className="space-y-3">
                  {culturePoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <GraduationCap className="w-6 h-6 mr-2 text-primary" />
                    Learning & Growth
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm">Conference budget ($2,000/year)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm">Learning platform access</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm">Technical book stipend</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm">Mentorship programs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm">Internal tech talks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Don't See a Fit Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-12 text-center">
                <Mail className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Don't See a Fit?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  We're always looking for talented people who share our passion for autonomous
                  development and developer tools. Send us a speculative application and tell us
                  how you can help shape the future of debugging.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="mailto:careers@bugsage.site">
                      <Mail className="w-5 h-5 mr-2" />
                      Send Speculative Application
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/about">
                      <Users className="w-5 h-5 mr-2" />
                      Learn About Our Team
                    </a>
                  </Button>
                </div>
                <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>We typically respond within 5 business days</span>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}