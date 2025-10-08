"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GitBranch, Zap, CheckCircle } from "lucide-react"

const valuePropositions = [
  {
    title: "Spec-Driven Development",
    description: "Define your application behavior with living specifications that evolve with your code",
    icon: FileText,
    features: [
      "Automated spec validation",
      "Version-controlled specifications",
      "Real-time sync with codebase",
      "Collaborative spec editing"
    ]
  },
  {
    title: "Intelligent Mutations",
    description: "Track, approve, and execute code changes with AI-powered risk assessment",
    icon: GitBranch,
    features: [
      "Risk-based approval workflows",
      "Automated testing integration",
      "Rollback capabilities",
      "Audit trail for all changes"
    ]
  },
  {
    title: "Seamless Integration",
    description: "Works with your existing tools and workflows through VSCode extension and APIs",
    icon: Zap,
    features: [
      "VSCode extension",
      "REST API access",
      "MCP server integration",
      "CI/CD pipeline support"
    ]
  }
]

export default function ValuePropositions() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Developers Choose Lattice
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built by developers, for developers. Experience the future of collaborative coding with tools that understand your workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {valuePropositions.map((proposition, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <proposition.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    {proposition.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {proposition.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {proposition.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}