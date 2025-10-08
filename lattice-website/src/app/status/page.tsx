"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, XCircle, Clock, Activity, Zap, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "System Status - Lattice Engine",
  description: "Real-time status monitoring for Lattice Engine services. Check system health, service availability, and incident reports for our AI-powered development platform.",
  keywords: [
    "system status",
    "service monitoring", 
    "uptime tracking",
    "incident reports",
    "service health",
    "system availability",
    "lattice engine status",
    "platform monitoring",
    "service dashboard",
    "system metrics"
  ],
  openGraph: {
    title: "System Status - Lattice Engine",
    description: "Real-time status monitoring for Lattice Engine services. Check system health, service availability, and incident reports.",
    url: "https://www.project-lattice.site/status",
    siteName: "Lattice Engine",
    images: [
      {
        url: "/og-status.png",
        width: 1200,
        height: 630,
        alt: "Lattice Engine System Status Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "System Status - Lattice Engine",
    description: "Real-time status monitoring for Lattice Engine services. Check system health, service availability, and incident reports.",
    images: ["/twitter-status.png"],
  },
  alternates: {
    canonical: "https://www.project-lattice.site/status",
  },
  robots: {
    index: true,
    follow: true,
  },
};
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "outage"
  responseTime: number
  uptime: number
  lastChecked: string
  description: string
}

interface SystemStatus {
  overall: "operational" | "degraded" | "outage"
  services: ServiceStatus[]
  incidents: Incident[]
  uptime: {
    last_24h: number
    last_7d: number
    last_30d: number
  }
}

interface Incident {
  id: string
  title: string
  status: "investigating" | "identified" | "monitoring" | "resolved"
  severity: "low" | "medium" | "high" | "critical"
  startTime: string
  endTime?: string
  description: string
}

export default function StatusPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    overall: "operational",
    services: [
      {
        name: "API Gateway",
        status: "operational",
        responseTime: 45,
        uptime: 99.9,
        lastChecked: "2 minutes ago",
        description: "Main API endpoint for all client requests"
      },
      {
        name: "Authentication Service",
        status: "operational",
        responseTime: 32,
        uptime: 99.8,
        lastChecked: "1 minute ago",
        description: "User authentication and authorization"
      },
      {
        name: "Mutation Engine",
        status: "operational",
        responseTime: 78,
        uptime: 99.7,
        lastChecked: "3 minutes ago",
        description: "Core mutation processing and approval workflows"
      },
      {
        name: "VSCode Extension Service",
        status: "operational",
        responseTime: 56,
        uptime: 99.9,
        lastChecked: "2 minutes ago",
        description: "VSCode extension backend services"
      },
      {
        name: "MCP Servers",
        status: "degraded",
        responseTime: 145,
        uptime: 98.5,
        lastChecked: "1 minute ago",
        description: "Model Context Protocol servers"
      },
      {
        name: "Database",
        status: "operational",
        responseTime: 12,
        uptime: 99.95,
        lastChecked: "30 seconds ago",
        description: "Primary database and replication"
      }
    ],
    incidents: [
      {
        id: "1",
        title: "MCP Server Performance Degradation",
        status: "monitoring",
        severity: "medium",
        startTime: "2024-01-15T14:30:00Z",
        description: "We're investigating increased response times for MCP server connections. Some users may experience slower performance."
      },
      {
        id: "2",
        title: "Scheduled Maintenance Complete",
        status: "resolved",
        severity: "low",
        startTime: "2024-01-14T02:00:00Z",
        endTime: "2024-01-14T04:00:00Z",
        description: "Database maintenance has been completed successfully. All services are operational."
      }
    ],
    uptime: {
      last_24h: 99.8,
      last_7d: 99.6,
      last_30d: 99.7
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500"
      case "degraded":
        return "bg-yellow-500"
      case "outage":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case "investigating":
        return "bg-blue-500"
      case "identified":
        return "bg-primary"
      case "monitoring":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getOverallStatus = () => {
    const hasOutage = systemStatus.services.some(s => s.status === "outage")
    const hasDegraded = systemStatus.services.some(s => s.status === "degraded")
    
    if (hasOutage) return "outage"
    if (hasDegraded) return "degraded"
    return "operational"
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              {getStatusIcon(overallStatus)}
              <h1 className="text-4xl font-bold text-foreground ml-3">
                System Status
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real-time status and performance metrics for all Lattice Engine services.
            </p>
          </motion.div>

          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(overallStatus)} mr-3`}></div>
                  <CardTitle className="text-2xl capitalize">
                    All Systems {overallStatus}
                  </CardTitle>
                </div>
                <CardDescription className="text-primary-foreground/90 text-lg">
                  {overallStatus === "operational" && "All services are functioning normally."}
                  {overallStatus === "degraded" && "Some services are experiencing degraded performance."}
                  {overallStatus === "outage" && "Some services are currently unavailable."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-400">{systemStatus.uptime.last_24h}%</div>
                    <div className="text-primary-foreground/80">Last 24 Hours</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">{systemStatus.uptime.last_7d}%</div>
                    <div className="text-primary-foreground/80">Last 7 Days</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">{systemStatus.uptime.last_30d}%</div>
                    <div className="text-primary-foreground/80">Last 30 Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Service Status</h2>
            <div className="grid gap-4">
              {systemStatus.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(service.status)}
                          <div>
                            <h3 className="font-semibold text-foreground">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={service.status === "operational" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {service.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {service.responseTime}ms response time
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                          <span>Uptime</span>
                          <span>{service.uptime}%</span>
                        </div>
                        <Progress value={service.uptime} className="h-2" />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Last checked: {service.lastChecked}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Incidents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Incidents</h2>
            <div className="space-y-4">
              {systemStatus.incidents.map((incident) => (
                <Card key={incident.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getIncidentStatusColor(incident.status)}`}></div>
                          <h3 className="font-semibold text-foreground">{incident.title}</h3>
                          <Badge variant="outline" className="capitalize">
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{incident.description}</p>
                        <div className="text-sm text-muted-foreground">
                          Started: {new Date(incident.startTime).toLocaleString()}
                          {incident.endTime && (
                            <> • Resolved: {new Date(incident.endTime).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="capitalize ml-4"
                      >
                        {incident.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Subscribe to Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Stay Informed</CardTitle>
                <CardDescription className="text-primary-foreground/90">
                  Get notified about service status and incidents
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="px-4 py-2 rounded-lg text-foreground bg-background/10 backdrop-blur-sm border border-primary-foreground/20 placeholder:text-primary-foreground/60 flex-1 max-w-xs"
                    />
                    <button className="bg-primary-foreground text-primary px-6 py-2 rounded-lg hover:bg-primary-foreground/90 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-center space-x-6">
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    RSS Feed
                  </a>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    Webhook
                  </a>
                  <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    API Access
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}