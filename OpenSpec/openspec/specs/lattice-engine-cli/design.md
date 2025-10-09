# Lattice Engine CLI — Design

## Overview
A TypeScript/Node.js CLI that builds on OpenSpec conventions to create, validate, and evolve specifications and to propose intelligent mutations. The CLI focuses on predictable file operations, AI-friendly outputs, and minimal dependencies.

## Tech Stack
- Runtime: Node.js ≥ 20 (ESM)
- Language: TypeScript (strict)
- CLI Framework: Commander.js
- Prompts: @inquirer/prompts (guarded by `--no-interactive`)
- File Ops: Node `fs/promises`, `path`, `os`
- Distribution: npm package (`lattice`), supports `npx lattice`

## Command Tree
- `lattice spec create <name> [--template auth|api|db|workflow]`
- `lattice spec validate [<name>] [--strict] [--json]`
- `lattice mutation propose --spec <name> [--title] [--description] [--risk] [--from-branch] [--json]`
- `lattice list [--specs|--changes] [--json]`
- `lattice show <item> [--type spec|change] [--json]`
- `lattice spec sync [--push|--pull] [--json]`

## File Structure (OpenSpec)
```
openspec/
├── project.md
├── AGENTS.md
├── specs/
│   └── <name>/
│       ├── spec.md
│       └── design.md (optional)
└── changes/
    ├── <YYYY-MM-DD>-<name>-mutation/
    │   ├── proposal.md
    │   ├── tasks.md
    │   └── specs/
    │       └── <name>/spec.md (future-state)
    └── archive/
```

## Behavior Details

### spec create
- Ensures base `openspec/` structure exists (creates if absent)
- Writes `spec.md` with structured headers (Requirement/Scenario)
- Optional `design.md` when `--template` provided
- Outputs ASCII-safe success with file paths

### spec validate
- Parses markdown to verify OpenSpec headings and SHALL statements
- `--strict` enforces mandatory sections; exits 1 on any deviation
- `--json` outputs structured violations

### mutation propose
- Creates a new change directory with unique date prefix
- Generates `proposal.md` including metadata (`--title`, `--description`, `--risk`, `--from-branch`)
- Writes future-state `specs/<name>/spec.md` (clean target state, no diff syntax)
- Populates `tasks.md` checklist inferred from mutation intent

### list / show
- `list --specs` enumerates `openspec/specs/*`
- `list --changes` enumerates `openspec/changes/*` excluding `archive`
- `show <item>` auto-detects type; `--type` disambiguates when needed

### spec sync
- `--push` writes specs to configured remote
- `--pull` updates local from remote
- Remote config read from `openspec/project.md` (or `.env`) when present

## Non-interactive & Output Modes
- `--no-interactive` disables prompts; fail early with guidance
- `--json` returns machine-readable data for all commands
- Default output is human-readable, ASCII-safe, with limited color

## Error Handling
- 0: success, 1: general error/validation failure, 2: misuse
- Descriptive messages; no stack traces by default
- Utility functions avoid try/catch; handle at command level

## Integration Points
- OpenSpec conventions: verb–noun style, structured spec format
- Potential remote: Lattice Portal API for sync (future extension)
- Optional link to CI to run `spec validate` on PRs

## Example Flows

### Create → Validate → Propose
```
npx lattice spec create user-auth --template auth
npx lattice spec validate user-auth --strict
npx lattice mutation propose --spec user-auth --risk medium \
  --title "Add OAuth2 provider" --description "Introduce OAuth2 integration"
```

### Inspect
```
npx lattice list --specs
npx lattice list --changes
npx lattice show user-auth --type spec
```

## Future Enhancements
- `review start --spec <name>` to initiate team review workflow
- `diff` to visualize delta between current and future-state specs
- Rich templates catalog with domain-specific requirements