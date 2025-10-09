"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, Download, Terminal, Code, GitBranch, Zap, FileText } from "lucide-react"

const codeSnippets = [
  "const mutation = await lattice.propose({...});",
  "if (spec.isValid()) { deploy(); }",
  "// AI-powered risk assessment",
  "mutation.status === 'approved'",
  "lattice.sync.specifications()",
  "await agent.validateDependencies();",
  "const approval = await lattice.requestApproval();",
  "// Automated code review complete",
  "spec.version.increment()",
  "lattice.monitor.performance()",
]

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [terminalText, setTerminalText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
const fullText = `$ lattice mutation propose\n✓ Analyzing code changes...\n✓ Risk assessment: LOW\n✓ Mutation proposed successfully\n→ Review at: https://app.project-lattice.site/mutations/mut_123`
    let index = 0
    
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTerminalText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Code Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {codeSnippets.map((snippet, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 font-mono text-sm whitespace-nowrap"
            initial={{ x: -200, y: Math.random() * 100 }}
            animate={{ 
              x: "100vw",
              y: Math.random() * 100 
            }}
            transition={{ 
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
            style={{
              top: `${Math.random() * 100}%`,
            }}
          >
            {snippet}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Agentic Coding
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 block">
              Redefined
            </span>
          </h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Automate your development workflow with intelligent mutation management, 
            spec-driven development, and collaborative code evolution.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
            <Button size="lg" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 text-lg">
              <Download className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Terminal Preview */}
      <motion.div 
        className="absolute bottom-10 right-10 w-96 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 hidden lg:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-400 text-sm font-mono">lattice-cli</span>
        </div>
        
        <div className="p-4 font-mono text-sm text-green-400">
          <pre className="whitespace-pre-wrap">
            {terminalText}
            <span className={`inline-block w-2 h-4 bg-green-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
          </pre>
        </div>
      </motion.div>

      {/* Floating Feature Cards */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <motion.div
          className="absolute top-20 left-10 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 0.5,
          }}
        >
          <Terminal className="h-6 w-6 text-purple-400 mb-2" />
          <h4 className="text-white font-semibold text-sm">CLI Tools</h4>
        </motion.div>

        <motion.div
          className="absolute top-40 right-20 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 1,
          }}
        >
          <GitBranch className="h-6 w-6 text-purple-400 mb-2" />
          <h4 className="text-white font-semibold text-sm">Smart Mutations</h4>
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-20 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 1.5,
          }}
        >
          <Zap className="h-6 w-6 text-purple-400 mb-2" />
          <h4 className="text-white font-semibold text-sm">Real-time Sync</h4>
        </motion.div>

        <motion.div
          className="absolute bottom-60 right-10 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 2,
          }}
        >
          <FileText className="h-6 w-6 text-purple-400 mb-2" />
          <h4 className="text-white font-semibold text-sm">Living Specs</h4>
        </motion.div>
      </div>
    </section>
  )
}