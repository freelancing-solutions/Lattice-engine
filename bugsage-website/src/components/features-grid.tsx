"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Bot, 
  RefreshCw, 
  Brain, 
  FileText, 
  Shield, 
  Link2, 
  Code, 
  BarChart3 
} from "lucide-react";

const features = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Autonomous Error Resolution",
    description: "From production alert to deployed fix without human intervention. Bugsage detects errors via Sentry MCP, analyzes root cause, generates fixes through coding agents, and deploys—all within your safety rules."
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Production Monitoring (Sentry MCP)",
    description: "Real-time error streaming from Sentry. Automatic correlation with spec versions, recent deployments, and historical patterns. Intelligent severity classification and routing."
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Coding Agent Orchestration",
    description: "Task assignment to specialized AI coding agents via Project Lattice. Agents receive full diagnostic context, spec definitions, and safety constraints to generate validated fixes."
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Spec Mutation Engine",
    description: "When errors reveal gaps in your specifications, Bugsage recommends new specs or mutations to existing ones. Integrates with Lattice's approval workflow for seamless spec evolution."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Configurable Safety Rules",
    description: "Define autonomous fix thresholds, human-in-loop triggers, and deployment gates through the Bugsage dashboard. Control exactly which errors can be auto-fixed and which require review."
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: "Deep Lattice Integration",
    description: "Built specifically for Project Lattice's spec-driven workflow. Reads from `.lattice/` folders, writes diagnostics back, and participates in the mutation approval process."
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "VSCode Git Automation",
    description: "Coding agent fixes appear as commits in VSCode. Review diffs with diagnostic context, approve with one click, or let autonomous mode handle it based on your rules."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Historical Pattern Learning",
    description: "Every resolved error trains the diagnostic engine. Bugsage learns your codebase patterns, common fix strategies, and team preferences to provide increasingly accurate solutions."
  }
];

export function FeaturesGrid() {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Key Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for autonomous debugging and error resolution in your spec-driven development workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}