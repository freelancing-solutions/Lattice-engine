import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { HowItWorksClient } from "@/components/how-it-works-client";
import { AlertCircle, Brain, GitBranch, Code, Shield, Zap, Database, Cloud, Server } from "lucide-react";

const stages = [
  {
    number: "01",
    title: "Error Detection",
    description: "Sentry MCP streams production errors in real-time. Development errors captured via VSCode extension. CI/CD failures routed through webhook integration.",
    icon: <AlertCircle className="w-6 h-6 text-red-400" />,
    details: [
      "Real-time error streaming from Sentry",
      "Development error capture via VSCode",
      "CI/CD webhook integration",
      "Error classification and routing"
    ],
    color: "border-red-500/20 bg-red-500/5"
  },
  {
    number: "02",
    title: "Context Enrichment",
    description: "Reads .lattice/ folder for relevant specs. Maps error to affected spec contracts. Retrieves mutation history from Lattice. Gathers git commit context.",
    icon: <Database className="w-6 h-6 text-blue-400" />,
    details: [
      ".lattice/ folder analysis",
      "Spec contract mapping",
      "Mutation history retrieval",
      "Git context correlation"
    ],
    color: "border-blue-500/20 bg-blue-500/5"
  },
  {
    number: "03",
    title: "Root Cause Analysis",
    description: "AI model analyzes error + context. Compares code implementation vs. spec contract. Identifies missing/incorrect implementations. Scores confidence in root cause.",
    icon: <Brain className="w-6 h-6 text-purple-400" />,
    details: [
      "AI-powered analysis",
      "Spec vs implementation comparison",
      "Confidence scoring",
      "Impact assessment"
    ],
    color: "border-purple-500/20 bg-purple-500/5"
  },
  {
    number: "04",
    title: "Safety Validation",
    description: "Checks error against configured safety rules. Determines if autonomous fix is allowed. Calculates risk score (0-10). Decides approval path: auto, review, or escalate.",
    icon: <Shield className="w-6 h-6 text-green-400" />,
    details: [
      "Safety rule validation",
      "Risk score calculation",
      "Approval path determination",
      "Autonomous vs human-in-loop"
    ],
    color: "border-green-500/20 bg-green-500/5"
  },
  {
    number: "05",
    title: "Fix Generation",
    description: "BugSage sends task to Lattice. Lattice assigns to appropriate coding agent. Agent generates code based on spec + diagnostic. Automated tests written alongside fix.",
    icon: <Code className="w-6 h-6 text-orange-400" />,
    details: [
      "Task assignment to Lattice",
      "Coding agent orchestration",
      "Spec-aware code generation",
      "Automated test creation"
    ],
    color: "border-orange-500/20 bg-orange-500/5"
  },
  {
    number: "06",
    title: "Deployment & Monitoring",
    description: "VSCode extension receives commit notification. Shows diff with diagnostic context. Auto-commits (if safety rules allow). Canary deployment to production.",
    icon: <Cloud className="w-6 h-6 text-cyan-400" />,
    details: [
      "VSCode Git integration",
      "Diff review with context",
      "Automated commits",
      "Canary deployment"
    ],
    color: "border-cyan-500/20 bg-cyan-500/5"
  }
];

const techStack = [
  {
    category: "Error Detection",
    items: [
      { name: "Sentry MCP Client", description: "Production error streaming" },
      { name: "VSCode Language Server", description: "Development error capture" },
      { name: "CI/CD Webhook Handler", description: "Testing integration" }
    ]
  },
  {
    category: "AI/ML Models",
    items: [
      { name: "Code Analysis", description: "Fine-tuned CodeBERT" },
      { name: "Root Cause", description: "GPT-4 with custom prompts" },
      { name: "Pattern Matching", description: "Custom similarity model" },
      { name: "Risk Scoring", description: "Trained on historical data" }
    ]
  },
  {
    category: "Parsers & Analyzers",
    items: [
      { name: "Multi-language", description: "Tree-sitter" },
      { name: "Spec parsing", description: "Custom YAML/JSON parser" },
      { name: "Stack trace", description: "Enhanced error-stack-parser" },
      { name: "Git analysis", description: "isomorphic-git" }
    ]
  },
  {
    category: "Storage",
    items: [
      { name: "Local", description: "SQLite (diagnostics cache)" },
      { name: "Cloud", description: "PostgreSQL (historical data)" },
      { name: "Files", description: "Cloudflare R2 (reports, diffs)" },
      { name: "Queue", description: "Redis (task distribution)" }
    ]
  }
];

const privacyFeatures = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Local-First Architecture",
    description: "Analysis runs on your machine by default. No code sent to cloud unless explicitly enabled."
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Zero Code Storage",
    description: "Only diagnostics metadata stored in cloud. Your source code never leaves your environment."
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "End-to-End Encryption",
    description: "Cloud sync uses E2E encryption. SOC 2 Type II compliance in progress."
  },
  {
    icon: <Server className="w-5 h-5" />,
    title: "Self-Hosted Option",
    description: "Enterprise plans include air-gapped deployment for maximum security."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <HowItWorksClient 
          stages={stages}
          techStack={techStack}
          privacyFeatures={privacyFeatures}
        />
      </main>
      
      <Footer />
    </div>
  );
}