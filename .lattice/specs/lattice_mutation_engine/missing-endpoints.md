# Missing Endpoints vs CLI Expectations

This document lists gaps between the CLI/VScode expectations and the current engine API.

## Base Path Alignment

- Add `/api` prefix for all endpoints or provide a reverse proxy that maps `/api/*` to engine routes.

## Mutations

- `GET /api/mutations` – List mutations
- `GET /api/mutations/{id}` – Get mutation details/status
- `POST /api/mutations/{id}/risk-assessment` – Run risk assessment

## Deployments

- `POST /api/deployments` – Trigger deployment for a mutation

## Spec Management / Sync

- `POST /api/specs/sync/pull` – Pull specs
- `POST /api/specs/sync/push` – Push specs
- `GET /api/specs` – List specs
- `GET /api/specs/{name}` – Show spec details
- `POST /api/specs/generate` – Generate from description
- `POST /api/specs/validate` – Validate spec file

## MCP

- `GET /api/mcp/status` – MCP status
- `POST /api/mcp/sync` – MCP sync

## Additional Considerations

- Ensure authentication middleware supports both JWT (`Authorization: Bearer`) and `X-API-Key` for CLI use.
- Maintain rate limits where appropriate, especially for mutation proposal, search, and spec operations.
- Align response shapes with CLI expectations (e.g., `{ mutation: {...} }` for show/status).