import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  GitBranch,
  Users,
  Briefcase,
  BookOpen,
  Megaphone,
  ExternalLink,
  Mail,
  CheckCircle,
  Target,
  Award,
  Zap,
  Shield,
  Globe,
  Building
} from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Partners - BugSage",
  description: "Partner with BugSage to build the autonomous debugging ecosystem. Explore technology, reseller, integration, and consulting partnership opportunities.",
  openGraph: {
    title: "Partners - BugSage",
    description: "Partner with BugSage to build the autonomous debugging ecosystem. Explore technology, reseller, integration, and consulting partnership opportunities.",
    type: "website",
  },
};

const partnershipOpportunities = [
  {
    icon: GitBranch,
    title: "Technology Partners",
    description: "Integrate BugSage with your platform, IDE, or development tools to provide seamless debugging experiences.",
    benefits: ["API access", "Technical support", "Co-marketing", "Joint development"],
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Briefcase,
    title: "Reseller Partners",
    description: "Offer BugSage to your customers and earn revenue while helping them improve their debugging workflow.",
    benefits: ["Revenue sharing", "Sales training", "Marketing materials", "Dedicated support"],
    color: "from-green-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "Integration Partners",
    description: "Build and maintain integrations between BugSage and popular development tools and platforms.",
    benefits: ["Early access", "Technical resources", "Partner directory listing", "Revenue opportunities"],
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Users,
    title: "Consulting Partners",
    description: "Help customers implement BugSage and optimize their development workflows for maximum efficiency.",
    benefits: ["Certification program", "Lead generation", "Training resources", "Partner portal"],
    color: "from-purple-500 to-pink-600",
  },
];

const currentPartners = [
  {
    name: "Project Lattice",
    type: "Strategic Integration",
    description: "Deep integration with Lattice's autonomous development ecosystem for seamless error-driven development.",
    logo: "🔗",
    website: "#",
  },
  {
    name: "Sentry",
    type: "Error Monitoring",
    description: "Native integration with Sentry for comprehensive error tracking and analysis.",
    logo: "🔍",
    website: "#",
  },
  {
    name: "VSCode",
    type: "Development Environment",
    description: "VSCode extension bringing BugSage's AI-powered debugging directly to your editor.",
    logo: "💻",
    website: "#",
  },
  {
    name: "GitHub",
    type: "Code Platform",
    description: "GitHub Actions integration for automated debugging in CI/CD pipelines.",
    logo: "🐙",
    website: "#",
  },
];

const partnerBenefits = [
  "Co-marketing opportunities and joint promotional campaigns",
  "Technical support and dedicated engineering resources",
  "Revenue sharing programs for resellers and referrers",
  "Early access to new features and beta programs",
  "Joint customer success and support collaboration",
  "Partner portal with resources and training materials",
  "Listing in our partner directory and marketplace",
  "Exclusive events and networking opportunities",
];

export default function PartnersPage() {
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
            <Handshake className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Partner with BugSage
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join us in building the autonomous debugging ecosystem. Together, we can help
              developers worldwide debug faster and build better software.
            </p>
          </motion.div>

          {/* Partnership Opportunities */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Partnership Opportunities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find the partnership model that best fits your business
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {partnershipOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${opportunity.color} flex items-center justify-center mb-4`}>
                        <opportunity.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">
                        {opportunity.description}
                      </p>
                      <div className="mb-6">
                        <h4 className="font-medium text-sm mb-3">Benefits:</h4>
                        <ul className="space-y-2">
                          {opportunity.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button className="w-full" variant="outline">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Current Partners */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Current Partners</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Companies already building amazing things with BugSage
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {currentPartners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                          {partner.logo}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{partner.name}</h3>
                            <Badge variant="secondary">{partner.type}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">
                            {partner.description}
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={partner.website} target="_blank">
                              Visit Website
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Partner Benefits */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Partner Benefits</h2>
                <p className="text-muted-foreground mb-8">
                  We believe in building strong, mutually beneficial partnerships that create
                  value for everyone involved.
                </p>
                <div className="space-y-3">
                  {partnerBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                      className="flex items-start space-x-3"
                    >
                      <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Building className="w-6 h-6 mr-2 text-primary" />
                    Why Partner with BugSage?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Growing Market</h4>
                        <p className="text-xs text-muted-foreground">
                          Join the rapidly expanding autonomous debugging market
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Established Technology</h4>
                        <p className="text-xs text-muted-foreground">
                          Partner with a proven platform already loved by developers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Global Reach</h4>
                        <p className="text-xs text-muted-foreground">
                          Access customers worldwide through our partner network
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Become a Partner CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-12">
                <div className="text-center">
                  <Handshake className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Ready to join our partner ecosystem? Let's discuss how we can work together
                    to bring autonomous debugging to more developers worldwide.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <a href="mailto:partners@bugsage.site?subject=Partnership Inquiry">
                        <Mail className="w-5 h-5 mr-2" />
                        Apply to Partner Program
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <a href="/contact">
                        <Users className="w-5 h-5 mr-2" />
                        Schedule a Call
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Partner Resources */}
          <motion.section
            className="mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="text-center mb-12">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Partner Resources</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tools and resources to help you succeed as a BugSage partner
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Megaphone className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Partner Portal</h3>
                  <p className="text-muted-foreground text-sm mb-4">Coming Soon</p>
                  <Button variant="outline" size="sm" disabled>
                    Access Portal
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Documentation</h3>
                  <p className="text-muted-foreground text-sm mb-4">API docs and guides</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/docs">View Docs</a>
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Target className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Marketing Kit</h3>
                  <p className="text-muted-foreground text-sm mb-4">Logos, templates, and more</p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Support</h3>
                  <p className="text-muted-foreground text-sm mb-4">Dedicated partner help</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:partners@bugsage.site">
                      Get Support
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}