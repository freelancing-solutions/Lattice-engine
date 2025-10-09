"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Terminal, 
  Code, 
  GitBranch, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  FileText,
  Users,
  ArrowRight,
  Clock
} from "lucide-react"

interface DemoPopupProps {
  isOpen: boolean
  onClose: () => void
}

const workflowSteps = [
  {
    id: 1,
    title: "Code Mutation Proposed",
    description: "AI agent analyzes your codebase and proposes intelligent changes",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    duration: 2000,
    code: `// AI proposes authentication enhancement
const mutation = await lattice.propose({
  type: "security_enhancement",
  target: "user-auth",
  changes: ["add_2fa", "hash_passwords"]
});`
  },
  {
    id: 2,
    title: "Risk Assessment",
    description: "Automated analysis evaluates potential impact and dependencies",
    icon: AlertTriangle,
    color: "from-yellow-500 to-orange-500",
    duration: 1500,
    code: `✓ Dependency analysis: SAFE
✓ Breaking changes: NONE
✓ Security impact: POSITIVE
✓ Performance impact: MINIMAL
→ Risk Level: LOW`
  },
  {
    id: 3,
    title: "Spec Validation",
    description: "Changes are validated against living specifications",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    duration: 1800,
    code: `spec.validate(mutation) {
  ✓ Authentication requirements met
  ✓ API contracts maintained  
  ✓ Database schema compatible
  ✓ Test coverage sufficient
}`
  },
  {
    id: 4,
    title: "Team Review",
    description: "Collaborative review process with intelligent routing",
    icon: Users,
    color: "from-green-500 to-emerald-500",
    duration: 2200,
    code: `→ Routed to: @security-team
→ Reviewer: Sarah Chen
→ Status: APPROVED
→ Comments: "Excellent security improvement"
→ Auto-merge: ENABLED`
  },
  {
    id: 5,
    title: "Deployment",
    description: "Automated deployment with real-time monitoring",
    icon: Zap,
    color: "from-indigo-500 to-blue-500",
    duration: 1600,
    code: `🚀 Deploying to production...
✓ Tests passed (127/127)
✓ Security scan: CLEAN
✓ Performance: +12% improvement
✓ Deployment: SUCCESS`
  }
]

export default function DemoPopup({ isOpen, onClose }: DemoPopupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPlaying || !isOpen) return

    const step = workflowSteps[currentStep]
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (step.duration / 50))
        if (newProgress >= 100) {
          if (currentStep < workflowSteps.length - 1) {
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
  }, [isPlaying, currentStep, isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          handlePlay()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleReset()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (currentStep > 0) {
            handleStepClick(currentStep - 1)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (currentStep < workflowSteps.length - 1) {
            handleStepClick(currentStep + 1)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStep, isPlaying])

  const handlePlay = () => {
    if (currentStep === workflowSteps.length - 1 && progress === 100) {
      // Reset to beginning
      setCurrentStep(0)
      setProgress(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setProgress(0)
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setProgress(0)
    setIsPlaying(false)
  }

  const currentStepData = workflowSteps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none overflow-hidden p-0 m-0 rounded-none border-none">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  Lattice Workflow Demo
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  See how intelligent mutation management works in practice
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Steps */}
            <div className="w-80 lg:w-96 bg-gray-50 border-r border-gray-200 p-4 lg:p-6 overflow-y-auto hidden md:block">
              <h3 className="text-lg font-semibold mb-4">Workflow Steps</h3>
              <div className="space-y-3">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep || (index === currentStep && progress === 100)
                  
                  return (
                    <motion.div
                      key={step.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-100 border-blue-300 border'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleStepClick(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isActive
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-gray-500">{step.description}</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Right Panel - Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile Step Indicator */}
              <div className="md:hidden p-4 border-b border-border bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Step {currentStep + 1} of {workflowSteps.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentStepData.title}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / workflowSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {currentStep + 1}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
                        <p className="text-gray-600">{currentStepData.description}</p>
                      </div>
                    </div>

                    {/* Mobile Step Navigation */}
                  <div className="md:hidden mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStepClick(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                      >
                        ← Previous
                      </Button>
                      <span className="text-sm font-medium">
                        {currentStep + 1} / {workflowSteps.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStepClick(Math.min(workflowSteps.length - 1, currentStep + 1))}
                        disabled={currentStep === workflowSteps.length - 1}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>

                  {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Button onClick={handlePlay} size="sm">
                          {isPlaying ? (
                            <Pause className="h-4 w-4 mr-2" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <Button onClick={handleReset} variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{Math.round(currentStepData.duration / 1000)}s</span>
                        </div>
                        <Badge variant="outline" className="hidden md:inline-flex">
                          Step {currentStep + 1} of {workflowSteps.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Keyboard Shortcuts Help */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 hidden lg:block">
                      <p className="text-xs text-blue-700">
                        <strong>Keyboard shortcuts:</strong> Space (play/pause) • R (reset) • ← → (navigate steps) • Esc (close)
                      </p>
                    </div>

                    {/* Terminal/Code Display */}
                    <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-hidden flex flex-col min-h-0">
                      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-2 text-gray-400">lattice-demo</span>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <motion.pre
                          className="text-green-400 whitespace-pre-wrap"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          {currentStepData.code}
                        </motion.pre>

                        {/* Animated cursor */}
                        {isPlaying && (
                          <motion.span
                            className="inline-block w-2 h-4 bg-green-400 ml-1"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Progress bar for active step */}
                    {isPlaying && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 lg:p-6 border-t border-border bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Experience the full power of intelligent development workflows
                  </div>
                  <div className="flex space-x-2 sm:ml-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      Learn More
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2 hidden sm:inline" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}