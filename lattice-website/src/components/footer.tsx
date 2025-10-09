import { Github, Twitter, Linkedin, MessageCircle, Mail } from "lucide-react"

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Documentation", href: "/docs" },
    { name: "Downloads", href: "/downloads" },
    { name: "System Status", href: "/status" },
  ],
  documentation: [
    { name: "API Reference", href: "/docs/api-documentation" },
    { name: "VSCode Extension", href: "/docs/vscode-extension" },
    { name: "MCP Servers", href: "/docs/mcp-servers" },
    { name: "Tutorials", href: "/docs/tutorials-and-guides" },
  ],
  support: [
    { name: "Help Center", href: "/support" },
    { name: "Contact Us", href: "/support" },
    { name: "Community", href: "/community" },
    { name: "Status Page", href: "/status" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
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
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-white font-bold text-xl">Lattice Engine</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Agentic coding platform that revolutionizes how developers manage specifications, 
              mutations, and collaborative coding workflows.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Documentation Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Documentation</h3>
            <ul className="space-y-2">
              {footerLinks.documentation.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">
                © 2024 Lattice Engine. All rights reserved.
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="/support" className="hover:text-white transition-colors duration-200">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}