import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CTASection from "@/components/cta-section";
import {
  Shield,
  Lock,
  Key,
  CheckCircle,
  AlertTriangle,
  Eye,
  Database,
  Cloud,
  Users,
  Certificate,
  FileText,
  ExternalLink,
  Zap,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Security - BugSage AI-Powered Debugging",
  description: "Learn about BugSage's security measures, compliance standards, and commitment to protecting your data and code.",
  openGraph: {
    title: "Security - BugSage AI-Powered Debugging",
    description: "Learn about BugSage's security measures, compliance standards, and commitment to protecting your data and code.",
    type: "website",
  },
};

const securityMeasures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data transmitted between your environment and BugSage is encrypted using TLS 1.3 and AES-256 encryption.",
    color: "from-blue-500 to-purple-600",
    status: "Active",
  },
  {
    icon: Database,
    title: "Local-First Architecture",
    description: "Code analysis runs on your machine or infrastructure. Only metadata and error patterns are sent to our cloud.",
    color: "from-green-500 to-teal-600",
    status: "Active",
  },
  {
    icon: Eye,
    title: "Zero Code Storage",
    description: "We never store your source code in our cloud. Only anonymized error patterns and fix suggestions are retained.",
    color: "from-orange-500 to-red-600",
    status: "Active",
  },
  {
    icon: Certificate,
    title: "SOC 2 Compliance",
    description: "Type II certification in progress. We're implementing comprehensive security controls and regular audits.",
    color: "from-purple-500 to-pink-600",
    status: "In Progress",
  },
  {
    icon: Users,
    title: "Regular Audits",
    description: "Third-party security audits and penetration testing conducted quarterly to identify and address vulnerabilities.",
    color: "from-indigo-500 to-blue-600",
    status: "Active",
  },
  {
    icon: AlertTriangle,
    title: "Vulnerability Disclosure",
    description: "Responsible disclosure program with security researchers. We address reported vulnerabilities within 30 days.",
    color: "from-red-500 to-orange-600",
    status: "Active",
  },
];

const dataPrivacy = [
  {
    title: "Data Collection",
    description: "We only collect essential metadata: error signatures, performance metrics, and usage patterns. No source code is stored.",
  },
  {
    title: "Data Usage",
    description: "Collected data is used solely for improving our AI models and service quality. Never shared with third parties.",
  },
  {
    title: "Data Retention",
    description: "Metadata is retained for 90 days by default, with customizable retention policies for enterprise customers.",
  },
  {
    title: "User Control",
    description: "Full control over your data with options to export, delete, or modify collected information at any time.",
  },
];

const enterpriseSecurity = [
  {
    title: "Self-Hosted Options",
    description: "Deploy BugSage in your own infrastructure for complete data sovereignty and control.",
    icon: Cloud,
  },
  {
    title: "SSO/SAML Integration",
    description: "Enterprise single sign-on with support for SAML 2.0, OAuth 2.0, and major identity providers.",
    icon: Key,
  },
  {
    title: "Custom Security Policies",
    description: "Configure custom security rules, access controls, and compliance requirements for your organization.",
    icon: Shield,
  },
  {
    title: "Dedicated Support",
    description: "24/7 security support with dedicated security team and guaranteed response times.",
    icon: Users,
  },
];

const certifications = [
  {
    name: "SOC 2 Type II",
    status: "In Progress",
    expectedDate: "Q1 2025",
    description: "Security, availability, processing integrity, confidentiality, and privacy controls",
  },
  {
    name: "GDPR",
    status: "Compliant",
    expectedDate: null,
    description: "General Data Protection Regulation compliance for EU customers",
  },
  {
    name: "CCPA",
    status: "Compliant",
    expectedDate: null,
    description: "California Consumer Privacy Act compliance",
  },
  {
    name: "ISO 27001",
    status: "Planned",
    expectedDate: "Q3 2025",
    description: "Information security management system certification",
  },
  {
    name: "HIPAA",
    status: "Enterprise Only",
    expectedDate: null,
    description: "Health Insurance Portability and Accountability Act for healthcare customers",
  },
];

export default function SecurityPage() {
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
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Security & Compliance
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're committed to protecting your code and data with enterprise-grade security,
              privacy-first architecture, and comprehensive compliance standards.
            </p>
          </motion.div>

          {/* Security Measures Grid */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Security Measures</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Multi-layered security protections to safeguard your development workflow
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityMeasures.map((measure, index) => (
                <motion.div
                  key={measure.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${measure.color} flex items-center justify-center`}>
                          <measure.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge
                          variant={measure.status === "Active" ? "default" : "secondary"}
                          className={measure.status === "Active" ? "bg-green-100 text-green-800" : ""}
                        >
                          {measure.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{measure.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {measure.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Data Privacy Section */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Data Privacy</h2>
                <p className="text-muted-foreground mb-8">
                  Your privacy is fundamental to our design. We've built BugSage with privacy-first
                  principles that ensure your data remains secure and under your control.
                </p>
                <div className="space-y-4">
                  {dataPrivacy.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Privacy by Design</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">No source code storage</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Anonymized data collection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Local processing优先</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">User-controlled data retention</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Transparent data usage</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Enterprise Security */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Enterprise Security</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Advanced security features for organizations with stringent requirements
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {enterpriseSecurity.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground text-sm">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <a href="/pricing">View Enterprise Plans</a>
              </Button>
            </div>
          </motion.section>

          {/* Certifications & Compliance */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="text-center mb-12">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Certifications & Compliance</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our commitment to meeting and exceeding industry standards
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{cert.name}</h3>
                        <Badge
                          variant={
                            cert.status === "Compliant"
                              ? "default"
                              : cert.status === "In Progress"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            cert.status === "Compliant"
                              ? "bg-green-100 text-green-800"
                              : cert.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                        >
                          {cert.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {cert.description}
                      </p>
                      {cert.expectedDate && (
                        <p className="text-xs text-primary">
                          Expected: {cert.expectedDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Report Vulnerability */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Report a Vulnerability</h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Found a security issue? We encourage responsible disclosure. Please report security
                    vulnerabilities to our security team for prompt attention.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" asChild>
                      <a href="mailto:security@bugsage.site">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Report Vulnerability
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/privacy">
                        <FileText className="w-4 h-4 mr-2" />
                        View Privacy Policy
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* CTA Section */}
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
}