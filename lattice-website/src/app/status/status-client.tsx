"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, XCircle, Clock, Activity, Zap, Database } from "lucide-react"

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

export default function StatusClient() {
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
        uptime: 99.95,
        lastChecked: "1 minute ago",
        description: "User authentication and authorization"
      },
      {
        name: "AI Processing Engine",
        status: "operational",
        responseTime: 156,
        uptime: 99.8,
        lastChecked: "3 minutes ago",
        description: "Core AI model inference and processing"
      },
      {
        name: "Database Cluster",
        status: "operational",
        responseTime: 28,
        uptime: 99.99,
        lastChecked: "1 minute ago",
        description: "Primary database and read replicas"
      },
      {
        name: "File Storage",
        status: "operational",
        responseTime: 67,
        uptime: 99.7,
        lastChecked: "2 minutes ago",
        description: "Object storage for user files and assets"
      },
      {
        name: "WebSocket Service",
        status: "operational",
        responseTime: 23,
        uptime: 99.85,
        lastChecked: "1 minute ago",
        description: "Real-time communication and notifications"
      }
    ],
    incidents: [],
    uptime: {
      last_24h: 99.9,
      last_7d: 99.8,
      last_30d: 99.7
    }
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600 bg-green-50 border-green-200"
      case "degraded":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "outage":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4" />
      case "degraded":
        return <AlertCircle className="h-4 w-4" />
      case "outage":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getOverallStatusMessage = () => {
    switch (systemStatus.overall) {
      case "operational":
        return "All systems operational"
      case "degraded":
        return "Some systems experiencing issues"
      case "outage":
        return "Major service disruption"
      default:
        return "Status unknown"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading system status...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              System
              <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent"> Status</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Real-time monitoring of all Lattice Engine services and infrastructure components. 
              Track uptime, performance metrics, and incident reports.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Badge variant="secondary" className={systemStatus.overall === "operational" ? "bg-green-600 text-white" : systemStatus.overall === "degraded" ? "bg-yellow-600 text-white" : "bg-red-600 text-white"}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(systemStatus.overall)}
                  <span>{getOverallStatusMessage()}</span>
                </div>
              </Badge>
              <Badge variant="secondary" className="bg-blue-600 text-white">99.9% Uptime</Badge>
              <Badge variant="secondary" className="bg-primary text-primary-foreground">6 Services Monitored</Badge>
              <Badge variant="secondary" className="bg-orange-600 text-white">Real-time Updates</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overall Uptime Stats */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Uptime Overview
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform maintains industry-leading uptime across all services and regions.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">24 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStatus.uptime.last_24h}%</div>
                <Progress value={systemStatus.uptime.last_24h} className="mt-2" />
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStatus.uptime.last_7d}%</div>
                <Progress value={systemStatus.uptime.last_7d} className="mt-2" />
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStatus.uptime.last_30d}%</div>
                <Progress value={systemStatus.uptime.last_30d} className="mt-2" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Service Status
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Detailed status and performance metrics for all core platform services.
            </p>
          </motion.div>

          <div className="space-y-4">
            {systemStatus.services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {service.name === "API Gateway" && <Zap className="h-5 w-5 text-muted-foreground" />}
                          {service.name === "Authentication Service" && <CheckCircle className="h-5 w-5 text-muted-foreground" />}
                          {service.name === "AI Processing Engine" && <Activity className="h-5 w-5 text-muted-foreground" />}
                          {service.name === "Database Cluster" && <Database className="h-5 w-5 text-muted-foreground" />}
                          {service.name === "File Storage" && <Database className="h-5 w-5 text-muted-foreground" />}
                          {service.name === "WebSocket Service" && <Activity className="h-5 w-5 text-muted-foreground" />}
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Response Time</div>
                          <div className="font-semibold">{service.responseTime}ms</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Uptime</div>
                          <div className="font-semibold">{service.uptime}%</div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(service.status)}
                            <span className="capitalize">{service.status}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Last checked: {service.lastChecked}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Incidents */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Recent Incidents
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track past incidents and their resolution status.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {systemStatus.incidents.length === 0 ? (
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recent Incidents</h3>
                  <p className="text-muted-foreground">
                    All systems have been running smoothly. No incidents reported in the last 30 days.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {systemStatus.incidents.map((incident) => (
                  <Card key={incident.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{incident.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={incident.severity === "critical" ? "destructive" : "secondary"}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        Started: {incident.startTime}
                        {incident.endTime && ` • Resolved: ${incident.endTime}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{incident.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  )
}