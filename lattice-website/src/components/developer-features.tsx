"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Terminal, Code, Webhook, Database, Copy, ExternalLink } from "lucide-react"

const developerFeatures = [
  {
    icon: Terminal,
    title: "CLI Integration",
    description: "Powerful command-line tools for automation",
    code: "npx lattice mutation propose --spec user-auth",
    features: ["Automation scripts", "CI/CD integration", "Batch operations", "Custom workflows"]
  },
  {
    icon: Code,
    title: "VSCode Extension",
    description: "Native IDE integration with IntelliSense",
    code: "// Auto-complete for Lattice APIs\nlattice.mutation.create({...})",
    features: ["Real-time validation", "Code completion", "Integrated debugging", "Live preview"]
  },
  {
    icon: Webhook,
    title: "REST API",
    description: "Full programmatic access to all features",
    code: "POST /api/v1/mutations\n{\n  \"spec_id\": \"user-auth\",\n  \"changes\": {...}\n}",
    features: ["RESTful design", "Webhook support", "Rate limiting", "OAuth 2.0 security"]
  },
  {
    icon: Database,
    title: "MCP Servers",
    description: "Model Context Protocol integration",
    code: "https://lattice.dev/specs/user-management",
    features: ["Real-time sync", "Multi-client support", "Event streaming", "State management"]
  }
]

export default function DeveloperFeatures() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for Developers
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Integrate Lattice seamlessly into your existing workflow with tools designed for how you actually work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {developerFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <pre className="bg-slate-900 p-4 rounded text-green-400 font-mono text-sm overflow-x-auto border border-slate-600">
                      <code>{feature.code}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(feature.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Key Features:</h4>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <Button variant="outline" className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who are already building better software with Lattice. 
              Start your free trial today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Install VSCode Extension
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                View API Docs
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}