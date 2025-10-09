# Lattice Engine CLI Specification

## Purpose

The `lattice` CLI manages specifications and mutation proposals for the Lattice Engine. It builds on OpenSpec conventions, enabling teams to create, validate, and evolve specs with AI-assisted workflows.

## Alignment

- Follows OpenSpec project structure and spec formatting conventions
- Adopts verb–noun command style defined in OpenSpec Conventions
- Produces ASCII-safe, AI-friendly output suitable for parsing

## Requirements

### Requirement: Authentication and Project Initialization
The CLI SHALL authenticate the user and initialize a repository before any backend operations.

#### Scenario: Authenticate
- **WHEN** a user runs `npx lattice auth login`
- **THEN** the CLI performs authenticated login against the backend
- **AND** persists credentials securely for subsequent commands
- **AND** supports `--api-url` and `--api-key` overrides

#### Scenario: Initialize repository
- **WHEN** a user runs `npx lattice init`
- **THEN** the CLI registers or syncs the repo with the backend
- **AND** writes local configuration under `.lattice/config.json`
- **AND** verifies connectivity and project selection

### Requirement: CLI Invocation and Namespace
The tool SHALL be invoked as `npx lattice` (or installed as `lattice`) and provide verb-first commands.

#### Scenario: Basic invocation
- **WHEN** a user runs `npx lattice --help`
- **THEN** display available verbs and top-level usage examples
- **AND** support `--version`, `--help`, `--json`, `--no-interactive`

### Requirement: Spec Creation
The CLI SHALL scaffold new specifications under `openspec/specs/<name>/` using OpenSpec format, and MAY save generated specifications to `.lattice/specs/<name>.json` when produced by the backend.

#### Scenario: Create a new spec
- **WHEN** running `npx lattice spec create user-auth`
- **THEN** create `openspec/specs/user-auth/spec.md` with structured sections
- **AND** optionally create `openspec/specs/user-auth/design.md`
- **AND** print success with path locations

#### Scenario: Generate spec from description (AI/API)
- **WHEN** running `npx lattice spec generate --from "User authentication with email, OAuth2" --name user-auth`
- **THEN** the CLI sends the description to the backend API for generation
- **AND** the backend returns a validated spec document (JSON/Markdown)
- **AND** the CLI saves the spec to `.lattice/specs/user-auth.json` (or `openspec/specs/user-auth/spec.md` when Markdown)
- **AND** prints the location and metadata

#### Scenario: Templates for different domains
- **WHEN** running with `--template auth|api|db|workflow`
- **THEN** scaffold domain-specific example requirements and scenarios

### Requirement: Spec Validation
The CLI SHALL validate spec files for adherence to OpenSpec conventions.

#### Scenario: Validate a single spec
- **WHEN** running `npx lattice spec validate user-auth`
- **THEN** check headings, SHALL statements, and scenario format
- **AND** exit with code 0 when valid
- **AND** exit with code 1 when violations found

#### Scenario: Strict mode
- **WHEN** running with `--strict`
- **THEN** enforce all mandatory sections and fail on any deviation

### Requirement: Mutation Proposal
The CLI SHALL propose a mutation against an existing spec, sending the proposal to the backend where conflicts and dependencies are automatically resolved. Outcomes MAY include: auto-approval with new spec creation, creation of a mutation for older specs, or rejection based on project rules requiring user intervention.

#### Scenario: Propose mutation for a spec
- **WHEN** running `npx lattice mutation propose --spec user-auth`
- **THEN** create `openspec/changes/<YYYY-MM-DD>-user-auth-mutation/`
- **AND** generate `proposal.md` with context and rationale
- **AND** create `specs/user-auth/spec.md` future-state content (no diff syntax)
- **AND** include `tasks.md` with checklist items inferred from the mutation

#### Scenario: Backend resolution
- **WHEN** a proposal is sent, the backend resolves conflicts and dependencies
- **THEN** if conflict-free, a new spec is created and returned
- **OR** a mutation is created referencing impacted older specs
- **OR** the proposal is rejected with reasons per project rules
- **AND** the CLI surfaces resolution, risk level, and next actions

#### Scenario: Additional proposal metadata
- **WHEN** providing `--title`, `--description`, `--risk low|medium|high`, `--from-branch <branch>`
- **THEN** persist metadata in `proposal.md`
- **AND** include risk notes and branch context

#### Scenario: Mutation status and approvals
- **WHEN** running `npx lattice mutation status <id>`
- **THEN** fetch current backend status and resolution details
- **WHEN** running `npx lattice mutation approve <id> [--auto-approve]`
- **THEN** record approval via backend and continue workflow
- **WHEN** running `npx lattice mutation reject <id> --reason "..."`
- **THEN** record rejection and persist reasons

### Requirement: Show and List
The CLI SHALL help users discover and inspect specs and changes.

#### Scenario: List items
- **WHEN** running `npx lattice list --specs`
- **THEN** list specs found under `openspec/specs`
- **WHEN** running `npx lattice list --changes`
- **THEN** list active changes under `openspec/changes`

#### Scenario: Show item
- **WHEN** running `npx lattice show user-auth`
- **THEN** detect if item is a spec or change by name
- **AND** display formatted content
- **AND** accept `--type spec|change` for disambiguation

### Requirement: Sync
The CLI SHALL synchronize specs with remote services when configured.

#### Scenario: Push and pull specs
- **WHEN** running `npx lattice spec sync --push`
- **THEN** push local spec content to configured remote endpoint
- **WHEN** running `npx lattice spec sync --pull`
- **THEN** update local specs from remote source
- **AND** respect non-interactive mode and `--json` output

### Requirement: Output and Non-interactive Behavior
The CLI SHALL provide human-readable output by default and machine-readable JSON when requested.

#### Scenario: JSON output
- **WHEN** running any command with `--json`
- **THEN** print structured JSON for programmatic consumption

#### Scenario: Non-interactive mode
- **WHEN** stdin is not a TTY or `--no-interactive` is provided
- **THEN** do not prompt and return helpful guidance on required flags

### Requirement: Error Handling
The CLI SHALL use consistent exit codes and descriptive error messages.

#### Scenario: Exit codes
- **WHEN** a command succeeds
- **THEN** exit 0
- **WHEN** validation fails or misuse occurs
- **THEN** exit 1 (general error) or 2 (misuse)

## Command Reference

### `lattice auth login [--api-url <url>] [--api-key <key>]`
- Authenticates the user against the backend and persists credentials
- Example: `npx lattice auth login --api-url https://api.project-lattice.site`

### `lattice auth logout`
- Clears local credentials and session state
- Example: `npx lattice auth logout`

### `lattice init [--project <id>]`
- Initializes the repo and syncs project details with the backend
- Example: `npx lattice init --project web-portal`

### `lattice spec create <name> [--template auth|api|db|workflow]`
- Scaffolds a new spec directory and files using OpenSpec format
- Example: `npx lattice spec create user-auth --template auth`

### `lattice spec generate --from "<description>" --name <name> [--output json|md]`
- Generates a spec via backend AI/API and saves to `.lattice/specs/<name>.json` or OpenSpec
- Example: `npx lattice spec generate --from "User auth with OAuth2" --name user-auth --output json`

### `lattice spec validate [<name>] [--strict] [--json]`
- Validates a single spec or all specs if `<name>` omitted
- Example: `npx lattice spec validate user-auth --strict`

### `lattice mutation propose --spec <name> [--title "..."] [--description "..."] [--risk low|medium|high] [--from-branch <branch>] [--json]`
- Creates a change proposal with future-state spec content
- Example: `npx lattice mutation propose --spec user-auth --risk medium`

### `lattice mutation status <id> [--json]`
- Shows current backend resolution status and next actions
- Example: `npx lattice mutation status 12345`

### `lattice mutation approve <id> [--auto-approve] [--reason "..."]`
- Approves a mutation via backend and continues workflow
- Example: `npx lattice mutation approve 12345 --auto-approve`

### `lattice mutation reject <id> --reason "..."`
- Rejects a mutation and records reason
- Example: `npx lattice mutation reject 12345 --reason "High risk"`

### `lattice list [--specs|--changes] [--json]`
- Lists specs or changes depending on flags
- Example: `npx lattice list --specs`

### `lattice show <item> [--type spec|change] [--json]`
- Displays content for the named item with type disambiguation
- Example: `npx lattice show user-auth --type spec`

### `lattice spec sync [--push|--pull] [--json]`
- Synchronizes specs with remote systems when configured
- Example: `npx lattice spec sync --push`

## Examples

```bash
# Authenticate and initialize the repo
npx lattice auth login --api-url https://api.project-lattice.site
npx lattice init --project web-portal

# Create a new specification
npx lattice spec create user-auth --template auth

# Generate a specification from description via backend
npx lattice spec generate --from "User auth with email + OAuth2" --name user-auth --output json

# Validate a spec strictly
npx lattice spec validate user-auth --strict

# Propose a mutation against a spec
npx lattice mutation propose --spec user-auth --risk low \
  --title "Add OAuth2 support" --description "Introduce OAuth2 provider integration"

# Check mutation status and approve
npx lattice mutation status 12345
npx lattice mutation approve 12345 --auto-approve --reason "All checks passed"

# List specs and changes
npx lattice list --specs
npx lattice list --changes

# Show an item
npx lattice show user-auth --type spec
```

## Notes
- All content written to files MUST be ASCII-safe and parseable by AI assistants
- Future-state spec content in changes MUST avoid diff syntax; write clean target state
- Command behavior SHOULD mirror OpenSpec CLI UX where appropriate
 - Generated specs SHOULD be saved under `.lattice/specs/` when returned by backend