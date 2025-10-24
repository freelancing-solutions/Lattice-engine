"use client"

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
  // IntelliSense shows available properties
});`
  },
  {
    title: "Real-time Validation",
    description: "Get immediate feedback on code issues",
    code: `// ❌ Error detected immediately
const mutation = await lattice.mutations.create({
  spec_id: "invalid-spec", // Red underline: "Spec ID not found"
  title: "",                // Warning: "Title is required"
});

// ✅ Valid code
const mutation = await lattice.mutations.create({
  spec_id: "user-auth",
  title: "Fix login bug",
  // All good!
});`
  },
  {
    title: "Code Lenses",
    description: "Quick actions directly in your code",
    code: `// 🔄 Create Mutation | 📋 Copy ID | 🔍 View Details
// Click on code lenses above for quick actions

const mutation = await lattice.mutations.create({
  // Your mutation code here
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

export default function VSCodeExtensionContent() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">VSCode Extension</h1>
          <Badge variant="secondary" className="text-sm">v1.5.2</Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          Native VSCode integration with IntelliSense support, real-time validation, and debugging tools.
          Streamline your Lattice Engine development workflow.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="https://marketplace.visualstudio.com/items?itemName=lattice-engine.vscode-extension" target="_blank">
              <Download className="h-4 w-4 mr-2" />
              Install Extension
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://github.com/lattice-engine/vscode-extension" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Source
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">{feature.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Installation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Installation & Setup</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {installationSteps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </div>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {step.steps.map((stepItem, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {stepItem}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Code Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Code Examples</h2>
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {codeExamples.map((example, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                {example.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {codeExamples.map((example, index) => (
            <TabsContent key={index} value={index.toString()}>
              <Card>
                <CardHeader>
                  <CardTitle>{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    <code>{example.code}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Configuration</h2>
        <div className="grid gap-6">
          {configuration.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.settings.map((setting) => (
                    <div key={setting.key} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {setting.key}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {setting.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {setting.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Default: <code>{setting.default}</code>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Troubleshooting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Troubleshooting</h2>
        <div className="grid gap-4">
          {troubleshooting.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    item.severity === 'common' ? 'bg-yellow-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{item.issue}</h3>
                    <p className="text-sm text-muted-foreground">{item.solution}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Need Help?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Join our community or check out the documentation for more support.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/docs/tutorials-and-guides">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/lattice-engine/vscode-extension/issues" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Report Issue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}