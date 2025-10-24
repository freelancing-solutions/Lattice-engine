"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Terminal, Settings, Shield, GitBranch, BookOpen, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export default function CLIContent() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-foreground mb-4">Lattice CLI Tools</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Automate workflows and integrate with CI/CD. Learn installation, global flags, dry-run previews,
          environment variables, and examples for key commands.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="secondary">Node 18, 20, 22</Badge>
          <Badge variant="outline">Windows · macOS · Linux</Badge>
        </div>
      </motion.div>

      {/* Installation */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" />Installation</CardTitle>
            <CardDescription>Install globally via npm</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`# Install globally
npm install -g @lattice/cli

# Initialize a new project
npx lattice project init --name "my-app" --type web`}
            </pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Global Flags</CardTitle>
            <CardDescription>Common flags supported across commands</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><code>--dry-run</code> Print the request preview without executing</li>
              <li><code>--output json|table</code> Format output as JSON or table</li>
              <li><code>--verbose</code> Enable detailed logging</li>
              <li><code>--config path</code> Use custom config file</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Commands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Commands</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" />Project Commands</CardTitle>
              <CardDescription>Initialize and manage projects</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`# Initialize new project
lattice project init --name "my-app" --type web

# Add component
lattice project add component --name "Button"

# Generate boilerplate
lattice project generate --template react-ts`}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security Commands</CardTitle>
              <CardDescription>Manage authentication and security</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`# Login to Lattice
lattice auth login

# Check authentication status
lattice auth status

# Logout
lattice auth logout`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Environment Variables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Environment Variables</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Configuration</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><code>LATTICE_API_URL</code> API endpoint URL</li>
                  <li><code>LATTICE_CONFIG_PATH</code> Custom config file path</li>
                  <li><code>LATTICE_LOG_LEVEL</code> Logging level (debug, info, warn, error)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Automation</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><code>NO_PROMPT</code> Disable interactive prompts</li>
                  <li><code>LATTICE_TOKEN</code> Authentication token</li>
                  <li><code>CI</code> Enable CI mode (auto-detected)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Examples</h2>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>CI/CD Integration</CardTitle>
              <CardDescription>Example GitHub Actions workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
{`name: Deploy with Lattice
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @lattice/cli
      - run: lattice project deploy --dry-run
        env:
          LATTICE_TOKEN: \${{ secrets.LATTICE_TOKEN }}
          NO_PROMPT: 1`}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>Tips for effective CLI usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Use <code>--dry-run</code> in CI to verify requests without execution</li>
                <li>Prefer <code>--output json</code> for machine parsing; <code>table</code> for human review</li>
                <li>Set <code>NO_PROMPT=1</code> for non-interactive automation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}