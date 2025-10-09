import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LatticeClient } from "@/components/lattice-client";
import { Brain, GitBranch, Shield, FileText, Zap, Code, AlertCircle, CheckCircle } from "lucide-react";

const flowSteps = [
  {
    title: "Production (Sentry MCP)",
    description: "Error detected → Streamed to BugSage",
    icon: <AlertCircle className="w-6 h-6 text-red-400" />,
    color: "border-red-500/20 bg-red-500/5"
  },
  {
    title: "BugSage (Error Intelligence)",
    description: "Analyzes error + correlates with specs",
    icon: <Brain className="w-6 h-6 text-blue-400" />,
    color: "border-blue-500/20 bg-blue-500/5"
  },
  {
    title: "Project Lattice (Orchestration)",
    description: "Creates/mutates spec + assigns task",
    icon: <GitBranch className="w-6 h-6 text-green-400" />,
    color: "border-green-500/20 bg-green-500/5"
  },
  {
    title: "Coding Agent (Execution)",
    description: "Generates fix based on spec",
    icon: <Code className="w-6 h-6 text-purple-400" />,
    color: "border-purple-500/20 bg-purple-500/5"
  },
  {
    title: "VSCode (Git Integration)",
    description: "Shows diff + auto-commits",
    icon: <FileText className="w-6 h-6 text-orange-400" />,
    color: "border-orange-500/20 bg-orange-500/5"
  }
];

const benefits = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Error-Driven Spec Evolution",
    description: "When production errors reveal spec gaps, BugSage automatically proposes new specs or mutations to Lattice. Your architecture documentation stays current."
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Intelligent Agent Task Assignment",
    description: "BugSage packages diagnostics with full context for coding agents: error traces, spec definitions, safety constraints, and historical patterns."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Safety-First Automation",
    description: "Configurable rules determine when fixes deploy autonomously vs. requiring human approval. BugSage validates every action against your safety thresholds."
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Production-to-Development Feedback Loop",
    description: "Production errors don't just get fixed—they inform spec improvements that prevent similar issues forever."
  }
];

const comparisonData = [
  { feature: "Manual triage", without: "30-60 min", with: "0.8 seconds" },
  { feature: "Dev writes fix", without: "1-4 hours", with: "2.5 minutes" },
  { feature: "Code review wait", without: "2-24 hours", with: "Real-time" },
  { feature: "Manual deployment", without: "30-60 min", with: "30 seconds" },
  { feature: "Total time", without: "4-30 hours", with: "4 minutes" }
];

export default function LatticeIntegrationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <LatticeClient 
          flowSteps={flowSteps}
          benefits={benefits}
          comparisonData={comparisonData}
        />
      </main>
      
      <Footer />
    </div>
  );
}