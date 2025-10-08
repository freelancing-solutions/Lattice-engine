# Lattice Engine MCP SDK

The Lattice Engine Model Context Protocol (MCP) SDK provides a Python client library for interacting with the Lattice Engine API. This SDK enables developers to integrate Lattice Engine's mutation capabilities into their applications, IDEs, and development workflows.

## Features

- **Authentication**: API key and JWT token support
- **Project Management**: Create, update, and manage projects
- **Mutation Operations**: Propose, execute, and monitor code mutations
- **Multi-Tenancy**: Organization and user management
- **Real-time Updates**: WebSocket support for live mutation status
- **Type Safety**: Full Pydantic model support with validation
- **Async/Await**: Modern async Python API

## Installation

```bash
pip install lattice-mcp-sdk
```

## Quick Start

```python
import asyncio
from lattice_sdk import LatticeClient

async def main():
    # Initialize client with API key
    async with LatticeClient(
        base_url="https://api.lattice.dev",
        api_key="your-api-key"
    ) as client:
        
        # Authenticate and get user info
        user = await client.authenticate()
        print(f"Authenticated as: {user.email}")
        
        # List projects
        projects = await client.list_projects()
        print(f"Found {len(projects)} projects")
        
        # Create a new project
        project = await client.create_project(
            name="My New Project",
            description="A sample project",
            spec_content="# Project Specification\n\nThis is a sample project."
        )
        
        # Propose a mutation
        mutation = await client.propose_mutation(
            project_id=project.id,
            operation_type="create",
            changes={
                "files": {
                    "src/main.py": {
                        "content": "print('Hello, World!')",
                        "action": "create"
                    }
                }
            },
            description="Add main.py file"
        )
        
        print(f"Mutation proposed: {mutation.mutation_id}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Authentication

The SDK supports multiple authentication methods:

### API Key Authentication

```python
from lattice_sdk import LatticeClient

# Via constructor
client = LatticeClient(api_key="your-api-key")

# Via environment variable
# Set LATTICE_API_KEY environment variable
client = LatticeClient()

# Via method call
client = LatticeClient()
await client.authenticate("your-api-key")
```

### JWT Token Authentication

```python
# Set token directly (for server-to-server communication)
client.auth.set_token("jwt-token", expires_in=3600)
```

## Project Management

### Creating Projects

```python
project = await client.create_project(
    name="My Project",
    description="Project description",
    spec_content="# Specification content"
)
```

### Listing Projects

```python
# List all accessible projects
projects = await client.list_projects()

# Get specific project
project = await client.get_project("project-id")
```

### Updating Projects

```python
updated_project = await client.update_project(
    project_id="project-id",
    name="Updated Name",
    spec_content="Updated specification"
)
```

## Mutation Operations

### Proposing Mutations

```python
mutation_response = await client.propose_mutation(
    project_id="project-id",
    operation_type="update",
    changes={
        "files": {
            "src/app.py": {
                "content": "# Updated content",
                "action": "update"
            }
        }
    },
    description="Update application logic"
)
```

### Monitoring Mutations

```python
# Get mutation status
mutation = await client.get_mutation("mutation-id")
print(f"Status: {mutation.status}")

# List mutations for a project
mutations = await client.list_mutations(
    project_id="project-id",
    status="pending"
)
```

### Approving/Rejecting Mutations

```python
# Approve a mutation
approved = await client.approve_mutation("mutation-id")

# Reject a mutation
rejected = await client.reject_mutation(
    "mutation-id", 
    reason="Does not meet requirements"
)
```

## Error Handling

The SDK provides specific exception types for different error scenarios:

```python
from lattice_sdk import (
    LatticeError,
    AuthenticationError,
    AuthorizationError,
    ProjectNotFoundError,
    MutationError
)

try:
    project = await client.get_project("invalid-id")
except ProjectNotFoundError:
    print("Project not found")
except AuthorizationError:
    print("Access denied")
except LatticeError as e:
    print(f"General error: {e.message}")
```

## Configuration

### SDK Configuration

```python
from lattice_sdk import LatticeClient

client = LatticeClient(
    base_url="https://api.lattice.dev",
    api_key="your-api-key",
    timeout=30,  # Request timeout in seconds
    max_retries=3  # Maximum retry attempts
)
```

### Environment Variables

- `LATTICE_API_KEY`: Default API key
- `LATTICE_BASE_URL`: Default base URL
- `LATTICE_TIMEOUT`: Default request timeout

## Models

The SDK includes comprehensive Pydantic models for type safety:

### User Model

```python
from lattice_sdk.models import User, UserRole, UserStatus

user = User(
    id="user-id",
    email="user@example.com",
    name="John Doe",
    role=UserRole.ADMIN,
    status=UserStatus.ACTIVE
)
```

### Project Model

```python
from lattice_sdk.models import Project, ProjectStatus

project = Project(
    id="project-id",
    name="My Project",
    organization_id="org-id",
    status=ProjectStatus.ACTIVE,
    spec_content="# Specification"
)
```

### Mutation Model

```python
from lattice_sdk.models import Mutation, MutationStatus

mutation = Mutation(
    id="mutation-id",
    project_id="project-id",
    operation_type="create",
    status=MutationStatus.PENDING,
    changes={"files": {...}}
)
```

## Advanced Usage

### Context Management

```python
# Use context manager for automatic cleanup
async with LatticeClient(api_key="key") as client:
    # Client automatically connects and disconnects
    projects = await client.list_projects()
```

### Custom Headers

```python
# Add custom headers to requests
headers = await client.auth.get_headers()
headers.update({"X-Custom-Header": "value"})
```

### Rate Limiting

The SDK automatically handles rate limiting with exponential backoff. Rate limit errors are raised as `RateLimitError` exceptions.

## WebSocket Support

For real-time mutation updates, the SDK supports WebSocket connections:

```python
# WebSocket support will be added in future versions
# Currently, use polling with get_mutation() for status updates
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://docs.lattice.dev
- Issues: https://github.com/lattice-dev/mcp-sdk/issues
- Discord: https://discord.gg/lattice-dev