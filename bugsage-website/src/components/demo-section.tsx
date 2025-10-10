"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle, TrendingUp, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DemoSection() {
  const handlePlayClick = () => {
    toast.info("Demo video coming soon! Join our beta program to get early access.");
  };

  const demoSteps = [
    {
      icon: Target,
      title: "Real-time Error Detection",
      description: "BugSage automatically detects errors from Sentry and other monitoring tools in real-time.",
    },
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Our AI analyzes the error context, codebase, and specifications to understand the root cause.",
    },
    {
      icon: CheckCircle,
      title: "Automatic Fix Generation",
      description: "BugSage generates and tests fixes that respect your existing patterns and specifications.",
    },
    {
      icon: TrendingUp,
      title: "Deployment & Monitoring",
      description: "Fixed code is deployed to production with comprehensive monitoring and rollback capabilities.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4">Live Demo</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See BugSage Resolve Errors in 90 Seconds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how BugSage transforms a production error into a deployed fix without human intervention
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 items-center max-w-6xl mx-auto">
          {/* Video/Demo Placeholder */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden group cursor-pointer" onClick={handlePlayClick}>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />

                {/* Play Button Overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:bg-primary/90 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </motion.div>

                {/* Demo Labels */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white">Live Demo</Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="text-white bg-black/50 backdrop-blur-sm rounded px-3 py-1 text-sm">
                    <Clock className="w-4 h-4 inline mr-1" />
                    90 seconds
                  </div>
                </div>
              </div>
            </Card>

            {/* Alternative Links */}
            <div className="flex space-x-4 mt-6">
              <Button variant="outline" onClick={handlePlayClick}>
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
              <Button variant="outline" asChild>
                <a href="https://youtube.com" target="_blank">
                  Watch on YouTube
                </a>
              </Button>
            </div>
          </motion.div>

          {/* What You'll See */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-6">What You'll See</h3>
              <div className="space-y-4">
                {demoSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Try It Yourself</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join our beta program and experience autonomous debugging firsthand
                  </p>
                  <Button className="w-full" asChild>
                    <a href="/beta-signup">Join Beta Program</a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">4 minutes</div>
            <div className="text-sm text-muted-foreground">Average resolution time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Success rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-sm text-muted-foreground">Errors prevented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">90%</div>
            <div className="text-sm text-muted-foreground">Time saved</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}