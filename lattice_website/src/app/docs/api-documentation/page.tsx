"use client";

import { GitBranch, Shield, BookOpen, Database, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ApiDocumentationContent from "@/components/api-documentation-content"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

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

export default function ApiDocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Code className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                    API Documentation
                  </h1>
                  <Badge variant="secondary" className="mt-2">v2.1.0</Badge>
                </div>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Complete REST API reference with examples and SDK documentation. Integrate Lattice Engine into your applications.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="h-5 w-5 mr-2" />
                  Download SDK
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open API Spec
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Start */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Quick Start</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded overflow-x-auto">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                          <code>{`curl -X POST http://localhost:8000/mutations/propose
  -H "Content-Type: application/json"
  -H "X-API-Key: your-api-key"
  -d '{"spec_id":"spec-123","operation_type":"update","changes":{"title":"Add hashing"},"reason":"Security","initiated_by":"user-42"}'`}</code>
                        </pre>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start by proposing a mutation with your API key.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Authentication */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {authentication.description}
                      </p>
                      <div className="p-3 bg-muted rounded">
                        <code className="text-xs text-foreground break-all">
                          {authentication.bearerToken}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SDKs */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      SDKs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="#javascript-sdk" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        JavaScript SDK
                      </Link>
                      <Link href="#python-sdk" className="block p-2 hover:bg-muted rounded text-sm text-foreground">
                        Python SDK
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Limits */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Rate Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Free Plan</span>
                        <span className="text-foreground font-medium">1,000 req/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pro Plan</span>
                        <span className="text-foreground font-medium">10,000 req/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Enterprise</span>
                        <span className="text-foreground font-medium">Unlimited</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Overview */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Overview</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    The Lattice Engine API provides programmatic access to all platform features. Use it to integrate
                    Lattice into your applications, automate workflows, and build custom tools.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">RESTful Design</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Follows REST principles with predictable URLs and HTTP methods.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">JSON Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        All responses are in JSON format with consistent error handling.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Webhooks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Receive real-time notifications about mutations and deployments.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.section>

              {/* SDKs */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">SDKs & Libraries</h2>
                <Tabs defaultValue="python" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>

                  {sdks.map((sdk) => (
                    <TabsContent key={sdk.name} value={sdk.name.toLowerCase().split(' ')[0]} className="mt-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{sdk.name}</CardTitle>
                          <CardDescription>{sdk.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Installation</h4>
                              <div className="bg-muted p-4 rounded">
                                <code className="text-sm">{sdk.install}</code>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Example Usage</h4>
                              <div className="bg-muted p-4 rounded overflow-x-auto">
                                <pre className="text-sm">
                                  <code>{sdk.example}</code>
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Features</h4>
                              <div className="flex flex-wrap gap-2">
                                {sdk.features.map((feature, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.section>

              {/* API Endpoints */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">API Endpoints</h2>
                <div className="space-y-12">
                  {apiEndpoints.map((category, categoryIndex) => (
                    <motion.div
                      key={categoryIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                          <category.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{category.category}</h3>
                          <p className="text-muted-foreground">{category.description}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {category.endpoints.map((endpoint, endpointIndex) => (
                          <Card key={endpointIndex} className="border-border">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Badge
                                    variant={endpoint.method === 'GET' ? 'secondary' :
                                           endpoint.method === 'POST' ? 'default' :
                                           endpoint.method === 'PUT' ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                                    {endpoint.path}
                                  </code>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={() => navigator.clipboard.writeText(endpoint.path)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <CardDescription className="text-base">
                                {endpoint.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {endpoint.example && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Request Example</h4>
                                    <div className="bg-muted p-4 rounded overflow-x-auto">
                                      <pre className="text-sm">
                                        <code>{endpoint.example}</code>
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {endpoint.response && (
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Response</h4>
                                    <div className="bg-muted p-4 rounded overflow-x-auto">
                                      <pre className="text-sm">
                                        <code>{endpoint.response}</code>
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Error Handling */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Error Handling</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Standard Error Response</h4>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "spec_id",
      "issue": "Required field is missing"
    },
    "request_id": "req_abc123"
  }
}`}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Common Error Codes</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">400</Badge>
                              <span className="text-sm font-mono text-foreground">Bad Request</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">401</Badge>
                              <span className="text-sm font-mono text-foreground">Unauthorized</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">403</Badge>
                              <span className="text-sm font-mono text-foreground">Forbidden</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">404</Badge>
                              <span className="text-sm font-mono text-foreground">Not Found</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">409</Badge>
                              <span className="text-sm font-mono text-foreground">Conflict</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">422</Badge>
                              <span className="text-sm font-mono text-foreground">Validation Error</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">429</Badge>
                              <span className="text-sm font-mono text-foreground">Rate Limit Exceeded</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="destructive" className="text-xs">500</Badge>
                              <span className="text-sm font-mono text-foreground">Server Error</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* WebSocket API */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">WebSocket API</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Connection Endpoint</h4>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{webSocketApi.endpoint}</code>
                          </pre>
                        </div>
                        <p className="text-muted-foreground mt-2">
                          {webSocketApi.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">WebSocket Events</h4>
                        {webSocketApi.events.map((event, index) => (
                          <div key={index} className="mb-4">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Event: <code className="bg-muted px-2 py-1 rounded">{event.event}</code>
                            </p>
                            <p className="text-muted-foreground mb-2">{event.description}</p>
                            <div className="bg-muted p-4 rounded overflow-x-auto">
                              <pre className="text-sm">
                                <code>{event.example}</code>
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">JavaScript WebSocket Example</h4>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{`const ws = new WebSocket('ws://localhost:8000/ws/user-42/web?token=your-api-key');

ws.onopen = () => {
  console.log('Connected to Lattice WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);

  if (message.event === 'approval:response') {
    // Handle approval response
    handleApprovalResponse(message.data);
  }
};

function sendApprovalResponse(approvalRequest, approved, comments) {
  ws.send(JSON.stringify({
    event: 'approval:response',
    data: {
      request_id: approvalRequest.request_id,
      approved: approved,
      responded_by: 'user-42',
      responded_via: 'web',
      comments: comments
    }
  }));
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Webhooks */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">Webhooks</h2>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Webhook Payload</h4>
                        <p className="text-muted-foreground mb-4">
                          When events trigger your webhook, you'll receive a JSON payload:
                        </p>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{`{
  "event": "mutation.approved",
  "data": {
    "mutation": {
      "id": "mut_abc123",
      "title": "Add password hashing",
      "status": "approved"
    },
    "project": {
      "id": "proj_456",
      "name": "My Project"
    },
    "reviewer": "security-team",
    "timestamp": "2024-01-15T11:00:00Z"
  }
}`}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Signature Verification</h4>
                        <p className="text-muted-foreground mb-4">
                          Verify webhook signatures using HMAC-SHA256:
                        </p>
                        <div className="bg-muted p-4 rounded overflow-x-auto">
                          <pre className="text-sm">
                            <code>{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}