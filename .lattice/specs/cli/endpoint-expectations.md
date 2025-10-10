# CLI Endpoint Expectations

This document captures the HTTP endpoints the CLI and VSCode extension expect the mutation engine to provide.

## Base Path

- Expected base prefix: `/api` (e.g., `/api/mutations/propose`)

## Mutations

- `POST /api/mutations/propose` – Propose a mutation
- `GET /api/mutations` – List mutations
- `GET /api/mutations/{id}` – Get mutation details/status
- `POST /api/mutations/{id}/risk-assessment` – Run risk assessment on a mutation

## Approvals

- `POST /api/approvals/{id}/respond` – Approve/Reject a mutation proposal
- `GET /api/approvals/pending?user_id={userId}` – List pending approvals for user

## Deployments

- `POST /api/deployments` – Initiate deployment for a mutation (with `environment`, `strategy`)

## Spec Management / Sync

- `POST /api/specs/sync/pull` – Sync specs from server to local
- `POST /api/specs/sync/push` – Sync specs from local to server
- `GET /api/specs` – List specs
- `GET /api/specs/{name}` – Show spec details
- `POST /api/specs/generate` – Generate spec from description
- `POST /api/specs/validate` – Validate spec file

## Graph / Search

- `POST /api/graph/query` – Query graph nodes
- `POST /api/graph/semantic-search` – Semantic search over graph/specs
- `GET /api/graph/semantic-search/stats` – Get semantic search backend stats

## MCP

- `GET /api/mcp/status` – MCP server status
- `POST /api/mcp/sync` – Sync MCP metadata (optional: `direction`, `profile`)

## Health / Metrics

- `GET /api/health` – Health check
- `GET /api/metrics` – Prometheus metrics