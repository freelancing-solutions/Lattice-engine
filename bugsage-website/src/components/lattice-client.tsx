'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

interface FlowStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ComparisonRow {
  feature: string;
  without: string;
  with: string;
}

interface LatticeClientProps {
  flowSteps: FlowStep[];
  benefits: Benefit[];
  comparisonData: ComparisonRow[];
}

export function LatticeClient({ flowSteps, benefits, comparisonData }: LatticeClientProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              The Brain Behind Lattice's Autonomous Development
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              BugSage + Project Lattice =
              <span className="text-primary"> Self-Healing Codebases</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Experience the power of autonomous development. BugSage provides the diagnostic intelligence 
              that enables Project Lattice to automatically detect, analyze, and fix production errors.
            </p>
            
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/beta-signup">
                Get Started with Both
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What is Project Lattice */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  What is Project Lattice?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground text-lg">
                  Project Lattice is a spec-driven development platform that manages architecture as code. 
                  It provides version-controlled specifications with mutation tracking and orchestrates 
                  coding agents for automated development.
                </p>
                <Button variant="outline" asChild>
                  <Link href="https://project-lattice.site" target="_blank">
                    Learn more about Project Lattice
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* The Autonomous Loop */}
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
              The Autonomous Loop
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch how BugSage and Project Lattice work together to create a self-healing development cycle
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {flowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Arrow connectors */}
                  {index < flowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <motion.div
                        animate={{ x: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        <ArrowRight className="w-6 h-6 text-primary" />
                      </motion.div>
                    </div>
                  )}

                  <Card className={`h-full border-2 ${step.color} hover:shadow-lg transition-all duration-300`}>
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        {step.icon}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Mobile flow arrows */}
            <div className="lg:hidden flex justify-center mt-6 space-x-2">
              {flowSteps.map((_, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ArrowRight className="w-4 h-4 text-primary mx-2" />}
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              How BugSage Enhances Lattice
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              BugSage provides the diagnostic intelligence that makes Project Lattice truly autonomous
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-border hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
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
              Configuration Comparison
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See the dramatic difference BugSage + Lattice makes in your development workflow
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="border border-border">
              <CardContent className="p-0">
                <div className="grid grid-cols-3 bg-muted/50">
                  <div className="p-4 font-semibold text-foreground">Feature</div>
                  <div className="p-4 font-semibold text-foreground text-center">Without BugSage</div>
                  <div className="p-4 font-semibold text-primary text-center">With BugSage</div>
                </div>
                {comparisonData.map((row, index) => (
                  <motion.div
                    key={row.feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-3 border-t border-border"
                  >
                    <div className="p-4 text-foreground">{row.feature}</div>
                    <div className="p-4 text-muted-foreground text-center">{row.without}</div>
                    <div className="p-4 text-primary text-center font-semibold">{row.with}</div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready for Autonomous Development?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              Install BugSage + Project Lattice and experience self-healing code that evolves with your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/beta-signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/docs">
                  View Documentation
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}