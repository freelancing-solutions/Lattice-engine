# Lattice Mutation Engine API Documentation

This document provides comprehensive documentation for the Lattice Mutation Engine API endpoints.

## Base URL

All API endpoints are available under two base paths:
- `/` - Root level endpoints
- `/api` - All endpoints mirrored under `/api` for CLI/extension compatibility

## Authentication

Most endpoints require API key authentication via the `X-API-Key` header:
```
X-API-Key: your-api-key-here
```

## Core Endpoints

### Mutations

#### Propose Mutation
- **Endpoint**: `POST /mutations/propose` or `POST /api/mutations/propose`
- **Description**: Propose a new mutation for system changes
- **Request Body**:
  ```json
  {
    "spec_id": "string",
    "operation_type": "string",
    "changes": {}
  }
  ```
- **Response**: Mutation proposal with approval requirements

#### List Mutations
- **Endpoint**: `GET /api/mutations`
- **Description**: List all mutations (proposals and results)
- **Query Parameters**:
  - `kind`: Filter by type (`proposal`, `result`, `all`)
- **Response**: List of mutations

#### Get Mutation
- **Endpoint**: `GET /api/mutations/{identifier}`
- **Description**: Get specific mutation details
- **Response**: Mutation details

#### Get Mutation Status
- **Endpoint**: `GET /api/mutations/{identifier}/status`
- **Description**: Get current status of a mutation
- **Response**: Status information

#### Risk Assessment
- **Endpoint**: `POST /api/mutations/risk-assess`
- **Description**: Assess risk of proposed changes
- **Request Body**:
  ```json
  {
    "spec_id": "string",
    "operation_type": "string", 
    "changes": {},
    "context": {}
  }
  ```
- **Response**: Risk assessment results

### Specs

#### List Specs
- **Endpoint**: `GET /api/specs`
- **Description**: List all specifications
- **Query Parameters**:
  - `status`: Filter by status
  - `limit`: Maximum results (1-1000)
  - `offset`: Results to skip
- **Response**: Paginated list of specs

#### Create Spec
- **Endpoint**: `POST /api/specs`
- **Description**: Create a new specification
- **Request Body**: Spec definition
- **Response**: Created spec details

#### Get Spec
- **Endpoint**: `GET /api/specs/{spec_id}`
- **Description**: Get specific specification
- **Response**: Spec details

#### Update Spec
- **Endpoint**: `PUT /api/specs/{spec_id}`
- **Description**: Update existing specification
- **Request Body**: Updated spec data
- **Response**: Updated spec details

#### Approve Spec
- **Endpoint**: `POST /api/specs/approve`
- **Description**: Approve a specification
- **Request Body**:
  ```json
  {
    "spec_id": "string"
  }
  ```
- **Response**: Approval confirmation

#### Delete Spec
- **Endpoint**: `DELETE /api/specs/{spec_id}`
- **Description**: Delete a specification
- **Response**: Deletion confirmation

#### Generate Spec
- **Endpoint**: `POST /api/specs/generate`
- **Description**: Generate new spec from template
- **Request Body**:
  ```json
  {
    "template": "string",
    "parameters": {}
  }
  ```
- **Response**: Generated spec

#### Validate Spec
- **Endpoint**: `POST /api/specs/validate`
- **Description**: Validate specification correctness
- **Request Body**: Spec to validate
- **Response**: Validation results

### Deployments

#### Create Deployment
- **Endpoint**: `POST /api/deployments`
- **Description**: Create a new deployment
- **Request Body**:
  ```json
  {
    "mutation_id": "string",
    "spec_id": "string", 
    "environment": "development|staging|production",
    "strategy": "blue_green|rolling|canary|rollback",
    "config": {}
  }
  ```
- **Response**: Deployment details

#### List Deployments
- **Endpoint**: `GET /api/deployments`
- **Description**: List deployments with filtering
- **Query Parameters**:
  - `environment`: Filter by environment
  - `status`: Filter by status
  - `limit`: Maximum results (1-1000)
  - `offset`: Results to skip
- **Response**: Paginated deployment list

#### Get Deployment
- **Endpoint**: `GET /api/deployments/{deployment_id}`
- **Description**: Get deployment details
- **Response**: Deployment information

#### Get Deployment Status
- **Endpoint**: `GET /api/deployments/{deployment_id}/status`
- **Description**: Get deployment status with progress
- **Response**: Status with progress percentage and estimated time

#### Rollback Deployment
- **Endpoint**: `POST /api/deployments/{deployment_id}/rollback`
- **Description**: Rollback a deployment
- **Request Body**:
  ```json
  {
    "reason": "string"
  }
  ```
- **Response**: Rollback deployment details

### MCP (Model Context Protocol)

#### List MCP Servers
- **Endpoint**: `GET /api/mcp/servers`
- **Description**: List all registered MCP servers
- **Response**: List of MCP servers

#### Register MCP Server
- **Endpoint**: `POST /api/mcp/servers/{server_id}/register`
- **Description**: Register a new MCP server
- **Request Body**: Server configuration
- **Response**: Registration confirmation

#### Connect to MCP Server
- **Endpoint**: `POST /api/mcp/servers/{server_id}/connect`
- **Description**: Connect to an MCP server
- **Response**: Connection status

#### Disconnect from MCP Server
- **Endpoint**: `POST /api/mcp/servers/{server_id}/disconnect`
- **Description**: Disconnect from an MCP server
- **Response**: Disconnection confirmation

#### Get MCP Server Status
- **Endpoint**: `GET /api/mcp/status/{server_id}`
- **Description**: Get MCP server status
- **Response**: Server status information

#### Sync with MCP Server
- **Endpoint**: `POST /api/mcp/sync`
- **Description**: Synchronize with MCP server
- **Request Body**:
  ```json
  {
    "server_id": "string"
  }
  ```
- **Response**: Sync operation details

#### Get MCP Server Health
- **Endpoint**: `GET /api/mcp/health/{server_id}`
- **Description**: Get MCP server health status
- **Response**: Health check results

### Approvals

#### Respond to Approval
- **Endpoint**: `POST /approvals/{request_id}/respond` or `POST /api/approvals/{request_id}/respond`
- **Description**: Respond to an approval request
- **Request Body**: Approval response
- **Response**: Processing confirmation

#### Get Pending Approvals
- **Endpoint**: `GET /approvals/pending` or `GET /api/approvals/pending`
- **Description**: Get pending approval requests for user
- **Query Parameters**:
  - `user_id`: User ID to filter by
- **Response**: List of pending approvals

### Health & Monitoring

#### Health Check
- **Endpoint**: `GET /health` or `GET /api/health`
- **Description**: Check API health status
- **Response**: Health status

#### Metrics
- **Endpoint**: `GET /metrics` or `GET /api/metrics`
- **Description**: Get API metrics
- **Response**: Metrics data

### WebSocket

#### WebSocket Connection
- **Endpoint**: `WS /ws/{user_id}/{client_type}`
- **Description**: WebSocket connection for real-time updates
- **Query Parameters**:
  - `token`: Authentication token
- **Events**:
  - `approval:response`: Handle approval responses

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

Some endpoints implement rate limiting. When rate limited, you'll receive:
- Status: `429 Too Many Requests`
- Response includes retry timing information

## Pagination

List endpoints support pagination with `limit` and `offset` parameters:
- `limit`: Maximum number of results (default: 100, max: 1000)
- `offset`: Number of results to skip (default: 0)

Response includes pagination metadata:
```json
{
  "items": [...],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

## Permissions

Endpoints require specific permissions:
- `mutations:read` - Read mutation data
- `mutations:write` - Create/modify mutations
- `deployment:create` - Create deployments
- `deployment:read` - Read deployment data
- `deployment:rollback` - Rollback deployments
- `mcp:read` - Read MCP server data
- `mcp:write` - Modify MCP servers
- `mcp:admin` - Administer MCP servers

## Examples

### Create a Deployment
```bash
curl -X POST "http://localhost:8000/api/deployments" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "mutation_id": "mut_123",
    "spec_id": "spec_456",
    "environment": "staging",
    "strategy": "blue_green",
    "config": {}
  }'
```

### List Specs with Pagination
```bash
curl "http://localhost:8000/api/specs?limit=50&offset=100" \
  -H "X-API-Key: your-api-key"
```

### Get Deployment Status
```bash
curl "http://localhost:8000/api/deployments/dep_789/status" \
  -H "X-API-Key: your-api-key"
```

This API documentation covers all the endpoints implemented for CLI compatibility with the Lattice Mutation Engine.