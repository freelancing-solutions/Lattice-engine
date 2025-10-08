# MCP SDK Documentation

## Overview

The Lattice MCP (Model Context Protocol) SDK is a Python client library that provides a high-level interface for interacting with the Lattice Engine API. It offers type-safe operations, automatic authentication handling, and comprehensive error management for building applications that integrate with Lattice.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [Core Features](#core-features)
5. [API Reference](#api-reference)
6. [Error Handling](#error-handling)
7. [Configuration](#configuration)
8. [Advanced Usage](#advanced-usage)
9. [Examples](#examples)
10. [Best Practices](#best-practices)

## Installation

### Requirements

- Python 3.8 or higher
- `aiohttp` for async HTTP requests
- `pydantic` for data validation
- `cryptography` for secure credential storage

### Install from Source

```bash
# Clone the repository
git clone https://github.com/your-org/lattice-engine.git
cd lattice-engine

# Install the MCP SDK
pip install -e ./mcp-sdk
```

### Install Dependencies

```bash
pip install aiohttp pydantic cryptography
```

## Quick Start

### Basic Setup

```python
import asyncio
from mcp_sdk import LatticeClient

async def main():
    # Initialize client with API key
    client = LatticeClient(
        api_key="lk_live_your_api_key_here",
        base_url="https://api.lattice.dev"
    )
    
    # List projects
    projects = await client.list_projects()
    print(f"Found {len(projects)} projects")
    
    # Create a new project
    project = await client.create_project(
        name="My New Project",
        description="A sample project created via SDK"
    )
    print(f"Created project: {project.id}")
    
    # Propose a mutation
    mutation = await client.propose_mutation(
        project_id=project.id,
        operation_type="create",
        description="Add new feature",
        changes={
            "files": {
                "src/feature.py": {
                    "content": "# New feature implementation\nprint('Hello, World!')",
                    "operation": "create"
                }
            }
        }
    )
    print(f"Proposed mutation: {mutation.id}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Authentication

The MCP SDK supports multiple authentication methods with automatic credential management.

### API Key Authentication

```python
from mcp_sdk import LatticeClient

# Direct API key
client = LatticeClient(api_key="lk_live_your_api_key_here")

# From environment variable
import os
client = LatticeClient(api_key=os.getenv("LATTICE_API_KEY"))

# Auto-discovery from config file
client = LatticeClient()  # Looks for ~/.lattice/credentials.json
```

### JWT Token Authentication

```python
from mcp_sdk import LatticeClient

# Using JWT token
client = LatticeClient(jwt_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")

# Login with email/password to get JWT
client = LatticeClient()
await client.login("user@example.com", "password")
```

### Credential Storage

The SDK automatically stores credentials securely:

```python
# Credentials are stored in ~/.lattice/credentials.json
{
    "api_key": "encrypted_api_key",
    "jwt_token": "encrypted_jwt_token",
    "refresh_token": "encrypted_refresh_token",
    "expires_at": "2024-12-31T23:59:59Z"
}
```

## Core Features

### 1. Project Management

```python
# List all projects
projects = await client.list_projects()

# Get specific project
project = await client.get_project("proj_123")

# Create new project
project = await client.create_project(
    name="My Project",
    description="Project description",
    visibility="private",
    settings={
        "auto_approve": False,
        "require_review": True
    }
)

# Update project
updated_project = await client.update_project(
    project_id="proj_123",
    name="Updated Name",
    description="Updated description"
)

# Delete project
await client.delete_project("proj_123")
```

### 2. Mutation Operations

```python
# Propose a mutation
mutation = await client.propose_mutation(
    project_id="proj_123",
    operation_type="update",
    description="Fix authentication bug",
    risk_level="medium",
    changes={
        "files": {
            "auth.py": {
                "content": "# Updated authentication code",
                "operation": "update"
            },
            "tests/test_auth.py": {
                "content": "# Updated tests",
                "operation": "create"
            }
        }
    },
    metadata={
        "branch": "feature/auth-fix",
        "commit": "abc123",
        "author": "developer@example.com"
    }
)

# List mutations
mutations = await client.list_mutations(
    project_id="proj_123",
    status="pending",
    limit=10
)

# Get mutation details
mutation = await client.get_mutation("mut_456")

# Approve mutation
await client.approve_mutation("mut_456", comment="LGTM!")

# Reject mutation
await client.reject_mutation("mut_456", reason="Needs more tests")

# Execute approved mutation
result = await client.execute_mutation("mut_456")
```

### 3. Organization Management

```python
# Get current organization
org = await client.get_organization()

# List organization members
members = await client.list_organization_members()

# Invite user to organization
invite = await client.invite_user(
    email="newuser@example.com",
    role="developer"
)

# Update user role
await client.update_user_role(
    user_id="user_789",
    role="admin"
)
```

### 4. Specification Management

```python
# Get project specification
spec = await client.get_project_spec("proj_123")

# Update project specification
updated_spec = await client.update_project_spec(
    project_id="proj_123",
    content="# Updated project specification\n...",
    version="1.2.0"
)

# Get specification history
history = await client.get_spec_history("proj_123")
```

## API Reference

### LatticeClient Class

```python
class LatticeClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        jwt_token: Optional[str] = None,
        base_url: str = "https://api.lattice.dev",
        timeout: int = 30,
        max_retries: int = 3,
        config: Optional[SDKConfig] = None
    ):
        """Initialize Lattice client."""
```

### Core Methods

#### Authentication Methods

```python
async def login(self, email: str, password: str) -> User:
    """Login with email and password."""

async def logout(self) -> None:
    """Logout and clear stored credentials."""

async def refresh_token(self) -> str:
    """Refresh JWT token."""

async def get_current_user(self) -> User:
    """Get current authenticated user."""
```

#### Project Methods

```python
async def list_projects(
    self,
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None
) -> List[Project]:
    """List projects."""

async def get_project(self, project_id: str) -> Project:
    """Get project by ID."""

async def create_project(
    self,
    name: str,
    description: Optional[str] = None,
    visibility: str = "private",
    settings: Optional[Dict[str, Any]] = None
) -> Project:
    """Create new project."""

async def update_project(
    self,
    project_id: str,
    **kwargs
) -> Project:
    """Update project."""

async def delete_project(self, project_id: str) -> None:
    """Delete project."""
```

#### Mutation Methods

```python
async def propose_mutation(
    self,
    project_id: str,
    operation_type: str,
    description: str,
    changes: Dict[str, Any],
    risk_level: str = "medium",
    metadata: Optional[Dict[str, Any]] = None
) -> Mutation:
    """Propose a new mutation."""

async def list_mutations(
    self,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Mutation]:
    """List mutations."""

async def get_mutation(self, mutation_id: str) -> Mutation:
    """Get mutation by ID."""

async def approve_mutation(
    self,
    mutation_id: str,
    comment: Optional[str] = None
) -> MutationResponse:
    """Approve mutation."""

async def reject_mutation(
    self,
    mutation_id: str,
    reason: str
) -> MutationResponse:
    """Reject mutation."""

async def execute_mutation(self, mutation_id: str) -> MutationResponse:
    """Execute approved mutation."""
```

## Error Handling

The SDK provides comprehensive error handling with specific exception types:

```python
from mcp_sdk.exceptions import (
    LatticeError,
    AuthenticationError,
    AuthorizationError,
    ProjectNotFoundError,
    MutationError,
    ValidationError,
    NetworkError,
    RateLimitError
)

try:
    project = await client.get_project("invalid_id")
except ProjectNotFoundError as e:
    print(f"Project not found: {e.message}")
except AuthorizationError as e:
    print(f"Access denied: {e.message}")
except NetworkError as e:
    print(f"Network error: {e.message}")
    # Retry logic here
except LatticeError as e:
    print(f"General Lattice error: {e.message}")
    print(f"Error code: {e.code}")
    print(f"Context: {e.context}")
```

### Error Response Format

```python
{
    "error": {
        "code": "PROJECT_NOT_FOUND",
        "message": "Project with ID 'proj_123' not found",
        "details": {
            "project_id": "proj_123",
            "organization_id": "org_456"
        }
    }
}
```

## Configuration

### SDK Configuration

```python
from mcp_sdk.models import SDKConfig

config = SDKConfig(
    base_url="https://api.lattice.dev",
    timeout=30,
    max_retries=3,
    retry_delay=1.0,
    enable_caching=True,
    cache_ttl=300,
    debug=False
)

client = LatticeClient(config=config)
```

### Environment Variables

```bash
# API Configuration
LATTICE_API_KEY=lk_live_your_api_key_here
LATTICE_BASE_URL=https://api.lattice.dev
LATTICE_TIMEOUT=30

# Authentication
LATTICE_JWT_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Debug and Logging
LATTICE_DEBUG=false
LATTICE_LOG_LEVEL=INFO
```

### Configuration File

Create `~/.lattice/config.json`:

```json
{
    "base_url": "https://api.lattice.dev",
    "timeout": 30,
    "max_retries": 3,
    "enable_caching": true,
    "cache_ttl": 300,
    "debug": false
}
```

## Advanced Usage

### Custom HTTP Client

```python
import aiohttp
from mcp_sdk import LatticeClient

# Custom session with proxy
connector = aiohttp.TCPConnector(limit=100)
timeout = aiohttp.ClientTimeout(total=60)
session = aiohttp.ClientSession(
    connector=connector,
    timeout=timeout,
    headers={"User-Agent": "MyApp/1.0"}
)

client = LatticeClient(session=session)
```

### Batch Operations

```python
# Batch create projects
projects_data = [
    {"name": "Project 1", "description": "First project"},
    {"name": "Project 2", "description": "Second project"},
    {"name": "Project 3", "description": "Third project"}
]

projects = await client.batch_create_projects(projects_data)

# Batch approve mutations
mutation_ids = ["mut_1", "mut_2", "mut_3"]
results = await client.batch_approve_mutations(mutation_ids)
```

### Streaming Responses

```python
# Stream mutation execution logs
async for log_entry in client.stream_mutation_logs("mut_456"):
    print(f"[{log_entry.timestamp}] {log_entry.message}")

# Stream project events
async for event in client.stream_project_events("proj_123"):
    print(f"Event: {event.type} - {event.data}")
```

### Caching

```python
from mcp_sdk.cache import MemoryCache, RedisCache

# Memory cache
cache = MemoryCache(max_size=1000, ttl=300)
client = LatticeClient(cache=cache)

# Redis cache
cache = RedisCache(redis_url="redis://localhost:6379", ttl=300)
client = LatticeClient(cache=cache)

# Disable caching for specific calls
project = await client.get_project("proj_123", use_cache=False)
```

## Examples

### 1. Automated Code Review Workflow

```python
import asyncio
from mcp_sdk import LatticeClient

async def automated_review_workflow():
    client = LatticeClient()
    
    # Get pending mutations
    pending_mutations = await client.list_mutations(status="pending")
    
    for mutation in pending_mutations:
        # Get mutation details
        details = await client.get_mutation(mutation.id)
        
        # Simple automated checks
        if details.risk_level == "low" and len(details.changes.get("files", {})) <= 3:
            # Auto-approve low-risk, small changes
            await client.approve_mutation(
                mutation.id,
                comment="Auto-approved: Low risk, small change"
            )
            print(f"Auto-approved mutation {mutation.id}")
        else:
            # Flag for manual review
            print(f"Mutation {mutation.id} requires manual review")

if __name__ == "__main__":
    asyncio.run(automated_review_workflow())
```

### 2. Project Synchronization

```python
import asyncio
import os
from mcp_sdk import LatticeClient

async def sync_local_project():
    client = LatticeClient()
    project_id = "proj_123"
    
    # Get current project spec
    spec = await client.get_project_spec(project_id)
    
    # Read local spec file
    with open("lattice.spec", "r") as f:
        local_spec = f.read()
    
    # Compare and update if different
    if spec.content != local_spec:
        updated_spec = await client.update_project_spec(
            project_id=project_id,
            content=local_spec,
            version=spec.version + ".1"
        )
        print(f"Updated project spec to version {updated_spec.version}")
    else:
        print("Project spec is up to date")

if __name__ == "__main__":
    asyncio.run(sync_local_project())
```

### 3. Bulk Mutation Management

```python
import asyncio
from mcp_sdk import LatticeClient

async def bulk_mutation_operations():
    client = LatticeClient()
    
    # Get all pending mutations older than 7 days
    import datetime
    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=7)
    
    mutations = await client.list_mutations(status="pending")
    old_mutations = [
        m for m in mutations 
        if m.created_at < cutoff_date
    ]
    
    print(f"Found {len(old_mutations)} old pending mutations")
    
    # Batch reject old mutations
    for mutation in old_mutations:
        await client.reject_mutation(
            mutation.id,
            reason="Automatically rejected: Stale mutation (>7 days old)"
        )
        print(f"Rejected stale mutation {mutation.id}")

if __name__ == "__main__":
    asyncio.run(bulk_mutation_operations())
```

### 4. Real-time Monitoring

```python
import asyncio
from mcp_sdk import LatticeClient

async def monitor_project_activity():
    client = LatticeClient()
    project_id = "proj_123"
    
    print(f"Monitoring activity for project {project_id}")
    
    # Stream project events
    async for event in client.stream_project_events(project_id):
        if event.type == "mutation_proposed":
            print(f"🔄 New mutation proposed: {event.data['mutation_id']}")
        elif event.type == "mutation_approved":
            print(f"✅ Mutation approved: {event.data['mutation_id']}")
        elif event.type == "mutation_executed":
            print(f"🚀 Mutation executed: {event.data['mutation_id']}")
        elif event.type == "spec_updated":
            print(f"📝 Spec updated to version {event.data['version']}")

if __name__ == "__main__":
    asyncio.run(monitor_project_activity())
```

## Best Practices

### 1. Error Handling

```python
import asyncio
from mcp_sdk import LatticeClient
from mcp_sdk.exceptions import NetworkError, RateLimitError

async def robust_api_call():
    client = LatticeClient()
    max_retries = 3
    retry_delay = 1.0
    
    for attempt in range(max_retries):
        try:
            result = await client.get_project("proj_123")
            return result
        except RateLimitError as e:
            if attempt < max_retries - 1:
                wait_time = e.retry_after or retry_delay * (2 ** attempt)
                print(f"Rate limited, waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
            else:
                raise
        except NetworkError as e:
            if attempt < max_retries - 1:
                print(f"Network error, retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise
```

### 2. Resource Management

```python
import asyncio
from mcp_sdk import LatticeClient

async def proper_resource_management():
    # Use context manager for automatic cleanup
    async with LatticeClient() as client:
        projects = await client.list_projects()
        # Client session is automatically closed
    
    # Or manual management
    client = LatticeClient()
    try:
        projects = await client.list_projects()
    finally:
        await client.close()
```

### 3. Pagination

```python
async def get_all_mutations(client, project_id):
    all_mutations = []
    offset = 0
    limit = 50
    
    while True:
        mutations = await client.list_mutations(
            project_id=project_id,
            limit=limit,
            offset=offset
        )
        
        if not mutations:
            break
            
        all_mutations.extend(mutations)
        offset += limit
        
        # Avoid overwhelming the API
        await asyncio.sleep(0.1)
    
    return all_mutations
```

### 4. Configuration Management

```python
import os
from mcp_sdk import LatticeClient
from mcp_sdk.models import SDKConfig

def create_client():
    # Environment-specific configuration
    env = os.getenv("ENVIRONMENT", "development")
    
    if env == "production":
        config = SDKConfig(
            base_url="https://api.lattice.dev",
            timeout=30,
            max_retries=3,
            debug=False
        )
    else:
        config = SDKConfig(
            base_url="https://api-dev.lattice.dev",
            timeout=60,
            max_retries=1,
            debug=True
        )
    
    return LatticeClient(
        api_key=os.getenv("LATTICE_API_KEY"),
        config=config
    )
```

### 5. Testing

```python
import pytest
from unittest.mock import AsyncMock, patch
from mcp_sdk import LatticeClient

@pytest.fixture
async def mock_client():
    with patch('mcp_sdk.client.aiohttp.ClientSession') as mock_session:
        mock_response = AsyncMock()
        mock_response.json.return_value = {"id": "proj_123", "name": "Test Project"}
        mock_response.status = 200
        
        mock_session.return_value.__aenter__.return_value.get.return_value.__aenter__.return_value = mock_response
        
        client = LatticeClient(api_key="test_key")
        yield client
        await client.close()

@pytest.mark.asyncio
async def test_get_project(mock_client):
    project = await mock_client.get_project("proj_123")
    assert project.id == "proj_123"
    assert project.name == "Test Project"
```

## Migration Guide

### From Direct API Calls

If you're currently making direct HTTP requests to the Lattice API:

**Before:**
```python
import aiohttp

async def get_project(project_id):
    headers = {"Authorization": f"Bearer {token}"}
    async with aiohttp.ClientSession() as session:
        async with session.get(f"https://api.lattice.dev/projects/{project_id}", headers=headers) as response:
            return await response.json()
```

**After:**
```python
from mcp_sdk import LatticeClient

client = LatticeClient(jwt_token=token)
project = await client.get_project(project_id)
```

### Benefits of Migration

1. **Type Safety**: Pydantic models provide runtime validation
2. **Error Handling**: Comprehensive exception hierarchy
3. **Authentication**: Automatic token management and refresh
4. **Retry Logic**: Built-in retry mechanisms for transient failures
5. **Caching**: Optional response caching for better performance
6. **Documentation**: Full type hints and docstrings

For more migration examples, see the [Migration Examples](./migration-examples.md) document.