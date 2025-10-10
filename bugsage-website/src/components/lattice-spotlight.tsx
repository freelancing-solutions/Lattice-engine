"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, Shield, ArrowRight, AlertTriangle, Code, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const autonomousSteps = [
  {
    icon: AlertTriangle,
    title: "Production Error",
    description: "Sentry detects error in production environment",
    color: "from-red-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "BugSage Analysis",
    description: "AI analyzes error context and root cause",
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: GitBranch,
    title: "Lattice Orchestration",
    description: "Project Lattice creates spec mutation task",
    color: "from-green-500 to-teal-600",
  },
  {
    icon: Code,
    title: "Coding Agent Fix",
    description: "AI agent generates and tests solution",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: CheckCircle,
    title: "Deployment & Monitoring",
    description: "Fix deployed with comprehensive monitoring",
    color: "from-cyan-500 to-blue-600",
  },
];

const benefits = [
  {
    title: "Error-Driven Spec Evolution",
    description: "Production errors automatically improve your specifications over time",
    icon: Zap,
  },
  {
    title: "Intelligent Task Assignment",
    description: "Lattice assigns debugging tasks to the most appropriate AI agents",
    icon: GitBranch,
  },
  {
    title: "Production Feedback Loop",
    description: "Real-world usage continuously improves system reliability",
    icon: ArrowRight,
  },
  {
    title: "Spec-Aware Code Generation",
    description: "All fixes respect existing specifications and patterns",
    icon: Shield,
  },
  {
    title: "Mutation Approval Workflow",
    description: "Human oversight with configurable automation levels",
    icon: CheckCircle,
  },
  {
    title: "Safety Rule Enforcement",
    description: "Comprehensive safety checks prevent harmful changes",
    icon: Shield,
  },
];

export default function LatticeSpotlight() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4">Integration Spotlight</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Brain Behind Lattice's Autonomous Development
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            BugSage integrates seamlessly with Project Lattice to create a complete autonomous
            development pipeline that learns from production errors and continuously improves.
          </p>
        </motion.div>

        {/* Autonomous Loop Diagram */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="max-w-5xl mx-auto">
            {/* Desktop - Circular Layout */}
            <div className="hidden lg:block">
              <div className="relative h-96">
                {autonomousSteps.map((step, index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const radius = 150;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={step.title}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${x}px - 120px)`,
                        top: `calc(50% + ${y}px - 60px)`,
                        width: "240px",
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-3`}>
                            <step.icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </CardContent>
                      </Card>

                      {/* Animated Arrow */}
                      {index < autonomousSteps.length - 1 && (
                        <motion.div
                          className="absolute"
                          style={{
                            left: "120px",
                            top: "60px",
                            width: "60px",
                            height: "2px",
                            transform: `rotate(${(index + 1) * 72}deg)`,
                            transformOrigin: "0 0",
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-r from-primary/50 to-primary relative">
                            <motion.div
                              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
                              animate={{
                                x: [0, 40],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.4,
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Center Circle */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg text-center shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  Autonomous Loop
                </motion.div>
              </div>
            </div>

            {/* Mobile/Tablet - Vertical Flow */}
            <div className="lg:hidden space-y-4">
              {autonomousSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {index < autonomousSteps.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Two Column Benefits */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 max-w-6xl mx-auto">
          {/* How BugSage Enhances Lattice */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-6">How BugSage Enhances Lattice</h3>
            <div className="space-y-4">
              {benefits.slice(0, 3).map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How Lattice Enhances BugSage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-6">How Lattice Enhances BugSage</h3>
            <div className="space-y-4">
              {benefits.slice(3, 6).map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Code Example */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Lattice Integration</h3>
                <Badge variant="secondary">.lattice/</Badge>
              </div>
              <div className="bg-background rounded-lg p-4 font-mono text-sm">
                <div className="text-muted-foreground"># Lattice spec with BugSage integration</div>
                <div className="text-blue-600">spec:</div>
                <div className="ml-4">name: "user-authentication"</div>
                <div className="ml-4">version: "1.2.0"</div>
                <div className="text-blue-600 mt-2">bugsage:</div>
                <div className="ml-4">auto_fix: true</div>
                <div className="ml-4">confidence_threshold: 0.95</div>
                <div className="ml-4">human_review: critical_changes</div>
                <div className="text-green-600 mt-2"># BugSage will auto-fix any errors</div>
                <div className="text-green-600"># that match this specification</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-12 text-center">
              <GitBranch className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Learn More About Lattice Integration
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover how BugSage and Project Lattice work together to create a truly
                autonomous development pipeline that continuously improves itself.
              </p>
              <Button size="lg" asChild>
                <a href="/lattice-integration">
                  Explore Integration
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}