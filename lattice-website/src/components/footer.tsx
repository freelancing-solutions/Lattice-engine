import { Github, Twitter, Linkedin, MessageCircle, Mail } from "lucide-react"

const footerLinks = {
  ecosystem: [
    { name: "Ecosystem Components", href: "/ecosystem" },
    { name: "Mutation Engine", href: "/ecosystem/mutation-engine" },
    { name: "Portal & BugSage", href: "/ecosystem/portal-bugsage" },
    { name: "VSCode Extension", href: "/ecosystem/vscode-extension" },
  ],
  documentation: [
    { name: "Quick Start", href: "/docs/quickstart" },
    { name: "Core Concepts", href: "/docs/core-concepts" },
    { name: "Integration Guides", href: "/docs/integration-guides" },
    { name: "API Reference", href: "/docs/api-reference" },
  ],
  developers: [
    { name: "Developer Journey", href: "/docs/developer-journey" },
    { name: "CLI Tools", href: "/docs/cli-tools" },
    { name: "MCP Servers", href: "/docs/mcp-servers" },
    { name: "Community Forum", href: "/community" },
  ],
  company: [
    { name: "About Project Lattice", href: "/about" },
    { name: "Blog & Insights", href: "/blog" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
}

const socialLinks = [
  { icon: Github, href: "https://github.com/lattice-dev", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/latticedev", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/lattice-dev", label: "LinkedIn" },
  { icon: MessageCircle, href: "https://discord.gg/lattice", label: "Discord" },
{ icon: Mail, href: "mailto:hello@project-lattice.site", label: "Email" },
]

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="text-foreground font-bold text-xl">Lattice Engine</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Agentic coding platform that revolutionizes how developers manage specifications, 
              mutations, and collaborative coding workflows.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Ecosystem Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Product</h3>
            <ul className="space-y-2">
              {footerLinks.ecosystem.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Documentation Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Documentation</h3>
            <ul className="space-y-2">
              {footerLinks.documentation.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Support</h3>
            <ul className="space-y-2">
              {footerLinks.developers.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-muted-foreground text-sm">
                © 2024 Lattice Engine. All rights reserved.
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-primary transition-colors duration-200">
                Terms of Service
              </a>
              <a href="/support" className="hover:text-primary transition-colors duration-200">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}