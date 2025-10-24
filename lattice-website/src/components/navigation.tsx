"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, Github, Twitter } from "lucide-react"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Ecosystem", href: "/ecosystem" },
  { name: "Documentation", href: "/docs" },
  { name: "CLI Tools", href: "/cli-tools" },
  { name: "MCP Servers", href: "/mcp-servers" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm" 
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="text-foreground font-bold text-xl hidden sm:block">Project Lattice</span>
              <span className="text-foreground font-bold text-xl sm:hidden">PL</span>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="transition-colors duration-200 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <span>{item.name}</span>
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <a href="https://app.project-lattice.site/login">Sign In</a>
            </Button>
            <Button asChild>
              <a href="/pricing">Start Building with Specs</a>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
              <div className="flex flex-col space-y-6 mt-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="transition-colors duration-200 text-lg font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{item.name}</span>
                  </a>
                ))}
                <div className="flex flex-col space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground justify-start" onClick={() => setIsOpen(false)}>
                    <a href="https://app.project-lattice.site/login">Sign In</a>
                  </Button>
                  <Button asChild>
                    <a href="/pricing">Start Building with Specs</a>
                  </Button>
                </div>
                <div className="flex space-x-4 pt-6 border-t border-border">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Github className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Twitter className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}