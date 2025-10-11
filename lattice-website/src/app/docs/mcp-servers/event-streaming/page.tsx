"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Signal,
  Activity,
  Zap,
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
  Layers,
  Target,
  Users,
  Lock,
  Cpu,
  HardDrive
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

const streamingFeatures = [
  {
    title: "Real-time Event Streaming",
    description: "Stream events in real-time with guaranteed delivery and ordering",
    icon: Signal,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: [
      "Sub-millisecond event delivery",
      "Guaranteed message ordering",
      "At-least-once delivery semantics",
      "Event replay capabilities",
      "Backpressure handling",
      "Dead letter queues"
    ]
  },
  {
    title: "Event Filtering & Routing",
    description: "Advanced filtering and routing capabilities for targeted event delivery",
    icon: Filter,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    features: [
      "Content-based filtering",
      "Topic-based routing",
      "Pattern matching",
      "Dynamic subscriptions",
      "Multi-tenant isolation",
      "Custom routing rules"
    ]
  },
  {
    title: "Scalable Architecture",
    description: "Built for high-throughput, low-latency event processing at scale",
    icon: Network,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: [
      "Horizontal scaling",
      "Load balancing",
      "Partition management",
      "Consumer groups",
      "Auto-scaling policies",
      "Multi-region support"
    ]
  },
  {
    title: "Event Persistence",
    description: "Durable event storage with configurable retention policies",
    icon: Database,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    features: [
      "Configurable retention",
      "Event compaction",
      "Snapshot support",
      "Time-based partitioning",
      "Compression algorithms",
      "Backup and recovery"
    ]
  }
]

const eventTypes = [
  {
    type: "Specification Events",
    description: "Events related to specification changes and updates",
    icon: Code,
    events: [
      "specification.created",
      "specification.updated",
      "specification.deleted",
      "specification.validated",
      "specification.published",
      "specification.archived"
    ]
  },
  {
    type: "Mutation Events",
    description: "Events for code mutations and transformations",
    icon: RefreshCw,
    events: [
      "mutation.requested",
      "mutation.started",
      "mutation.completed",
      "mutation.failed",
      "mutation.rolled_back",
      "mutation.approved"
    ]
  },
  {
    type: "System Events",
    description: "System-level events and health monitoring",
    icon: Activity,
    events: [
      "system.health_check",
      "system.resource_usage",
      "system.error_occurred",
      "system.maintenance_mode",
      "system.backup_completed",
      "system.alert_triggered"
    ]
  },
  {
    type: "User Events",
    description: "User activity and authentication events",
    icon: Users,
    events: [
      "user.authenticated",
      "user.session_started",
      "user.session_ended",
      "user.permission_changed",
      "user.profile_updated",
      "user.action_performed"
    ]
  }
]

const setupSteps = [
  {
    step: 1,
    title: "Install Event Streaming Server",
    description: "Install the Lattice Engine MCP server for event streaming",
    command: "npm install -g @lattice-engine/mcp-server-events",
    note: "The event streaming server provides real-time event processing capabilities"
  },
  {
    step: 2,
    title: "Configure Event Server",
    description: "Set up the event streaming server configuration",
    command: `// lattice.config.json\n{\n  \"mcpServers\": {\n    \"events\": {\n      \"command\": \"lattice-mcp-events\",\n      \"args\": [\n        \"--port\", \"8081\",\n        \"--kafka-brokers\", \"localhost:9092\",\n        \"--redis-url\", \"redis://localhost:6379\",\n        \"--max-consumers\", \"100\"\n      ],\n      \"env\": {\n        \"LATTICE_API_KEY\": \"your-api-key\",\n        \"LATTICE_PROJECT_ID\": \"your-project-id\",\n        \"EVENT_STORE_TYPE\": \"kafka\",\n        \"RETENTION_POLICY\": \"7d\"\n      },\n      \"streaming\": {\n        \"enabled\": true,\n        \"protocol\": \"websocket\",\n        \"compression\": true,\n        \"encryption\": true,\n        \"batchSize\": 100,\n        \"flushInterval\": \"1s\",\n        \"maxRetries\": 3,\n        \"deadLetterQueue\": true\n      }\n    }\n  }\n}`,
    note: "Configure event streaming settings, retention policies, and processing options"
  },
  {
    step: 3,
    title: "Start Event Server",
    description: "Start the MCP event streaming server",
    command: "lattice-mcp-events --config lattice.config.json",
    note: "The server will start processing and streaming events in real-time"
  },
  {
    step: 4,
    title: "Connect Event Consumer",
    description: "Connect your application to consume events",
    command: `// In your application\nimport { LatticeEventClient } from '@lattice-engine/event-client';\n\nconst eventClient = new LatticeEventClient({\n  serverUrl: 'ws://localhost:8081',\n  apiKey: 'your-api-key',\n  projectId: 'your-project-id'\n});\n\n// Subscribe to events\neventClient.subscribe('specification.*', (event) => {\n  console.log('Specification event:', event);\n});\n\n// Start consuming events\nawait eventClient.connect();`,
    note: "Connect your application to the event stream and subscribe to relevant events"
  }
]

const streamingExamples = [
  {
    language: "JavaScript",
    title: "Basic Event Streaming",
    description: "Set up basic event streaming with filtering and error handling",
    code: `// Initialize the event client\nimport { LatticeEventClient } from '@lattice-engine/event-client';\n\nconst eventClient = new LatticeEventClient({\n  serverUrl: 'ws://localhost:8081',\n  apiKey: process.env.LATTICE_API_KEY,\n  projectId: 'proj_1234567890',\n  options: {\n    autoReconnect: true,\n    maxReconnectAttempts: 5,\n    reconnectInterval: 1000,\n    compression: true,\n    batchSize: 50\n  }\n});\n\n// Connect to the event stream\nawait eventClient.connect();\n\n// Subscribe to specification events\neventClient.subscribe('specification.*', {\n  handler: (event) => {\n    console.log('Specification event received:', {\n      type: event.type,\n      id: event.id,\n      timestamp: event.timestamp,\n      data: event.data\n    });\n    \n    // Process the event\n    handleSpecificationEvent(event);\n  },\n  filter: {\n    // Only process events for specific projects\n    'data.projectId': ['proj_1234567890', 'proj_0987654321'],\n    // Only process certain event types\n    'type': ['specification.created', 'specification.updated']\n  },\n  options: {\n    fromBeginning: false,\n    maxRetries: 3,\n    retryDelay: 1000\n  }\n});\n\n// Subscribe to mutation events with different handler\neventClient.subscribe('mutation.*', {\n  handler: async (event) => {\n    try {\n      await processMutationEvent(event);\n    } catch (error) {\n      console.error('Error processing mutation event:', error);\n      // Send to dead letter queue\n      await eventClient.sendToDeadLetterQueue(event, error);\n    }\n  }\n});\n\n// Handle connection events\neventClient.on('connected', () => {\n  console.log('Connected to event stream');\n});\n\neventClient.on('disconnected', () => {\n  console.log('Disconnected from event stream');\n});\n\neventClient.on('error', (error) => {\n  console.error('Event stream error:', error);\n});`,
    features: ["Event filtering", "Auto-reconnection", "Error handling", "Dead letter queue", "Batch processing"]
  },
  {
    language: "TypeScript",
    title: "Advanced Event Processing",
    description: "Implement advanced event processing with custom handlers and state management",
    code: `import { \n  LatticeEventClient, \n  EventHandler, \n  EventFilter, \n  EventSubscription \n} from '@lattice-engine/event-client';\n\ninterface SpecificationEvent {\n  id: string;\n  type: 'specification.created' | 'specification.updated' | 'specification.deleted';\n  timestamp: Date;\n  data: {\n    specificationId: string;\n    projectId: string;\n    userId: string;\n    changes?: Record<string, any>;\n    metadata: Record<string, any>;\n  };\n}\n\ninterface MutationEvent {\n  id: string;\n  type: 'mutation.requested' | 'mutation.completed' | 'mutation.failed';\n  timestamp: Date;\n  data: {\n    mutationId: string;\n    specificationId: string;\n    status: 'pending' | 'running' | 'completed' | 'failed';\n    result?: any;\n    error?: string;\n  };\n}\n\nclass EventProcessor {\n  private eventClient: LatticeEventClient;\n  private subscriptions: Map<string, EventSubscription> = new Map();\n  private eventStore: Map<string, any[]> = new Map();\n\n  constructor() {\n    this.eventClient = new LatticeEventClient({\n      serverUrl: 'ws://localhost:8081',\n      apiKey: process.env.LATTICE_API_KEY!,\n      projectId: 'proj_1234567890',\n      options: {\n        autoReconnect: true,\n        compression: true,\n        encryption: true\n      }\n    });\n  }\n\n  async initialize(): Promise<void> {\n    await this.eventClient.connect();\n    this.setupEventHandlers();\n  }\n\n  private setupEventHandlers(): void {\n    // Handle specification events\n    const specHandler: EventHandler<SpecificationEvent> = {\n      handler: async (event) => {\n        await this.processSpecificationEvent(event);\n      },\n      filter: {\n        'data.projectId': [process.env.PROJECT_ID!]\n      },\n      options: {\n        ordered: true,\n        maxRetries: 3\n      }\n    };\n\n    this.subscriptions.set(\n      'specifications',\n      this.eventClient.subscribe('specification.*', specHandler)\n    );\n\n    // Handle mutation events\n    const mutationHandler: EventHandler<MutationEvent> = {\n      handler: async (event) => {\n        await this.processMutationEvent(event);\n      },\n      filter: {\n        'type': ['mutation.completed', 'mutation.failed']\n      }\n    };\n\n    this.subscriptions.set(\n      'mutations',\n      this.eventClient.subscribe('mutation.*', mutationHandler)\n    );\n  }\n\n  private async processSpecificationEvent(event: SpecificationEvent): Promise<void> {\n    console.log('Processing specification event:', event.type);\n    \n    // Store event for replay\n    const events = this.eventStore.get('specifications') || [];\n    events.push(event);\n    this.eventStore.set('specifications', events);\n\n    // Process based on event type\n    switch (event.type) {\n      case 'specification.created':\n        await this.handleSpecificationCreated(event);\n        break;\n      case 'specification.updated':\n        await this.handleSpecificationUpdated(event);\n        break;\n      case 'specification.deleted':\n        await this.handleSpecificationDeleted(event);\n        break;\n    }\n  }\n\n  private async processMutationEvent(event: MutationEvent): Promise<void> {\n    console.log('Processing mutation event:', event.type);\n    \n    if (event.type === 'mutation.completed') {\n      await this.handleMutationCompleted(event);\n    } else if (event.type === 'mutation.failed') {\n      await this.handleMutationFailed(event);\n    }\n  }\n\n  // Event replay functionality\n  async replayEvents(eventType: string, fromTimestamp?: Date): Promise<void> {\n    const events = this.eventStore.get(eventType) || [];\n    const filteredEvents = fromTimestamp \n      ? events.filter(e => e.timestamp >= fromTimestamp)\n      : events;\n\n    for (const event of filteredEvents) {\n      await this.processEvent(event);\n    }\n  }\n\n  async shutdown(): Promise<void> {\n    // Unsubscribe from all events\n    for (const [name, subscription] of this.subscriptions) {\n      await subscription.unsubscribe();\n    }\n    \n    await this.eventClient.disconnect();\n  }\n}`,
    features: ["Type-safe events", "Custom handlers", "Event replay", "State management", "Graceful shutdown"]
  },
  {
    language: "Python",
    title: "Python Event Consumer",
    description: "Consume events using the Python SDK with async processing",
    code: `import asyncio\nimport json\nfrom typing import Dict, Any, Callable, Optional\nfrom lattice_engine import LatticeEventClient, EventHandler\n\nclass EventProcessor:\n    def __init__(self, api_key: str, project_id: str):\n        self.client = LatticeEventClient(\n            server_url=\"ws://localhost:8081\",\n            api_key=api_key,\n            project_id=project_id,\n            options={\n                \"auto_reconnect\": True,\n                \"compression\": True,\n                \"batch_size\": 100,\n                \"max_retries\": 3\n            }\n        )\n        self.handlers: Dict[str, Callable] = {}\n        self.event_store: Dict[str, list] = {}\n\n    async def connect(self):\n        \"\"\"Connect to the event stream\"\"\"\n        await self.client.connect()\n        await self.setup_handlers()\n\n    async def setup_handlers(self):\n        \"\"\"Set up event handlers for different event types\"\"\"\n        \n        # Specification events handler\n        @self.client.subscribe(\"specification.*\")\n        async def handle_specification_events(event: Dict[str, Any]):\n            await self.process_specification_event(event)\n\n        # Mutation events handler\n        @self.client.subscribe(\n            \"mutation.*\",\n            filter_conditions={\n                \"type\": [\"mutation.completed\", \"mutation.failed\"]\n            }\n        )\n        async def handle_mutation_events(event: Dict[str, Any]):\n            await self.process_mutation_event(event)\n\n        # System events handler\n        @self.client.subscribe(\"system.*\")\n        async def handle_system_events(event: Dict[str, Any]):\n            await self.process_system_event(event)\n\n    async def process_specification_event(self, event: Dict[str, Any]):\n        \"\"\"Process specification-related events\"\"\"\n        event_type = event.get(\"type\")\n        event_data = event.get(\"data\", {})\n        \n        print(f\"Processing specification event: {event_type}\")\n        \n        # Store event for replay\n        if \"specifications\" not in self.event_store:\n            self.event_store[\"specifications\"] = []\n        self.event_store[\"specifications\"].append(event)\n        \n        # Process based on event type\n        if event_type == \"specification.created\":\n            await self.handle_specification_created(event_data)\n        elif event_type == \"specification.updated\":\n            await self.handle_specification_updated(event_data)\n        elif event_type == \"specification.deleted\":\n            await self.handle_specification_deleted(event_data)\n\n    async def process_mutation_event(self, event: Dict[str, Any]):\n        \"\"\"Process mutation-related events\"\"\"\n        event_type = event.get(\"type\")\n        event_data = event.get(\"data\", {})\n        \n        print(f\"Processing mutation event: {event_type}\")\n        \n        if event_type == \"mutation.completed\":\n            await self.handle_mutation_completed(event_data)\n        elif event_type == \"mutation.failed\":\n            await self.handle_mutation_failed(event_data)\n\n    async def process_system_event(self, event: Dict[str, Any]):\n        \"\"\"Process system-related events\"\"\"\n        event_type = event.get(\"type\")\n        event_data = event.get(\"data\", {})\n        \n        print(f\"Processing system event: {event_type}\")\n        \n        if event_type == \"system.error_occurred\":\n            await self.handle_system_error(event_data)\n        elif event_type == \"system.health_check\":\n            await self.handle_health_check(event_data)\n\n    async def handle_specification_created(self, data: Dict[str, Any]):\n        \"\"\"Handle specification creation events\"\"\"\n        spec_id = data.get(\"specificationId\")\n        print(f\"New specification created: {spec_id}\")\n        # Add your custom logic here\n\n    async def handle_specification_updated(self, data: Dict[str, Any]):\n        \"\"\"Handle specification update events\"\"\"\n        spec_id = data.get(\"specificationId\")\n        changes = data.get(\"changes\", {})\n        print(f\"Specification updated: {spec_id}, changes: {changes}\")\n        # Add your custom logic here\n\n    async def handle_mutation_completed(self, data: Dict[str, Any]):\n        \"\"\"Handle completed mutation events\"\"\"\n        mutation_id = data.get(\"mutationId\")\n        result = data.get(\"result\")\n        print(f\"Mutation completed: {mutation_id}, result: {result}\")\n        # Add your custom logic here\n\n    async def replay_events(self, event_type: str, from_timestamp: Optional[str] = None):\n        \"\"\"Replay stored events\"\"\"\n        events = self.event_store.get(event_type, [])\n        \n        if from_timestamp:\n            # Filter events by timestamp\n            events = [e for e in events if e.get(\"timestamp\", \"\") >= from_timestamp]\n        \n        for event in events:\n            if event_type == \"specifications\":\n                await self.process_specification_event(event)\n            elif event_type == \"mutations\":\n                await self.process_mutation_event(event)\n\n    async def disconnect(self):\n        \"\"\"Disconnect from the event stream\"\"\"\n        await self.client.disconnect()\n\n# Usage example\nasync def main():\n    processor = EventProcessor(\n        api_key=\"your-api-key\",\n        project_id=\"proj_1234567890\"\n    )\n    \n    try:\n        await processor.connect()\n        print(\"Connected to event stream. Processing events...\")\n        \n        # Keep the connection alive\n        while True:\n            await asyncio.sleep(1)\n            \n    except KeyboardInterrupt:\n        print(\"Shutting down...\")\n    finally:\n        await processor.disconnect()\n\nif __name__ == \"__main__\":\n    asyncio.run(main())`,
    features: ["Async processing", "Event filtering", "Event replay", "Error handling", "Graceful shutdown"]
  }
]

const architecturePatterns = [
  {
    title: "Event Sourcing",
    description: "Store all changes as a sequence of events",
    icon: Database,
    benefits: ["Complete audit trail", "Event replay capability", "Temporal queries", "Debugging support"]
  },
  {
    title: "CQRS",
    description: "Separate command and query responsibilities",
    icon: Layers,
    benefits: ["Optimized read/write models", "Independent scaling", "Better performance", "Clear separation"]
  },
  {
    title: "Saga Pattern",
    description: "Manage distributed transactions with events",
    icon: Network,
    benefits: ["Distributed coordination", "Failure handling", "Compensation logic", "Eventual consistency"]
  },
  {
    title: "Event-Driven Architecture",
    description: "Loosely coupled, event-driven microservices",
    icon: Signal,
    benefits: ["Loose coupling", "Scalability", "Resilience", "Flexibility"]
  }
]

const performanceMetrics = [
  {
    metric: "Event Throughput",
    value: "1M+ events/s",
    description: "Maximum events processed per second",
    icon: Activity
  },
  {
    metric: "Event Latency",
    value: "< 1ms",
    description: "End-to-end event processing latency",
    icon: Clock
  },
  {
    metric: "Consumer Lag",
    value: "< 100ms",
    description: "Maximum consumer lag behind producers",
    icon: Signal
  },
  {
    metric: "Availability",
    value: "99.99%",
    description: "Event streaming service uptime",
    icon: Shield
  }
]

const troubleshootingTips = [
  {
    issue: "High consumer lag",
    solution: "Scale consumers or optimize processing logic",
    steps: [
      "Monitor consumer group lag metrics",
      "Increase number of consumer instances",
      "Optimize event processing logic",
      "Check for processing bottlenecks",
      "Consider batch processing"
    ]
  },
  {
    issue: "Event ordering issues",
    solution: "Configure proper partitioning and ordering",
    steps: [
      "Use consistent partition keys",
      "Enable ordered processing",
      "Check partition assignment",
      "Verify consumer configuration",
      "Review event timestamps"
    ]
  },
  {
    issue: "Missing events",
    solution: "Check retention policies and consumer offsets",
    steps: [
      "Verify retention policy settings",
      "Check consumer offset positions",
      "Review dead letter queue",
      "Monitor event acknowledgments",
      "Check for consumer failures"
    ]
  }
]

export default function EventStreamingPage() {
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
                  <Signal className="h-8 w-8 text-blue-50" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Event Streaming
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Process and stream events in real-time with Lattice Engine's high-performance event streaming platform. Built for scale, reliability, and low-latency processing.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">1M+ Events/s</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-blue-500 text-blue-500">Sub-ms Latency</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-blue-500 text-blue-500">Event Replay</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-blue-500 text-blue-500">Guaranteed Delivery</Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Streaming Features */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Event Streaming Features</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {streamingFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-border h-full">
                        <CardHeader>
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                              <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                          </div>
                          <CardDescription className="text-base">{feature.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <ul className="space-y-2">
                            {feature.features.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Event Types */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Event Types</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {eventTypes.map((eventType, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <eventType.icon className="h-6 w-6 text-blue-500" />
                          </div>
                          <CardTitle className="text-lg text-foreground">{eventType.type}</CardTitle>
                        </div>
                        <CardDescription>{eventType.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {eventType.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <code className="text-sm font-mono text-foreground">{event}</code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Setup Guide */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Setup Guide</h2>
                <div className="space-y-6">
                  {setupSteps.map((step, index) => (
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
                      {step.command && (
                        <CardContent>
                          <div className="bg-muted p-4 rounded-lg border border-border">
                            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{step.command}</pre>
                          </div>
                        </CardContent>
                      )}
                      {step.note && (
                        <CardContent>
                          <div className="flex items-start space-x-2">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{step.note}</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Streaming Examples */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Streaming Examples</h2>
                
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>

                  {streamingExamples.map((example, index) => (
                    <TabsContent key={example.language} value={example.language.toLowerCase()} className="space-y-6">
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
                            <ul className="space-y-2">
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

              {/* Architecture Patterns */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Architecture Patterns</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {architecturePatterns.map((pattern, index) => (
                    <Card key={index} className="border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <pattern.icon className="h-6 w-6 text-blue-500" />
                          </div>
                          <h3 className="font-semibold text-foreground">{pattern.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{pattern.description}</p>
                        <div className="space-y-2">
                          {pattern.benefits.map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Performance Metrics */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Performance Metrics</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <Card key={index} className="border-border">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <metric.icon className="h-6 w-6 text-blue-500" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-2">{metric.value}</div>
                        <div className="text-sm font-semibold text-foreground mb-1">{metric.metric}</div>
                        <div className="text-sm text-muted-foreground">{metric.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Troubleshooting */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
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
                      <Link href="/docs/mcp-servers" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        MCP Servers Overview
                      </Link>
                      <Link href="/docs/mcp-servers/realtime-sync" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Real-time Sync
                      </Link>
                      <Link href="/docs/mcp-servers/configuration" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Settings className="h-4 w-4 mr-2" />
                        Server Configuration
                      </Link>
                      <Link href="/docs/mcp-servers/deployment" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Globe className="h-4 w-4 mr-2" />
                        Deployment Guide
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Download SDK */}
                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Download className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-foreground">Install Event SDK</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Install the Lattice Engine event SDK to start consuming events in your applications.
                    </p>
                    <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-500/90 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Install Event SDK
                    </Button>
                  </CardContent>
                </Card>

                {/* Event Monitoring */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-foreground">Event Monitoring</h3>
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Real-time event metrics</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Consumer lag monitoring</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Error rate tracking</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Help */}
                <Card className="border-border">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Having issues with event streaming? Contact our support team.
                    </p>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-500/90 text-white">
                      Contact Support
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