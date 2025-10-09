import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FeaturesClient } from "@/components/features-client";
import { Bot, RefreshCw, Brain, FileText, Shield, Link2, Code, BarChart3 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features - BugSage AI-Powered Debugging",
  description: "Discover BugSage's powerful features: autonomous error resolution, Sentry MCP integration, coding agent orchestration, spec mutation engine, and deep Project Lattice integration.",
  keywords: ["BugSage features", "autonomous debugging", "AI error resolution", "Sentry integration", "Project Lattice", "coding agents", "spec mutations"],
  openGraph: {
    title: "BugSage Features - AI-Powered Debugging",
    description: "Explore comprehensive features designed for modern development workflows and spec-driven debugging.",
    url: "https://bugsage.site/features",
  },
};

const features = [
  {
    icon: <Bot className="w-8 h-8" />,
    title: "Autonomous Error Resolution",
    description: "From production alert to deployed fix without human intervention. Bugsage detects errors via Sentry MCP, analyzes root cause, generates fixes through coding agents, and deploys—all within your safety rules.",
    details: [
      "Real-time error detection from Sentry",
      "AI-powered root cause analysis",
      "Automated fix generation",
      "Safety rule validation",
      "Autonomous deployment"
    ],
    color: "text-blue-400"
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: "Production Monitoring (Sentry MCP)",
    description: "Real-time error streaming from Sentry. Automatic correlation with spec versions, recent deployments, and historical patterns. Intelligent severity classification and routing.",
    details: [
      "Sentry MCP integration",
      "Real-time error streaming",
      "Spec version correlation",
      "Deployment impact analysis",
      "Intelligent severity classification"
    ],
    color: "text-green-400"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Coding Agent Orchestration",
    description: "Task assignment to specialized AI coding agents via Project Lattice. Agents receive full diagnostic context, spec definitions, and safety constraints to generate validated fixes.",
    details: [
      "Specialized AI agents",
      "Full diagnostic context",
      "Spec-aware code generation",
      "Safety constraint validation",
      "Automated testing"
    ],
    color: "text-purple-400"
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: "Spec Mutation Engine",
    description: "When errors reveal gaps in your specifications, Bugsage recommends new specs or mutations to existing ones. Integrates with Lattice's approval workflow for seamless spec evolution.",
    details: [
      "Gap detection in specs",
      "Automated spec recommendations",
      "Lattice approval workflow",
      "Version-controlled mutations",
      "Impact analysis"
    ],
    color: "text-yellow-400"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Configurable Safety Rules",
    description: "Define autonomous fix thresholds, human-in-loop triggers, and deployment gates through the Bugsage dashboard. Control exactly which errors can be auto-fixed and which require review.",
    details: [
      "Risk score thresholds",
      "File modification limits",
      "Human-in-loop triggers",
      "Deployment gates",
      "Environment restrictions"
    ],
    color: "text-red-400"
  },
  {
    icon: <Link2 className="w-8 h-8" />,
    title: "Deep Lattice Integration",
    description: "Built specifically for Project Lattice's spec-driven workflow. Reads from `.lattice/` folders, writes diagnostics back, and participates in the mutation approval process.",
    details: [
      ".lattice/ folder support",
      "Diagnostic report generation",
      "Mutation participation",
      "Approval workflow integration",
      "Bidirectional sync"
    ],
    color: "text-cyan-400"
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "VSCode Git Automation",
    description: "Coding agent fixes appear as commits in VSCode. Review diffs with diagnostic context, approve with one click, or let autonomous mode handle it based on your rules.",
    details: [
      "VSCode extension integration",
      "Git commit automation",
      "Diff review with context",
      "One-click approval",
      "Auto-commit rules"
    ],
    color: "text-orange-400"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Historical Pattern Learning",
    description: "Every resolved error trains the diagnostic engine. Bugsage learns your codebase patterns, common fix strategies, and team preferences to provide increasingly accurate solutions.",
    details: [
      "Pattern recognition",
      "Fix strategy learning",
      "Team preference adaptation",
      "Accuracy improvement",
      "Knowledge base growth"
    ],
    color: "text-pink-400"
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <FeaturesClient features={features} />
      </main>
      
      <Footer />
    </div>
  );
}