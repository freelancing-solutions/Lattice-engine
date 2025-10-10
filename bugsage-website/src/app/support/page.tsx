import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  FileText,
  Code,
  MessageCircle,
  Mail,
  Calendar,
  Search,
  ExternalLink,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Zap,
  Shield,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Support - BugSage AI-Powered Debugging",
  description: "Get help with BugSage through documentation, community support, and direct assistance for autonomous debugging.",
  openGraph: {
    title: "Support - BugSage AI-Powered Debugging",
    description: "Get help with BugSage through documentation, community support, and direct assistance for autonomous debugging.",
    type: "website",
  },
};

const quickLinks = [
  {
    title: "Documentation",
    description: "Comprehensive guides and API references",
    icon: BookOpen,
    href: "/docs",
    color: "from-blue-500 to-purple-600",
  },
  {
    title: "Getting Started",
    description: "Quick start guide for new users",
    icon: Zap,
    href: "/docs/quickstart",
    color: "from-green-500 to-teal-600",
  },
  {
    title: "API Reference",
    description: "Detailed API documentation",
    icon: Code,
    href: "/docs/api",
    color: "from-orange-500 to-red-600",
  },
  {
    title: "Troubleshooting",
    description: "Common issues and solutions",
    icon: AlertCircle,
    href: "/docs/troubleshooting",
    color: "from-purple-500 to-pink-600",
  },
];

const supportChannels = [
  {
    title: "Community Forum",
    description: "Connect with other BugSage users and share solutions",
    icon: MessageCircle,
    action: "Join Community",
    href: "#",
    badge: "Community",
    isExternal: true,
  },
  {
    title: "Email Support",
    description: "Direct help from our support team",
    icon: Mail,
    action: "Email Us",
    href: "mailto:support@bugsage.site",
    badge: "24-48h response",
  },
  {
    title: "Priority Support",
    description: "Dedicated support for Pro and Enterprise customers",
    icon: Shield,
    action: "Upgrade Plan",
    href: "/pricing",
    badge: "Pro/Enterprise",
  },
  {
    title: "Schedule Demo",
    description: "Personalized walkthrough for your team",
    icon: Calendar,
    action: "Book a Call",
    href: "/contact",
    badge: "Free",
  },
];

const commonIssues = [
  {
    title: "Installation Problems",
    symptoms: "BugSage not installing correctly or CLI commands not found",
    solution: "Ensure you have Node.js 18+ installed, check your PATH configuration, and try running with elevated permissions if needed.",
    link: "/docs/installation",
  },
  {
    title: "Integration Setup",
    symptoms: "BugSage not connecting to Sentry or Project Lattice",
    solution: "Verify your API keys are correctly configured, check network connectivity, and ensure proper permissions in your dashboard.",
    link: "/docs/integration",
  },
  {
    title: "Authentication Errors",
    symptoms: "Unable to authenticate or access token issues",
    solution: "Regenerate your API keys, clear local cache, and ensure your subscription is active. Check token expiration dates.",
    link: "/docs/authentication",
  },
  {
    title: "Performance Optimization",
    symptoms: "Slow analysis or timeout issues",
    solution: "Increase resource allocation, exclude unnecessary files from analysis, and consider using our hosted solution for better performance.",
    link: "/docs/performance",
  },
  {
    title: "Fix Generation Failures",
    symptoms: "BugSage not generating fixes or producing errors",
    solution: "Check that your project has sufficient test coverage, verify your specs are up to date, and review error logs for specific issues.",
    link: "/docs/fix-generation",
  },
];

export default function SupportPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              How Can We Help?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Find answers to common questions, access documentation, and get personalized support for your BugSage journey.
            </p>

            {/* Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search documentation and help articles..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background text-lg"
                  disabled
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Search coming soon. Use the links below for now.
              </p>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Quick Links</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        {link.description}
                      </p>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={link.href}>
                          {link.title}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Support Channels */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Support Channels</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {supportChannels.map((channel, index) => (
                <motion.div
                  key={channel.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <channel.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{channel.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {channel.badge}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">
                            {channel.description}
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={channel.href} target={channel.isExternal ? "_blank" : undefined}>
                              {channel.action}
                              {channel.isExternal && <ExternalLink className="w-3 h-3 ml-2" />}
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

          {/* Common Issues */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-center mb-12">
              <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Common Issues</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find solutions to the most frequently encountered problems
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {commonIssues.map((issue, index) => (
                  <motion.div
                    key={issue.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    <AccordionItem value={issue.title} className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-semibold">{issue.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Symptoms:</h4>
                          <p className="text-sm">{issue.symptoms}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Solution:</h4>
                          <p className="text-sm mb-3">{issue.solution}</p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={issue.link}>
                              <FileText className="w-4 h-4 mr-2" />
                              View Detailed Guide
                            </a>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </motion.section>

          {/* Status Section */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-900">All Systems Operational</h3>
                </div>
                <p className="text-green-700 mb-6 max-w-2xl mx-auto">
                  All BugSage services are running normally. Check our status page for real-time updates and incident history.
                </p>
                <Button variant="outline" className="bg-white/50" asChild>
                  <a href="#" target="_blank">
                    View Status Page
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.section>

          {/* Still Need Help CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you get the most out of BugSage.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="/contact">Contact Support</a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/beta-signup">Join Beta Program</a>
                  </Button>
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