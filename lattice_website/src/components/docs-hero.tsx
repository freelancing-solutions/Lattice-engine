"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, PlayCircle, ExternalLink } from "lucide-react"

export default function DocsHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary rounded-full"
            initial={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              scale: Math.random() * 0.3 + 0.3
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              scale: Math.random() * 0.3 + 0.3
            }}
            transition={{
              duration: 25 + Math.random() * 15,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mr-4">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              Documentation
            </h1>
          </div>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to master Lattice Engine. From quick start guides to advanced API references.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlayCircle className="h-5 w-5 mr-2" />
              Quick Start Guide
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ExternalLink className="h-5 w-5 mr-2" />
              Browse API Reference
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}