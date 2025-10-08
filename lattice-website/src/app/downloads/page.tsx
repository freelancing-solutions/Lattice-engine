"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, ExternalLink, CheckCircle, Star, Code, Terminal } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const downloads = [
  {
    name: "Lattice JavaScript SDK",
    description: "Full-featured SDK for Node.js and browser environments",
    version: "v2.1.0",
    downloadUrl: "#",
    documentation: "#",
    size: "2.3 MB",
    platforms: ["Node.js", "Browser", "React", "Vue", "Angular"],
    icon: Code,
    features: ["TypeScript support", "Promise-based API", "Middleware support", "Error handling"],
    rating: 4.8,
    downloads: "15.2k"
  },
  {
    name: "Lattice Python SDK",
    description: "Python SDK with async support and type hints",
    version: "v2.1.0", 
    downloadUrl: "#",
    documentation: "#",
    size: "1.8 MB",
    platforms: ["Python 3.8+", "FastAPI", "Django", "Flask"],
    icon: Terminal,
    features: ["Async/await support", "Type hints", "Pydantic integration", "CLI tools"],
    rating: 4.9,
    downloads: "12.8k"
  },
  {
    name: "VSCode Extension",
    description: "Native VSCode integration with IntelliSense support",
    version: "v1.5.2",
    downloadUrl: "#",
    documentation: "#",
    size: "5.2 MB",
    platforms: ["VSCode", "VSCodium"],
    icon: Code,
    features: ["Code completion", "Real-time validation", "Debugging", "Git integration"],
    rating: 4.7,
    downloads: "28.5k"
  },
  {
    name: "CLI Tools",
    description: "Command-line interface for automation and CI/CD",
    version: "v2.0.1",
    downloadUrl: "#",
    documentation: "#",
    size: "15.4 MB",
    platforms: ["Windows", "macOS", "Linux"],
    icon: Terminal,
    features: ["Cross-platform", "Batch operations", "CI/CD integration", "Configuration management"],
    rating: 4.6,
    downloads: "9.3k"
  }
]

const installationGuides = {
  npm: {
    title: "NPM Installation",
    code: `# Install the JavaScript SDK
npm install @lattice/engine

# Install the CLI globally
npm install -g @lattice/cli

# Initialize a new project
npx lattice init`,
    language: "bash"
  },
  python: {
    title: "Python Installation",
    code: `# Install from PyPI
pip install lattice-engine

# Install with async support
pip install lattice-engine[async]

# Install CLI tools
pip install lattice-cli`,
    language: "python"
  },
  vscode: {
    title: "VSCode Extension",
    code: `# Install from VSCode Marketplace
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Lattice Engine"
4. Click Install

# Or install from .vsix file
code --install-extension lattice.vsix`,
    language: "bash"
  }
}

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Downloads & Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get the tools you need to integrate Lattice Engine into your development workflow.
            </p>
          </motion.div>

          {/* Main Downloads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            {downloads.map((download, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <download.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{download.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {download.version}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-muted-foreground">{download.rating}</span>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {download.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{download.size}</span>
                    <span>{download.downloads} downloads</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Features:</h4>
                    <ul className="space-y-1">
                      {download.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Platforms:</h4>
                    <div className="flex flex-wrap gap-1">
                      {download.platforms.map((platform, platformIndex) => (
                        <Badge key={platformIndex} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-border">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Docs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Installation Guides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Installation Guides</CardTitle>
                <CardDescription>
                  Step-by-step instructions to get started with Lattice Engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="npm" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="npm">NPM</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="vscode">VSCode</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(installationGuides).map(([key, guide]) => (
                    <TabsContent key={key} value={key} className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{guide.title}</h3>
                        <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm font-mono">
                            <code style={{ 
                              color: 'var(--code-string)',
                            }}>
                              {guide.code}
                            </code>
                          </pre>
                        </div>
                        <Button variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-primary to-primary/80 p-8 rounded-2xl text-primary-foreground text-center">
              <h2 className="text-2xl font-bold mb-4">
                Need Help Getting Started?
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Our comprehensive documentation and community support will help you get up and running quickly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  View Documentation
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Join Community
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Copy component for the copy button
function Copy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}