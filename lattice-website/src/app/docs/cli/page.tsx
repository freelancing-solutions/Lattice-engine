"use client"

import { Metadata } from "next";
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Terminal, Settings, Shield, GitBranch, BookOpen, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "CLI Documentation - Lattice Engine | Command Line Interface",
  description: "Automate workflows and integrate with CI/CD. Learn installation, global flags, dry-run previews, environment variables, and examples for key commands with Lattice CLI tools.",
  keywords: [
    "lattice cli",
    "command line interface",
    "cli tools",
    "automation",
    "ci/cd integration",
    "npm package",
    "project initialization",
    "dry-run previews",
    "environment variables",
    "workflow automation"
  ],
  authors: [{ name: "Lattice Engine Team" }],
  openGraph: {
    title: "CLI Documentation - Lattice Engine",
    description: "Automate workflows and integrate with CI/CD. Learn installation, global flags, dry-run previews, environment variables, and examples for key commands.",
    url: `${baseUrl}/docs/cli`,
    siteName: "Lattice Engine",
    images: [
      {
        url: `${baseUrl}/og-cli-docs.jpg`,
        width: 1200,
        height: 630,
        alt: "Lattice Engine CLI Documentation"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "CLI Documentation - Lattice Engine",
    description: "Automate workflows and integrate with CI/CD. Learn installation, global flags, dry-run previews, environment variables, and examples for key commands.",
    images: [`${baseUrl}/og-cli-docs.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/docs/cli`
  }
}

export default function CLIDocsPage() {
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
                  <li><code>--output</code> Choose preview format: <code>json</code> (default) or <code>table</code></li>
                  <li><code>--non-interactive</code> Disable prompts (or set <code>NO_PROMPT=1</code>)</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Dry-run Examples */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Dry-run Previews</CardTitle>
              <CardDescription>Supported commands and example output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground">Supported</h3>
                <p className="text-sm text-muted-foreground">auth <code>login</code>/<code>logout</code>, project <code>init</code>, spec <code>show</code> (remote), mutation <code>list</code>/<code>show</code></p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold">Auth Login (JSON)</h4>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
{`lattice auth login --email alice@example.com --password ****** --dry-run
{
  "method": "POST",
  "url": "http://localhost:8000/api/auth/login",
  "headers": { "Content-Type": "application/json" },
  "body": { "email": "alice@example.com" },
  "dryRun": true
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Project Init (table)</h4>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
{`lattice project init --name my-app --type web --dry-run --output table
Method   URL                                      Dry Run
POST     http://localhost:8000/api/projects       true
Headers  Content-Type: application/json
Body     {
           "name": "my-app",
           "type": "web"
         }`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" />Configuration & Env Vars</CardTitle>
              <CardDescription>Override defaults and configure networking</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><code>LATTICE_API_URL</code> Base API endpoint (e.g., <code>https://api.project-lattice.site</code>)</li>
                <li><code>HTTP_PROXY</code> / <code>HTTPS_PROXY</code> Standard Node.js proxy variables for outbound HTTP(S)</li>
                <li><code>NO_PROMPT</code> Set to <code>1</code> to disable interactive prompts</li>
                <li>Local config: <code>.lattice/config.json</code>; shared defaults: <code>cli/shared/config.json</code></li>
              </ul>
            </CardContent>
          </Card>

          {/* References */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />CLI Reference</CardTitle>
                <CardDescription>Repository documents and usage examples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/docs/api-documentation" className="text-sm text-primary flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> API Reference
                </Link>
                <Link href="/docs/tutorials-and-guides" className="text-sm text-primary flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Tutorials & Guides
                </Link>
                <Link href="/docs/cli-configuration" className="text-sm text-primary flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> CLI Configuration & Env Vars
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
                <CardDescription>Useful patterns</CardDescription>
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
        </div>
      </main>
      <Footer />
    </div>
  )
}