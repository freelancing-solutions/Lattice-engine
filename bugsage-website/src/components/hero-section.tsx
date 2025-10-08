"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle, AlertCircle, GitBranch } from "lucide-react";

interface CodePanel {
  title: string;
  icon: React.ReactNode;
  content: string[];
  isActive: boolean;
  color: string;
}

export function HeroSection() {
  const [activePanel, setActivePanel] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const panels: CodePanel[] = [
    {
      title: "Sentry Alert",
      icon: <AlertCircle className="w-4 h-4" />,
      content: [
        "🚨 Production Error (247 occurrences)",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "❌ TypeError: Cannot read property",
        "   'refresh_token' of undefined",
        "",
        "📍 auth/oauth.ts:42",
        "👤 Affecting 15% of users",
        "⏰ Last 30 minutes"
      ],
      isActive: activePanel === 0,
      color: "text-red-400"
    },
    {
      title: "BugSage Analysis",
      icon: <CheckCircle className="w-4 h-4" />,
      content: [
        "🧠 Autonomous Analysis Started",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "✓ Root cause identified (0.8s)",
        "✓ Spec impact analyzed (1.2s)",
        "✓ Safety rules validated (0.3s)",
        "",
        "📋 Missing: OAuth2 refresh token",
        "   rotation in user-auth spec",
        "",
        "🤖 Assigning to coding agent..."
      ],
      isActive: activePanel === 1,
      color: "text-green-400"
    },
    {
      title: "Fix Deployed",
      icon: <GitBranch className="w-4 h-4" />,
      content: [
        "✅ Fix Deployed to Production",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "📝 Spec created:",
        "   oauth-refresh-token-rotation v1.0",
        "",
        "💻 Code updated:",
        "   + auth/oauth.ts (12 lines)",
        "   + auth/session.ts (5 lines)",
        "   + tests/oauth.test.ts (new)",
        "",
        "🚀 Deployed via canary (10%)",
        "   Error rate: 247 → 0",
        "",
        "⏱️ Total time: 4 minutes"
      ],
      isActive: activePanel === 2,
      color: "text-blue-400"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePanel((prev) => (prev + 1) % panels.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary/10 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Integrated with Project Lattice
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Fix Production Errors
              <span className="text-primary"> Autonomously</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              AI-powered debugging that detects, diagnoses, and deploys fixes—automatically. 
              Integrated with Project Lattice and Sentry for end-to-end error resolution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/beta-signup">
                  Join Beta Program
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="#demo">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Animated Code Example */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Live Demo
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {panels.map((panel, index) => (
                  <motion.div
                    key={panel.title}
                    initial={{ opacity: 0, x: index === 0 ? -20 : index === 2 ? 20 : 0 }}
                    animate={{ 
                      opacity: panel.isActive ? 1 : 0.6,
                      x: 0,
                      scale: panel.isActive ? 1.02 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className={`relative ${panel.isActive ? 'z-10' : 'z-0'}`}
                  >
                    <div className={`bg-muted border rounded-lg p-4 transition-all duration-300 ${
                      panel.isActive 
                        ? 'border-primary shadow-lg shadow-primary/20' 
                        : 'border-border opacity-60'
                    }`}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={panel.color}>{panel.icon}</span>
                        <span className="text-sm font-medium text-foreground">
                          {panel.title}
                        </span>
                      </div>
                      
                      <div className="font-mono text-xs text-muted-foreground space-y-1">
                        {panel.content.map((line, lineIndex) => (
                          <motion.div
                            key={lineIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lineIndex * 0.05 }}
                            className={line.startsWith('✓') ? 'text-green-400' : 
                                       line.startsWith('❌') ? 'text-red-400' :
                                       line.startsWith('✅') ? 'text-green-400' :
                                       line.startsWith('🚨') ? 'text-red-400' :
                                       line.startsWith('🧠') ? 'text-blue-400' :
                                       line.startsWith('🤖') ? 'text-purple-400' :
                                       line.startsWith('🚀') ? 'text-green-400' :
                                       line.startsWith('📝') ? 'text-yellow-400' :
                                       line.startsWith('💻') ? 'text-blue-400' :
                                       line.startsWith('📋') ? 'text-yellow-400' :
                                       line.startsWith('📍') ? 'text-orange-400' :
                                       line.startsWith('👤') ? 'text-purple-400' :
                                       line.startsWith('⏰') ? 'text-orange-400' :
                                       line.startsWith('⏱️') ? 'text-blue-400' : ''}
                          >
                            {line}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Arrow indicators */}
                    {index < panels.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
                        >
                          <ArrowRight className="w-6 h-6 text-primary" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {panels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePanel(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activePanel 
                        ? 'bg-primary w-8' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground text-sm">
              Integrated with Project Lattice • 10,000+ diagnostics run • Trusted by development teams worldwide
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}