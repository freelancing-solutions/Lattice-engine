# Lattice Engine CLI Backend API Specification

## Purpose

Define the backend endpoints and behaviors required for the `lattice` CLI to authenticate, initialize repositories, generate specifications, and manage mutation proposals with automated conflict/dependency resolution.

## Alignment

- Mirrors documented endpoints and flows from the Lattice Engine docs
- Adds proposed endpoints where functionality is implied but not yet implemented
- Uses OpenSpec-style requirements and scenarios for clarity

## Requirements

### Requirement: Authentication
The backend SHALL provide endpoints for authenticating the CLI and verifying identity.

#### Scenario: Login
- **Endpoint**: `POST /api/auth/login`
- **Input**: `{ api_key?: string, username?: string, password?: string }`
- **Output**: `{ token: string, user: { id: string, email: string } }`
- **Notes**: Supports API key or username/password; token used for subsequent calls

#### Scenario: Me
- **Endpoint**: `GET /api/auth/me`
- **Output**: `{ id, email, organizations, roles }`
- **Notes**: Verifies authentication state and permissions

### Requirement: Project Initialization & Sync
The backend SHALL register and synchronize repositories/projects.

#### Scenario: Create/Select Project
- **Endpoint**: `POST /api/projects`
- **Input**: `{ name: string, repo_url?: string }`
- **Output**: `{ id: string, name: string }`

#### Scenario: Sync Repo
- **Endpoint**: `PUT /api/projects/{id}/sync` (proposed)
- **Input**: `{ branch: string, commit: string, metadata?: object }`
- **Output**: `{ status: "synced", last_sync: string }`

### Requirement: Specifications
The backend SHALL list, show, create, and generate specifications.

#### Scenario: List specs
- **Endpoint**: `GET /api/specs`
- **Output**: `Array<{ id, name, version, status }>`

#### Scenario: Show spec
- **Endpoint**: `GET /api/specs/{id}`
- **Output**: `{ id, name, version, content, metadata }`

#### Scenario: Create spec
- **Endpoint**: `POST /api/specs`
- **Input**: `{ name, description?, content?, template? }`
- **Output**: `{ id, name, version, location }`

#### Scenario: Generate spec from description
- **Endpoint**: `POST /api/specs/generate` (proposed)
- **Input**: `{ name, description, output?: "json" | "md" }`
- **Output**: `{ id, name, version, content, format }`
- **Notes**: Returns validated spec content; CLI saves to `.lattice/specs/<name>.json` or OpenSpec markdown

#### Scenario: Sync specs
- **Endpoint**: `POST /api/specs/sync` (proposed)
- **Input**: `{ push?: boolean, pull?: boolean, project_id?: string }`
- **Output**: `{ pushed?: number, pulled?: number }`

### Requirement: Mutation Proposals & Resolution
The backend SHALL accept mutation proposals, resolve conflicts/dependencies, and produce outcomes.

#### Scenario: Propose mutation
- **Endpoint**: `POST /api/mutations/propose`
- **Input**: `{ spec_id: string, title?: string, description?: string, risk?: "low"|"medium"|"high", changes?: object }`
- **Output**: `{ id, status: "pending"|"approved"|"rejected"|"mutation", resolution: { type, details } }`
- **Notes**: Resolution types include `new_spec`, `mutation_required`, `rejected`

#### Scenario: Mutation status
- **Endpoint**: `GET /api/mutations/{id}` (proposed)
- **Output**: `{ id, status, resolution, approvals, risk }`

#### Scenario: Approvals
- **Endpoint**: `GET /api/approvals/pending`
- **Output**: `Array<{ id, mutation_id, requested_by, status }>`

#### Scenario: Respond to approval
- **Endpoint**: `POST /api/approvals/{id}/respond`
- **Input**: `{ decision: "approve"|"reject", reason?: string, auto?: boolean }`
- **Output**: `{ id, status }`

#### Scenario: Risk assessment
- **Endpoint**: `POST /api/mutations/{id}/risk-assessment` (proposed)
- **Input**: `{ context?: object }`
- **Output**: `{ level: "low"|"medium"|"high", factors: Array<string> }`

### Requirement: Real-time Updates (WebSocket)
The backend SHOULD provide WebSocket updates for mutation and spec events.

#### Scenario: Subscribe
- **Endpoint**: `GET /ws/{userId}/{clientType}`
- **Notes**: Streams events for `mutations`, `approvals`, `specs`

## Examples

```http
# Propose a mutation
POST /api/mutations/propose
Content-Type: application/json

{
  "spec_id": "user-auth",
  "title": "Add OAuth2",
  "description": "Support Google and GitHub OAuth",
  "risk": "medium"
}

# Generate a spec from description
POST /api/specs/generate
Content-Type: application/json

{
  "name": "user-auth",
  "description": "Users can login via email & OAuth2",
  "output": "json"
}
```

## Notes
- Endpoints marked "proposed" indicate capabilities implied by docs and CLI UX but may require implementation.
- The CLI SHALL store generated specs under `.lattice/specs/` and sync project metadata via `init`.