'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
}

interface FeaturesClientProps {
  features: Feature[];
}

export function FeaturesClient({ features }: FeaturesClientProps) {
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
              Built for Spec-Driven Development
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Features Designed for
              <span className="text-primary"> Modern Development</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Every feature designed around your .lattice/ workflow. From autonomous error resolution 
              to seamless spec evolution, BugSage enhances every aspect of your development process.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-card">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 ${feature.color} flex-shrink-0`}>
                        {feature.icon}
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {feature.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        
                        <div className="space-y-2">
                          {feature.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Ready to Transform Your Debugging Workflow?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              Join developers who are already using BugSage to fix errors autonomously and focus on building features that matter.
            </p>
            
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/beta-signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}