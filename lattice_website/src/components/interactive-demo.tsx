"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, CheckCircle, AlertCircle, Clock } from "lucide-react"

const mutationBefore = `// User authentication module
export class Auth {
  private users: User[] = [];
  
  async login(email: string, password: string) {
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    if (user.password !== password) throw new Error('Invalid password');
    return user;
  }
}`

const mutationAfter = `// User authentication module with enhanced security
export class Auth {
  private users: User[] = [];
  
  async login(email: string, password: string) {
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    
    // Secure password verification
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) throw new Error('Invalid password');
    
    // Log security event
    await this.logSecurityEvent('login_attempt', { email, success: true });
    
    return user;
  }
  
  private async logSecurityEvent(event: string, data: any) {
    // Security logging implementation
  }
}`

const steps = [
  {
    title: "Propose Change",
    description: "Developer proposes a security enhancement to the authentication module",
    status: "completed",
    icon: CheckCircle
  },
  {
    title: "AI Analysis",
    description: "Lattice analyzes the change for security implications and compatibility",
    status: "completed", 
    icon: CheckCircle
  },
  {
    title: "Risk Assessment",
    description: "Automated risk assessment flags this as a low-risk, high-value change",
    status: "completed",
    icon: CheckCircle
  },
  {
    title: "Team Review",
    description: "Security team reviews and approves the proposed changes",
    status: "current",
    icon: Clock
  },
  {
    title: "Deploy",
    description: "Changes are automatically deployed to staging and then production",
    status: "pending",
    icon: ArrowRight
  }
]

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState("mutation")

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            See Lattice in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how Lattice transforms your development workflow from code changes to production deployment.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mutation">Mutation Flow</TabsTrigger>
                <TabsTrigger value="spec">Spec Management</TabsTrigger>
                <TabsTrigger value="approval">Approval Process</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mutation" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Security Enhancement
                      <Badge variant="secondary">Low Risk</Badge>
                    </CardTitle>
                    <CardDescription>
                      Enhance authentication with secure password hashing and security logging
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Before:</h4>
                        <pre className="bg-muted text-foreground p-3 rounded text-xs overflow-x-auto">
                          <code>{mutationBefore}</code>
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">After:</h4>
                        <pre className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-xs overflow-x-auto border border-green-200 dark:border-green-800 text-foreground">
                          <code>{mutationAfter}</code>
                        </pre>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">AI Analysis Complete</span>
                        </div>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Run Tests
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="spec" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Living Specification</CardTitle>
                    <CardDescription>
                      Real-time specification that evolves with your codebase
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-primary/10 p-4 rounded border border-primary/20">
                        <h4 className="font-semibold text-primary mb-2">Authentication Spec v2.1</h4>
                        <ul className="text-sm text-foreground space-y-1">
                          <li>• Passwords must be hashed using bcrypt</li>
                          <li>• All authentication events must be logged</li>
                          <li>• Rate limiting applies to login attempts</li>
                          <li>• Session timeout: 24 hours</li>
                        </ul>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last updated: 2 minutes ago</span>
                        <Badge variant="outline">In Sync</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="approval" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Approval Workflow</CardTitle>
                    <CardDescription>
                      Intelligent routing based on change type and risk assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Security Review Required</p>
                            <p className="text-xs text-muted-foreground">Assigned to: security-team@company.com</p>
                          </div>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Automated Tests Passed</p>
                            <p className="text-xs text-muted-foreground">15/15 tests successful</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                From Idea to Production in Minutes
              </h3>
              <p className="text-muted-foreground mb-6">
                Lattice streamlines your development workflow with intelligent automation and smart approvals.
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 mt-1">
                    {step.status === "completed" && (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                    {step.status === "current" && (
                      <Clock className="h-6 w-6 text-primary" />
                    )}
                    {step.status === "pending" && (
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="pt-6 border-t">
              <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">
                  🚀 80% Faster Deployment Cycle
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Teams using Lattice report an average 80% reduction in time from code commit to production deployment.
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Free Trial
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}