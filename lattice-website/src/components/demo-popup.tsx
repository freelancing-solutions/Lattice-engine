"use client"

import { useState, useEffect } from "react"
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
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
            {/* Sidebar - Step Navigation */}
            <div className="w-80 border-r border-border p-6 overflow-y-auto">
              <div className="space-y-3">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep || (index === currentStep && progress === 100)
                  
                  return (
                    <motion.div
                      key={step.id}
                      className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                        isActive 
                          ? 'border-primary bg-primary/5' 
                          : isCompleted 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleStepClick(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${step.color}`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Icon className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {step.description}
                          </p>
                          {isActive && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <motion.div
                                  className="bg-gradient-to-r from-primary to-primary/80 h-1 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Current Step Display */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${currentStepData.color}`}>
                    <currentStepData.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{currentStepData.title}</h3>
                    <p className="text-muted-foreground">{currentStepData.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    Step {currentStep + 1} of {workflowSteps.length}
                  </Badge>
                </div>

                {/* Controls */}
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
                  <div className="flex items-center space-x-2 ml-4 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(currentStepData.duration / 1000)}s duration</span>
                  </div>
                </div>
              </div>

              {/* Code/Animation Area */}
              <div className="flex-1 p-6 bg-slate-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {/* Terminal-style Code Display */}
                    <div className="bg-gray-900 rounded-lg h-full flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-400 text-sm font-mono">
                          lattice-demo
                        </span>
                      </div>
                      
                      <div className="flex-1 p-6 font-mono text-sm overflow-auto">
                        <motion.pre
                          className="text-green-400 whitespace-pre-wrap"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          {currentStepData.code}
                        </motion.pre>
                        
                        {/* Animated cursor */}
                        <motion.span
                          className="inline-block w-2 h-4 bg-green-400 ml-1"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Experience the full power of intelligent development workflows
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                    <Button size="sm">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
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