"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  X,
  ArrowRight,
  Terminal,
  Code,
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
  Clock,
  Zap,
  Shield,
  GitBranch,
  Rocket,
  Lightbulb
} from "lucide-react"

interface DemoStep {
  id: number
  title: string
  subtitle: string
  developerThought: string
  context: string
  code: string
  result: string
  insights: string[]
  duration: number
  icon: React.ElementType
  iconColor: string
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "The Challenge",
    subtitle: "Security Vulnerability in Production",
    developerThought: "I just found a critical security issue in our authentication system. Passwords are stored in plain text - this needs to be fixed immediately.",
    context: "Senior Developer discovers a critical security vulnerability during routine code review. The authentication module needs immediate hardening.",
    code: `// 🚨 CRITICAL SECURITY ISSUE
export class Auth {
  private users: User[] = [];

  async login(email: string, password: string) {
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');

    // ❌ VULNERABLE: Plain text comparison
    if (user.password !== password) throw new Error('Invalid password');
    return user;
  }
}`,
    result: "🔍 Security scan detects critical vulnerability\n❌ Plain text password storage\n⚠️ Risk level: CRITICAL\n🚨 Immediate action required",
    insights: [
      "Traditional development: Manual code reviews can miss critical issues",
      "Security vulnerabilities often go unnoticed until it's too late",
      "Fixing authentication systems requires careful testing and coordination"
    ],
    duration: 4000,
    icon: AlertTriangle,
    iconColor: "from-red-500 to-orange-500"
  },
  {
    id: 2,
    title: "Intelligent Analysis",
    subtitle: "Lattice AI Identifies the Risk",
    developerThought: "Let me use Lattice to propose a security fix. The AI will analyze the change for security implications and compatibility.",
    context: "Developer uses Lattice CLI to propose a security enhancement. The AI automatically analyzes the change for security implications.",
    code: `$ lattice mutation propose security-fix \\
  --title "Enhance Authentication Security" \\
  --risk "high" \\
  --impact "authentication module"

🤖 Lattice AI Analysis:
├── Security Impact: CRITICAL → SECURED
├── Breaking Changes: NONE
├── Test Coverage: 15/15 tests
├── Dependencies: bcrypt, logging
└── Risk Score: HIGH → LOW (after fix)`,
    result: "✅ AI analysis complete\n🔒 Security improvement: +95%\n📊 Risk reduction: 89%\n⚡ Processing time: 2.3s",
    insights: [
      "AI automatically understands security implications",
      "Intelligent dependency analysis prevents breaking changes",
      "Risk assessment happens in real-time, not after deployment"
    ],
    duration: 5000,
    icon: Lightbulb,
    iconColor: "from-yellow-500 to-orange-500"
  },
  {
    id: 3,
    title: "Smart Routing",
    subtitle: "Automated Approval Workflow",
    developerThought: "Perfect! Lattice automatically routed this to the security team since it's a high-risk change. I love how it knows who needs to review what.",
    context: "Lattice automatically routes the security fix to the appropriate team based on change type, risk level, and organizational structure.",
    code: `📋 Mutation Proposal Created
┌─────────────────────────────────┐
│ ID: mut_7x9k2m4                  │
│ Type: Security Enhancement       │
│ Risk: HIGH → LOW                 │
│                               │
│ 🎯 Smart Routing:                │
│ └──> security-team@company.com   │
│     (auto-assigned: Sarah Chen)  │
│                               │
│ 📊 Automated Analysis:           │
│ ✓ Security impact: POSITIVE      │
│ ✓ Breaking changes: NONE        │
│ ✓ Test coverage: 100%           │
└─────────────────────────────────┘`,
    result: "🔄 Auto-routed to Security Team\n👤 Assigned to: Sarah Chen (Security Lead)\n⏰ ETA: 2-4 hours\n📋 Status: IN REVIEW",
    insights: [
      "Smart routing eliminates manual approval chain confusion",
      "Right people review the right changes automatically",
      "No more "who should approve this?" discussions"
    ],
    duration: 4500,
    icon: GitBranch,
    iconColor: "from-purple-500 to-pink-500"
  },
  {
    id: 4,
    title: "Living Specification",
    subtitle: "Real-time Spec Evolution",
    developerThought: "Look at that! The living specification updated automatically. Our authentication spec now reflects the new security requirements.",
    context: "As the mutation progresses, the living specification automatically updates to reflect the new security requirements and best practices.",
    code: `📚 Living Specification: Authentication v3.2
═══════════════════════════════════════════════════════════

🔐 Security Requirements:
├── Passwords SHALL be hashed using bcrypt (min 12 rounds)
├── Authentication events MUST be logged
├── Rate limiting: 5 attempts per 15 minutes
├── Session timeout: 24 hours
└── Password complexity: 12+ chars, mixed case

🔄 Auto-updated: Just now
📝 Source: Security Enhancement Mutation
✅ Status: IMPLEMENTED`,
    result: "📚 Spec updated: v3.1 → v3.2\n🔄 Auto-synced with codebase\n📖 Team notified of changes\n📋 Documentation: UP-TO-DATE",
    insights: [
      "Specifications evolve with your codebase automatically",
      "No more drift between code and documentation",
      "Team always works with latest requirements"
    ],
    duration: 4000,
    icon: FileText,
    iconColor: "from-blue-500 to-cyan-500"
  },
  {
    id: 5,
    title: "Zero-Risk Deployment",
    subtitle: "Automated Testing & Rollout",
    developerThought: "Amazing! The mutation is approved and Lattice is handling the deployment automatically. All tests passed and it's rolling out to production now.",
    context: "With approval complete, Lattice automatically handles the deployment process with comprehensive testing and gradual rollout.",
    code: `🚀 Deployment Pipeline - ACTIVE
┌─────────────────────────────────────────────┐
│ 🧪 Testing Phase:                           │
│ ├─ Unit Tests: 127/127 ✅                  │
│ ├─ Integration Tests: 45/45 ✅              │
│ ├─ Security Scan: CLEAN ✅                 │
│ ├─ Performance Test: +12% improvement ✅   │
│ └─ Load Test: 10K req/s ✅                  │
│                                             │
│ 🌍 Rollout Strategy:                        │
│ ├─ Canary: 5% users → SUCCESS ✅            │
│ ├─ Staging: 100% validation ✅              │
│ └─ Production: Rolling out now... 🔄         │
└─────────────────────────────────────────────┘`,
    result: "🎉 Deployment: IN PROGRESS\n✅ All tests: PASSED\n📈 Performance: +12%\n🌍 Rollout: 73% complete",
    insights: [
      "Automated testing eliminates human error",
      "Gradual rollout minimizes deployment risk",
      "Real-time monitoring ensures safe releases"
    ],
    duration: 5000,
    icon: Rocket,
    iconColor: "from-green-500 to-emerald-500"
  },
  {
    id: 6,
    title: "Mission Complete",
    subtitle: "Security Hardened, System Protected",
    developerThought: "That was incredible! What would have taken days of coordination, testing, and deployment anxiety was completed in minutes. Our system is now secure.",
    context: "The security enhancement is complete. The authentication system is now production-ready with enterprise-grade security.",
    code: `✨ SECURITY ENHANCEMENT COMPLETE
═══════════════════════════════════════════════════════════

🔒 Security Status: ENHANCED
├── Plain text passwords → bcrypt hashed
├── No audit trail → comprehensive logging
├── No rate limiting → 5 attempts/15min
└── Manual reviews → AI-powered analysis

⏱️  Time to completion: 8 minutes
📊  Risk reduction: 89%
🧪  Tests passed: 172/172
👥  People involved: 2 (vs 8 normally)
💰  Cost saved: ~$4,200 in developer time`,
    result: "🎉 Mission Accomplished!\n🔒 System secured\n⚡ Zero downtime\n💪 Team empowered",
    insights: [
      "Complex changes can be made safely and quickly",
      "AI assistance reduces human error and coordination overhead",
      "Your team can focus on innovation, not process"
    ],
    duration: 4000,
    icon: CheckCircle,
    iconColor: "from-green-500 to-blue-500"
  }
]

interface CinematicDemoProps {
  isOpen: boolean
  onClose: () => void
}

export default function CinematicDemo({ isOpen, onClose }: CinematicDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepProgress, setStepProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [typedResult, setTypedResult] = useState("")

  const currentStepData = demoSteps[currentStep]
  const progress = ((currentStep + (stepProgress / 100)) / demoSteps.length) * 100

  // Handle step progression
  useEffect(() => {
    if (!isPlaying || !isOpen) return

    const interval = setInterval(() => {
      setStepProgress(prev => {
        const newProgress = prev + (100 / (currentStepData.duration / 50))
        if (newProgress >= 100) {
          if (currentStep < demoSteps.length - 1) {
            setCurrentStep(prev => prev + 1)
            return 0
          } else {
            setIsPlaying(false)
            return 100
          }
        }
        return newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, currentStepData.duration, isOpen])

  // Typing effect for code and results
  useEffect(() => {
    setTypedText("")
    setTypedResult("")
    setShowResults(false)

    // Type code
    let codeIndex = 0
    const codeInterval = setInterval(() => {
      if (codeIndex < currentStepData.code.length) {
        setTypedText(currentStepData.code.slice(0, codeIndex + 1))
        codeIndex++
      } else {
        clearInterval(codeInterval)
        // Start typing result after code is complete
        setTimeout(() => {
          setShowResults(true)
          let resultIndex = 0
          const resultInterval = setInterval(() => {
            if (resultIndex < currentStepData.result.length) {
              setTypedResult(currentStepData.result.slice(0, resultIndex + 1))
              resultIndex++
            } else {
              clearInterval(resultInterval)
            }
          }, 30)
          return () => clearInterval(resultInterval)
        }, 500)
      }
    }, 20)

    return () => clearInterval(codeInterval)
  }, [currentStep, currentStepData.code, currentStepData.result])

  const handlePlay = useCallback(() => {
    if (currentStep === demoSteps.length - 1 && stepProgress === 100) {
      // Reset to beginning
      setCurrentStep(0)
      setStepProgress(0)
      setShowResults(false)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, currentStep, stepProgress])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    setStepProgress(0)
    setShowResults(false)
  }, [])

  const handleStepChange = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex)
    setStepProgress(0)
    setShowResults(false)
    setIsPlaying(false)
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < demoSteps.length - 1) {
      handleStepChange(currentStep + 1)
    }
  }, [currentStep, handleStepChange])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1)
    }
  }, [currentStep, handleStepChange])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          handlePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePlay, handleNext, handlePrevious, onClose])

  const Icon = currentStepData.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black"
        >
          {/* Cinematic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated code particles */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-green-400 font-mono text-xs"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    opacity: 0
                  }}
                  animate={{
                    y: window.innerHeight + 20,
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 10 + Math.random() * 10,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear"
                  }}
                >
                  const mutation = await lattice.propose({...});
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main Demo Content */}
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between p-6 border-b border-white/10"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Lattice Engine Demo</h1>
                    <p className="text-sm text-gray-400">Intelligent Development Workflow</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Progress */}
                <div className="hidden md:block">
                  <div className="text-sm text-gray-400 mb-1">
                    Step {currentStep + 1} of {demoSteps.length}
                  </div>
                  <div className="w-48 bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Main Stage */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Developer Persona & Context */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-96 bg-black/20 backdrop-blur-sm border-r border-white/10 p-6 flex flex-col"
              >
                {/* Developer Avatar */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Alex Chen</h3>
                    <p className="text-gray-400 text-sm">Senior Developer</p>
                  </div>
                </div>

                {/* Current Step Info */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentStepData.iconColor} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{currentStepData.title}</h2>
                      <p className="text-sm text-gray-400">{currentStepData.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Developer Thought */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/10">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-300 italic">
                      "{currentStepData.developerThought}"
                    </p>
                  </div>
                </div>

                {/* Context */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/10">
                  <h4 className="text-white font-semibold mb-2">Context</h4>
                  <p className="text-sm text-gray-300">{currentStepData.context}</p>
                </div>

                {/* Insights */}
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3">Key Insights</h4>
                  <div className="space-y-2">
                    {currentStepData.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-2"
                      >
                        <Zap className="h-3 w-3 text-purple-400 mt-1 flex-shrink-0" />
                        <p className="text-xs text-gray-300">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right Panel - Code Display */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex-1 flex flex-col p-6"
              >
                {/* Code Terminal */}
                <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="ml-2 text-gray-400 text-sm font-mono">lattice-terminal</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Step {currentStep + 1}/{demoSteps.length}
                    </Badge>
                  </div>

                  {/* Code Content */}
                  <div className="flex-1 p-4 overflow-hidden">
                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-y-auto h-full">
                      <code>{typedText}</code>
                      {showResults && (
                        <>
                          <br />
                          <br />
                          <div className="text-blue-400">
                            {typedResult}
                          </div>
                        </>
                      )}
                      {!showResults && (
                        <motion.span
                          className="inline-block w-2 h-4 bg-green-400 ml-1"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-6"
            >
              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentStep === demoSteps.length - 1}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Center Controls */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-white hover:bg-white/10"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePlay}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        {currentStep === demoSteps.length - 1 && stepProgress === 100 ? "Restart" : "Play"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/10"
                  >
                    Skip Demo
                  </Button>
                </div>

                {/* Right Info */}
                <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(currentStepData.duration / 1000)}s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4" />
                    <span>Interactive Demo</span>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Keyboard shortcuts: Space (play/pause) • ← → (navigate) • Esc (exit)
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}