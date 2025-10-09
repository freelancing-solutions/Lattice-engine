# MCP SDK Migration Examples

This guide provides comprehensive examples for migrating from direct HTTP requests or other SDKs to the Lattice MCP SDK. The examples demonstrate how the SDK simplifies development while adding type safety, error handling, and performance improvements.

## Table of Contents

1. [Migration from Direct HTTP Requests](#migration-from-direct-http-requests)
2. [Migration from REST API Calls](#migration-from-rest-api-calls)
3. [Type Safety Migration](#type-safety-migration)
4. [Async/Await Patterns](#asyncawait-patterns)
5. [Configuration Migration](#configuration-migration)
6. [Error Handling Migration](#error-handling-migration)
7. [Batch Operations](#batch-operations)
8. [Real-world Scenarios](#real-world-scenarios)

## Migration from Direct HTTP Requests

### Before: Raw HTTP Requests

```python
import aiohttp
import asyncio
from typing import Dict, Any, Optional

class LatticeClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login with email and password"""
        async with self.session.post(
            f"{self.base_url}/api/auth/login",
            json={"email": email, "password": password}
        ) as response:
            if response.status != 200:
                raise Exception(f"Login failed: {response.status}")
            return await response.json()

    async def create_project(self, name: str, description: str) -> Dict[str, Any]:
        """Create a new project"""
        async with self.session.post(
            f"{self.base_url}/api/projects",
            json={"name": name, "description": description}
        ) as response:
            if response.status != 201:
                raise Exception(f"Project creation failed: {response.status}")
            return await response.json()

    async def get_project_spec(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project specification"""
        async with self.session.get(
            f"{self.base_url}/api/projects/{project_id}/spec"
        ) as response:
            if response.status == 404:
                return None
            if response.status != 200:
                raise Exception(f"Failed to get spec: {response.status}")
            return await response.json()

# Usage
async def main():
    async with LatticeClient("https://api.project-lattice.site", "your-api-key") as client:
        # Login
        login_result = await client.login("user@example.com", "password")
        token = login_result["token"]

        # Create project
        project = await client.create_project("My Project", "Description")
        project_id = project["id"]

        # Get spec
        spec = await client.get_project_spec(project_id)
        print(f"Project spec: {spec}")
```

### After: MCP SDK

```python
from mcp_sdk import LatticeClient
from mcp_sdk.models import ProjectCreate, ProjectSpec
from mcp_sdk.exceptions import AuthenticationError, ProjectNotFoundError
import asyncio

async def main():
    # Initialize client with automatic authentication
    client = LatticeClient(
        base_url="https://api.project-lattice.site",
        api_key="your-api-key"
    )

    try:
        # Login with automatic error handling
        auth_result = await client.login("user@example.com", "password")
        print(f"Logged in as: {auth_result.user.email}")

        # Create project with type safety
        project = await client.create_project(
            ProjectCreate(
                name="My Project",
                description="Description"
            )
        )
        print(f"Created project: {project.name} (ID: {project.id})")

        # Get spec with proper typing
        spec: ProjectSpec = await client.get_project_spec(project.id)
        print(f"Project spec version: {spec.version}")

    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
    except ProjectNotFoundError as e:
        print(f"Project not found: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

    # SDK handles cleanup automatically

if __name__ == "__main__":
    asyncio.run(main())
```

## Migration from REST API Calls

### Authentication Endpoints

#### Before: REST API
```python
import requests

# Login
response = requests.post(
    "https://api.project-lattice.site/api/auth/login",
    json={"email": "user@example.com", "password": "password"}
)
if response.status_code == 200:
    data = response.json()
    token = data["token"]
    user_id = data["user"]["id"]

# Refresh token
response = requests.post(
    "https://api.project-lattice.site/api/auth/refresh",
    headers={"Authorization": f"Bearer {token}"}
)
```

#### After: MCP SDK
```python
from mcp_sdk import LatticeClient
from mcp_sdk.exceptions import AuthenticationError

client = LatticeClient(base_url="https://api.project-lattice.site")

try:
    # Login with automatic token management
    auth_result = await client.login("user@example.com", "password")
    print(f"User: {auth_result.user.email}, ID: {auth_result.user.id}")

    # Refresh token automatically when needed
    await client.refresh_token()

except AuthenticationError as e:
    print(f"Authentication error: {e}")
```

### Mutation Endpoints

#### Before: REST API
```python
# Propose mutation
mutation_data = {
    "title": "Fix authentication bug",
    "description": "Update login validation",
    "changes": [
        {
            "file_path": "src/auth.py",
            "operation": "modify",
            "content": "# Updated auth code"
        }
    ]
}

response = requests.post(
    f"https://api.project-lattice.site/api/projects/{project_id}/mutations",
    json=mutation_data,
    headers={"Authorization": f"Bearer {token}"}
)

if response.status_code == 201:
    mutation = response.json()
    mutation_id = mutation["id"]
```

#### After: MCP SDK
```python
from mcp_sdk.models import MutationPropose, FileChange, MutationOperation

# Propose mutation with type safety
mutation = await client.propose_mutation(
    project_id,
    MutationPropose(
        title="Fix authentication bug",
        description="Update login validation",
        changes=[
            FileChange(
                file_path="src/auth.py",
                operation=MutationOperation.MODIFY,
                content="# Updated auth code"
            )
        ]
    )
)

print(f"Mutation proposed: {mutation.id} - {mutation.title}")
```

### Project Endpoints

#### Before: REST API
```python
# List projects
response = requests.get(
    "https://api.project-lattice.site/api/projects",
    headers={"Authorization": f"Bearer {token}"}
)
projects = response.json() if response.status_code == 200 else []

# Update project spec
spec_data = {
    "version": "2.0",
    "schema": {...}
}

response = requests.put(
    f"https://api.project-lattice.site/api/projects/{project_id}/spec",
    json=spec_data,
    headers={"Authorization": f"Bearer {token}"}
)
```

#### After: MCP SDK
```python
from mcp_sdk.models import ProjectSpecUpdate, SchemaDefinition

# List projects with automatic pagination
projects = await client.list_projects()
print(f"Found {len(projects)} projects")

# Update project spec with validation
spec_update = await client.update_project_spec(
    project_id,
    ProjectSpecUpdate(
        version="2.0",
        schema=SchemaDefinition(...)
    )
)
print(f"Updated spec to version {spec_update.version}")
```

## Type Safety Migration

### Before: Raw Dictionaries
```python
def process_user(user_data: dict):
    # Risk of KeyError and wrong types
    email = user_data["email"]  # Could fail
    age = user_data.get("age", 0)  # Could be wrong type
    is_active = user_data["is_active"]  # Could be string instead of bool

    if age > 18:  # Runtime error if age is string
        pass

# Usage
user = response.json()
process_user(user)
```

### After: Typed Models
```python
from mcp_sdk.models import User
from typing import Optional

def process_user(user: User):
    # Type-safe access with IDE autocomplete
    email: str = user.email
    age: Optional[int] = user.age
    is_active: bool = user.is_active

    if age and age > 18:  # Type checker guarantees age is int or None
        pass

# Usage
user: User = await client.get_user(user_id)
process_user(user)
```

### Runtime Validation Benefits
```python
from mcp_sdk.models import ProjectCreate
from pydantic import ValidationError

try:
    # SDK validates data before sending to API
    project = ProjectCreate(
        name="",  # Validation error: empty string
        description="A" * 1001  # Validation error: too long
    )
except ValidationError as e:
    print(f"Validation error: {e}")
    # Clear error messages help fix issues quickly
```

## Async/Await Patterns

### Before: Synchronous Code
```python
import requests
import time

def sync_workflow():
    # Sequential blocking calls
    start_time = time.time()

    auth_response = requests.post("/api/auth/login", json={...})
    project_response = requests.post("/api/projects", json={...})
    mutation_response = requests.post("/api/mutations", json={...})

    end_time = time.time()
    print(f"Completed in {end_time - start_time:.2f} seconds")
```

### After: Async Code
```python
import asyncio
from mcp_sdk import LatticeClient

async def async_workflow():
    # Concurrent non-blocking calls
    start_time = time.time()

    # Run operations concurrently when possible
    login_task = client.login("user@example.com", "password")
    projects_task = client.list_projects()

    # Wait for both to complete
    auth_result, projects = await asyncio.gather(login_task, projects_task)

    # Continue with dependent operations
    mutation = await client.propose_mutation(...)

    end_time = time.time()
    print(f"Completed in {end_time - start_time:.2f} seconds")

# 3-5x performance improvement for I/O bound operations
```

## Configuration Migration

### Before: Hardcoded Values
```python
# Hardcoded throughout the codebase
API_URL = "https://api.project-lattice.site"
TIMEOUT = 30
RETRY_COUNT = 3

def make_request(endpoint):
    url = f"{API_URL}/api/{endpoint}"
    # Repeat timeout and retry logic in every function
    for attempt in range(RETRY_COUNT):
        try:
            response = requests.get(url, timeout=TIMEOUT)
            return response
        except requests.Timeout:
            if attempt == RETRY_COUNT - 1:
                raise
```

### After: SDK Configuration
```python
from mcp_sdk import LatticeClient, LatticeConfig

# Centralized configuration
config = LatticeConfig(
    base_url="https://api.project-lattice.site",
    timeout=30,
    retry_count=3,
    retry_backoff_factor=2.0,
    max_connections=100
)

client = LatticeClient(config=config)

# SDK handles timeouts and retries automatically
response = await client.get_projects()  # No need to repeat retry logic
```

## Error Handling Migration

### Before: Generic Exception Handling
```python
def generic_error_handling():
    try:
        response = requests.get("/api/projects")
        data = response.json()
        return data
    except Exception as e:
        # All errors treated the same way
        print(f"Something went wrong: {e}")
        return None

# No way to distinguish between different error types
```

### After: Specific Exception Types
```python
from mcp_sdk.exceptions import (
    AuthenticationError,
    ProjectNotFoundError,
    ValidationError,
    RateLimitError,
    NetworkError
)

async def specific_error_handling():
    try:
        projects = await client.list_projects()
        return projects
    except AuthenticationError:
        print("Please check your API credentials")
        raise
    except RateLimitError:
        print("Rate limit exceeded, please wait")
        await asyncio.sleep(60)
        return await specific_error_handling()  # Retry after rate limit
    except NetworkError:
        print("Network connection failed")
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise

# Each error type can be handled appropriately
```

## Batch Operations

### Before: Multiple Sequential API Calls
```python
def create_multiple_projects(project_names):
    created_projects = []
    for name in project_names:
        response = requests.post(
            "/api/projects",
            json={"name": name, "description": f"Project {name}"}
        )
        if response.status_code == 201:
            created_projects.append(response.json())
        else:
            print(f"Failed to create {name}")

    return created_projects

# Slow, no transaction support, partial failures possible
```

### After: SDK Batch Operations
```python
from mcp_sdk.models import ProjectCreate

async def create_multiple_projects(project_names):
    # Prepare batch request
    projects_to_create = [
        ProjectCreate(name=name, description=f"Project {name}")
        for name in project_names
    ]

    try:
        # Single API call for all operations
        created_projects = await client.batch_create_projects(projects_to_create)
        print(f"Created {len(created_projects)} projects successfully")
        return created_projects
    except Exception as e:
        # All operations rolled back on failure
        print(f"Batch creation failed: {e}")
        raise

# 10x faster with transaction support
```

## Real-world Scenarios

### Automated Code Review Workflow Migration

#### Before: Direct API Implementation
```python
import requests
import json
import os
from typing import List, Dict

class CodeReviewBot:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.project-lattice.site"

    def review_pull_request(self, project_id: str, pr_data: Dict):
        """Complex workflow with manual error handling"""
        try:
            # Step 1: Get current project spec
            spec_response = requests.get(
                f"{self.base_url}/api/projects/{project_id}/spec",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            if spec_response.status_code != 200:
                return {"error": "Failed to get spec"}

            spec = spec_response.json()

            # Step 2: Analyze changes (simplified)
            changes = []
            for file_path in pr_data["changed_files"]:
                # Read file content
                with open(file_path, 'r') as f:
                    content = f.read()

                # Create mutation proposal
                changes.append({
                    "file_path": file_path,
                    "operation": "modify",
                    "content": content
                })

            # Step 3: Propose mutation
            mutation_data = {
                "title": f"Automated review for PR #{pr_data['number']}",
                "description": pr_data["description"],
                "changes": changes
            }

            mutation_response = requests.post(
                f"{self.base_url}/api/projects/{project_id}/mutations",
                json=mutation_data,
                headers={"Authorization": f"Bearer {self.api_key}"}
            )

            if mutation_response.status_code == 201:
                return {"success": True, "mutation_id": mutation_response.json()["id"]}
            else:
                return {"error": "Failed to create mutation"}

        except Exception as e:
            return {"error": str(e)}

# Usage
bot = CodeReviewBot(os.getenv("LATTICE_API_KEY"))
result = bot.review_pull_request("project-123", {
    "number": 42,
    "description": "Fix authentication bug",
    "changed_files": ["src/auth.py", "tests/test_auth.py"]
})
```

#### After: MCP SDK Implementation
```python
from mcp_sdk import LatticeClient
from mcp_sdk.models import MutationPropose, FileChange, MutationOperation
from mcp_sdk.exceptions import LatticeError
import asyncio
from typing import List
import os

class CodeReviewBot:
    def __init__(self):
        self.client = LatticeClient(
            base_url="https://api.project-lattice.site",
            api_key=os.getenv("LATTICE_API_KEY")
        )

    async def review_pull_request(self, project_id: str, pr_number: int, description: str, changed_files: List[str]):
        """Simplified workflow with automatic error handling"""
        try:
            # Step 1: Get current project spec (handled automatically)
            spec = await self.client.get_project_spec(project_id)

            # Step 2: Prepare file changes with validation
            changes = []
            for file_path in changed_files:
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()

                    changes.append(FileChange(
                        file_path=file_path,
                        operation=MutationOperation.MODIFY,
                        content=content
                    ))
                except IOError as e:
                    print(f"Warning: Could not read {file_path}: {e}")
                    continue

            if not changes:
                raise ValueError("No valid file changes found")

            # Step 3: Create and submit mutation
            mutation = await self.client.propose_mutation(
                project_id,
                MutationPropose(
                    title=f"Automated review for PR #{pr_number}",
                    description=description,
                    changes=changes
                )
            )

            return {
                "success": True,
                "mutation_id": mutation.id,
                "mutation_url": f"https://app.project-lattice.site/mutations/{mutation.id}"
            }

        except ProjectNotFoundError:
            return {"error": f"Project {project_id} not found"}
        except ValidationError as e:
            return {"error": f"Validation failed: {e}"}
        except LatticeError as e:
            return {"error": f"Lattice API error: {e}"}
        except Exception as e:
            return {"error": f"Unexpected error: {e}"}

# Usage
async def main():
    bot = CodeReviewBot()
    result = await bot.review_pull_request(
        "project-123",
        42,
        "Fix authentication bug",
        ["src/auth.py", "tests/test_auth.py"]
    )
    print(result)

asyncio.run(main())
```

### Project Synchronization Migration

#### Before: Manual Synchronization
```python
import requests
import hashlib
import json
from pathlib import Path

class ProjectSync:
    def __init__(self, api_key: str, local_path: str):
        self.api_key = api_key
        self.local_path = Path(local_path)
        self.base_url = "https://api.project-lattice.site"
        self.file_hashes = {}

    def sync_project(self, project_id: str):
        """Manual synchronization with lots of boilerplate"""
        try:
            # Step 1: Get remote project state
            response = requests.get(
                f"{self.base_url}/api/projects/{project_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )

            if response.status_code != 200:
                return {"error": "Failed to get project"}

            project = response.json()

            # Step 2: Calculate local file hashes
            local_files = {}
            for file_path in self.local_path.rglob("*"):
                if file_path.is_file():
                    rel_path = file_path.relative_to(self.local_path)
                    with open(file_path, 'rb') as f:
                        content = f.read()
                        file_hash = hashlib.sha256(content).hexdigest()
                        local_files[str(rel_path)] = file_hash

            # Step 3: Compare with remote state
            remote_files = project.get("files", {})

            # Step 4: Determine changes
            changes = []
            for file_path, local_hash in local_files.items():
                remote_hash = remote_files.get(file_path, {}).get("hash")
                if local_hash != remote_hash:
                    # File changed or new
                    with open(self.local_path / file_path, 'r') as f:
                        content = f.read()

                    changes.append({
                        "file_path": file_path,
                        "operation": "modify" if file_path in remote_files else "create",
                        "content": content
                    })

            # Step 5: Submit changes
            if changes:
                mutation_response = requests.post(
                    f"{self.base_url}/api/projects/{project_id}/mutations",
                    json={
                        "title": "Sync local changes",
                        "description": f"Sync {len(changes)} files",
                        "changes": changes
                    },
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )

                if mutation_response.status_code == 201:
                    return {"success": True, "changes": len(changes)}
                else:
                    return {"error": "Failed to submit changes"}
            else:
                return {"success": True, "changes": 0}

        except Exception as e:
            return {"error": str(e)}
```

#### After: SDK Synchronization
```python
from mcp_sdk import LatticeClient
from mcp_sdk.models import MutationPropose, FileChange, MutationOperation
from mcp_sdk.sync import ProjectSynchronizer
import asyncio
from pathlib import Path

class ProjectSync:
    def __init__(self, api_key: str, local_path: str):
        self.client = LatticeClient(api_key=api_key)
        self.local_path = Path(local_path)
        self.synchronizer = ProjectSynchronizer(self.client, self.local_path)

    async def sync_project(self, project_id: str):
        """Automatic synchronization with built-in optimization"""
        try:
            # SDK handles all the complexity:
            # - File hash calculation
            # - Change detection
            # - Conflict resolution
            # - Batch operations
            # - Progress tracking

            sync_result = await self.synchronizer.sync_project(project_id)

            return {
                "success": True,
                "changes": sync_result.total_changes,
                "files_added": sync_result.files_added,
                "files_modified": sync_result.files_modified,
                "files_deleted": sync_result.files_deleted,
                "conflicts": sync_result.conflicts
            }

        except Exception as e:
            return {"error": str(e)}

    async def watch_project(self, project_id: str):
        """Real-time file watching with automatic sync"""
        async for change in self.synchronizer.watch_project(project_id):
            print(f"Change detected: {change.file_path} ({change.type})")

            if change.type == "conflict":
                # Handle conflicts
                resolution = await self.resolve_conflict(change)
                await self.synchronizer.apply_resolution(resolution)

    async def resolve_conflict(self, conflict):
        """Interactive conflict resolution"""
        print(f"Conflict in {conflict.file_path}:")
        print(f"Local version: {conflict.local_hash}")
        print(f"Remote version: {conflict.remote_hash}")

        # Interactive resolution logic here
        return ConflictResolution(
            file_path=conflict.file_path,
            action="merge"  # or "keep_local", "keep_remote"
        )

# Usage
async def main():
    sync = ProjectSync("your-api-key", "./my-project")
    result = await sync.sync_project("project-123")
    print(result)

    # Start real-time watching
    await sync.watch_project("project-123")

asyncio.run(main())
```

## Additional Resources

- [MCP SDK Guide](docs/mcp-sdk-guide.md) - Complete SDK documentation
- [API Documentation](docs/api-documentation.md) - REST API reference
- [Authentication Guide](docs/authentication-and-rbac.md) - Authentication setup
- [Best Practices](docs/mcp-sdk-guide.md#best-practices) - Development recommendations

## Migration Checklist

- [ ] Replace direct HTTP requests with SDK methods
- [ ] Update error handling to use specific exception types
- [ ] Migrate to typed models instead of raw dictionaries
- [ ] Convert synchronous code to async/await patterns
- [ ] Centralize configuration using SDK config objects
- [ ] Implement proper retry and timeout handling
- [ ] Add comprehensive logging and monitoring
- [ ] Update unit tests to use SDK mocks
- [ ] Performance test the migrated code
- [ ] Update documentation and examples

For support during migration, refer to the [MCP SDK Guide](docs/mcp-sdk-guide.md) or open an issue on the project repository.