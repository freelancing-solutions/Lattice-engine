import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Mail, Shield, Lock, Key, Eye } from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Privacy Policy - BugSage",
  description: "BugSage's privacy policy explaining how we collect, use, and protect your data in our AI-powered debugging platform.",
  openGraph: {
    title: "Privacy Policy - BugSage",
    description: "BugSage's privacy policy explaining how we collect, use, and protect your data in our AI-powered debugging platform.",
    type: "website",
  },
};

export default function PrivacyPage() {
  const sections = [
    { id: "information-we-collect", title: "Information We Collect" },
    { id: "how-we-use-information", title: "How We Use Your Information" },
    { id: "data-storage-security", title: "Data Storage and Security" },
    { id: "third-party-services", title: "Third-Party Services" },
    { id: "your-rights", title: "Your Rights" },
    { id: "contact-us", title: "Contact Us" },
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
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 border-yellow-200">
              Legal Document
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-6">
              <Calendar className="w-4 h-4" />
              <span>Last updated: October 15, 2024</span>
            </div>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-2">This is a placeholder document</p>
                    <p className="text-yellow-700 text-sm">
                      This is a placeholder privacy policy. Actual legal content will be added before launch.
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

          {/* Privacy Content Sections */}
          <div className="space-y-12">
            {/* Information We Collect */}
            <motion.section
              id="information-we-collect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">1. Information We Collect</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    [Placeholder content for information collection section. This will detail what types of data we collect, including:]
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Account information (name, email, company)</li>
                    <li>Usage data and analytics</li>
                    <li>Error logs and debugging information</li>
                    <li>API keys and authentication tokens</li>
                    <li>Communication and support interactions</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* How We Use Information */}
            <motion.section
              id="how-we-use-information"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6">2. How We Use Your Information</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    [Placeholder content for information usage section. This will explain how we use collected data, including:]
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Providing and improving our services</li>
                    <li>AI model training and improvement</li>
                    <li>Customer support and communication</li>
                    <li>Security and fraud prevention</li>
                    <li>Legal compliance and requirements</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Data Storage and Security */}
            <motion.section
              id="data-storage-security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">3. Data Storage and Security</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      [Placeholder content for data storage and security section. This will detail our security practices, including:]
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Encryption in transit and at rest</li>
                    <li>Access controls and authentication</li>
                    <li>Regular security audits</li>
                    <li>Data retention policies</li>
                    <li>Secure development practices</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Third-Party Services */}
            <motion.section
              id="third-party-services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">4. Third-Party Services</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    [Placeholder content for third-party services section. This will list services we integrate with, including:]
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Error monitoring services (Sentry)</li>
                    <li>Analytics and monitoring tools</li>
                    <li>Payment processors</li>
                    <li>Cloud infrastructure providers</li>
                    <li>Communication platforms</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Your Rights */}
            <motion.section
              id="your-rights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold mb-6">5. Your Rights</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Key className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      [Placeholder content for user rights section. This will explain your data rights, including:]
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Right to access your data</li>
                    <li>Right to correct inaccurate information</li>
                    <li>Right to request deletion</li>
                    <li>Right to data portability</li>
                    <li>Right to opt-out of certain data processing</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            {/* Contact Us */}
            <motion.section
              id="contact-us"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold mb-6">6. Contact Us</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground mb-6">
                    If you have questions about this Privacy Policy or how we handle your data, please contact us:
                  </p>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Email:</p>
                      <p className="text-primary">privacy@bugsage.site</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
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
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Have Privacy Questions?</h3>
                <p className="text-muted-foreground mb-6">
                  Our privacy team is here to answer any questions about how we handle your data.
                </p>
                <Button asChild>
                  <a href="/contact">Contact Privacy Team</a>
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