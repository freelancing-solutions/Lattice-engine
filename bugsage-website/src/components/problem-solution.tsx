"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertTriangle, Users, Bot, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
    title: "Production Errors",
    description: "Critical bugs slip through testing, affecting users and damaging reputation. Manual debugging takes hours or days.",
    color: "border-red-500/20 bg-red-500/5"
  },
  {
    icon: <Users className="w-8 h-8 text-orange-400" />,
    title: "Manual Debugging",
    description: "Developers spend 30% of time debugging. Context switching between tools slows down resolution and increases errors.",
    color: "border-orange-500/20 bg-orange-500/5"
  },
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: "BugSage Solution",
    description: "AI-powered autonomous debugging detects, analyzes, and deploys fixes automatically—often before users notice.",
    color: "border-primary/20 bg-primary/5"
  }
];

export function ProblemSolution() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            From Problem to Autonomous Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stop firefighting production issues. Let BugSage handle error resolution while you focus on building features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.div>
                </div>
              )}

              <Card className={`h-full border-2 ${step.color} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-muted-foreground">Reduction in debugging time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">4min</div>
            <div className="text-muted-foreground">Average fix time vs 4 hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Autonomous monitoring</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}