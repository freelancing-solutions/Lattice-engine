# Lattice Engine Documentation

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Authentication & Security](#3-authentication--security)
4. [MCP SDK Integration](#4-mcp-sdk-integration)
5. [VSCode Extension](#5-vscode-extension)
6. [API Reference](#6-api-reference)
7. [Core Components](#7-core-components)
8. [Advanced Topics](#8-advanced-topics)
9. [Development](#9-development)

## 1. Introduction

The Lattice Engine is the core backend service that powers the Lattice platform. It is a powerful, asynchronous engine designed to manage and orchestrate AI-driven code mutations, approvals, and real-time collaboration. The engine is built on a modular architecture, allowing for extensibility and scalability.

### 1.1. Core Concepts

- **Mutations**: A mutation is a proposed change to a codebase. It is the fundamental unit of work in the Lattice Engine.
- **Approvals**: An approval is a human-in-the-loop verification step for a mutation. It ensures that all changes are reviewed and accepted before being applied.
- **Graph**: The graph is a representation of the codebase, including files, functions, classes, and their relationships. It is used to reason about the impact of mutations.
- **Specs**: A spec is a high-level description of a feature or change. It is used to guide the mutation process.
- **Tasks**: A task is a unit of work that can be assigned to an AI agent. It is used to break down complex changes into smaller, manageable steps.

### 1.2. Architecture

The Lattice Engine is built on a modular, service-oriented architecture. It consists of the following core components:

- **FastAPI Application**: The main entry point for the engine. It exposes a RESTful API for interacting with the engine.
- **Orchestrator**: The orchestrator is responsible for managing the lifecycle of mutations, from proposal to completion.
- **Approval Manager**: The approval manager handles the approval workflow, including notifying users and tracking responses.
- **WebSocket Hub**: The WebSocket hub provides real-time communication between the engine and clients.
- **Graph Repo**: The graph repo is responsible for storing and querying the codebase graph.
- **Task Manager**: The task manager is responsible for managing the lifecycle of tasks.
- **Spec Sync Daemon**: The spec sync daemon is a background process that synchronizes specs from a directory.

## 2. Getting Started

### Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- Redis 6.0 or higher
- Node.js 16+ (for VSCode extension development)

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lattice-engine.git
cd lattice-engine

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
alembic upgrade head

# Start the services
uvicorn lattice_mutation_engine.main:app --reload
```

### Authentication Setup

The Lattice Engine now includes comprehensive authentication and authorization:

1. **Create your first organization and user:**
```bash
python scripts/create_admin_user.py --email admin@example.com --name "Admin User" --org "My Organization"
```

2. **Generate an API key:**
```bash
python scripts/generate_api_key.py --user admin@example.com --name "Development Key"
```

3. **Test authentication:**
```bash
curl -H "X-API-Key: lk_live_your_api_key_here" http://localhost:8000/auth/me
```

### MCP SDK Setup

Install and use the MCP SDK for programmatic access:

```bash
# Install the SDK
pip install -e ./mcp-sdk

# Use in your code
python -c "
from mcp_sdk import LatticeClient
import asyncio

async def test():
    client = LatticeClient(api_key='lk_live_your_api_key_here')
    user = await client.get_current_user()
    print(f'Authenticated as: {user.name}')

asyncio.run(test())
"
```

### VSCode Extension Setup

1. **Install the extension:**
   - Open VSCode
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Lattice Engine" and install

2. **Authenticate:**
   - Press Ctrl+Shift+P
   - Run "Lattice: Authenticate"
   - Enter your API key

3. **Start using:**
   - Create or select a project
   - Make code changes
   - Right-click and select "Propose Mutation"

## 3. Authentication & Security

The Lattice Engine provides enterprise-grade authentication and authorization with multi-tenant support. For detailed information, see the [Authentication and RBAC Guide](./authentication-and-rbac.md).

### Key Features

- **Multi-tenant architecture** with organization isolation
- **Role-based access control (RBAC)** with granular permissions
- **JWT and API key authentication** for different use cases
- **Rate limiting and abuse protection**
- **Comprehensive audit logging**

### Quick Authentication Examples

```python
# JWT Authentication
headers = {"Authorization": f"Bearer {jwt_token}"}
response = requests.get("/api/projects", headers=headers)

# API Key Authentication
headers = {"X-API-Key": "lk_live_your_api_key_here"}
response = requests.get("/api/projects", headers=headers)
```

## 4. MCP SDK Integration

The MCP (Model Context Protocol) SDK provides a high-level Python client for the Lattice Engine. For comprehensive documentation, see the [MCP SDK Guide](./mcp-sdk-guide.md).

### Key Features

- **Type-safe operations** with Pydantic models
- **Async/await support** for high performance
- **Automatic authentication handling**
- **Built-in retry logic and error handling**
- **Response caching** for improved performance

### Quick SDK Examples

```python
from mcp_sdk import LatticeClient

# Initialize client
client = LatticeClient(api_key="lk_live_your_api_key_here")

# Create a project
project = await client.create_project(
    name="My Project",
    description="A sample project"
)

# Propose a mutation
mutation = await client.propose_mutation(
    project_id=project.id,
    operation_type="update",
    description="Fix authentication bug",
    changes={
        "files": {
            "auth.py": {
                "content": "# Updated code",
                "operation": "update"
            }
        }
    }
)
```

## 5. VSCode Extension

The Lattice VSCode Extension provides seamless integration between your development environment and the Lattice Engine. For detailed documentation, see the [VSCode Extension Guide](./vscode-extension-guide.md).

### Key Features

- **Seamless IDE integration** for mutation proposals
- **Real-time project synchronization**
- **Visual diff tools** for change review
- **Team collaboration** features
- **Automated workflow** integration

### Quick Extension Usage

1. **Authenticate:** Use Ctrl+Shift+P → "Lattice: Authenticate"
2. **Select Project:** Use "Lattice: Select Project" or create new
3. **Propose Changes:** Right-click in editor → "Propose Mutation"
4. **Review Mutations:** Use the Lattice Projects panel
5. **Monitor Status:** Check the status bar for updates

## 6. API Reference

### 3.1. Authentication

All API requests must be authenticated using an API key. The API key must be included in the `Authorization` header of each request, with the `Bearer` scheme.

Example:

```
Authorization: Bearer <your-api-key>
```

### 3.2. Endpoints
#### 3.2.1. Mutations

##### POST /mutations/propose

Proposes a mutation to be applied to the codebase. This is an asynchronous operation.

- **Request Body**: `MutationRequest`
  - `spec_id` (str): The ID of the specification to use for the mutation.
  - `context` (str): Additional context for the mutation.
- **Responses**:
  - `202 Accepted`: The mutation has been accepted for processing.
    - If using Celery, the response will include a `task_id`.
    - Otherwise, the status will be `processing`.

**Example Request**

```json
{
  "spec_id": "spec_123",
  "context": "This is a test mutation."
}
```
#### 3.2.2. Approvals

##### POST /approvals/{request_id}/respond

Responds to an approval request.

- **Path Parameters**:
  - `request_id` (str): The ID of the approval request.
- **Request Body**:
  - `approved` (bool): Whether the mutation is approved or not.
- **Responses**:
  - `200 OK`: The response has been recorded.

**Example Request**

```json
{
  "approved": true
}
```

##### GET /approvals/pending

Retrieves all pending approval requests for the authenticated user.

- **Responses**:
  - `200 OK`: A list of pending approval requests.

**Example Response**

```json
[
  {
    "request_id": "req_456",
    "mutation_id": "mut_789",
    "user_id": "user_123"
  }
]
```

- **Path Parameters**:
  - `request_id` (str): The ID of the approval request.
- **Request Body**:
  - `approved` (bool): Whether the mutation is approved or not.
- **Responses**:
  - `200 OK`: The response has been recorded.

**Example Request**

```json
{
  "approved": true
}
```
#### 3.2.3. Graph

##### POST /graph/query

Queries the codebase graph for nodes of a specific type, with optional filtering.

- **Request Body**:
  - `node_type` (str): The type of node to query (e.g., `file`, `function`, `class`).
  - `filters` (dict, optional): A dictionary of filters to apply to the query.
- **Responses**:
  - `200 OK`: A list of nodes that match the query.

**Example Request**

```json
{
  "node_type": "function",
  "filters": {
    "name": "my_function"
  }
}
```

##### POST /graph/semantic-search

Performs a semantic search on the codebase graph.

- **Request Body**:
  - `query` (str): The search query.
  - `filters` (dict, optional): A dictionary of filters to apply to the search.
  - `top_k` (int, optional): The number of results to return. Defaults to 10.
- **Responses**:
  - `200 OK`: A list of search results.

**Example Request**

```json
{
  "query": "a function that calculates the total price",
  "top_k": 5
}
```

##### GET /graph/semantic-search/stats

Retrieves statistics and backend information about the semantic search functionality.

- **Responses**:
  - `200 OK`: A dictionary containing semantic search statistics.

- **Request Body**:
  - `query` (str): The search query.
  - `filters` (dict, optional): A dictionary of filters to apply to the search.
  - `top_k` (int, optional): The number of results to return. Defaults to 10.
- **Responses**:
  - `200 OK`: A list of search results.

**Example Request**

```json
{
  "query": "a function that calculates the total price",
  "top_k": 5
}
```

- **Request Body**:
  - `node_type` (str): The type of node to query (e.g., `file`, `function`, `class`).
  - `filters` (dict, optional): A dictionary of filters to apply to the query.
- **Responses**:
  - `200 OK`: A list of nodes that match the query.

**Example Request**

```json
{
  "node_type": "function",
  "filters": {
    "name": "my_function"
  }
}
```
#### 3.2.4. Specs

##### POST /specs

Creates a new specification.

- **Request Body**:
  - `name` (str): The name of the specification.
  - `description` (str): A description of the specification.
  - `content` (str): The content of the specification.
  - `spec_source` (str): The source of the specification.
- **Responses**:
  - `201 Created`: The specification has been created.

**Example Request**

```json
{
  "name": "My New Spec",
  "description": "A new specification for a new feature.",
  "content": "The feature should do X, Y, and Z.",
  "spec_source": "manual"
}
```

##### GET /specs

Lists all specifications for a given project.

- **Query Parameters**:
  - `project_id` (str): The ID of the project.
- **Responses**:
  - `200 OK`: A list of specifications.

**Example Response**

```json
[
  {
    "spec_id": "spec_123",
    "name": "My Spec",
    "description": "A test specification.",
    "status": "ACTIVE"
  }
]
```

##### POST /specs/{spec_id}/approve

##### PUT /specs/{spec_id}

Updates a specification.

- **Path Parameters**:
  - `spec_id` (str): The ID of the specification to update.
- **Request Body**:
  - `diff_summary` (str): A summary of the changes made to the specification.
- **Responses**:
  - `200 OK`: The specification has been updated.

##### DELETE /specs/{spec_id}

Deletes a specification.

- **Path Parameters**:
  - `spec_id` (str): The ID of the specification to delete.
- **Responses**:
  - `200 OK`: The specification has been deleted.

- **Path Parameters**:
  - `spec_id` (str): The ID of the specification to approve.
- **Responses**:
  - `200 OK`: The specification has been approved.

Updates a specification.

- **Path Parameters**:
  - `spec_id` (str): The ID of the specification to update.
- **Request Body**:
  - `diff_summary` (str): A summary of the changes made to the specification.
- **Responses**:
  - `200 OK`: The specification has been updated.
#### 3.2.5. Tasks

##### POST /tasks/clarify

Provides clarification for a task.

- **Request Body**: `TaskClarificationPayload`
  - `task_id` (str): The ID of the task to clarify.
  - `clarification` (str): The clarification for the task.
- **Responses**:
  - `200 OK`: The clarification has been provided.

**Example Request**

```json
{
  "task_id": "task_123",
  "clarification": "This is a clarification."
}
```

##### POST /tasks/request

Requests a new task to be executed.

- **Request Body**: `TaskRequestPayload`
  - `task_type` (str): The type of task to execute.
  - `payload` (dict): The payload for the task.
- **Responses**:
  - `200 OK`: The task has been requested.

**Example Request**

```json
{
  "task_type": "my_task",
  "payload": {
    "foo": "bar"
  }
}
```

##### POST /tasks/complete

Completes a task.

- **Request Body**: `TaskCompletionPayload`
  - `task_id` (str): The ID of the task to complete.
  - `success` (bool): Whether the task was successful or not.
  - `result` (dict): The result of the task.
- **Responses**:
  - `200 OK`: The task has been completed.

##### GET /tasks/status/{task_id}

Retrieves the status of a task.

- **Path Parameters**:
  - `task_id` (str): The ID of the task.
- **Responses**:
  - `200 OK`: The status of the task.

- **Request Body**: `TaskCompletionPayload`
  - `task_id` (str): The ID of the task to complete.
  - `success` (bool): Whether the task was successful or not.
  - `result` (dict): The result of the task.
- **Responses**:
  - `200 OK`: The task has been completed.

- **Request Body**: `TaskRequestPayload`
  - `task_type` (str): The type of task to execute.
  - `payload` (dict): The payload for the task.
- **Responses**:
  - `200 OK`: The task has been requested.

**Example Request**

```json
{
  "task_type": "my_task",
  "payload": {
    "foo": "bar"
  }
}
```
#### 3.2.6. Spec Sync

##### GET /spec-sync/status

Retrieves the status of the spec sync daemon.

- **Responses**:
  - `200 OK`: The status of the spec sync daemon.

**Example Response**

```json
{
  "enabled": true,
  "running": true,
  "dir": "/path/to/specs"
}
```

##### POST /spec-sync/start

Starts the spec sync daemon.

- **Responses**:
  - `200 OK`: The spec sync daemon has been started.

##### POST /spec-sync/stop

Stops the spec sync daemon.

- **Responses**:
  - `200 OK`: The spec sync daemon has been stopped.

- **Responses**:
  - `200 OK`: The status of the spec sync daemon.

**Example Response**

```json
{
  "enabled": true,
  "running": true,
  "dir": "/path/to/specs"
}
```
### 3.3. WebSocket API

The WebSocket API provides real-time communication between the Lattice Engine and clients.

- **URL**: `ws://<host>:<port>/ws/{user_id}/{client_type}`
- **Authentication**: The WebSocket connection is authenticated using a token passed as a query parameter.

#### 3.3.1. Events

- **`approval_request`** (sent by server): Notifies the client that an approval is required for a mutation.
- **`approval_response`** (sent by client): Submits an approval or rejection for a mutation.
- **`mutation_status`** (sent by server): Provides an update on the status of a mutation.

## 4. Core Components

### 4.1. Orchestrator

The Orchestrator is the heart of the Lattice Engine. It is responsible for managing the entire lifecycle of a mutation, from the initial proposal to the final application of the change. It coordinates the other components of the engine to ensure that mutations are processed correctly and efficiently.
   ### 4.2. Approval Manager

The Approval Manager is responsible for handling the human-in-the-loop approval workflow for mutations. It sends notifications to users when their approval is required, and it tracks their responses. This component ensures that no changes are made to the codebase without the proper authorization.
   ### 4.3. WebSocket Hub

The WebSocket Hub is responsible for managing real-time communication with clients. It uses WebSockets to push notifications to users and to receive real-time updates from them. This component is essential for providing a responsive and interactive user experience.
   ### 4.4. Graph Repo

The Graph Repo is responsible for storing and managing the codebase graph. This graph is a rich representation of the code, including information about files, classes, functions, and their dependencies. The Graph Repo provides an API for querying the graph, which is used by other components of the engine to reason about the code and the impact of mutations.
   ### 4.5. Task Manager

The Task Manager is responsible for managing the lifecycle of tasks. It provides a way to create, assign, and track the progress of tasks. This component is used to break down complex mutations into smaller, more manageable units of work.
   ### 4.6. Spec Sync Daemon

The Spec Sync Daemon is a background process that is responsible for keeping the specifications in the Lattice Engine up to date. It monitors a directory for changes to specification files and automatically synchronizes those changes with the engine. This ensures that the engine is always working with the latest version of the specifications.

## 5. Advanced Topics

### 5.1. Celery Integration

The Lattice Engine uses Celery to handle long-running, asynchronous tasks, such as processing mutations. By offloading these tasks to a Celery worker, the main application can remain responsive and available to handle other requests. The engine is configured to use Redis as the message broker for Celery.
   ### 5.2. Observability (Metrics)

The Lattice Engine exposes a `/metrics` endpoint that provides Prometheus-compatible metrics. These metrics provide insight into the performance and health of the engine, and they can be used to monitor the system and to alert on any issues that may arise.
   ### 5.3. Security

The Lattice Engine is designed with security in mind. All API requests must be authenticated using an API key, and the WebSocket connection is authenticated using a token. The engine also includes measures to prevent common security vulnerabilities, such as injection attacks and cross-site scripting (XSS).

## 6. Development

### 6.1. Project Structure

The Lattice Engine codebase is organized into the following directories:

- `lattice_mutation_engine`: The main application code.
  - `api`: The FastAPI application and endpoints.
  - `orchestration`: The core orchestration logic.
  - `approval`: The approval management components.
  - `websocket`: The WebSocket communication components.
  - `graph`: The graph repository and related components.
  - `tasks`: The task management components.
  - `spec_sync`: The spec synchronization components.
  - `models`: The data models for the application.
  - `config`: The application configuration.
- `docs`: The project documentation.
- `tests`: The project tests.
   ### 6.2. Running Tests

The project's tests can be run using `pytest`:

```bash
poetry run pytest
```
   ### 6.3. Contributing

Contributions to the Lattice Engine are welcome. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes.
4. Write tests for your changes.
5. Run the tests to ensure that they pass.
6. Submit a pull request.