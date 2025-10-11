"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Users, 
  Globe, 
  FileText, 
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the Privacy Policy page
// export const metadata: Metadata = {
//   title: "Privacy Policy - Lattice Engine",
//   description: "Learn about Lattice Engine's privacy policy, data collection practices, and how we protect your information.",
// }

const privacySections = [
  {
    title: "Information We Collect",
    icon: Database,
    content: [
      {
        subtitle: "Personal Information",
        description: "We collect information you provide directly to us, such as when you create an account, subscribe to our service, or contact us for support.",
        details: [
          "Name and email address",
          "Account credentials and authentication information",
          "Payment and billing information",
          "Communication preferences",
          "Support requests and correspondence"
        ]
      },
      {
        subtitle: "Usage Information",
        description: "We automatically collect certain information about your use of our services.",
        details: [
          "Device information (IP address, browser type, operating system)",
          "Usage patterns and feature interactions",
          "Performance metrics and error logs",
          "Session duration and frequency of use"
        ]
      },
      {
        subtitle: "Code and Project Data",
        description: "Information related to your development projects and code repositories.",
        details: [
          "Project specifications and requirements",
          "Code snippets and file structures (when explicitly shared)",
          "Build logs and deployment information",
          "Integration configurations and settings"
        ]
      }
    ]
  },
  {
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      {
        subtitle: "Service Provision",
        description: "We use your information to provide, maintain, and improve our services.",
        details: [
          "Process your account registration and authentication",
          "Provide access to Lattice Engine features and functionality",
          "Process payments and manage subscriptions",
          "Deliver customer support and technical assistance",
          "Send service-related communications and updates"
        ]
      },
      {
        subtitle: "Product Improvement",
        description: "We analyze usage data to enhance our platform and develop new features.",
        details: [
          "Monitor service performance and reliability",
          "Identify and fix bugs and technical issues",
          "Analyze user behavior to improve user experience",
          "Develop new features and capabilities",
          "Conduct research and analytics"
        ]
      },
      {
        subtitle: "Communication",
        description: "We may use your contact information to communicate with you about our services.",
        details: [
          "Send important service announcements",
          "Provide technical support and assistance",
          "Share product updates and new features",
          "Send marketing communications (with your consent)",
          "Respond to your inquiries and feedback"
        ]
      }
    ]
  },
  {
    title: "Information Sharing and Disclosure",
    icon: Users,
    content: [
      {
        subtitle: "Service Providers",
        description: "We may share your information with third-party service providers who assist us in operating our business.",
        details: [
          "Cloud hosting and infrastructure providers",
          "Payment processing services",
          "Customer support platforms",
          "Analytics and monitoring tools",
          "Email and communication services"
        ]
      },
      {
        subtitle: "Legal Requirements",
        description: "We may disclose your information when required by law or to protect our rights.",
        details: [
          "Comply with legal obligations and court orders",
          "Respond to lawful requests from government authorities",
          "Protect our rights, property, and safety",
          "Enforce our terms of service and policies",
          "Prevent fraud and abuse of our services"
        ]
      },
      {
        subtitle: "Business Transfers",
        description: "Your information may be transferred in connection with business transactions.",
        details: [
          "Mergers, acquisitions, or asset sales",
          "Bankruptcy or insolvency proceedings",
          "Corporate restructuring or reorganization",
          "Due diligence processes",
          "Successor entity obligations"
        ]
      }
    ]
  },
  {
    title: "Data Security",
    icon: Lock,
    content: [
      {
        subtitle: "Security Measures",
        description: "We implement appropriate technical and organizational measures to protect your information.",
        details: [
          "Encryption of data in transit and at rest",
          "Regular security assessments and audits",
          "Access controls and authentication systems",
          "Employee training on data protection",
          "Incident response and breach notification procedures"
        ]
      },
      {
        subtitle: "Data Retention",
        description: "We retain your information only as long as necessary for legitimate business purposes.",
        details: [
          "Account information retained while your account is active",
          "Usage data retained for analytics and improvement purposes",
          "Support communications retained for quality assurance",
          "Legal and regulatory compliance requirements",
          "Secure deletion procedures for expired data"
        ]
      }
    ]
  },
  {
    title: "Your Rights and Choices",
    icon: Shield,
    content: [
      {
        subtitle: "Access and Control",
        description: "You have certain rights regarding your personal information.",
        details: [
          "Access and review your personal information",
          "Update or correct inaccurate information",
          "Delete your account and associated data",
          "Export your data in a portable format",
          "Opt-out of marketing communications"
        ]
      },
      {
        subtitle: "Privacy Settings",
        description: "You can control various aspects of how your information is used.",
        details: [
          "Manage communication preferences",
          "Control data sharing with third parties",
          "Adjust analytics and tracking settings",
          "Configure security and authentication options",
          "Set data retention preferences"
        ]
      },
      {
        subtitle: "Regional Rights",
        description: "Additional rights may apply based on your location.",
        details: [
          "GDPR rights for EU residents",
          "CCPA rights for California residents",
          "Right to data portability",
          "Right to be forgotten",
          "Right to object to processing"
        ]
      }
    ]
  },
  {
    title: "International Data Transfers",
    icon: Globe,
    content: [
      {
        subtitle: "Cross-Border Processing",
        description: "Your information may be processed in countries other than your own.",
        details: [
          "Data centers located in multiple jurisdictions",
          "Appropriate safeguards for international transfers",
          "Standard contractual clauses with service providers",
          "Adequacy decisions and certification programs",
          "Your consent for specific transfers when required"
        ]
      }
    ]
  },
  {
    title: "Cookies and Tracking Technologies",
    icon: Eye,
    content: [
      {
        subtitle: "Types of Cookies",
        description: "We use various types of cookies and similar technologies.",
        details: [
          "Essential cookies for basic functionality",
          "Performance cookies for analytics",
          "Functional cookies for enhanced features",
          "Targeting cookies for personalized content",
          "Third-party cookies from integrated services"
        ]
      },
      {
        subtitle: "Cookie Management",
        description: "You can control cookie settings through your browser or our preferences.",
        details: [
          "Browser settings to block or delete cookies",
          "Opt-out mechanisms for analytics cookies",
          "Third-party opt-out tools and services",
          "Cookie preference center in our application",
          "Impact of disabling cookies on functionality"
        ]
      }
    ]
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 rounded-full">
                  <Shield className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Privacy
                <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent"> Policy</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Your privacy is important to us. This policy explains how we collect, use, and protect 
                your personal information when you use Lattice Engine.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last Updated: January 15, 2024
                </Badge>
                <Badge variant="secondary" className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  GDPR Compliant
                </Badge>
                <Badge variant="secondary" className="bg-primary text-white">
                  <Lock className="h-3 w-3 mr-1" />
                  Data Protected
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span>Privacy Policy Summary</span>
                  </CardTitle>
                  <CardDescription>
                    Here's what you need to know about how we handle your data:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">We collect minimal data</h4>
                          <p className="text-sm text-gray-600">Only what's necessary to provide our services</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Your code stays private</h4>
                          <p className="text-sm text-gray-600">We don't access your code without permission</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Strong security measures</h4>
                          <p className="text-sm text-gray-600">Encryption and secure infrastructure</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">You control your data</h4>
                          <p className="text-sm text-gray-600">Access, update, or delete anytime</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">No selling of data</h4>
                          <p className="text-sm text-gray-600">We never sell your personal information</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Transparent practices</h4>
                          <p className="text-sm text-gray-600">Clear communication about data use</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Detailed Privacy Sections */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {privacySections.map((section, sectionIndex) => (
                <motion.div
                  key={sectionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-2xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <section.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <span>{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {section.content.map((subsection, subsectionIndex) => (
                          <div key={subsectionIndex}>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                              {subsection.subtitle}
                            </h4>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {subsection.description}
                            </p>
                            <ul className="space-y-2">
                              {subsection.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start space-x-2">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 text-sm">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-2xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <span>Contact Us About Privacy</span>
                  </CardTitle>
                  <CardDescription>
                    If you have questions about this privacy policy or our data practices, we're here to help.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Privacy Officer</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Email: privacy@project-lattice.site</p>
                        <p>Response time: Within 48 hours</p>
                        <p>Available: Monday - Friday, 9 AM - 5 PM PST</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Data Protection Rights</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Request access to your data</p>
                        <p>• Correct inaccurate information</p>
                        <p>• Delete your account and data</p>
                        <p>• Export your data</p>
                        <p>• Object to data processing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Updates and Changes */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span>Policy Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      We may update this privacy policy from time to time to reflect changes in our practices, 
                      technology, legal requirements, or other factors. When we make material changes, we will:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">Notify you via email at least 30 days before changes take effect</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">Display a prominent notice in our application</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">Update the "Last Updated" date at the top of this policy</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">Provide you with the opportunity to review and accept the changes</span>
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      Your continued use of our services after the effective date of any changes constitutes 
                      acceptance of the updated privacy policy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}