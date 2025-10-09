"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Code,
  Terminal,
  Download,
  Play,
  Settings,
  Zap,
  CheckCircle,
  BookOpen,
  ExternalLink,
  Key,
  GitBranch,
  Shield,
  Clock,
  Star,
  Users,
  Lightbulb
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Metadata for the VSCode Extension page
// export const metadata: Metadata = {
//   title: "VSCode Extension v1.5.2 - Lattice Engine",
//   description: "Native VSCode integration with IntelliSense support, real-time validation, and debugging tools. Install and configure the Lattice Engine extension.",
// }

const features = [
  {
    title: "IntelliSense Support",
    description: "Smart code completion for all Lattice Engine APIs and functions",
    icon: Zap,
    category: "Code Completion"
  },
  {
    title: "Real-time Validation",
    description: "Live code checking with immediate feedback on errors and warnings",
    icon: Shield,
    category: "Validation"
  },
  {
    title: "Integrated Debugging",
    description: "Debug mutations and specifications directly in your IDE",
    icon: Play,
    category: "Debugging"
  },
  {
    title: "Git Integration",
    description: "Seamless workflow integration with Git commands and status tracking",
    icon: GitBranch,
    category: "Integration"
  },
  {
    title: "Status Bar Integration",
    description: "Monitor connection status and pending mutations at a glance",
    icon: Settings,
    category: "UI Features"
  },
  {
    title: "Code Lenses",
    description: "Inline actions for quick access to mutation operations",
    icon: Code,
    category: "UI Features"
  }
]

const installationSteps = [
  {
    title: "Install from Marketplace",
    description: "Search for 'Lattice Engine' in the VSCode Marketplace",
    steps: [
      "Open VSCode",
      "Press Ctrl+Shift+X to open Extensions",
      "Search for 'Lattice Engine'",
      "Click Install on the official extension"
    ]
  },
  {
    title: "Configure API Key",
    description: "Set up your API key to connect to your Lattice project",
    steps: [
      "Press Ctrl+Shift+P and search for 'Lattice: Configure API Key'",
      "Enter your API key from the Lattice dashboard",
      "Optionally set your project ID",
      "Save the configuration"
    ]
  },
  {
    title: "Initialize Project",
    description: "Set up your workspace for Lattice Engine development",
    steps: [
      "Open your project folder",
      "Press Ctrl+Shift+P and search for 'Lattice: Initialize Project'",
      "Follow the prompts to create .lattice configuration",
      "Start using the extension features"
    ]
  }
]

const configuration = [
  {
    category: "Extension Settings",
    settings: [
      {
        key: "lattice.apiKey",
        description: "Your Lattice Engine API key",
        type: "string",
        default: ""
      },
      {
        key: "lattice.projectId",
        description: "Project ID for multi-project setups",
        type: "string",
        default: ""
      },
      {
        key: "lattice.autoSave",
        description: "Auto-save mutations on changes",
        type: "boolean",
        default: "true"
      },
      {
        key: "lattice.realTimeValidation",
        description: "Enable real-time code validation",
        type: "boolean",
        default: "true"
      }
    ]
  },
  {
    category: "UI Settings",
    settings: [
      {
        key: "lattice.showStatusBar",
        description: "Show Lattice status in the status bar",
        type: "boolean",
        default: "true"
      },
      {
        key: "lattice.showActivityBar",
        description: "Show Lattice icon in activity bar",
        type: "boolean",
        default: "true"
      },
      {
        key: "lattice.theme",
        description: "Extension theme setting",
        type: "enum",
        default: "auto"
      }
    ]
  },
  {
    category: "Advanced Settings",
    settings: [
      {
        key: "lattice.debugMode",
        description: "Enable debug logging",
        type: "boolean",
        default: "false"
      },
      {
        key: "lattice.maxSuggestions",
        description: "Maximum number of completion suggestions",
        type: "number",
        default: "10"
      }
    ]
  }
]

const codeExamples = [
  {
    title: "IntelliSense Auto-completion",
    description: "Type 'lattice.' to see available methods and properties",
    code: `const mutation = await lattice.mutations.create({
  spec_id: "user-auth",
  title: "Add password hashing",
  changes: { /*...*/ }
});

// Auto-completes available methods:
// - lattice.mutations.create()
// - lattice.mutations.list()
// - lattice.mutations.approve()
// - lattice.specs.get()
// - lattice.deploy.create()`
  },
  {
    title: "Real-time Validation",
    description: "Get immediate feedback on code issues",
    code: `// ❌ Error detected immediately
const mutation = await lattice.mutations.create({
  spec_id: "invalid-spec", // Red underline: "Spec ID not found"
  title: "",                // Warning: "Title is required"
  // ...
});

// ✅ Valid code passes validation
const mutation = await lattice.mutations.create({
  spec_id: "user-auth",
  title: "Fix login bug",
  changes: { /*...*/ }
});`
  },
  {
    title: "Code Lenses",
    description: "Quick actions directly in your code",
    code: `// 🔄 Create Mutation
// ✅ Review Mutation
// 🚀 Deploy Mutation

const mutation = await lattice.mutations.create({
  // Hover over this line to see inline actions
});`
  }
]

const troubleshooting = [
  {
    issue: "Extension not loading",
    solution: "Check VSCode version compatibility (1.74+), restart VSCode, and reload the extension",
    severity: "common"
  },
  {
    issue: "API connection failed",
    solution: "Verify your API key is correct and active, check network connectivity, and validate project ID",
    severity: "common"
  },
  {
    issue: "IntelliSense not working",
    solution: "Ensure TypeScript/JavaScript language features are enabled, check .lattice/config.json exists, restart TypeScript server",
    severity: "moderate"
  },
  {
    issue: "Real-time validation errors",
    solution: "Enable debug mode in settings, check extension logs in Developer Tools",
    severity: "moderate"
  }
]

export default function VSCodeExtensionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Code className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                    VSCode Extension
                  </h1>
                  <Badge variant="secondary" className="mt-2">v1.5.2</Badge>
                </div>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Native VSCode integration with IntelliSense support, real-time validation, and debugging tools.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="h-5 w-5 mr-2" />
                  Install Extension
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Marketplace
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Start */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Quick Start</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a href="#installation" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        Installation
                      </a>
                      <a href="#configuration" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        Configuration
                      </a>
                      <a href="#features" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        Features
                      </a>
                      <a href="#examples" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        Examples
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Installation Stats */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Extension Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Downloads</span>
                        <span className="text-sm font-medium text-foreground">28.5k</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rating</span>
                        <span className="text-sm font-medium text-foreground">4.7/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">VS Code</span>
                        <span className="text-sm font-medium text-foreground">1.74+</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Links */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a href="https://marketplace.visualstudio.com/items?itemName=lattice-engine.lattice" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Marketplace
                      </a>
                      <a href="/docs/troubleshooting" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Troubleshooting
                      </a>
                      <a href="/docs/examples" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Examples
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Installation */}
              <motion.section
                id="installation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Installation & Setup</h2>
                <div className="space-y-8">
                  {installationSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex gap-8"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                        <p className="text-muted-foreground mb-4">{step.description}</p>
                        <Card className="border-border">
                          <CardContent className="p-4">
                            <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                              {step.steps.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-sm">{item}</li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Features */}
              <motion.section
                id="features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Key Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                              <feature.icon className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <Badge variant="outline" className="text-xs border-primary text-primary">
                              {feature.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Configuration */}
              <motion.section
                id="configuration"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Configuration</h2>
                <Tabs defaultValue="extension" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="extension">Extension</TabsTrigger>
                    <TabsTrigger value="ui">UI</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  {configuration.map((configGroup) => (
                    <TabsContent key={configGroup.category} value={configGroup.category.toLowerCase()} className="mt-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{configGroup.category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {configGroup.settings.map((setting, index) => (
                              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-border last:border-0">
                                <div className="flex-shrink-0">
                                  <Badge variant="outline" className="text-xs border-primary text-primary">
                                    {setting.type}
                                  </Badge>
                                </div>
                                <div className="flex-1">
                                  <div className="font-mono text-sm text-foreground mb-1">
                                    {setting.key}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {setting.description}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">Default:</span>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                      {setting.default}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.section>

              {/* Code Examples */}
              <motion.section
                id="examples"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Code Examples</h2>
                <div className="space-y-8">
                  {codeExamples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{example.title}</CardTitle>
                          <CardDescription>{example.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-4 rounded overflow-x-auto">
                            <pre className="text-sm">
                              <code>{example.code}</code>
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Troubleshooting */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Troubleshooting</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {troubleshooting.map((item, index) => (
                        <div key={index} className="flex items-start space-x-4 pb-6 border-b border-border last:border-0">
                          <div className="flex-shrink-0 mt-1">
                            <Badge
                              variant={item.severity === 'common' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {item.severity}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-2">{item.issue}</h4>
                            <p className="text-sm text-muted-foreground">{item.solution}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}