import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Mail, Shield, Gavel, AlertTriangle, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Terms of Service - BugSage",
  description: "BugSage's terms of service outlining the rules and guidelines for using our AI-powered debugging platform.",
  openGraph: {
    title: "Terms of Service - BugSage",
    description: "BugSage's terms of service outlining the rules and guidelines for using our AI-powered debugging platform.",
    type: "website",
  },
};

export default function TermsPage() {
  const sections = [
    { id: "acceptance-of-terms", title: "Acceptance of Terms" },
    { id: "description-of-service", title: "Description of Service" },
    { id: "user-responsibilities", title: "User Responsibilities" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "limitation-of-liability", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "governing-law", title: "Governing Law" },
    { id: "contact-information", title: "Contact Information" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              Legal Document
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-6">
              <Calendar className="w-4 h-4" />
              <span>Last updated: October 15, 2024</span>
            </div>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Gavel className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium mb-2">This is a placeholder document</p>
                    <p className="text-blue-700 text-sm">
                      This is a placeholder terms of service. Actual legal content will be added before launch.
                      This document is for development and review purposes only.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Table of Contents
                </h2>
                <ul className="space-y-2">
                  {sections.map((section, index) => (
                    <motion.li
                      key={section.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                      <a
                        href={`#${section.id}`}
                        className="text-primary hover:underline transition-colors"
                      >
                        {index + 1}. {section.title}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Terms Content Sections */}
          <div className="space-y-12">
            {/* Acceptance of Terms */}
            <motion.section
              id="acceptance-of-terms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    [Placeholder content for acceptance of terms section. This will explain that by using BugSage, you agree to these terms.]
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Agreement to be bound by these terms</li>
                    <li>Age requirements for using the service</li>
                    <li>Right to modify terms at any time</li>
                    <li>Notification of changes</li>
                    <li>Continued use constitutes acceptance</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Description of Service */}
            <motion.section
              id="description-of-service"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6">2. Description of Service</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    [Placeholder content for service description section. This will detail what BugSage provides, including:]
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>AI-powered error analysis and debugging</li>
                    <li>Automated fix generation</li>
                    <li>Integration with development workflows</li>
                    <li>Project Lattice ecosystem integration</li>
                    <li>Cloud and self-hosted options</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* User Responsibilities */}
            <motion.section
              id="user-responsibilities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">3. User Responsibilities</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      [Placeholder content for user responsibilities section. This will outline user obligations, including:]
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Account security and password protection</li>
                    <li>Accurate information provision</li>
                    <li>Compliance with applicable laws</li>
                    <li>Responsible use of AI-generated fixes</li>
                    <li>Respect for intellectual property rights</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Intellectual Property */}
            <motion.section
              id="intellectual-property"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">4. Intellectual Property</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    [Placeholder content for intellectual property section. This will cover IP rights, including:]
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>BugSage ownership of platform and technology</li>
                    <li>User ownership of their code and projects</li>
                    <li>Licenses granted for using the service</li>
                    <li>AI-generated content ownership</li>
                    <li>Trademark and copyright notices</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Limitation of Liability */}
            <motion.section
              id="limitation-of-liability"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold mb-6">5. Limitation of Liability</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      [Placeholder content for limitation of liability section. This will explain liability limitations, including:]
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Service provided "as is" without warranties</li>
                    <li>Limitation of consequential damages</li>
                    <li>Maximum liability limits</li>
                    <li>No liability for third-party services</li>
                    <li>User responsibility for code review and testing</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Termination */}
            <motion.section
              id="termination"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold mb-6">6. Termination</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    [Placeholder content for termination section. This will cover termination conditions, including:]
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Voluntary termination by user</li>
                    <li>Termination for violation of terms</li>
                    <li>Effect of termination on access and data</li>
                    <li>Survival of certain obligations</li>
                    <li>Refund policy and proration</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Governing Law */}
            <motion.section
              id="governing-law"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <h2 className="text-2xl font-bold mb-6">7. Governing Law</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      [Placeholder content for governing law section. This will specify:]
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Governing jurisdiction and laws</li>
                    <li>Dispute resolution procedures</li>
                    <li>Arbitration agreement</li>
                    <li>Class action waiver</li>
                    <li>Severability clause</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              id="contact-information"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <h2 className="text-2xl font-bold mb-6">8. Contact Information</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground mb-6">
                    If you have questions about these Terms of Service, please contact us:
                  </p>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Legal Inquiries:</p>
                      <p className="text-primary">legal@bugsage.site</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">General Inquiries:</p>
                      <p className="text-primary">hello@bugsage.site</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* Contact CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Questions About Our Terms?</h3>
                <p className="text-muted-foreground mb-6">
                  Our legal team is here to clarify any questions about our terms of service.
                </p>
                <Button asChild>
                  <a href="/contact">Contact Legal Team</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}