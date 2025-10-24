"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Workflow,
  GitBranch,
  Layers,
  Clock,
  ArrowRight,
  Code,
  Settings,
  Play,
  Download,
  ExternalLink,
  Eye,
  RefreshCw,
  Network,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  Filter,
  Bell,
  Database,
  Server,
  Globe,
  Wifi,
  MessageSquare,
  Radio,
  Target,
  Users,
  Lock,
  Cpu,
  HardDrive,
  Zap,
  Activity,
  FileText,
  Folder,
  GitMerge,
  Timer,
  Repeat,
  Pause,
  FastForward,
  Rewind,
  SkipForward
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

const workflowPatterns = [
  {
    title: "Multi-Stage Approval Workflow",
    description: "Implement complex approval chains with conditional logic and parallel processing",
    icon: GitBranch,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    complexity: "Advanced",
    duration: "45 min",
    features: [
      "Sequential approval stages",
      "Parallel approval paths",
      "Conditional routing",
      "Escalation policies",
      "Timeout handling",
      "Rollback mechanisms"
    ]
  },
  {
    title: "Event-Driven Automation",
    description: "Build reactive workflows that respond to system events and external triggers",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    complexity: "Expert",
    duration: "60 min",
    features: [
      "Event-driven triggers",
      "Real-time processing",
      "State machines",
      "Error recovery",
      "Circuit breakers",
      "Monitoring & alerts"
    ]
  },
  {
    title: "Batch Processing Pipeline",
    description: "Process large datasets with parallel execution and resource optimization",
    icon: Layers,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    complexity: "Advanced",
    duration: "50 min",
    features: [
      "Batch job scheduling",
      "Parallel processing",
      "Resource management",
      "Progress tracking",
      "Failure recovery",
      "Performance optimization"
    ]
  },
  {
    title: "Cross-Service Orchestration",
    description: "Coordinate complex workflows across multiple services and systems",
    icon: Network,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    complexity: "Expert",
    duration: "75 min",
    features: [
      "Service coordination",
      "Distributed transactions",
      "Saga patterns",
      "Compensation logic",
      "Service discovery",
      "Health monitoring"
    ]
  }
]

const workflowSteps = [
  {
    step: 1,
    title: "Design Workflow Architecture",
    description: "Plan your workflow structure and identify key components",
    tasks: [
      "Define workflow objectives and requirements",
      "Identify input/output data structures",
      "Map out decision points and branches",
      "Plan error handling strategies",
      "Design monitoring and logging"
    ]
  },
  {
    step: 2,
    title: "Implement Core Logic",
    description: "Build the main workflow logic with proper abstractions",
    tasks: [
      "Create workflow specification",
      "Implement business logic functions",
      "Add validation and error handling",
      "Set up state management",
      "Configure retry mechanisms"
    ]
  },
  {
    step: 3,
    title: "Add Advanced Features",
    description: "Enhance your workflow with advanced capabilities",
    tasks: [
      "Implement conditional routing",
      "Add parallel execution paths",
      "Set up event-driven triggers",
      "Configure timeout handling",
      "Add monitoring and metrics"
    ]
  },
  {
    step: 4,
    title: "Test & Optimize",
    description: "Thoroughly test and optimize workflow performance",
    tasks: [
      "Write comprehensive tests",
      "Perform load testing",
      "Optimize resource usage",
      "Validate error scenarios",
      "Document workflow behavior"
    ]
  }
]

const advancedExamples = [
  {
    title: "Multi-Stage Approval Workflow",
    description: "Complex approval workflow with parallel paths and escalation",
    language: "JavaScript",
    code: `// Advanced Multi-Stage Approval Workflow
import { LatticeEngine, WorkflowBuilder, ApprovalStage } from '@lattice-engine/core';

class MultiStageApprovalWorkflow {
  constructor(config) {
    this.engine = new LatticeEngine(config);
    this.workflow = new WorkflowBuilder('multi-stage-approval');
    this.setupWorkflow();
  }

  setupWorkflow() {
    this.workflow
      .start('document-submission')
      .then('initial-validation', {
        handler: this.validateDocument,
        timeout: '5m',
        retries: 3
      })
      .branch('approval-routing', {
        conditions: [
          {
            condition: 'document.value > 10000',
            path: 'high-value-approval'
          },
          {
            condition: 'document.type === "contract"',
            path: 'legal-approval'
          },
          {
            default: true,
            path: 'standard-approval'
          }
        ]
      })
      
      // High-value approval path (parallel approvals)
      .path('high-value-approval')
      .parallel('executive-approvals', [
        {
          stage: 'cfo-approval',
          handler: this.requestCFOApproval,
          timeout: '24h',
          escalation: {
            after: '12h',
            to: 'ceo-approval'
          }
        },
        {
          stage: 'legal-approval',
          handler: this.requestLegalApproval,
          timeout: '48h',
          escalation: {
            after: '24h',
            to: 'senior-legal-approval'
          }
        }
      ])
      .then('final-executive-review', {
        handler: this.executiveReview,
        requiresAll: true
      })
      
      // Legal approval path
      .path('legal-approval')
      .then('legal-review', {
        handler: this.legalReview,
        timeout: '72h'
      })
      .conditional('compliance-check', {
        condition: 'document.requiresCompliance',
        then: 'compliance-approval',
        else: 'legal-sign-off'
      })
      
      // Standard approval path
      .path('standard-approval')
      .then('manager-approval', {
        handler: this.managerApproval,
        timeout: '24h',
        escalation: {
          after: '12h',
          to: 'director-approval'
        }
      })
      
      // Convergence point
      .converge('final-processing')
      .then('document-finalization', {
        handler: this.finalizeDocument
      })
      .then('notification-dispatch', {
        handler: this.sendNotifications
      })
      .end('workflow-complete');

    // Add error handling
    this.workflow.onError('validation-failed', {
      handler: this.handleValidationError,
      retry: false,
      notify: ['submitter', 'admin']
    });

    this.workflow.onError('approval-timeout', {
      handler: this.handleApprovalTimeout,
      escalate: true,
      notify: ['manager', 'admin']
    });
  }

  async validateDocument(context) {
    const { document } = context.input;
    
    // Perform document validation
    const validationRules = [
      { field: 'title', required: true, minLength: 5 },
      { field: 'content', required: true, minLength: 100 },
      { field: 'submitter', required: true, type: 'email' },
      { field: 'department', required: true, enum: ['finance', 'legal', 'hr', 'it'] }
    ];

    const errors = [];
    for (const rule of validationRules) {
      const value = document[rule.field];
      
      if (rule.required && !value) {
        errors.push(\`\${rule.field} is required\`);
      }
      
      if (rule.minLength && value && value.length < rule.minLength) {
        errors.push(\`\${rule.field} must be at least \${rule.minLength} characters\`);
      }
      
      if (rule.type === 'email' && value && !this.isValidEmail(value)) {
        errors.push(\`\${rule.field} must be a valid email address\`);
      }
      
      if (rule.enum && value && !rule.enum.includes(value)) {
        errors.push(\`\${rule.field} must be one of: \${rule.enum.join(', ')}\`);
      }
    }

    if (errors.length > 0) {
      throw new Error(\`Validation failed: \${errors.join(', ')}\`);
    }

    // Add metadata for routing decisions
    return {
      ...document,
      validatedAt: new Date().toISOString(),
      value: this.calculateDocumentValue(document),
      riskLevel: this.assessRiskLevel(document)
    };
  }

  async requestCFOApproval(context) {
    const { document } = context.input;
    
    // Send approval request to CFO
    const approvalRequest = await this.engine.createApproval({
      type: 'cfo-approval',
      documentId: document.id,
      approver: 'cfo@company.com',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      metadata: {
        value: document.value,
        department: document.department,
        submitter: document.submitter
      }
    });

    // Wait for approval with timeout
    const approval = await this.engine.waitForApproval(approvalRequest.id, {
      timeout: '24h',
      pollInterval: '5m'
    });

    if (approval.status === 'rejected') {
      throw new Error(\`CFO rejected the document: \${approval.reason}\`);
    }

    return {
      approved: true,
      approver: approval.approver,
      approvedAt: approval.approvedAt,
      comments: approval.comments
    };
  }

  async executiveReview(context) {
    const { cfoApproval, legalApproval } = context.input;
    
    // Both approvals are required for executive review
    if (!cfoApproval.approved || !legalApproval.approved) {
      throw new Error('Both CFO and Legal approval are required');
    }

    // Perform final executive review
    const reviewResult = await this.performExecutiveReview({
      cfoApproval,
      legalApproval,
      document: context.input.document
    });

    return {
      executiveReviewComplete: true,
      finalApproval: reviewResult.approved,
      reviewComments: reviewResult.comments,
      reviewedBy: reviewResult.reviewer
    };
  }

  async handleApprovalTimeout(context, error) {
    const { stage, document } = context;
    
    // Log timeout event
    await this.engine.logEvent('approval-timeout', {
      stage,
      documentId: document.id,
      timeoutDuration: context.timeout,
      escalationRequired: true
    });

    // Send escalation notifications
    await this.sendEscalationNotifications(stage, document);

    // Create escalated approval request
    const escalatedApproval = await this.createEscalatedApproval(stage, document);
    
    return {
      escalated: true,
      newApprovalId: escalatedApproval.id,
      escalatedTo: escalatedApproval.approver
    };
  }

  async start(documentData) {
    try {
      const result = await this.workflow.execute({
        document: documentData,
        startedAt: new Date().toISOString(),
        workflowId: this.generateWorkflowId()
      });

      return {
        success: true,
        workflowId: result.workflowId,
        status: result.status,
        completedAt: result.completedAt
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        workflowId: error.workflowId
      };
    }
  }
}

// Usage example
const approvalWorkflow = new MultiStageApprovalWorkflow({
  apiKey: process.env.LATTICE_API_KEY,
  projectId: 'proj_approval_system'
});

// Start workflow with document
const result = await approvalWorkflow.start({
  title: 'Software License Agreement',
  content: 'Detailed contract content...',
  submitter: 'john.doe@company.com',
  department: 'legal',
  value: 50000,
  type: 'contract'
});`,
    features: [
      "Multi-path routing",
      "Parallel approvals",
      "Timeout handling",
      "Escalation policies",
      "Error recovery",
      "State management"
    ]
  },
  {
    title: "Event-Driven Automation",
    description: "Reactive workflow system that responds to events",
    language: "TypeScript",
    code: `// Event-Driven Automation Workflow
import { 
  LatticeEngine, 
  EventDrivenWorkflow, 
  EventTrigger, 
  StateManager,
  CircuitBreaker 
} from '@lattice-engine/core';

interface SystemEvent {
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowState {
  activeIncidents: Map<string, any>;
  systemHealth: Record<string, any>;
  alertThresholds: Record<string, number>;
  maintenanceMode: boolean;
}

class EventDrivenAutomationWorkflow {
  private engine: LatticeEngine;
  private workflow: EventDrivenWorkflow;
  private stateManager: StateManager<WorkflowState>;
  private circuitBreaker: CircuitBreaker;

  constructor(config: any) {
    this.engine = new LatticeEngine(config);
    this.workflow = new EventDrivenWorkflow('event-automation');
    this.stateManager = new StateManager<WorkflowState>({
      activeIncidents: new Map(),
      systemHealth: {},
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        errorRate: 5
      },
      maintenanceMode: false
    });
    
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 60000
    });

    this.setupEventTriggers();
    this.setupWorkflowHandlers();
  }

  private setupEventTriggers(): void {
    // System health monitoring
    this.workflow.onEvent('system.health.*', {
      handler: this.handleHealthEvent,
      filter: {
        severity: ['medium', 'high', 'critical']
      },
      rateLimit: {
        maxEvents: 100,
        windowMs: 60000
      }
    });

    // Error rate monitoring
    this.workflow.onEvent('application.error', {
      handler: this.handleErrorEvent,
      aggregation: {
        window: '5m',
        groupBy: ['service', 'errorType'],
        threshold: 10
      }
    });

    // Performance degradation
    this.workflow.onEvent('performance.degradation', {
      handler: this.handlePerformanceDegradation,
      debounce: '30s' // Prevent spam
    });

    // Security events
    this.workflow.onEvent('security.*', {
      handler: this.handleSecurityEvent,
      priority: 'high',
      immediate: true
    });

    // Deployment events
    this.workflow.onEvent('deployment.*', {
      handler: this.handleDeploymentEvent,
      conditions: [
        {
          event: 'deployment.started',
          action: 'enableMaintenanceMode'
        },
        {
          event: 'deployment.completed',
          action: 'disableMaintenanceMode'
        },
        {
          event: 'deployment.failed',
          action: 'rollbackDeployment'
        }
      ]
    });
  }

  private setupWorkflowHandlers(): void {
    // Incident management workflow
    this.workflow.defineWorkflow('incident-management', {
      trigger: 'incident.created',
      steps: [
        {
          name: 'assess-severity',
          handler: this.assessIncidentSeverity,
          timeout: '2m'
        },
        {
          name: 'auto-remediation',
          handler: this.attemptAutoRemediation,
          condition: 'severity <= medium',
          timeout: '10m',
          retries: 3
        },
        {
          name: 'escalate-incident',
          handler: this.escalateIncident,
          condition: 'severity > medium || autoRemediationFailed',
          timeout: '5m'
        },
        {
          name: 'monitor-resolution',
          handler: this.monitorResolution,
          timeout: '60m',
          polling: '30s'
        }
      ]
    });

    // Auto-scaling workflow
    this.workflow.defineWorkflow('auto-scaling', {
      trigger: 'resource.threshold.exceeded',
      steps: [
        {
          name: 'analyze-metrics',
          handler: this.analyzeResourceMetrics,
          timeout: '1m'
        },
        {
          name: 'calculate-scaling',
          handler: this.calculateScalingRequirements,
          timeout: '30s'
        },
        {
          name: 'execute-scaling',
          handler: this.executeScaling,
          timeout: '5m',
          circuitBreaker: this.circuitBreaker
        },
        {
          name: 'verify-scaling',
          handler: this.verifyScalingSuccess,
          timeout: '10m',
          retries: 3
        }
      ]
    });
  }

  private async handleHealthEvent(event: SystemEvent): Promise<void> {
    const state = await this.stateManager.getState();
    
    // Update system health state
    state.systemHealth[event.source] = {
      status: event.data.status,
      metrics: event.data.metrics,
      lastUpdate: event.timestamp
    };

    await this.stateManager.setState(state);

    // Check if thresholds are exceeded
    const thresholdExceeded = this.checkThresholds(event.data.metrics, state.alertThresholds);
    
    if (thresholdExceeded.length > 0) {
      await this.workflow.triggerWorkflow('incident-management', {
        source: event.source,
        type: 'threshold-exceeded',
        thresholds: thresholdExceeded,
        metrics: event.data.metrics,
        severity: this.calculateSeverity(thresholdExceeded)
      });
    }
  }

  private async handleErrorEvent(aggregatedEvents: SystemEvent[]): Promise<void> {
    const errorRate = aggregatedEvents.length;
    const service = aggregatedEvents[0].data.service;
    const errorType = aggregatedEvents[0].data.errorType;

    // Check if error rate exceeds threshold
    const state = await this.stateManager.getState();
    if (errorRate > state.alertThresholds.errorRate) {
      await this.workflow.triggerWorkflow('incident-management', {
        source: service,
        type: 'high-error-rate',
        errorRate,
        errorType,
        severity: errorRate > 20 ? 'critical' : 'high',
        events: aggregatedEvents
      });
    }
  }

  private async attemptAutoRemediation(context: any): Promise<any> {
    const { source, type, severity } = context.input;

    // Define remediation strategies
    const strategies = {
      'high-cpu': [
        this.restartHighCpuProcesses,
        this.scaleUpInstances,
        this.enableCpuThrottling
      ],
      'high-memory': [
        this.clearMemoryCache,
        this.restartMemoryLeakProcesses,
        this.scaleUpMemory
      ],
      'high-error-rate': [
        this.restartFailingService,
        this.rollbackRecentDeployment,
        this.enableCircuitBreaker
      ],
      'disk-space': [
        this.cleanupTempFiles,
        this.archiveOldLogs,
        this.expandDiskSpace
      ]
    };

    const remediationSteps = strategies[type] || [];
    
    for (const step of remediationSteps) {
      try {
        const result = await step(context);
        if (result.success) {
          return {
            remediated: true,
            strategy: step.name,
            result
          };
        }
      } catch (error) {
        console.error(\`Remediation step \${step.name} failed:\`, error);
        continue;
      }
    }

    return {
      remediated: false,
      reason: 'All remediation strategies failed'
    };
  }

  private async escalateIncident(context: any): Promise<any> {
    const { source, type, severity, autoRemediationFailed } = context.input;

    // Create incident ticket
    const incident = await this.engine.createIncident({
      title: \`\${type} on \${source}\`,
      description: this.generateIncidentDescription(context.input),
      severity,
      source,
      type,
      autoRemediationAttempted: !!autoRemediationFailed,
      assignee: this.getAssigneeForSeverity(severity),
      tags: [source, type, severity]
    });

    // Send notifications
    await this.sendIncidentNotifications(incident);

    // Update state
    const state = await this.stateManager.getState();
    state.activeIncidents.set(incident.id, incident);
    await this.stateManager.setState(state);

    return {
      escalated: true,
      incidentId: incident.id,
      assignee: incident.assignee
    };
  }

  private async executeScaling(context: any): Promise<any> {
    const { scalingPlan } = context.input;

    // Execute scaling through circuit breaker
    return await this.circuitBreaker.execute(async () => {
      const results = [];

      for (const action of scalingPlan.actions) {
        const result = await this.executeScalingAction(action);
        results.push(result);
      }

      return {
        success: results.every(r => r.success),
        results,
        scaledResources: results.filter(r => r.success).length
      };
    });
  }

  private checkThresholds(metrics: Record<string, number>, thresholds: Record<string, number>): string[] {
    const exceeded = [];
    
    for (const [metric, value] of Object.entries(metrics)) {
      if (thresholds[metric] && value > thresholds[metric]) {
        exceeded.push(metric);
      }
    }
    
    return exceeded;
  }

  private calculateSeverity(exceededThresholds: string[]): 'low' | 'medium' | 'high' | 'critical' {
    if (exceededThresholds.includes('disk') && exceededThresholds.length > 1) {
      return 'critical';
    }
    if (exceededThresholds.length > 2) {
      return 'high';
    }
    if (exceededThresholds.length > 1) {
      return 'medium';
    }
    return 'low';
  }

  async start(): Promise<void> {
    await this.workflow.start();
    console.log('Event-driven automation workflow started');
  }

  async stop(): Promise<void> {
    await this.workflow.stop();
    console.log('Event-driven automation workflow stopped');
  }
}

// Usage
const automation = new EventDrivenAutomationWorkflow({
  apiKey: process.env.LATTICE_API_KEY,
  projectId: 'proj_automation'
});

await automation.start();`,
    features: [
      "Event-driven triggers",
      "State management",
      "Circuit breakers",
      "Auto-remediation",
      "Incident escalation",
      "Performance monitoring"
    ]
  }
]

const bestPractices = [
  {
    category: "Workflow Design",
    practices: [
      "Keep workflows focused on single responsibilities",
      "Design for failure and implement proper error handling",
      "Use timeouts and circuit breakers for external dependencies",
      "Implement idempotent operations where possible",
      "Plan for workflow versioning and migration"
    ]
  },
  {
    category: "Performance Optimization",
    practices: [
      "Use parallel execution for independent tasks",
      "Implement proper resource management and cleanup",
      "Cache frequently accessed data and computations",
      "Monitor workflow performance and bottlenecks",
      "Optimize database queries and external API calls"
    ]
  },
  {
    category: "Error Handling",
    practices: [
      "Implement comprehensive error handling strategies",
      "Use dead letter queues for failed messages",
      "Implement exponential backoff for retries",
      "Log errors with sufficient context for debugging",
      "Set up alerting for critical workflow failures"
    ]
  },
  {
    category: "Monitoring & Observability",
    practices: [
      "Implement comprehensive logging and metrics",
      "Use distributed tracing for complex workflows",
      "Set up health checks and monitoring dashboards",
      "Track workflow performance and success rates",
      "Implement alerting for anomalies and failures"
    ]
  }
]

const troubleshootingTips = [
  {
    issue: "Workflow timeouts",
    solution: "Optimize long-running operations and adjust timeout values",
    steps: [
      "Identify bottlenecks in workflow execution",
      "Optimize database queries and external API calls",
      "Implement proper caching strategies",
      "Adjust timeout values based on actual performance",
      "Consider breaking long workflows into smaller chunks"
    ]
  },
  {
    issue: "Memory leaks in long-running workflows",
    solution: "Implement proper resource cleanup and memory management",
    steps: [
      "Profile memory usage during workflow execution",
      "Implement proper cleanup in finally blocks",
      "Avoid holding references to large objects",
      "Use streaming for large data processing",
      "Monitor memory usage and set up alerts"
    ]
  },
  {
    issue: "Inconsistent workflow state",
    solution: "Implement proper state management and consistency checks",
    steps: [
      "Use transactional operations where possible",
      "Implement state validation at key checkpoints",
      "Use event sourcing for audit trails",
      "Implement compensation logic for failures",
      "Regular state consistency checks"
    ]
  }
]

export default function AdvancedWorkflowsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-b border-blue-500/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                  <Workflow className="h-8 w-8 text-blue-50" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Advanced Workflows
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Master complex workflow patterns and build sophisticated automation systems with Lattice Engine's advanced workflow capabilities.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">Advanced Patterns</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-blue-500 text-blue-500">Event-Driven</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-blue-500 text-blue-500">Multi-Stage</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-blue-500 text-blue-500">Orchestration</Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Workflow Patterns */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Advanced Workflow Patterns</h2>
                <div className="grid gap-6 mb-8">
                  {workflowPatterns.map((pattern, index) => (
                    <motion.div
                      key={pattern.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 ${pattern.bgColor} rounded-lg flex items-center justify-center`}>
                                <pattern.icon className={`h-6 w-6 ${pattern.color}`} />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-foreground">{pattern.title}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{pattern.complexity}</Badge>
                                  <Badge variant="secondary" className="text-xs">{pattern.duration}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardDescription className="text-base">{pattern.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <h4 className="font-semibold text-foreground">Key Features:</h4>
                          <ul className="grid md:grid-cols-2 gap-2">
                            {pattern.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Implementation Steps */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Implementation Steps</h2>
                <div className="space-y-6">
                  {workflowSteps.map((step, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-blue-50 text-sm font-bold flex-shrink-0">
                            {step.step}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">{step.title}</CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {step.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Advanced Examples */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Advanced Examples</h2>
                
                <Tabs defaultValue="multi-stage" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="multi-stage">Multi-Stage Approval</TabsTrigger>
                    <TabsTrigger value="event-driven">Event-Driven Automation</TabsTrigger>
                  </TabsList>

                  {advancedExamples.map((example, index) => (
                    <TabsContent key={index} value={index === 0 ? "multi-stage" : "event-driven"} className="space-y-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">{example.title}</CardTitle>
                          <CardDescription>{example.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="bg-muted p-4 rounded-lg border border-border">
                            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">{example.code}</pre>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Key Features:</h4>
                            <ul className="grid md:grid-cols-2 gap-2">
                              {example.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.section>

              {/* Best Practices */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Best Practices</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {bestPractices.map((category, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.practices.map((practice, practiceIndex) => (
                            <li key={practiceIndex} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Troubleshooting */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Troubleshooting</h2>
                <div className="space-y-6">
                  {troubleshootingTips.map((tip, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                          </div>
                          <CardTitle className="text-lg text-foreground">{tip.issue}</CardTitle>
                        </div>
                        <CardDescription>{tip.solution}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Steps to resolve:</h4>
                          <ul className="space-y-2">
                            {tip.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start space-x-2">
                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                                  {stepIndex + 1}
                                </div>
                                <span className="text-sm text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Links */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/docs/tutorials-and-guides" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Tutorials Overview
                      </Link>
                      <Link href="/docs/tutorials-and-guides/team-collaboration" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Users className="h-4 w-4 mr-2" />
                        Team Collaboration
                      </Link>
                      <Link href="/docs/tutorials-and-guides/cicd-integration" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <GitMerge className="h-4 w-4 mr-2" />
                        CI/CD Integration
                      </Link>
                      <Link href="/docs/api-documentation" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        API Documentation
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Templates */}
                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Download className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-foreground">Workflow Templates</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download pre-built workflow templates to jumpstart your advanced automation projects.
                    </p>
                    <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-500/90 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download Templates
                    </Button>
                  </CardContent>
                </Card>

                {/* Performance Tips */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-foreground">Performance Tips</h3>
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Use parallel execution for independent tasks</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Implement proper caching strategies</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Monitor workflow performance metrics</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Help */}
                <Card className="border-border">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Having trouble with advanced workflows? Our experts are here to help.
                    </p>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-500/90 text-white">
                      Get Expert Help
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}