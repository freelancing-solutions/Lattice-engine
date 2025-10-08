# Authentication and Role-Based Access Control (RBAC)

## Overview

The Lattice Engine now includes a comprehensive authentication and authorization system that supports multi-tenancy, role-based access control (RBAC), and secure API access. This system enables organizations to manage users, projects, and permissions at scale.

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication Methods](#authentication-methods)
3. [Multi-Tenancy](#multi-tenancy)
4. [Role-Based Access Control](#role-based-access-control)
5. [API Integration](#api-integration)
6. [Security Features](#security-features)
7. [Configuration](#configuration)
8. [Usage Examples](#usage-examples)

## Architecture

The authentication system consists of several key components:

- **AuthService**: Core authentication and authorization logic
- **Middleware**: FastAPI dependencies for request authentication
- **Models**: User, Organization, and Project data models
- **Rate Limiting**: Protection against abuse and DoS attacks
- **JWT Tokens**: Secure token-based authentication
- **API Keys**: Service-to-service authentication

### Component Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │  VSCode Ext.   │    │   MCP SDK      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ JWT/API Key          │ API Key              │ API Key
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Middleware                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Auth Service   │  │  Rate Limiter   │  │  Tenant Context │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Model    │    │ Organization    │    │  Project Model  │
│                 │    │     Model       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Authentication Methods

### 1. JWT Token Authentication

JWT tokens are used for user authentication in web applications and provide secure, stateless authentication.

**Token Structure:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "org_id": "org_123",
  "role": "developer",
  "permissions": ["mutations:read", "mutations:write"],
  "exp": 1640995200,
  "iat": 1640908800
}
```

**Usage:**
```python
# In your API client
headers = {
    "Authorization": f"Bearer {jwt_token}"
}
response = requests.get("/api/mutations", headers=headers)
```

### 2. API Key Authentication

API keys are used for service-to-service authentication and long-lived access.

**API Key Format:**
```
lk_live_1234567890abcdef1234567890abcdef
lk_test_abcdef1234567890abcdef1234567890
```

**Usage:**
```python
# In your API client
headers = {
    "X-API-Key": "lk_live_1234567890abcdef1234567890abcdef"
}
response = requests.get("/api/mutations", headers=headers)
```

## Multi-Tenancy

The system supports multi-tenant architecture where each organization operates in isolation.

### Organization Structure

```python
class Organization(BaseModel):
    id: str
    name: str
    slug: str
    status: OrganizationStatus
    subscription_tier: str
    settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
```

### Tenant Context

Every authenticated request includes tenant context:

```python
class TenantContext:
    user: Optional[User]
    organization: Optional[Organization]
    project: Optional[Project]
    api_key: Optional[str]
    permissions: Set[str]
```

### Data Isolation

- All data is scoped to organizations
- Users can belong to multiple organizations
- Projects belong to specific organizations
- Cross-tenant access is strictly prohibited

## Role-Based Access Control

### Roles

The system defines several built-in roles:

| Role | Description | Default Permissions |
|------|-------------|-------------------|
| `owner` | Organization owner | All permissions |
| `admin` | Organization administrator | Most permissions except billing |
| `developer` | Developer with mutation access | Read/write mutations, read projects |
| `viewer` | Read-only access | Read-only permissions |
| `guest` | Limited access | Minimal read permissions |

### Permissions

Permissions follow a hierarchical structure:

```
mutations:
  - mutations:read
  - mutations:write
  - mutations:approve
  - mutations:execute

projects:
  - projects:read
  - projects:write
  - projects:delete

organizations:
  - organizations:read
  - organizations:write
  - organizations:manage_users

specs:
  - specs:read
  - specs:write
  - specs:approve
```

### Permission Checking

```python
# Require specific permission
@require_permission("mutations:write")
async def propose_mutation(
    request: MutationRequest,
    context: TenantContext = Depends(get_current_user)
):
    # Implementation
    pass

# Require organization access
@require_organization_access
async def get_organization_stats(
    context: TenantContext = Depends(get_current_user)
):
    # Implementation
    pass
```

## API Integration

### FastAPI Dependencies

The system provides several FastAPI dependencies for easy integration:

```python
from lattice_mutation_engine.auth import (
    get_current_user,
    get_current_user_optional,
    require_permission,
    require_organization_access,
    require_project_access,
    verify_api_key,
    rate_limit
)

# Require authenticated user
@app.get("/protected")
async def protected_endpoint(
    context: TenantContext = Depends(get_current_user)
):
    return {"user": context.user.email}

# Optional authentication
@app.get("/public")
async def public_endpoint(
    context: TenantContext = Depends(get_current_user_optional)
):
    if context.user:
        return {"message": f"Hello {context.user.name}"}
    return {"message": "Hello anonymous"}

# Rate limiting
@app.post("/mutations/propose")
@rate_limit(max_requests=10, window_seconds=60)
async def propose_mutation(
    request: MutationRequest,
    context: TenantContext = Depends(get_current_user)
):
    # Implementation
    pass
```

### Middleware Integration

The authentication middleware is automatically applied to all routes:

```python
# In your FastAPI app startup
from lattice_mutation_engine.auth import init_auth_service

@app.on_event("startup")
async def startup_event():
    # Initialize authentication service
    init_auth_service()
    
    # Other initialization code
    await init_engine()
    await init_celery()
```

## Security Features

### 1. Password Security

- Passwords are hashed using bcrypt with salt
- Minimum password requirements enforced
- Password history to prevent reuse

### 2. Token Security

- JWT tokens have configurable expiration
- Refresh tokens for long-lived sessions
- Token blacklisting for logout

### 3. API Key Security

- API keys are hashed and salted
- Configurable expiration dates
- Usage tracking and monitoring

### 4. Rate Limiting

- Per-user and per-IP rate limiting
- Configurable limits per endpoint
- Automatic blocking of abusive requests

### 5. Audit Logging

- All authentication events logged
- Permission changes tracked
- Failed login attempts monitored

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=30

# API Key Configuration
API_KEY_PREFIX=lk_
API_KEY_LENGTH=32

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT_MINUTES=30
```

### Database Configuration

The system requires the following database tables:

- `users` - User accounts
- `organizations` - Organization data
- `projects` - Project information
- `user_organizations` - User-organization relationships
- `api_keys` - API key storage
- `audit_logs` - Security audit trail

## Usage Examples

### 1. User Registration and Authentication

```python
# Register new user
user_data = {
    "email": "user@example.com",
    "password": "secure_password",
    "name": "John Doe",
    "organization_name": "Acme Corp"
}

response = requests.post("/auth/register", json=user_data)
tokens = response.json()

# Use JWT token
headers = {"Authorization": f"Bearer {tokens['access_token']}"}
```

### 2. API Key Management

```python
# Create API key
api_key_data = {
    "name": "Production API Key",
    "permissions": ["mutations:read", "mutations:write"],
    "expires_at": "2024-12-31T23:59:59Z"
}

response = requests.post("/auth/api-keys", json=api_key_data, headers=headers)
api_key = response.json()["api_key"]

# Use API key
api_headers = {"X-API-Key": api_key}
```

### 3. Organization Management

```python
# Create organization
org_data = {
    "name": "My Organization",
    "slug": "my-org",
    "subscription_tier": "pro"
}

response = requests.post("/organizations", json=org_data, headers=headers)

# Invite user to organization
invite_data = {
    "email": "colleague@example.com",
    "role": "developer"
}

response = requests.post("/organizations/my-org/invites", json=invite_data, headers=headers)
```

### 4. Project Access Control

```python
# Create project with specific permissions
project_data = {
    "name": "My Project",
    "description": "A sample project",
    "visibility": "private",
    "allowed_roles": ["developer", "admin"]
}

response = requests.post("/projects", json=project_data, headers=headers)
```

### 5. Permission-Based Mutations

```python
# Propose mutation (requires mutations:write permission)
mutation_data = {
    "project_id": "proj_123",
    "operation_type": "update",
    "description": "Fix bug in authentication",
    "changes": {
        "file": {
            "path": "auth.py",
            "content": "# Updated code here"
        }
    }
}

response = requests.post("/mutations/propose", json=mutation_data, headers=headers)
```

## Best Practices

### 1. Token Management

- Store JWT tokens securely (httpOnly cookies for web apps)
- Implement token refresh logic
- Handle token expiration gracefully

### 2. API Key Security

- Store API keys securely (environment variables, key vaults)
- Rotate API keys regularly
- Use least-privilege principle for permissions

### 3. Error Handling

- Don't expose sensitive information in error messages
- Log security events for monitoring
- Implement proper error responses

### 4. Testing

- Test authentication flows thoroughly
- Verify permission enforcement
- Test rate limiting behavior

### 5. Monitoring

- Monitor failed authentication attempts
- Track API key usage
- Set up alerts for suspicious activity

## Migration Guide

If you're upgrading from a previous version without authentication:

1. **Database Migration**: Run the provided migration scripts to create auth tables
2. **Environment Setup**: Configure the required environment variables
3. **Code Updates**: Update your API calls to include authentication headers
4. **User Migration**: Create initial user accounts and organizations
5. **Permission Setup**: Assign appropriate roles and permissions

For detailed migration instructions, see the [Migration Guide](./migration-guide.md).