"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Code,
  Key,
  Shield,
  GitBranch,
  Database,
  Webhook,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  BookOpen,
  Zap
} from "lucide-react"
import Link from "next/link"

const apiEndpoints = [
  {
    category: "Mutations",
    description: "Propose and manage code mutations",
    icon: GitBranch,
    endpoints: [
      {
        method: "POST",
        path: "/mutations/propose",
        description: "Propose a mutation with multi-tenant context",
        example: `{
  "spec_id": "spec-123",
  "operation_type": "update",
  "changes": {
    "title": "Add password hashing",
    "files_modified": ["src/auth.ts"]
  },
  "reason": "Security enhancement to hash passwords",
  "initiated_by": "user-42",
  "priority": 5
}`,
        response: `{
  "status": "proposed",
  "proposal": {
    "proposal_id": "prop-abc123",
    "spec_id": "spec-123",
    "operation_type": "update",
    "current_version": "1.0.0",
    "proposed_changes": {...},
    "reasoning": "Security enhancement identified",
    "confidence": 0.92,
    "impact_analysis": {
      "security_impact": "high",
      "complexity": "low"
    },
    "requires_approval": true,
    "affected_specs": ["spec-123", "auth-flow"]
  }
}`
      }
    ]
  },
  {
    category: "Approvals",
    description: "Handle approval workflows and responses",
    icon: Shield,
    endpoints: [
      {
        method: "POST",
        path: "/approvals/{request_id}/respond",
        description: "Respond to an approval request",
        example: `{
  "request_id": "approval-req-123",
  "approved": true,
  "responded_by": "reviewer@example.com",
  "responded_via": "web",
  "comments": "Security enhancement approved"
}`,
        response: `{
  "status": "processed",
  "result": {
    "request_id": "approval-req-123",
    "approved": true,
    "processed_at": "2024-01-15T11:00:00Z",
    "next_steps": ["mutation_execution"]
  }
}`
      },
      {
        method: "GET",
        path: "/approvals/pending",
        description: "Get pending approvals for a user",
        example: `GET /approvals/pending?user_id=user-42`,
        response: `{
  "pending_approvals": [
    {
      "request_id": "approval-req-123",
      "proposal_id": "prop-abc123",
      "spec_id": "spec-123",
      "user_id": "user-42",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "details": {...}
    }
  ]
}`
      }
    ]
  },
  {
    category: "Specifications",
    description: "Manage project specifications and documents",
    icon: BookOpen,
    endpoints: [
      {
        method: "GET",
        path: "/specs/{project_id}",
        description: "List all specifications for a project",
        example: `GET /specs/proj-123`,
        response: `{
  "project_id": "proj-123",
  "specs": [
    {
      "id": "spec-123",
      "name": "User Authentication",
      "type": "SPEC",
      "description": "Authentication flow specifications",
      "content": "Detailed auth requirements...",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}`
      },
      {
        method: "POST",
        path: "/specs/create",
        description: "Create a new specification",
        example: `{
  "name": "Payment Processing",
  "description": "Payment gateway integration specs",
  "content": "Payment processing requirements...",
  "spec_source": "payment-team",
  "metadata": {
    "priority": "high",
    "team": "backend"
  }
}`,
        response: `{
  "created": {
    "id": "spec-456",
    "name": "Payment Processing",
    "type": "SPEC",
    "description": "Payment gateway integration specs",
    "content": "Payment processing requirements...",
    "status": "DRAFT",
    "created_at": "2024-01-15T11:00:00Z"
  }
}`
      },
      {
        method: "PATCH",
        path: "/specs/update",
        description: "Update an existing specification",
        example: `{
  "spec_id": "spec-123",
  "file_path": "docs/auth.md",
  "diff_summary": "Added MFA requirements",
  "user_context": {
    "updated_by": "security-team"
  }
}`,
        response: `{
  "graph_snapshot": {
    "nodes_updated": ["spec-123"],
    "edges_updated": [],
    "timestamp": "2024-01-15T11:00:00Z"
  }
}`
      },
      {
        method: "POST",
        path: "/specs/approve",
        description: "Approve a specification",
        example: `{
  "spec_id": "spec-123"
}`,
        response: `{
  "status": "approved",
  "spec_id": "spec-123",
  "approved_at": "2024-01-15T11:00:00Z"
}`
      },
      {
        method: "DELETE",
        path: "/specs/{spec_id}",
        description: "Delete a specification",
        example: `DELETE /specs/spec-123`,
        response: `{
  "deleted": "spec-123",
  "deleted_at": "2024-01-15T11:00:00Z"
}`
      }
    ]
  },
  {
    category: "Graph Query",
    description: "Query and search the specification graph",
    icon: Database,
    endpoints: [
      {
        method: "POST",
        path: "/graph/query",
        description: "Query the graph with filters",
        example: `{
  "node_type": "SPEC",
  "filters": {
    "status": "ACTIVE",
    "team": "backend"
  }
}`,
        response: `{
  "nodes": [
    {
      "id": "spec-123",
      "name": "User Authentication",
      "type": "SPEC",
      "status": "ACTIVE",
      "metadata": {...}
    }
  ]
}`
      },
      {
        method: "POST",
        path: "/graph/semantic-search",
        description: "Perform semantic search on specifications",
        example: `{
  "query": "password authentication security",
  "top_k": 5,
  "filters": {
    "status": "ACTIVE"
  }
}`,
        response: `{
  "results": [
    {
      "id": "spec-123",
      "name": "User Authentication",
      "content": "Authentication and password requirements...",
      "similarity_score": 0.95
    }
  ]
}`
      },
      {
        method: "GET",
        path: "/graph/semantic-search/stats",
        description: "Get semantic search statistics",
        example: `GET /graph/semantic-search/stats`,
        response: `{
  "available": true,
  "backend": "qdrant",
  "total_documents": 150,
  "embedding_model": "all-MiniLM-L6-v2",
  "index_size": "2.3MB"
}`
      }
    ]
  },
  {
    category: "Tasks",
    description: "Manage background tasks and operations",
    icon: Zap,
    endpoints: [
      {
        method: "POST",
        path: "/tasks/request",
        description: "Request a background task",
        example: `{
  "requester_id": "user-42",
  "operation": "validate_spec",
  "input_data": {
    "spec_id": "spec-123",
    "validation_rules": ["security", "performance"]
  },
  "target_agent_type": "validator",
  "priority": 7
}`,
        response: `{
  "status": "requested",
  "task": {
    "task_id": "task-789",
    "requester_id": "user-42",
    "operation": "validate_spec",
    "status": "pending",
    "created_at": "2024-01-15T11:00:00Z",
    "target_agent_type": "validator"
  }
}`
      },
      {
        method: "POST",
        path: "/tasks/clarify",
        description: "Request clarification for a task",
        example: `{
  "task_id": "task-789",
  "note": "Please specify which security validation rules to apply",
  "from_user_id": "user-42"
}`,
        response: `{
  "status": "clarification_requested",
  "task": {
    "task_id": "task-789",
    "status": "clarification_requested",
    "clarification_notes": [
      {
        "note": "Please specify which security validation rules to apply",
        "from_user_id": "user-42",
        "timestamp": "2024-01-15T11:05:00Z"
      }
    ]
  }
}`
      },
      {
        method: "POST",
        path: "/tasks/complete",
        description: "Mark a task as completed",
        example: `{
  "task_id": "task-789",
  "success": true,
  "result": {
    "validation_passed": true,
    "issues_found": 0
  },
  "notes": "Spec validation completed successfully"
}`,
        response: `{
  "status": "completed",
  "task": {
    "task_id": "task-789",
    "status": "completed",
    "result": {
      "validation_passed": true,
      "issues_found": 0
    },
    "completed_at": "2024-01-15T11:10:00Z"
  }
}`
      },
      {
        method: "GET",
        path: "/tasks/status/{task_id}",
        description: "Get task status",
        example: `GET /tasks/status/task-789`,
        response: `{
  "task": {
    "task_id": "task-789",
    "requester_id": "user-42",
    "operation": "validate_spec",
    "status": "completed",
    "result": {
      "validation_passed": true,
      "issues_found": 0
    },
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:10:00Z"
  }
}`
      }
    ]
  },
  {
    category: "Spec Sync",
    description: "Manage specification synchronization",
    icon: GitBranch,
    endpoints: [
      {
        method: "GET",
        path: "/spec-sync/status",
        description: "Get spec sync daemon status",
        example: `GET /spec-sync/status`,
        response: `{
  "enabled": true,
  "running": true,
  "dir": "specs"
}`
      },
      {
        method: "POST",
        path: "/spec-sync/start",
        description: "Start the spec sync daemon",
        example: `POST /spec-sync/start`,
        response: `{
  "status": "started",
  "dir": "specs"
}`
      },
      {
        method: "POST",
        path: "/spec-sync/stop",
        description: "Stop the spec sync daemon",
        example: `POST /spec-sync/stop`,
        response: `{
  "status": "stopped"
}`
      }
    ]
  },
  {
    category: "System",
    description: "System health and monitoring endpoints",
    icon: Database,
    endpoints: [
      {
        method: "GET",
        path: "/health",
        description: "Check API health status",
        example: `GET /health`,
        response: `{
  "status": "healthy",
  "engine_initialized": true,
  "timestamp": "2024-01-15T11:00:00Z"
}`
      },
      {
        method: "GET",
        path: "/metrics",
        description: "Get Prometheus metrics",
        example: `GET /metrics`,
        response: `# HELP lattice_mutations_proposed_total Total number of mutations proposed
# TYPE lattice_mutations_proposed_total counter
lattice_mutations_proposed_total 42

# HELP lattice_websocket_connections Current WebSocket connections
# TYPE lattice_websocket_connections gauge
lattice_websocket_connections 5`
      }
    ]
  }
]

const sdks = [
  {
    name: "Python SDK",
    description: "Direct FastAPI client for the Lattice Mutation Engine",
    install: "pip install httpx pydantic",
    example: `import httpx
from pydantic import BaseModel

class LatticeClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.client = httpx.Client(
            base_url=base_url,
            headers={"X-API-Key": api_key}
        )

    async def propose_mutation(self, spec_id: str, operation_type: str,
                             changes: dict, reason: str, initiated_by: str):
        response = await self.client.post("/mutations/propose", json={
            "spec_id": spec_id,
            "operation_type": operation_type,
            "changes": changes,
            "reason": reason,
            "initiated_by": initiated_by
        })
        return response.json()

    async def get_specs(self, project_id: str):
        response = await self.client.get(f"/specs/{project_id}")
        return response.json()

# Usage
client = LatticeClient("http://localhost:8000", "your-api-key")
mutation = await client.propose_mutation(
    spec_id="spec-123",
    operation_type="update",
    changes={"title": "Add password hashing"},
    reason="Security enhancement",
    initiated_by="user-42"
)`,
    features: ["Async/await support", "Type hints", "Pydantic integration", "Direct HTTP client"]
  },
  {
    name: "JavaScript/Fetch SDK",
    description: "Lightweight JavaScript client using fetch API",
    install: "# No installation needed - uses built-in fetch",
    example: `class LatticeClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async proposeMutation(specId, operationType, changes, reason, initiatedBy) {
    const response = await fetch(\`\${this.baseUrl}/mutations/propose\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        spec_id: specId,
        operation_type: operationType,
        changes,
        reason,
        initiated_by: initiatedBy
      })
    });

    return response.json();
  }

  async getSpecs(projectId) {
    const response = await fetch(\`\${this.baseUrl}/specs/\${projectId}\`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }
}

// Usage
const client = new LatticeClient('http://localhost:8000', 'your-api-key');
const mutation = await client.proposeMutation(
  'spec-123',
  'update',
  { title: 'Add password hashing' },
  'Security enhancement',
  'user-42'
);`,
    features: ["No dependencies", "Promise-based API", "TypeScript support", "Browser and Node.js compatible"]
  }
]

const authentication = {
  bearerToken: "X-API-Key: your-api-key-here",
  description: "Include your API key in the X-API-Key header for all requests. For WebSocket connections, include it as a query parameter: ?token=your-api-key"
}

const webSocketApi = {
  endpoint: "ws://localhost:8000/ws/{user_id}/{client_type}",
  description: "Real-time WebSocket connection for approval requests and notifications",
  events: [
    {
      event: "approval:response",
      description: "Handle approval responses via WebSocket",
      example: `{
  "event": "approval:response",
  "data": {
    "request_id": "approval-req-123",
    "approved": true,
    "responded_by": "reviewer@example.com",
    "comments": "Approved via WebSocket"
  }
}`
    }
  ]
}

export default function ApiDocumentationContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Code className="w-4 h-4" />
              API Documentation v2.1.0
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-orange-600 to-slate-900 dark:from-slate-100 dark:via-orange-400 dark:to-slate-100 bg-clip-text text-transparent mb-6">
              REST API Reference
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Complete REST API reference with examples and SDK documentation. Learn how to integrate Lattice Engine into your applications with mutations, approvals, specifications, and more.
            </p>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <Card className="border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {apiEndpoints.map((category, index) => (
                    <motion.a
                      key={category.category}
                      href={`#${category.category.toLowerCase().replace(' ', '-')}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200"
                    >
                      <category.icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium">{category.category}</span>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Authentication */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
            id="authentication"
          >
            <Card className="border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  {authentication.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <code className="text-sm font-mono text-slate-700 dark:text-slate-300">
                    {authentication.bearerToken}
                  </code>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* API Endpoints */}
          {apiEndpoints.map((category, categoryIndex) => (
            <motion.section
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + categoryIndex * 0.1 }}
              className="mb-12"
              id={category.category.toLowerCase().replace(' ', '-')}
            >
              <Card className="border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    {category.category}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.endpoints.map((endpoint, endpointIndex) => (
                      <motion.div
                        key={`${endpoint.method}-${endpoint.path}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: endpointIndex * 0.1 }}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Badge 
                            variant={endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : 'destructive'}
                            className={`${
                              endpoint.method === 'GET' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                : endpoint.method === 'POST'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : endpoint.method === 'PATCH'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                          {endpoint.description}
                        </p>
                        
                        <Tabs defaultValue="request" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="request">Request</TabsTrigger>
                            <TabsTrigger value="response">Response</TabsTrigger>
                          </TabsList>
                          <TabsContent value="request" className="mt-4">
                            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-sm text-slate-100">
                                <code>{endpoint.example}</code>
                              </pre>
                            </div>
                          </TabsContent>
                          <TabsContent value="response" className="mt-4">
                            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-sm text-slate-100">
                                <code>{endpoint.response}</code>
                              </pre>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          ))}

          {/* WebSocket API */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
            id="websocket"
          >
            <Card className="border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  WebSocket API
                </CardTitle>
                <CardDescription>{webSocketApi.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Endpoint</h4>
                    <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded block">
                      {webSocketApi.endpoint}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Events</h4>
                    {webSocketApi.events.map((event, index) => (
                      <motion.div
                        key={event.event}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300">
                            {event.event}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-3">
                          {event.description}
                        </p>
                        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-slate-100">
                            <code>{event.example}</code>
                          </pre>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* SDKs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-12"
            id="sdks"
          >
            <Card className="border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  SDKs & Client Libraries
                </CardTitle>
                <CardDescription>
                  Official and community SDKs for integrating with the Lattice Engine API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {sdks.map((sdk, index) => (
                    <motion.div
                      key={sdk.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold mb-2">{sdk.name}</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        {sdk.description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Installation</h4>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded p-3">
                          <code className="text-sm font-mono">{sdk.install}</code>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {sdk.features.map((feature, featureIndex) => (
                            <Badge 
                              key={featureIndex}
                              variant="secondary"
                              className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Example Usage</h4>
                        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-slate-100">
                            <code>{sdk.example}</code>
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Rate Limiting & Best Practices */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-12"
          >
            <Card className="border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Rate Limiting & Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      Rate Limits
                    </h3>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                      <li>• 1000 requests per hour per API key</li>
                      <li>• 100 mutations per hour per project</li>
                      <li>• 50 concurrent WebSocket connections</li>
                      <li>• Burst limit: 100 requests per minute</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      Best Practices
                    </h3>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                      <li>• Use WebSocket for real-time updates</li>
                      <li>• Implement exponential backoff for retries</li>
                      <li>• Cache specification data when possible</li>
                      <li>• Use semantic search for better results</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                        Important Security Note
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Always validate webhook signatures using the provided secret. Never expose your API key in client-side code or public repositories.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Webhook Verification Example */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mb-12"
          >
            <Card className="border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  Webhook Signature Verification
                </CardTitle>
                <CardDescription>
                  Verify webhook signatures to ensure requests are from Lattice Engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="node" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  <TabsContent value="node" className="mt-4">
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-slate-100">
                        <code>{`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="python" className="mt-4">
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-slate-100">
                        <code>{`import hmac
import hashlib

def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  )
}