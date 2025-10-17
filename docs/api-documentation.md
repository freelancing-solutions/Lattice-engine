# API Documentation v2.1.0

## Table of Contents
1. [Authentication & Security](#authentication--security)
2. [Mutation Management](#mutation-management)
3. [Project Operations](#project-operations)
4. [Webhook Integration](#webhook-integration)
5. [Rate Limiting & Best Practices](#rate-limiting--best-practices)

---

## Authentication & Security

### API Key Authentication

All API requests require authentication using an API key. Include your API key in the request header:

```http
Authorization: Bearer your-api-key-here
```

### Generating API Keys

1. Log into your Lattice Engine dashboard
2. Navigate to Settings > API Keys
3. Click "Generate New Key"
4. Give your key a descriptive name
5. Set appropriate permissions
6. Copy and securely store the key

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-access-token-here",
    "refresh_token": "refresh-token-here",
    "expires_in": 3600
  }
}
```

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password",
  "full_name": "John Doe",
  "organization_name": "Acme Corp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-access-token-here",
    "refresh_token": "refresh-token-here",
    "expires_in": 3600
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new-jwt-access-token",
    "refresh_token": "new-refresh-token",
    "expires_in": 3600
  }
}
```

#### Logout
```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refresh_token": "refresh-token-here"
}
```

**Response:**
```json
{
  "success": true
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer your-access-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe",
    "status": "active",
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-15T10:30:00Z"
  }
}
```

### Token Management

- **Access Token Expiration**: 60 minutes (configurable)
- **Refresh Token Expiration**: 30 days (configurable)
- **Token Refresh**: Clients should automatically refresh tokens before expiration
- **401 Error Handling**: On 401 responses, attempt token refresh before forcing logout

### Automatic Token Refresh

Clients should implement automatic token refresh logic:

1. **Schedule Refresh**: Refresh tokens 5 minutes before expiration
2. **Handle 401 Errors**: On 401 response, attempt token refresh and retry the original request
3. **Failed Refresh**: If refresh fails, clear tokens and redirect to login
4. **Prevent Concurrent Refresh**: Use flags to prevent multiple simultaneous refresh attempts

**Example Client Implementation:**
```javascript
// Schedule token refresh
const expiresAt = Date.now() + (expiresIn * 1000);
const refreshDelay = (expiresIn - 300) * 1000; // 5 minutes before expiration
setTimeout(refreshToken, refreshDelay);

// Handle 401 errors with automatic retry
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
}).catch(async error => {
  if (error.status === 401) {
    await refreshToken();
    return fetch(url, { // Retry original request
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
  }
  throw error;
});
```

### Security Best Practices

- **Never expose API keys** in client-side code or public repositories
- **Use environment variables** to store API keys securely
- **Rotate API keys** regularly (recommended every 90 days)
- **Use scoped permissions** - grant only necessary permissions
- **Monitor API usage** and set up alerts for unusual activity
- **Use HTTPS** for all API requests

---

## Mutation Management

### Create Mutation

Create a new mutation for code changes:

```http
POST /api/v1/mutations
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "spec_id": "user-auth",
  "title": "Add password hashing",
  "description": "Implement secure password hashing using bcrypt",
  "changes": {
    "type": "security-enhancement",
    "files_modified": [
      {
        "path": "src/auth.ts",
        "diff": "@@ -1,5 +1,8 @@\n import bcrypt from 'bcrypt';\n export class Auth {\n+  private async hashPassword(password: string): Promise<string> {\n+    return await bcrypt.hash(password, 12);\n+  }"
      }
    ]
  },
  "metadata": {
    "author": "john.doe",
    "ticket_id": "TICKET-123",
    "priority": "medium"
  }
}
```

**Response:**
```json
{
  "id": "mut_abc123",
  "status": "pending",
  "risk_assessment": {
    "score": "low",
    "factors": ["security_improvement", "minimal_scope"],
    "recommendations": ["auto_approve"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "spec_version": "2.1"
}
```

### List Mutations

```http
GET /api/v1/mutations?status=pending&limit=10&offset=0
Authorization: Bearer your-api-key
```

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected, deployed)
- `limit`: Number of results per page (default: 20, max: 100)
- `offset`: Number of results to skip (for pagination)
- `spec_id`: Filter by specification ID
- `author`: Filter by author

**Response:**
```json
{
  "mutations": [
    {
      "id": "mut_abc123",
      "title": "Add password hashing",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "author": "john.doe",
      "risk_score": "low"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

### Get Mutation Details

```http
GET /api/v1/mutations/{mutation_id}
Authorization: Bearer your-api-key
```

**Response:**
```json
{
  "id": "mut_abc123",
  "title": "Add password hashing",
  "description": "Implement secure password hashing using bcrypt",
  "status": "pending",
  "spec_id": "user-auth",
  "changes": {
    "type": "security-enhancement",
    "files_modified": ["src/auth.ts"],
    "lines_added": 8,
    "lines_removed": 2
  },
  "risk_assessment": {
    "score": "low",
    "analysis": "Security improvement with minimal breaking changes",
    "test_coverage": 95,
    "security_scan": "passed"
  },
  "reviews": [
    {
      "reviewer": "security-team",
      "status": "approved",
      "comment": "Good security improvement",
      "reviewed_at": "2024-01-15T11:00:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### Review Mutation

```http
POST /api/v1/mutations/{mutation_id}/review
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "action": "approve",
  "comment": "Security improvements look good. Ready for deployment."
}
```

**Request Body Parameters:**
- `action`: Either "approve" or "reject"
- `comment`: Optional review comment
- `conditions`: Optional conditions for approval

### Update Mutation

```http
PUT /api/v1/mutations/{mutation_id}
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "title": "Updated title",
  "description": "Updated description",
  "changes": {
    "additional_files": ["src/utils.ts"]
  }
}
```

### Delete Mutation

```http
DELETE /api/v1/mutations/{mutation_id}
Authorization: Bearer your-api-key
```

---

## Project Operations

### Get Project Information

```http
GET /api/v1/projects/{project_id}
Authorization: Bearer your-api-key
```

**Response:**
```json
{
  "id": "proj_123",
  "name": "E-commerce Platform",
  "description": "Online shopping platform with user authentication",
  "status": "active",
  "settings": {
    "auto_approve": {
      "enabled": true,
      "risk_threshold": "low"
    },
    "test_coverage": {
      "required": true,
      "minimum": 80
    },
    "security_scan": {
      "enabled": true,
      "fail_on_high": true
    }
  },
  "team": [
    {
      "user_id": "user_123",
      "role": "owner",
      "permissions": ["admin", "deploy", "review"]
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Update Project Settings

```http
PUT /api/v1/projects/{project_id}/settings
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "auto_approve": {
    "enabled": true,
    "risk_threshold": "medium"
  },
  "notifications": {
    "email": true,
    "slack": "#deployments",
    "webhook": "https://hooks.slack.com/..."
  }
}
```

### List Team Members

```http
GET /api/v1/projects/{project_id}/members
Authorization: Bearer your-api-key
```

### Invite Team Member

```http
POST /api/v1/projects/{project_id}/members
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "email": "newmember@example.com",
  "role": "developer",
  "permissions": ["review", "deploy"]
}
```

### Get Project Statistics

```http
GET /api/v1/projects/{project_id}/stats
Authorization: Bearer your-api-key
```

**Response:**
```json
{
  "mutations": {
    "total": 150,
    "pending": 5,
    "approved": 120,
    "rejected": 10,
    "deployed": 115
  },
  "team": {
    "total_members": 8,
    "active_members": 6
  },
  "performance": {
    "avg_review_time": "2.5 hours",
    "avg_deploy_time": "30 minutes",
    "success_rate": 98.5
  },
  "period": "30_days"
}
```

---

## Webhook Integration

### Create Webhook

```http
POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "name": "Deployment Notifications",
  "url": "https://your-app.com/webhooks/lattice",
  "events": [
    "mutation.created",
    "mutation.approved",
    "mutation.deployed",
    "mutation.rejected"
  ],
  "secret": "your-webhook-secret",
  "active": true,
  "headers": {
    "Authorization": "Bearer your-token"
  }
}
```

**Response:**
```json
{
  "id": "webhook_123",
  "name": "Deployment Notifications",
  "url": "https://your-app.com/webhooks/lattice",
  "events": ["mutation.created", "mutation.approved"],
  "active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### List Webhooks

```http
GET /api/v1/webhooks
Authorization: Bearer your-api-key
```

### Update Webhook

```http
PUT /api/v1/webhooks/{webhook_id}
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "active": false,
  "events": ["mutation.deployed"]
}
```

### Delete Webhook

```http
DELETE /api/v1/webhooks/{webhook_id}
Authorization: Bearer your-api-key
```

### Webhook Payload Structure

When events trigger your webhook, you'll receive a JSON payload:

```json
{
  "event": "mutation.approved",
  "data": {
    "mutation": {
      "id": "mut_abc123",
      "title": "Add password hashing",
      "status": "approved",
      "spec_id": "user-auth"
    },
    "project": {
      "id": "proj_123",
      "name": "E-commerce Platform"
    },
    "reviewer": "security-team",
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

### Securing Webhooks

1. **Use HTTPS URLs** for all webhook endpoints
2. **Set a secret** and verify signatures using HMAC-SHA256
3. **Validate timestamps** to prevent replay attacks
4. **Return 200 OK** quickly (process asynchronously if needed)

**Signature Verification Example (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Rate Limiting & Best Practices

### Rate Limits

The API implements rate limiting to ensure fair usage:

| Plan | Requests per Hour | Requests per Minute | Burst Limit |
|------|------------------|---------------------|-------------|
| Free | 1,000 | 100 | 20 |
| Pro | 10,000 | 500 | 50 |
| Enterprise | Unlimited | 1,000 | 100 |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

### Handling Rate Limits

When you hit the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

**Best Practices:**
- Implement exponential backoff for retries
- Use the `Retry-After` header when available
- Cache responses when possible
- Use webhooks for real-time updates instead of polling

### Pagination

Large result sets are paginated:

```http
GET /api/v1/mutations?limit=20&offset=40
```

**Response includes pagination info:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "has_next": true,
    "has_prev": true
  }
}
```

### Best Practices

#### Request Optimization
- **Use specific fields** with `?fields=id,title,status`
- **Filter early** using query parameters
- **Compress responses** with `Accept-Encoding: gzip`
- **Batch operations** when possible

#### Error Handling
- **Check HTTP status codes** first
- **Parse error response** for details
- **Implement retry logic** with backoff
- **Log errors** for debugging

#### Security
- **Use HTTPS** for all requests
- **Validate inputs** before sending
- **Never log sensitive data** (API keys, tokens)
- **Rotate credentials** regularly

#### Performance
- **Cache GET requests** when appropriate
- **Use webhooks** for real-time updates
- **Batch API calls** to reduce overhead
- **Monitor usage** and optimize accordingly

### SDK Examples

#### JavaScript/TypeScript
```javascript
import { Lattice } from '@lattice/engine';

const lattice = new Lattice({
  apiKey: process.env.LATTICE_API_KEY,
  baseUrl: 'https://api.project-lattice.site'
});

// Create mutation with retry logic
async function createMutationWithRetry(specData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await lattice.mutations.create(specData);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

#### Python
```python
import asyncio
import aiohttp
from lattice import LatticeClient

async def main():
    client = LatticeClient(api_key="your-api-key")

    # Create mutation
    mutation = await client.mutations.create({
        "spec_id": "user-auth",
        "title": "Add password hashing",
        "changes": {...}
    })

    # Poll for status updates
    while mutation.status in ["pending", "in_review"]:
        await asyncio.sleep(5)
        mutation = await client.mutations.get(mutation.id)
        print(f"Status: {mutation.status}")

asyncio.run(main())
```

---

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Check request body and parameters |
| 401 | Unauthorized | Verify API key is valid and has permissions |
| 403 | Forbidden | Check user permissions for this action |
| 404 | Not Found | Verify resource ID exists |
| 409 | Conflict | Resource state conflict, refresh and retry |
| 422 | Validation Error | Check request validation rules |
| 429 | Rate Limit Exceeded | Wait and retry with backoff |
| 500 | Server Error | Contact support if persists |

---

## Support

For API-related questions and issues:

- **Documentation**: [docs.lattice.dev/api](https://docs.lattice.dev/api)
- **API Status**: [status.lattice.dev](https://status.lattice.dev)
- **Support**: api-support@lattice.dev
- **Community**: [GitHub Discussions](https://github.com/lattice-engine/discussions)

---

*API Documentation v2.1.0 - Last updated: January 15, 2024*