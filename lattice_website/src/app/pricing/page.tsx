"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Code, 
  Database,
  Clock,
  GitBranch,
  Bot,
  Rocket,
  Building,
  Crown,
  ArrowRight,
  HelpCircle
} from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Pricing Plans - Lattice Engine | AI-Powered Development Platform",
  description: "Choose the perfect plan for your team. From individual developers to enterprise organizations, find flexible pricing for AI-powered agentic coding with Lattice Engine.",
  keywords: [
    "lattice engine pricing",
    "ai development platform pricing", 
    "agentic coding plans",
    "developer tools pricing",
    "team collaboration pricing",
    "enterprise development platform",
    "ai coding assistant pricing",
    "mutation tracking pricing"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "Pricing Plans - Lattice Engine",
    description: "Choose the perfect plan for your team. From individual developers to enterprise organizations, find flexible pricing for AI-powered agentic coding.",
    url: `${baseUrl}/pricing`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-pricing.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine Pricing Plans"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans - Lattice Engine",
    description: "Choose the perfect plan for your team. From individual developers to enterprise organizations, find flexible pricing for AI-powered agentic coding.",
    images: [`${baseUrl}/og-pricing.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/pricing`
  }
}

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individual developers and small projects",
    badge: null,
    features: [
      "Up to 3 projects",
      "Basic mutation tracking",
      "Community support",
      "VSCode extension",
      "Basic API access",
      "5 mutations per month",
      "Standard templates"
    ],
    limitations: [
      "No team collaboration",
      "Limited AI features",
      "No priority support"
    ],
    cta: "Get Started Free",
    popular: false,
    color: "border-border"
  },
  {
    name: "Pro",
    price: "$29",
    period: "per user/month",
    description: "For professional developers and growing teams",
    badge: "Most Popular",
    features: [
      "Unlimited projects",
      "Advanced mutation management",
      "AI-powered risk assessment",
      "Team collaboration (up to 10 users)",
      "Priority email support",
      "Unlimited mutations",
      "Custom templates",
      "Advanced analytics",
      "Git integration",
      "Automated testing workflows"
    ],
    limitations: [
      "Limited enterprise features",
      "No custom integrations"
    ],
    cta: "Start Pro Trial",
    popular: true,
    color: "border-primary"
  },
  {
    name: "Team",
    price: "$79",
    period: "per user/month",
    description: "For larger teams with advanced collaboration needs",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Advanced approval workflows",
      "Custom deployment pipelines",
      "24/7 priority support",
      "Advanced security features",
      "Custom integrations",
      "Team analytics dashboard",
      "Role-based permissions",
      "Audit logs",
      "SLA guarantees"
    ],
    limitations: [
      "No white-label options",
      "Standard compliance features"
    ],
    cta: "Start Team Trial",
    popular: false,
    color: "border-orange-500"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    description: "For large organizations with custom requirements",
    badge: "Enterprise",
    features: [
      "Everything in Team",
      "Unlimited everything",
      "White-label solutions",
      "Custom AI model training",
      "Dedicated account manager",
      "On-premise deployment",
      "Advanced compliance (SOC2, HIPAA)",
      "Custom SLA agreements",
      "Professional services",
      "Training and onboarding",
      "Custom integrations",
      "Priority feature requests"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    color: "border-orange-500"
  }
]

const features = [
  {
    category: "Core Features",
    items: [
      { name: "Projects", free: "3", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
      { name: "Mutations per month", free: "5", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
      { name: "Team members", free: "1", pro: "10", team: "Unlimited", enterprise: "Unlimited" },
      { name: "API calls per month", free: "1,000", pro: "50,000", team: "500,000", enterprise: "Unlimited" }
    ]
  },
  {
    category: "AI & Automation",
    items: [
      { name: "AI-powered risk assessment", free: false, pro: true, team: true, enterprise: true },
      { name: "Automated testing", free: false, pro: true, team: true, enterprise: true },
      { name: "Smart code suggestions", free: false, pro: true, team: true, enterprise: true },
      { name: "Custom AI model training", free: false, pro: false, team: false, enterprise: true }
    ]
  },
  {
    category: "Collaboration",
    items: [
      { name: "Team workspaces", free: false, pro: true, team: true, enterprise: true },
      { name: "Advanced approval workflows", free: false, pro: false, team: true, enterprise: true },
      { name: "Role-based permissions", free: false, pro: false, team: true, enterprise: true },
      { name: "Audit logs", free: false, pro: false, team: true, enterprise: true }
    ]
  },
  {
    category: "Support & Security",
    items: [
      { name: "Community support", free: true, pro: true, team: true, enterprise: true },
      { name: "Email support", free: false, pro: true, team: true, enterprise: true },
      { name: "24/7 priority support", free: false, pro: false, team: true, enterprise: true },
      { name: "Dedicated account manager", free: false, pro: false, team: false, enterprise: true },
      { name: "SOC2 compliance", free: false, pro: false, team: false, enterprise: true }
    ]
  }
]

const faqs = [
  {
    question: "Can I change my plan at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer: "We'll notify you when you're approaching your limits. For API calls and mutations, you can purchase additional capacity or upgrade your plan."
  },
  {
    question: "Do you offer annual discounts?",
    answer: "Yes! Annual subscriptions receive a 20% discount compared to monthly billing. Enterprise customers can negotiate custom terms."
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes, all paid plans include a 14-day free trial. No credit card required to start your trial."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and for Enterprise customers, we can arrange invoicing and wire transfers."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Star className="w-4 h-4 mr-1" />
                Pricing Plans
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Choose Your Plan
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                From individual developers to enterprise teams, find the perfect plan to accelerate your development workflow with AI-powered agentic coding.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">Annual (20% off)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {pricingPlans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className={`relative h-full ${plan.color} ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">
                              {plan.badge}
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="text-center pb-8">
                          <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                          <div className="mt-4">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            {plan.period && (
                              <span className="text-muted-foreground ml-1">/{plan.period}</span>
                            )}
                          </div>
                          <CardDescription className="mt-4">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {plan.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center">
                                <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                            {plan.limitations.map((limitation, limitIndex) => (
                              <div key={limitIndex} className="flex items-center opacity-60">
                                <X className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{limitation}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full mt-8" 
                            variant={plan.popular ? "default" : "outline"}
                          >
                            {plan.cta}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="annual">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {pricingPlans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className={`relative h-full ${plan.color} ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">
                              {plan.badge}
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="text-center pb-8">
                          <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                          <div className="mt-4">
                            {plan.name === "Free" ? (
                              <span className="text-4xl font-bold">$0</span>
                            ) : plan.name === "Enterprise" ? (
                              <span className="text-4xl font-bold">Custom</span>
                            ) : (
                              <>
                                <span className="text-4xl font-bold">
                                  ${plan.name === "Pro" ? "23" : "63"}
                                </span>
                                <span className="text-muted-foreground ml-1">/user/month</span>
                                <div className="text-sm text-green-600 mt-1">
                                  Save 20% annually
                                </div>
                              </>
                            )}
                          </div>
                          <CardDescription className="mt-4">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {plan.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center">
                                <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                            {plan.limitations.map((limitation, limitIndex) => (
                              <div key={limitIndex} className="flex items-center opacity-60">
                                <X className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{limitation}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full mt-8" 
                            variant={plan.popular ? "default" : "outline"}
                          >
                            {plan.cta}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Compare Features
              </h2>
              <p className="text-xl text-muted-foreground">
                See what's included in each plan
              </p>
            </motion.div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Features</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                    <th className="text-center p-4 font-semibold">Team</th>
                    <th className="text-center p-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((category) => (
                    <>
                      <tr key={category.category} className="border-b bg-muted/30">
                        <td colSpan={5} className="p-4 font-semibold text-sm uppercase tracking-wide">
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/20">
                          <td className="p-4">{item.name}</td>
                          <td className="p-4 text-center">
                            {typeof item.free === 'boolean' ? (
                              item.free ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />
                            ) : (
                              item.free
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof item.pro === 'boolean' ? (
                              item.pro ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />
                            ) : (
                              item.pro
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof item.team === 'boolean' ? (
                              item.team ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />
                            ) : (
                              item.team
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof item.enterprise === 'boolean' ? (
                              item.enterprise ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />
                            ) : (
                              item.enterprise
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Got questions? We've got answers.
              </p>
            </motion.div>

            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <HelpCircle className="w-5 h-5 mr-3 text-primary" />
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/5">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of developers who are already using Lattice Engine to accelerate their development workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Contact Sales
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}