# Lattice Mutation Engine – Current API Endpoints

This document enumerates endpoints found in the engine codebase.

## Base Path

- Current base has no `/api` prefix (e.g., `/mutations/propose`).

## Mutations

- `POST /mutations/propose` – Propose a mutation
  - Rate limited via `rate_limit`
  - Requires auth via `get_current_user`

## Approvals

- `POST /approvals/{request_id}/respond` – Process approval response
- `GET /approvals/pending?user_id={userId}` – List user’s pending approvals

## WebSocket

- `WS /ws/{user_id}/{client_type}` – Real-time events, approval responses

## Tasks

- `POST /tasks/request` – Create task
- `POST /tasks/clarify` – Request clarification
- `POST /tasks/complete` – Complete task
- `GET /tasks/status/{task_id}` – Task status

## Graph / Search

- `POST /graph/query` – Query graph
- `POST /graph/semantic-search` – Semantic search
- `GET /graph/semantic-search/stats` – Search stats

## Spec Sync

- `GET /spec-sync/status` – Spec sync daemon status
- `POST /spec-sync/start` – Start sync daemon
- `POST /spec-sync/stop` – Stop sync daemon

## Health / Metrics

- `GET /health` – Health check
- `GET /metrics` – Metrics

## Notes

- The code references `spec_endpoints` router, but the file was not located; likely intended endpoints for spec list/show/generate/validate.