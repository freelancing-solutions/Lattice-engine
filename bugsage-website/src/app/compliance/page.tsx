import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  Download,
  Globe,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  ExternalLink,
  Award,
  Building,
  Mail,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Compliance - BugSage AI-Powered Debugging",
  description: "BugSage's compliance standards including GDPR, CCPA, SOC 2, and other regulatory certifications for enterprise customers.",
  openGraph: {
    title: "Compliance - BugSage AI-Powered Debugging",
    description: "BugSage's compliance standards including GDPR, CCPA, SOC 2, and other regulatory certifications for enterprise customers.",
    type: "website",
  },
};

const complianceStandards = [
  {
    name: "GDPR",
    fullName: "General Data Protection Regulation",
    status: "Compliant",
    description: "Full compliance with EU data protection regulations including data subject rights, consent management, and breach notification.",
    region: "European Union",
    icon: Globe,
  },
  {
    name: "CCPA",
    fullName: "California Consumer Privacy Act",
    status: "Compliant",
    description: "California privacy law compliance including consumer rights to know, delete, and opt-out of sale of personal information.",
    region: "California, USA",
    icon: Shield,
  },
  {
    name: "SOC 2 Type II",
    fullName: "Service Organization Control 2",
    status: "In Progress",
    description: "Comprehensive security controls audit covering security, availability, processing integrity, confidentiality, and privacy.",
    region: "Global",
    expectedDate: "Q1 2025",
    icon: Award,
  },
  {
    name: "ISO 27001",
    fullName: "Information Security Management",
    status: "Planned",
    description: "International standard for information security management systems and best practices.",
    region: "Global",
    expectedDate: "Q3 2025",
    icon: FileText,
  },
  {
    name: "HIPAA",
    fullName: "Health Insurance Portability and Accountability Act",
    status: "Enterprise Only",
    description: "Healthcare data protection standards for medical customers handling protected health information.",
    region: "United States",
    icon: Building,
  },
];

const dataResidency = [
  {
    region: "United States",
    locations: ["US East (N. Virginia)", "US West (Oregon)", "US Central (Iowa)"],
    compliance: ["SOC 2", "HIPAA (Enterprise)", "CCPA"],
  },
  {
    region: "European Union",
    locations: ["Frankfurt", "Ireland", "Paris"],
    compliance: ["GDPR", "SOC 2", "ISO 27001"],
  },
  {
    region: "Asia Pacific",
    locations: ["Singapore", "Tokyo", "Sydney"],
    compliance: ["SOC 2", "Local Data Laws"],
  },
  {
    region: "Canada",
    locations: ["Central Canada", "Toronto"],
    compliance: ["PIPEDA", "SOC 2"],
  },
];

const complianceDocuments = [
  {
    name: "SOC 2 Type II Report",
    status: "Available Q1 2025",
    description: "Comprehensive audit report on security controls",
    icon: Download,
    available: false,
  },
  {
    name: "Security Whitepaper",
    status: "Available Now",
    description: "Detailed overview of our security practices and architecture",
    icon: FileText,
    available: true,
  },
  {
    name: "Data Processing Agreement",
    status: "Available Now",
    description: "Legal agreement for data processing and protection",
    icon: FileText,
    available: true,
  },
  {
    name: "Subprocessor List",
    status: "Updated Monthly",
    description: "Current list of third-party subprocessors",
    icon: Globe,
    available: true,
  },
];

export default function CompliancePage() {
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
            <Award className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Compliance & Certifications
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meeting global compliance standards to ensure your data is protected according to
              industry best practices and regulatory requirements.
            </p>
          </motion.div>

          {/* Compliance Standards Grid */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Compliance Standards</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our commitment to regulatory compliance across global jurisdictions
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complianceStandards.map((standard, index) => (
                <motion.div
                  key={standard.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <standard.icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge
                          variant={
                            standard.status === "Compliant"
                              ? "default"
                              : standard.status === "In Progress"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            standard.status === "Compliant"
                              ? "bg-green-100 text-green-800"
                              : standard.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : standard.status === "Enterprise Only"
                              ? "bg-purple-100 text-purple-800"
                              : ""
                          }
                        >
                          {standard.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{standard.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{standard.fullName}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        {standard.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{standard.region}</span>
                        </div>
                        {standard.expectedDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-xs text-primary">{standard.expectedDate}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Data Residency */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Data Residency</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose where your data is stored with multi-region deployment options
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {dataResidency.map((region, index) => (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span>{region.region}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Data Centers:</h4>
                          <div className="flex flex-wrap gap-2">
                            {region.locations.map((location, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Compliance:</h4>
                          <div className="flex flex-wrap gap-2">
                            {region.compliance.map((compliance, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {compliance}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Compliance Documentation */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center mb-12">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Compliance Documentation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Access our compliance documents and security reports
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {complianceDocuments.map((doc, index) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <doc.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{doc.name}</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            {doc.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={doc.available ? "default" : "secondary"}
                              className={doc.available ? "bg-green-100 text-green-800" : ""}
                            >
                              {doc.status}
                            </Badge>
                            {doc.available ? (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <Clock className="w-4 h-4 mr-2" />
                                Coming Soon
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Enterprise Compliance */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">For Enterprise Customers</h2>
                    <p className="text-muted-foreground mb-6">
                      We understand that enterprise organizations have unique compliance requirements.
                      Our enterprise solutions provide enhanced compliance support and customization.
                    </p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Custom compliance requirements</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Dedicated compliance support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Regular compliance reporting</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">On-site compliance assessments</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild>
                        <a href="/contact">
                          <Users className="w-4 h-4 mr-2" />
                          Contact Enterprise Team
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/pricing">
                          <Building className="w-4 h-4 mr-2" />
                          View Enterprise Plans
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Compliance Support</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Compliance Team</p>
                          <p className="text-xs text-muted-foreground">compliance@bugsage.site</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Security Questions</p>
                          <p className="text-xs text-muted-foreground">security@bugsage.site</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Response Time</p>
                          <p className="text-xs text-muted-foreground">Within 24 business hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Questions CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Questions About Compliance?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Our compliance and security teams are here to answer your questions and provide
                  the documentation you need for your regulatory requirements.
                </p>
                <Button size="lg" asChild>
                  <a href="/contact">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Compliance Team
                  </a>
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