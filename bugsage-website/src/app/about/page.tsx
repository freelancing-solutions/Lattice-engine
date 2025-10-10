import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CTASection from "@/components/cta-section";
import {
  Users,
  Target,
  Lightbulb,
  Shield,
  Heart,
  Zap,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "About - BugSage AI-Powered Debugging",
  description: "Learn about BugSage's mission to revolutionize debugging through AI-powered autonomous error resolution and spec-driven development.",
  openGraph: {
    title: "About - BugSage AI-Powered Debugging",
    description: "Learn about BugSage's mission to revolutionize debugging through AI-powered autonomous error resolution and spec-driven development.",
    type: "website",
  },
};

const values = [
  {
    icon: Users,
    title: "Developer-First",
    description: "Built by developers, for developers. We understand the pain points of debugging and create tools that genuinely solve real problems.",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    icon: Lightbulb,
    title: "Transparency",
    description: "Open about our AI capabilities and limitations. We believe in honest communication about what our technology can and cannot do.",
    gradient: "from-green-500 to-teal-600",
  },
  {
    icon: Shield,
    title: "Safety",
    description: "Human oversight with configurable automation. Every change is reviewed and approved before deployment to production.",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Pushing boundaries of autonomous development. We're constantly exploring new ways to make software development more efficient.",
    gradient: "from-purple-500 to-pink-600",
  },
];

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    bio: "Former senior engineer at Google. Passionate about autonomous systems and developer productivity.",
    initials: "SC",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    name: "Marcus Johnson",
    role: "CTO & Co-Founder",
    bio: "AI researcher and systems architect. Led ML teams at Stripe and Airbnb.",
    initials: "MJ",
    gradient: "from-green-500 to-teal-600",
  },
  {
    name: "Dr. Elena Rodriguez",
    role: "Head of Research",
    bio: "PhD in Computer Science from Stanford. Expert in program synthesis and formal methods.",
    initials: "ER",
    gradient: "from-orange-500 to-red-600",
  },
  {
    name: "Alex Kim",
    role: "Lead Engineer",
    bio: "Full-stack developer with expertise in distributed systems. Previously at Cloudflare.",
    initials: "AK",
    gradient: "from-purple-500 to-pink-600",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              About BugSage
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Building the Future of
              <br />
              Autonomous Debugging
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to eliminate manual debugging through intelligent AI-powered
              error resolution that integrates seamlessly with spec-driven development workflows.
            </p>
          </motion.div>

          {/* Our Story Section */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    BugSage was born from frustration. As developers ourselves, we spent countless
                    hours debugging production issues, manually tracing errors through complex
                    codebases, and implementing fixes that often introduced new problems.
                  </p>
                  <p>
                    We asked: What if debugging could be autonomous? What if AI could analyze
                    production errors, understand the root cause, and generate fixes that respect
                    existing specifications and patterns?
                  </p>
                  <p>
                    Today, BugSage is transforming how development teams handle errors. By integrating
                    with Project Lattice's autonomous development ecosystem, we've created a system
                    that not only fixes bugs but evolves your specifications based on real-world
                    usage patterns.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                    <div className="text-sm text-muted-foreground">Errors Prevented</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">4min</div>
                    <div className="text-sm text-muted-foreground">Avg Resolution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">50+</div>
                    <div className="text-sm text-muted-foreground">Beta Users</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Our Values Section */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at BugSage
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-4`}>
                        <value.icon className="w-6 h-6 text-white" />
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

          {/* Team Section */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The passionate individuals building the future of autonomous debugging
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold`}>
                    {member.initials}
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {member.bio}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Mission Section */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center">
              <Target className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                To eliminate manual debugging through intelligent AI-powered error resolution
                that empowers developers to focus on building innovative features rather than
                fixing production issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="/beta-signup">Join Beta Program</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/contact">Contact Us</a>
                </Button>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
}