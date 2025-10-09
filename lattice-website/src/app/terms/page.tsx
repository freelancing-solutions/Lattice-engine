"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  Shield, 
  Users, 
  CreditCard, 
  Ban, 
  Mail,
  Calendar,
  CheckCircle,
  Info,
  Gavel,
  Globe,
  Lock,
  RefreshCw
} from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the Terms of Service page
// export const metadata: Metadata = {
//   title: "Terms of Service - Lattice Engine",
//   description: "Read the terms of service for using Lattice Engine, including user responsibilities and service limitations.",
// }

const termsSections = [
  {
    title: "Acceptance of Terms",
    icon: CheckCircle,
    content: [
      {
        subtitle: "Agreement to Terms",
        description: "By accessing or using Lattice Engine, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
        details: [
          "These terms constitute a legally binding agreement between you and Lattice Engine",
          "If you do not agree to these terms, you may not use our services",
          "Your use of the service constitutes acceptance of these terms",
          "You must be at least 18 years old or have parental consent to use our services",
          "You represent that you have the authority to enter into this agreement"
        ]
      }
    ]
  },
  {
    title: "Description of Service",
    icon: FileText,
    content: [
      {
        subtitle: "Platform Overview",
        description: "Lattice Engine is an agentic coding platform that provides AI-powered development tools and services.",
        details: [
          "Automated code generation and mutation capabilities",
          "Specification-based development workflows",
          "Integration with popular development environments",
          "Collaborative development features",
          "Analytics and performance monitoring tools"
        ]
      },
      {
        subtitle: "Service Availability",
        description: "We strive to maintain high service availability but cannot guarantee uninterrupted access.",
        details: [
          "Services are provided on an 'as is' and 'as available' basis",
          "We may modify, suspend, or discontinue services at any time",
          "Scheduled maintenance may temporarily interrupt service",
          "We will provide reasonable notice for planned service interruptions",
          "Emergency maintenance may occur without prior notice"
        ]
      }
    ]
  },
  {
    title: "User Accounts and Registration",
    icon: Users,
    content: [
      {
        subtitle: "Account Creation",
        description: "To use certain features of our service, you must create an account and provide accurate information.",
        details: [
          "You must provide accurate and complete registration information",
          "You are responsible for maintaining the confidentiality of your account credentials",
          "You must notify us immediately of any unauthorized use of your account",
          "You may not create multiple accounts or share accounts with others",
          "We reserve the right to refuse service or terminate accounts at our discretion"
        ]
      },
      {
        subtitle: "Account Security",
        description: "You are responsible for maintaining the security of your account and all activities that occur under it.",
        details: [
          "Use strong, unique passwords for your account",
          "Enable two-factor authentication when available",
          "Do not share your login credentials with others",
          "Report any security incidents or suspicious activity immediately",
          "We are not liable for losses resulting from unauthorized account access"
        ]
      }
    ]
  },
  {
    title: "Acceptable Use Policy",
    icon: Shield,
    content: [
      {
        subtitle: "Permitted Uses",
        description: "You may use our service for lawful purposes in accordance with these terms.",
        details: [
          "Develop software applications and projects",
          "Collaborate with team members on development tasks",
          "Access documentation and support resources",
          "Integrate with approved third-party services",
          "Use our APIs within documented rate limits"
        ]
      },
      {
        subtitle: "Prohibited Activities",
        description: "The following activities are strictly prohibited when using our service.",
        details: [
          "Violating any applicable laws or regulations",
          "Infringing on intellectual property rights of others",
          "Uploading malicious code, viruses, or harmful content",
          "Attempting to gain unauthorized access to our systems",
          "Using the service to spam, harass, or abuse others",
          "Reverse engineering or attempting to extract our source code",
          "Reselling or redistributing our services without permission"
        ]
      }
    ]
  },
  {
    title: "Intellectual Property Rights",
    icon: Lock,
    content: [
      {
        subtitle: "Our Intellectual Property",
        description: "Lattice Engine and its original content, features, and functionality are owned by us and protected by intellectual property laws.",
        details: [
          "Our service, software, and documentation are proprietary",
          "Trademarks, logos, and brand names are our property",
          "You may not copy, modify, or distribute our proprietary content",
          "Any feedback or suggestions you provide may be used by us without compensation",
          "We retain all rights not expressly granted to you"
        ]
      },
      {
        subtitle: "Your Content",
        description: "You retain ownership of the code and content you create using our service.",
        details: [
          "You own the code and projects you create",
          "You grant us a limited license to process your content to provide our services",
          "You are responsible for ensuring you have rights to any third-party content you use",
          "You must not upload content that infringes on others' intellectual property",
          "We may remove content that violates these terms or applicable laws"
        ]
      }
    ]
  },
  {
    title: "Payment Terms and Billing",
    icon: CreditCard,
    content: [
      {
        subtitle: "Subscription Plans",
        description: "Our service is offered through various subscription plans with different features and pricing.",
        details: [
          "Subscription fees are billed in advance on a recurring basis",
          "All fees are non-refundable except as required by law",
          "We may change our pricing with 30 days' notice",
          "Taxes may apply to your subscription based on your location",
          "Failed payments may result in service suspension or termination"
        ]
      },
      {
        subtitle: "Free Trial and Cancellation",
        description: "We may offer free trials for new users, and you may cancel your subscription at any time.",
        details: [
          "Free trials automatically convert to paid subscriptions unless cancelled",
          "You may cancel your subscription at any time through your account settings",
          "Cancellation takes effect at the end of your current billing period",
          "No refunds are provided for partial billing periods",
          "We may terminate free trials at any time without notice"
        ]
      }
    ]
  },
  {
    title: "Privacy and Data Protection",
    icon: Shield,
    content: [
      {
        subtitle: "Data Collection and Use",
        description: "Our collection and use of your personal information is governed by our Privacy Policy.",
        details: [
          "We collect information necessary to provide our services",
          "Your code and projects remain private and confidential",
          "We implement appropriate security measures to protect your data",
          "We do not sell your personal information to third parties",
          "You may request access, correction, or deletion of your data"
        ]
      }
    ]
  },
  {
    title: "Service Modifications and Termination",
    icon: RefreshCw,
    content: [
      {
        subtitle: "Service Changes",
        description: "We reserve the right to modify or discontinue our service at any time.",
        details: [
          "We may add, modify, or remove features from our service",
          "We will provide reasonable notice for material changes",
          "Continued use of the service constitutes acceptance of changes",
          "We may temporarily suspend service for maintenance or updates",
          "We are not liable for any modifications or discontinuation of service"
        ]
      },
      {
        subtitle: "Account Termination",
        description: "Either party may terminate this agreement under certain circumstances.",
        details: [
          "You may terminate your account at any time",
          "We may terminate accounts for violation of these terms",
          "We may suspend or terminate accounts for non-payment",
          "Upon termination, your access to the service will cease",
          "We may retain certain information as required by law or for legitimate business purposes"
        ]
      }
    ]
  },
  {
    title: "Disclaimers and Limitation of Liability",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "Service Disclaimers",
        description: "Our service is provided 'as is' without warranties of any kind.",
        details: [
          "We disclaim all warranties, express or implied",
          "We do not guarantee that our service will be error-free or uninterrupted",
          "We are not responsible for the accuracy or reliability of generated code",
          "You use our service at your own risk",
          "We recommend testing all generated code before production use"
        ]
      },
      {
        subtitle: "Limitation of Liability",
        description: "Our liability to you is limited to the maximum extent permitted by law.",
        details: [
          "We are not liable for indirect, incidental, or consequential damages",
          "Our total liability is limited to the amount you paid for our service",
          "We are not liable for damages caused by third-party services or integrations",
          "You agree to indemnify us against claims arising from your use of our service",
          "Some jurisdictions may not allow certain limitations of liability"
        ]
      }
    ]
  },
  {
    title: "Dispute Resolution and Governing Law",
    icon: Gavel,
    content: [
      {
        subtitle: "Governing Law",
        description: "These terms are governed by the laws of the jurisdiction where our company is incorporated.",
        details: [
          "These terms are governed by [Jurisdiction] law",
          "Any disputes will be resolved in the courts of [Jurisdiction]",
          "You consent to the jurisdiction of these courts",
          "If any provision is found invalid, the remainder remains in effect",
          "These terms constitute the entire agreement between us"
        ]
      },
      {
        subtitle: "Dispute Resolution",
        description: "We encourage resolving disputes through direct communication before pursuing legal action.",
        details: [
          "Contact us first to attempt to resolve any disputes",
          "We will work in good faith to address your concerns",
          "Certain disputes may be subject to binding arbitration",
          "You may have rights to pursue claims in small claims court",
          "Class action lawsuits are waived to the extent permitted by law"
        ]
      }
    ]
  }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 rounded-full">
                  <Scale className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Terms of
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Service</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                These terms govern your use of Lattice Engine. Please read them carefully to understand 
                your rights and responsibilities when using our agentic coding platform.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  <Calendar className="h-3 w-3 mr-1" />
                  Effective: January 15, 2024
                </Badge>
                <Badge variant="secondary" className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Legally Binding
                </Badge>
                <Badge variant="secondary" className="bg-purple-600 text-white">
                  <Gavel className="h-3 w-3 mr-1" />
                  User Agreement
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>Important Legal Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Please read these Terms of Service carefully.</strong> By using Lattice Engine, 
                      you agree to be legally bound by these terms. If you do not agree to these terms, 
                      you may not use our service.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Legally binding agreement</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Governs service usage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Protects both parties</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Terms Sections */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {termsSections.map((section, sectionIndex) => (
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
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <section.icon className="h-6 w-6 text-slate-600" />
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
                                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
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

        {/* Contact and Support */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span>Questions About These Terms?</span>
                    </CardTitle>
                    <CardDescription>
                      If you have questions about these terms or need clarification, we're here to help.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Legal Team</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Email: legal@project-lattice.site</p>
                          <p>Response time: Within 5 business days</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">General Support</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Email: support@project-lattice.site</p>
                          <p>Response time: Within 24 hours</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Info className="h-5 w-5 text-green-600" />
                      <span>Related Documents</span>
                    </CardTitle>
                    <CardDescription>
                      Additional policies and agreements that may apply to your use of our service.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="/privacy">
                          <Shield className="h-4 w-4 mr-2" />
                          Privacy Policy
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="/support">
                          <Mail className="h-4 w-4 mr-2" />
                          Support Center
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="/about">
                          <Users className="h-4 w-4 mr-2" />
                          About Us
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Agreement Confirmation */}
        <section className="py-16 bg-gradient-to-r from-slate-600 to-gray-600">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                By creating an account or using our service, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-slate-600 hover:bg-gray-100">
                  Create Account
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-600">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}