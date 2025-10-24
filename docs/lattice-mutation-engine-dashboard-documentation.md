# Lattice Mutation Engine - Dashboard Implementation Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Core Components](#architecture--core-components)
3. [Dashboard Feature Requirements](#dashboard-feature-requirements)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Data Models & Schemas](#data-models--schemas)
6. [Real-time Communication](#real-time-communication)
7. [Authentication & Authorization](#authentication--authorization)
8. [Dashboard Integration Guide](#dashboard-integration-guide)
9. [UI Component Specifications](#ui-component-specifications)
10. [Error Handling & Status Management](#error-handling--status-management)

---

## Overview

The Lattice Mutation Engine is the core backend service that powers AI-driven code mutations, approvals, and real-time collaboration. This documentation provides comprehensive guidance for implementing the Lattice Portal dashboard that interfaces with the mutation engine.

### Key Capabilities for Dashboard Integration

- **Mutation Management**: Create, track, and manage code mutations
- **Approval Workflows**: Multi-channel approval system with real-time notifications
- **Project & Organization Management**: Multi-tenant project organization
- **Spec Graph Visualization**: Interactive dependency graphs and spec relationships
- **Task Management**: AI agent task orchestration and monitoring
- **Real-time Updates**: WebSocket-based live updates and notifications
- **Usage Analytics**: Subscription and usage tracking

---

## Architecture & Core Components

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Lattice Portal │    │  Mutation Engine│    │   External APIs │
│   (Dashboard)   │◄──►│   (FastAPI)     │◄──►│  (Claude, etc.) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   PostgreSQL    │              │
         └──────────────┤   (Multi-tenant)├──────────────┘
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   Redis/Queue   │
                        │  (WebSockets)   │
                        └─────────────────┘
```

### Core Components

#### 1. **Agent Orchestrator** (`src/agents/orchestrator.py`)
- Manages AI agent lifecycle and task distribution
- Coordinates between different agent types (validator, mutation, semantic, etc.)
- Handles agent registration and capability management

#### 2. **Approval Manager** (`src/approval/approval_manager.py`)
- Manages human-in-the-loop approval workflows
- Routes approval requests through multiple channels (VSCode, Web, MCP)
- Tracks approval status and responses

#### 3. **WebSocket Hub** (`src/approval/websocket_hub.py`)
- Provides real-time communication infrastructure
- Manages client connections and message routing
- Supports multiple client types (VSCode, Web, CLI)

#### 4. **Graph Repository** (`src/graph/`)
- Stores and queries codebase dependency graphs
- Supports both in-memory and Neo4j backends
- Provides semantic indexing capabilities

#### 5. **Task Manager** (`src/tasks/manager.py`)
- Orchestrates AI agent tasks
- Provides task status tracking and result management
- Handles task prioritization and scheduling

---

## Dashboard Feature Requirements

### 1. **Project Management Dashboard**

**Core Features:**
- Project creation, editing, and archival
- Multi-organization support with role-based access
- Project statistics and health metrics
- Spec synchronization status monitoring

**Key Metrics to Display:**
- Total specs per project
- Active mutations count
- Pending approvals
- Sync status and last sync time
- Error rates and validation issues

### 2. **Mutation Management Interface**

**Features Required:**
- Mutation proposal creation and editing
- Mutation status tracking (pending, running, completed, failed)
- Mutation history and audit trail
- Risk assessment visualization
- Rollback capabilities

**Status Flow:**
```
Proposed → Validating → Pending Approval → Approved → Executing → Completed
                    ↓                   ↓
                 Rejected           Cancelled
```

### 3. **Approval Workflow Dashboard**

**Features:**
- Pending approvals queue with priority sorting
- Approval request details with diff visualization
- Multi-channel approval routing (Web, VSCode, MCP)
- Approval history and audit logs
- Timeout management and escalation

### 4. **Spec Graph Visualization**

**Interactive Features:**
- Node-based graph visualization of spec dependencies
- Filterable by node type (SPEC, MODULE, CONTROLLER, etc.)
- Impact analysis visualization
- Dependency path highlighting
- Real-time graph updates

### 5. **Agent & Task Monitoring**

**Monitoring Capabilities:**
- Active agent status and health
- Task queue visualization
- Agent performance metrics
- Task execution history
- Error tracking and debugging

### 6. **Analytics & Usage Dashboard**

**Metrics & Reports:**
- API usage statistics
- Mutation success/failure rates
- Agent performance analytics
- User activity tracking
- Subscription usage monitoring

---

## API Endpoints Reference

### Authentication Endpoints

```typescript
// Authentication check
GET /auth/me
Headers: { "X-API-Key": "lk_live_..." }
Response: TenantContext

// API key management
GET /api/keys
POST /api/keys
DELETE /api/keys/{key_id}
```

### Mutation Management

```typescript
// Propose new mutation
POST /api/mutations/propose
Body: MutationRequest
Response: MutationResponse

// List mutations with filtering
GET /api/mutations?kind={type}&status={status}
Response: MutationListResponse

// Get specific mutation details
GET /api/mutations/{identifier}
Response: MutationDetails

// Get mutation status
GET /api/mutations/{identifier}/status
Response: MutationStatus

// Risk assessment
POST /api/mutations/risk-assess
Body: RiskAssessmentRequest
Response: RiskAssessmentResponse
```

### Approval Management

```typescript
// Respond to approval request
POST /api/approvals/{request_id}/respond
Body: ApprovalResponse

// Get pending approvals for user
GET /api/approvals/pending?user_id={user_id}
Response: PendingApprovals[]
```

### Project Management

```typescript
// Project CRUD operations
GET /api/projects
POST /api/projects
GET /api/projects/{project_id}
PUT /api/projects/{project_id}
DELETE /api/projects/{project_id}

// Project statistics
GET /api/projects/{project_id}/stats
Response: ProjectStats
```

### Spec Graph Operations

```typescript
// Get spec graph
GET /api/graph/specs/{spec_id}
Response: SpecGraphNode

// Get dependencies
GET /api/graph/dependencies/{spec_id}
Response: DependencyGraph

// Update spec graph
POST /api/graph/specs
Body: SpecGraphUpdate
```

### Task Management

```typescript
// Create task
POST /api/tasks
Body: TaskRequestPayload
Response: TaskRecord

// Get task status
GET /api/tasks/{task_id}
Response: TaskRecord

// List tasks
GET /api/tasks?status={status}&agent_type={type}
Response: TaskRecord[]
```

### Real-time WebSocket

```typescript
// WebSocket connection
WS /ws/{user_id}/{client_type}

// Message types:
- approval_request
- mutation_update
- task_status_change
- graph_update
- system_notification
```

---

## Data Models & Schemas

### Core Models for Dashboard

#### MutationRequest
```typescript
interface MutationRequest {
  spec_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'merge' | 'split' | 'refactor';
  changes: Record<string, any>;
  reason: string;
  initiated_by: string;
  priority: number; // 1-10
}
```

#### MutationProposal
```typescript
interface MutationProposal {
  proposal_id: string;
  spec_id: string;
  operation_type: string;
  current_version: string;
  proposed_changes: Record<string, any>;
  reasoning: string;
  confidence: number; // 0.0-1.0
  impact_analysis: Record<string, any>;
  requires_approval: boolean;
  affected_specs: string[];
}
```

#### ApprovalRequest
```typescript
interface ApprovalRequest {
  request_id: string;
  proposal_id: string;
  user_id: string;
  spec_id: string;
  mutation_type: string;
  current_content: string;
  proposed_content: string;
  diff: Record<string, any>;
  reasoning: string;
  confidence: number;
  impact_analysis: Record<string, any>;
  priority: 'critical' | 'high' | 'normal' | 'low';
  timeout_seconds: number;
  created_at: string;
  expires_at: string;
  preferred_channel: 'vscode' | 'web' | 'auto';
  fallback_channels: string[];
}
```

#### ProjectSummary
```typescript
interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  status: 'active' | 'archived' | 'suspended';
  total_specs: number;
  total_mutations: number;
  pending_mutations: number;
  last_mutation_at?: string;
  spec_sync_status: 'synced' | 'syncing' | 'error' | 'disabled';
  created_at: string;
}
```

#### TaskRecord
```typescript
interface TaskRecord {
  task_id: string;
  requester_id: string;
  operation: string;
  input_data: Record<string, any>;
  status: 'pending' | 'running' | 'clarification_requested' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  assigned_agent_id?: string;
  target_agent_type?: string;
  result?: Record<string, any>;
  error?: string;
  clarification_notes: Array<Record<string, any>>;
}
```

#### SpecGraphNode
```typescript
interface SpecGraphNode {
  id: string;
  type: 'SPEC' | 'MODULE' | 'CONTROLLER' | 'MODEL' | 'ROUTE_API' | 'TASK' | 'TEST' | 'AGENT' | 'GOAL' | 'CONSTRAINT' | 'DOCUMENTATION';
  name: string;
  content?: string;
  metadata: Record<string, any>;
  relationships: SpecGraphRelationship[];
  created_at: string;
  updated_at: string;
}
```

---

## Real-time Communication

### WebSocket Integration

The dashboard should establish WebSocket connections for real-time updates:

```typescript
// Connection establishment
const ws = new WebSocket(`ws://localhost:8000/ws/${userId}/web`);

// Message handling
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'approval_request':
      handleApprovalRequest(message.data);
      break;
    case 'mutation_update':
      updateMutationStatus(message.data);
      break;
    case 'task_status_change':
      updateTaskStatus(message.data);
      break;
    case 'graph_update':
      refreshSpecGraph(message.data);
      break;
    case 'system_notification':
      showNotification(message.data);
      break;
  }
};
```

### Message Types

1. **approval_request**: New approval requests requiring user attention
2. **mutation_update**: Status changes in mutation lifecycle
3. **task_status_change**: AI agent task progress updates
4. **graph_update**: Spec graph modifications
5. **system_notification**: General system messages and alerts

---

## Authentication & Authorization

### API Key Authentication

All API requests require authentication via API key:

```typescript
const headers = {
  'X-API-Key': 'lk_live_your_api_key_here',
  'Content-Type': 'application/json'
};
```

### Multi-tenant Context

The engine supports multi-tenancy with organization and project scoping:

```typescript
interface TenantContext {
  user_id: string;
  organization_id: string;
  project_ids: string[];
  scopes: string[];
  rate_limits: RateLimits;
}
```

### Required Scopes for Dashboard Features

- **specs:read, specs:write**: Spec management
- **mutations:read, mutations:write, mutations:execute**: Mutation operations
- **projects:read, projects:write**: Project management
- **org:read**: Organization data access
- **websocket:connect**: Real-time updates

---

## Dashboard Integration Guide

### 1. **Initial Setup**

```typescript
// Environment configuration
const config = {
  MUTATION_ENGINE_URL: 'http://localhost:8000',
  WEBSOCKET_URL: 'ws://localhost:8000',
  API_KEY: process.env.LATTICE_API_KEY
};

// API client setup
class LatticeEngineClient {
  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.headers = {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    };
  }
  
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: { ...this.headers, ...options.headers }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}
```

### 2. **State Management Integration**

```typescript
// Zustand store for mutations
interface MutationStore {
  mutations: MutationProposal[];
  selectedMutation: MutationProposal | null;
  loading: boolean;
  error: string | null;
  
  fetchMutations: () => Promise<void>;
  proposeMutation: (request: MutationRequest) => Promise<void>;
  updateMutationStatus: (id: string, status: string) => void;
}

const useMutationStore = create<MutationStore>((set, get) => ({
  mutations: [],
  selectedMutation: null,
  loading: false,
  error: null,
  
  fetchMutations: async () => {
    set({ loading: true });
    try {
      const response = await client.request('/api/mutations');
      set({ mutations: response.mutations, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  proposeMutation: async (request: MutationRequest) => {
    const response = await client.request('/api/mutations/propose', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    // Refresh mutations list
    get().fetchMutations();
  }
}));
```

### 3. **Component Integration Examples**

```typescript
// Mutation list component
const MutationList: React.FC = () => {
  const { mutations, loading, fetchMutations } = useMutationStore();
  
  useEffect(() => {
    fetchMutations();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="mutation-list">
      {mutations.map(mutation => (
        <MutationCard key={mutation.proposal_id} mutation={mutation} />
      ))}
    </div>
  );
};

// Approval queue component
const ApprovalQueue: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  
  useEffect(() => {
    // Fetch pending approvals
    const fetchApprovals = async () => {
      const response = await client.request(`/api/approvals/pending?user_id=${userId}`);
      setApprovals(response.approvals);
    };
    
    fetchApprovals();
    
    // WebSocket listener for new approvals
    const handleApprovalRequest = (approval: ApprovalRequest) => {
      setApprovals(prev => [...prev, approval]);
    };
    
    websocket.addEventListener('approval_request', handleApprovalRequest);
    
    return () => {
      websocket.removeEventListener('approval_request', handleApprovalRequest);
    };
  }, []);
  
  return (
    <div className="approval-queue">
      {approvals.map(approval => (
        <ApprovalCard key={approval.request_id} approval={approval} />
      ))}
    </div>
  );
};
```

---

## UI Component Specifications

### 1. **Mutation Status Badge**

```typescript
interface MutationStatusBadgeProps {
  status: 'proposed' | 'validating' | 'pending_approval' | 'approved' | 'executing' | 'completed' | 'failed' | 'rejected';
}

const statusConfig = {
  proposed: { color: 'blue', icon: 'clock' },
  validating: { color: 'yellow', icon: 'spinner' },
  pending_approval: { color: 'orange', icon: 'user-check' },
  approved: { color: 'green', icon: 'check' },
  executing: { color: 'purple', icon: 'play' },
  completed: { color: 'green', icon: 'check-circle' },
  failed: { color: 'red', icon: 'x-circle' },
  rejected: { color: 'red', icon: 'x' }
};
```

### 2. **Risk Assessment Indicator**

```typescript
interface RiskIndicatorProps {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  factors: string[];
}

const riskColors = {
  low: 'green',
  medium: 'yellow', 
  high: 'orange',
  critical: 'red'
};
```

### 3. **Spec Graph Visualization**

```typescript
// Using React Flow or similar graph library
interface SpecGraphProps {
  nodes: SpecGraphNode[];
  relationships: SpecGraphRelationship[];
  onNodeSelect: (node: SpecGraphNode) => void;
  highlightPath?: string[];
}
```

### 4. **Approval Diff Viewer**

```typescript
interface ApprovalDiffProps {
  currentContent: string;
  proposedContent: string;
  language: string;
  onApprove: () => void;
  onReject: () => void;
  onModify: (content: string) => void;
}
```

---

## Error Handling & Status Management

### Error Response Format

```typescript
interface APIError {
  error: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

### Status Polling Strategy

For long-running operations, implement polling:

```typescript
const pollMutationStatus = async (mutationId: string) => {
  const poll = async () => {
    const status = await client.request(`/api/mutations/${mutationId}/status`);
    
    if (['completed', 'failed', 'rejected'].includes(status.status)) {
      return status;
    }
    
    // Continue polling
    setTimeout(poll, 2000);
  };
  
  return poll();
};
```

### Rate Limiting Handling

```typescript
const handleRateLimit = (response: Response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    // Implement exponential backoff
    setTimeout(() => {
      // Retry request
    }, parseInt(retryAfter) * 1000);
  }
};
```

---

This documentation provides the foundation for implementing a comprehensive dashboard that interfaces with the Lattice Mutation Engine. Each section includes practical examples and implementation guidance to ensure successful integration.