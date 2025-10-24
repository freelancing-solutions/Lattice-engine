# Lattice Mutation Engine - API Reference

## Table of Contents
1. [Authentication](#authentication)
2. [Mutation Management API](#mutation-management-api)
3. [Spec Management API](#spec-management-api)
4. [Graph Query API](#graph-query-api)
5. [Task Management API](#task-management-api)
6. [Approval Workflow API](#approval-workflow-api)
7. [Project Management API](#project-management-api)
8. [WebSocket API](#websocket-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

All API endpoints require authentication via API key in the request header.

### Headers
```http
X-API-Key: lk_live_your_api_key_here
Content-Type: application/json
```

### Authentication Check
```http
GET /auth/me
```

**Response:**
```json
{
  "user_id": "uuid",
  "organization_id": "uuid", 
  "project_ids": ["uuid1", "uuid2"],
  "scopes": ["specs:read", "mutations:write"],
  "rate_limits": {
    "requests_per_minute": 100,
    "requests_per_hour": 1000
  }
}
```

---

## Mutation Management API

### Propose Mutation
Create a new mutation proposal for review and execution.

```http
POST /api/mutations/propose
```

**Request Body:**
```json
{
  "spec_id": "string",
  "operation_type": "create|update|delete|merge|split|refactor",
  "changes": {
    "field_name": "new_value",
    "nested": {
      "property": "value"
    }
  },
  "reason": "Description of why this change is needed",
  "initiated_by": "user_id_or_agent_id",
  "priority": 5
}
```

**Response:**
```json
{
  "mutation_id": "uuid",
  "status": "proposed",
  "message": "Mutation proposal created successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### List Mutations
Retrieve mutations with optional filtering.

```http
GET /api/mutations?kind={type}&status={status}&limit={limit}&offset={offset}
```

**Query Parameters:**
- `kind` (optional): Filter by mutation type
- `status` (optional): Filter by status (proposed, validating, pending_approval, etc.)
- `limit` (optional): Number of results to return (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "mutations": [
    {
      "proposal_id": "uuid",
      "spec_id": "uuid",
      "operation_type": "update",
      "status": "pending_approval",
      "confidence": 0.85,
      "requires_approval": true,
      "created_at": "2024-01-15T10:30:00Z",
      "reasoning": "Updated validation logic for better error handling"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

### Get Mutation Details
Retrieve detailed information about a specific mutation.

```http
GET /api/mutations/{mutation_id}
```

**Response:**
```json
{
  "proposal_id": "uuid",
  "spec_id": "uuid",
  "operation_type": "update",
  "current_version": "1.2.0",
  "proposed_changes": {
    "validation_rules": ["new_rule_1", "new_rule_2"]
  },
  "reasoning": "Enhanced validation for better data integrity",
  "confidence": 0.92,
  "impact_analysis": {
    "affected_specs": ["spec1", "spec2"],
    "risk_level": "medium",
    "estimated_effort": "2 hours"
  },
  "requires_approval": true,
  "status": "pending_approval",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Get Mutation Status
Check the current status of a mutation.

```http
GET /api/mutations/{mutation_id}/status
```

**Response:**
```json
{
  "mutation_id": "uuid",
  "status": "executing",
  "progress": 65,
  "current_step": "applying_changes",
  "estimated_completion": "2024-01-15T11:00:00Z",
  "logs": [
    {
      "timestamp": "2024-01-15T10:45:00Z",
      "level": "info",
      "message": "Validation completed successfully"
    }
  ]
}
```

### Risk Assessment
Assess the risk level of proposed changes.

```http
POST /api/mutations/risk-assess
```

**Request Body:**
```json
{
  "spec_id": "uuid",
  "operation_type": "update",
  "changes": {
    "database_schema": "modified"
  },
  "context": {
    "environment": "production",
    "user_count": 10000
  }
}
```

**Response:**
```json
{
  "risk_level": "high",
  "confidence": 0.88,
  "factors": [
    "Database schema modification in production",
    "High user impact potential",
    "No rollback strategy defined"
  ],
  "recommendations": [
    "Create database backup before execution",
    "Schedule during low-traffic hours",
    "Implement gradual rollout strategy"
  ]
}
```

---

## Spec Management API

### List Specs
Retrieve specs for a project with filtering and pagination.

```http
GET /api/specs/{project_id}?status={status}&limit={limit}&offset={offset}
```

**Query Parameters:**
- `status` (optional): Filter by spec status (draft, active, deprecated)
- `limit` (optional): Number of results (default: 100, max: 500)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "project_id": "uuid",
  "specs": [
    {
      "id": "uuid",
      "name": "User Authentication Spec",
      "type": "SPEC",
      "description": "Handles user login and authentication",
      "status": "active",
      "content": "# Authentication Specification...",
      "metadata": {
        "version": "1.0.0",
        "author": "john.doe@example.com"
      },
      "created_at": "2024-01-10T09:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "limit": 100,
  "offset": 0
}
```

### Create Spec
Create a new specification.

```http
POST /api/specs/create
```

**Request Body:**
```json
{
  "name": "Payment Processing Spec",
  "description": "Handles payment transactions and validation",
  "content": "# Payment Processing\n\nThis spec defines...",
  "spec_source": "manual",
  "metadata": {
    "version": "1.0.0",
    "tags": ["payment", "transaction"]
  }
}
```

**Response:**
```json
{
  "created": {
    "id": "uuid",
    "name": "Payment Processing Spec",
    "type": "SPEC",
    "status": "draft",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Update Spec
Update an existing specification.

```http
PATCH /api/specs/update
```

**Request Body:**
```json
{
  "spec_id": "uuid",
  "updates": {
    "content": "# Updated Payment Processing\n\nNew requirements...",
    "description": "Updated payment processing specification",
    "metadata": {
      "version": "1.1.0"
    }
  }
}
```

### Approve Spec
Approve a spec for active use.

```http
POST /api/specs/approve
```

**Request Body:**
```json
{
  "spec_id": "uuid",
  "approved_by": "user_id",
  "notes": "Approved after security review"
}
```

### Delete Spec
Delete a specification.

```http
DELETE /api/specs/{spec_id}
```

**Response:**
```json
{
  "deleted": true,
  "spec_id": "uuid",
  "message": "Spec deleted successfully"
}
```

### Generate Spec
Generate a new spec using AI assistance.

```http
POST /api/specs/generate
```

**Request Body:**
```json
{
  "prompt": "Create a spec for user profile management with CRUD operations",
  "template_type": "api_spec",
  "context": {
    "project_type": "web_application",
    "framework": "fastapi"
  }
}
```

### Validate Spec
Validate a specification against business rules.

```http
POST /api/specs/validate
```

**Request Body:**
```json
{
  "spec_id": "uuid",
  "content": "# Spec content to validate...",
  "validation_rules": ["schema", "dependency", "semantic"]
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "type": "style",
      "message": "Consider adding more detailed examples"
    }
  ],
  "suggestions": [
    {
      "type": "enhancement",
      "message": "Add error handling specifications"
    }
  ]
}
```

---

## Graph Query API

### Execute Graph Query
Query the spec dependency graph.

```http
POST /api/graph/query
```

**Request Body:**
```json
{
  "query_type": "cypher|traversal|neighbors",
  "query": "MATCH (n:Spec) RETURN n LIMIT 10",
  "parameters": {
    "limit": 10
  },
  "start_node": "uuid",
  "relationship_types": ["DEPENDS_ON", "IMPLEMENTS"],
  "max_depth": 3
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "User Service",
      "type": "SPEC",
      "relationships": [
        {
          "target": "uuid2",
          "type": "DEPENDS_ON",
          "properties": {}
        }
      ]
    }
  ],
  "query_time_ms": 45.2,
  "total_results": 1
}
```

### Semantic Search
Search specs using semantic similarity.

```http
POST /api/graph/semantic-search
```

**Request Body:**
```json
{
  "query": "user authentication and authorization",
  "similarity_threshold": 0.7,
  "max_results": 10,
  "filters": {
    "node_type": "SPEC",
    "status": "active"
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Authentication Service",
      "similarity_score": 0.92,
      "content_snippet": "Handles user login, JWT tokens, and role-based access..."
    }
  ],
  "query": "user authentication and authorization",
  "similarity_threshold": 0.7,
  "search_time_ms": 23.1
}
```

### Get Semantic Search Stats
Get statistics about the semantic search index.

```http
GET /api/graph/semantic-search/stats
```

**Response:**
```json
{
  "available": true,
  "backend": "qdrant",
  "total_documents": 1250,
  "index_size_mb": 45.2,
  "last_updated": "2024-01-15T10:00:00Z"
}
```

---

## Task Management API

### Request Task
Submit a task for AI agent processing.

```http
POST /api/tasks/request
```

**Request Body:**
```json
{
  "requester_id": "user_id",
  "operation": "validate_spec",
  "input_data": {
    "spec_id": "uuid",
    "validation_type": "comprehensive"
  },
  "target_agent_type": "validator",
  "priority": 7
}
```

**Response:**
```json
{
  "status": "requested",
  "task": {
    "task_id": "uuid",
    "requester_id": "user_id",
    "operation": "validate_spec",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "priority": 7
  }
}
```

### Get Task Status
Check the status of a submitted task.

```http
GET /api/tasks/status/{task_id}
```

**Response:**
```json
{
  "task": {
    "task_id": "uuid",
    "requester_id": "user_id",
    "operation": "validate_spec",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:32:00Z",
    "assigned_agent_id": "validator_agent_1",
    "result": {
      "validation_passed": true,
      "issues_found": 0,
      "recommendations": ["Add more examples"]
    }
  }
}
```

### Clarify Task
Request clarification for a task that needs more information.

```http
POST /api/tasks/clarify
```

**Request Body:**
```json
{
  "task_id": "uuid",
  "note": "Please specify which validation rules to apply",
  "from_user_id": "user_id"
}
```

### Complete Task
Mark a task as completed (typically called by agents).

```http
POST /api/tasks/complete
```

**Request Body:**
```json
{
  "task_id": "uuid",
  "success": true,
  "result": {
    "validation_score": 0.95,
    "issues": [],
    "suggestions": ["Consider adding error handling"]
  },
  "notes": "Validation completed successfully"
}
```

---

## Approval Workflow API

### Respond to Approval
Submit a response to an approval request.

```http
POST /api/approvals/{request_id}/respond
```

**Request Body:**
```json
{
  "request_id": "uuid",
  "decision": "approved|rejected|modified",
  "modified_content": "Modified spec content...",
  "user_notes": "Approved with minor modifications",
  "responded_via": "web",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Approval response recorded"
}
```

### Get Pending Approvals
Retrieve pending approval requests for a user.

```http
GET /api/approvals/pending?user_id={user_id}
```

**Response:**
```json
{
  "approvals": [
    {
      "request_id": "uuid",
      "proposal_id": "uuid",
      "user_id": "uuid",
      "spec_id": "uuid",
      "mutation_type": "update",
      "current_content": "Original spec content...",
      "proposed_content": "Modified spec content...",
      "diff": {
        "additions": 5,
        "deletions": 2,
        "changes": [
          {
            "line": 10,
            "type": "addition",
            "content": "+ New validation rule"
          }
        ]
      },
      "reasoning": "Enhanced validation for better data integrity",
      "confidence": 0.92,
      "priority": "high",
      "timeout_seconds": 300,
      "created_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

## Project Management API

### List Projects
Get all projects for the authenticated organization.

```http
GET /api/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "E-commerce Platform",
      "slug": "ecommerce-platform",
      "organization_id": "uuid",
      "status": "active",
      "total_specs": 25,
      "total_mutations": 150,
      "pending_mutations": 3,
      "last_mutation_at": "2024-01-15T09:30:00Z",
      "spec_sync_status": "synced",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Project
Create a new project.

```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "Mobile App Backend",
  "slug": "mobile-app-backend",
  "description": "Backend services for mobile application",
  "spec_sync_enabled": true,
  "spec_sync_directory": "/path/to/specs",
  "repository_url": "https://github.com/org/mobile-backend",
  "repository_branch": "main",
  "settings": {
    "auto_approve_low_risk": false,
    "notification_channels": ["email", "slack"]
  }
}
```

### Get Project Details
Retrieve detailed information about a project.

```http
GET /api/projects/{project_id}
```

### Update Project
Update project settings and configuration.

```http
PUT /api/projects/{project_id}
```

### Get Project Statistics
Get detailed statistics for a project.

```http
GET /api/projects/{project_id}/stats
```

**Response:**
```json
{
  "project_id": "uuid",
  "specs": {
    "total": 25,
    "active": 20,
    "draft": 3,
    "deprecated": 2
  },
  "mutations": {
    "total": 150,
    "successful": 142,
    "failed": 5,
    "pending": 3
  },
  "approvals": {
    "pending": 2,
    "approved_today": 8,
    "average_response_time_minutes": 15
  },
  "sync_status": {
    "last_sync": "2024-01-15T10:00:00Z",
    "sync_errors": 0,
    "files_synced": 25
  }
}
```

---

## WebSocket API

### Connection
Establish a WebSocket connection for real-time updates.

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/{user_id}/{client_type}');
```

**Client Types:**
- `web`: Web dashboard clients
- `vscode`: VSCode extension clients  
- `cli`: Command-line interface clients

### Message Format
All WebSocket messages follow this format:

```json
{
  "type": "message_type",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    // Message-specific data
  }
}
```

### Message Types

#### Approval Request
```json
{
  "type": "approval_request",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "request_id": "uuid",
    "spec_id": "uuid",
    "mutation_type": "update",
    "priority": "high",
    "expires_at": "2024-01-15T10:35:00Z"
  }
}
```

#### Mutation Update
```json
{
  "type": "mutation_update",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "mutation_id": "uuid",
    "status": "executing",
    "progress": 65,
    "message": "Applying changes to database schema"
  }
}
```

#### Task Status Change
```json
{
  "type": "task_status_change",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "task_id": "uuid",
    "old_status": "running",
    "new_status": "completed",
    "result": {
      "success": true,
      "output": "Task completed successfully"
    }
  }
}
```

#### Graph Update
```json
{
  "type": "graph_update",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "spec_id": "uuid",
    "change_type": "node_added|node_updated|relationship_added",
    "affected_nodes": ["uuid1", "uuid2"]
  }
}
```

#### System Notification
```json
{
  "type": "system_notification",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "level": "info|warning|error",
    "title": "System Maintenance",
    "message": "Scheduled maintenance will begin in 30 minutes",
    "action_required": false
  }
}
```

---

## Error Handling

### Error Response Format
All API errors follow this consistent format:

```json
{
  "error": "ValidationError",
  "message": "Spec name is required and cannot be empty",
  "details": {
    "field": "name",
    "code": "REQUIRED_FIELD_MISSING"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid API key)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (resource already exists)
- `422`: Unprocessable Entity (business logic errors)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error
- `503`: Service Unavailable (engine not initialized)

### Common Error Types

#### Validation Errors
```json
{
  "error": "ValidationError",
  "message": "Invalid mutation request",
  "details": {
    "field": "operation_type",
    "allowed_values": ["create", "update", "delete", "merge", "split", "refactor"]
  }
}
```

#### Authentication Errors
```json
{
  "error": "AuthenticationError",
  "message": "Invalid API key",
  "details": {
    "code": "INVALID_API_KEY"
  }
}
```

#### Resource Not Found
```json
{
  "error": "NotFoundError",
  "message": "Spec not found",
  "details": {
    "resource_type": "spec",
    "resource_id": "uuid"
  }
}
```

#### Rate Limiting
```json
{
  "error": "RateLimitError",
  "message": "Rate limit exceeded",
  "details": {
    "limit": 100,
    "window": "per_minute",
    "retry_after": 60
  }
}
```

---

## Rate Limiting

### Default Limits
- **Mutations**: 30 requests per minute
- **General API**: 100 requests per minute
- **WebSocket connections**: 5 concurrent connections per user

### Rate Limit Headers
Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642248600
Retry-After: 60
```

### Handling Rate Limits
When rate limited (HTTP 429), implement exponential backoff:

```javascript
async function apiRequest(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, 4 - retries) * 1000;
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiRequest(url, options, retries - 1);
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}
```

---

This API reference provides comprehensive documentation for integrating with the Lattice Mutation Engine. Each endpoint includes request/response examples and error handling guidance to ensure successful dashboard implementation.