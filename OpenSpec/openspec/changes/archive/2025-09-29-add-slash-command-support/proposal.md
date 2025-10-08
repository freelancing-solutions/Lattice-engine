# Add Slash Command Support for Coding Agents

## Summary
- Enable OpenSpec to generate and update custom slash commands for supported coding agents (Claude Code and Cursor).
- Provide three slash commands aligned with OpenSpec's workflow: proposal (start a change proposal), apply (implement), and archive.
- Share slash command templating between agents to make future extensions simple.

## Motivation
Developers use different coding agents and editors. Having consistent slash commands across tools for the OpenSpec workflow reduces friction and ensures a standard way to trigger the workflow. Supporting both Claude Code and Cursor now lays a foundation for future agents that introduce slash command features.

## Proposal
1. During `openspec init`, when a user selects a supported tool, generate slash command configuration for three OpenSpec workflow stages:
   - Claude (namespaced): `/openspec/proposal`, `/openspec/apply`, `/openspec/archive`.
   - Cursor (flat, prefixed): `/openspec-proposal`, `/openspec-apply`, `/openspec-archive`.
   - Semantics:
     - Create – scaffold a change (ID, `proposal.md`, `tasks.md`, delta specs); validate strictly.
     - Apply – implement an approved change; complete tasks; validate strictly.
     - Archive – archive after deployment; update specs if needed.
   - Each command file MUST embed concise, step-by-step instructions sourced from `openspec/README.md` (see Template Content section).
2. Store slash command files per tool:
   - Claude Code: `.claude/commands/openspec/{proposal,apply,archive}.md`
   - Cursor: `.cursor/commands/{openspec-proposal,openspec-apply,openspec-archive}.md`
   - Ensure nested directories are created.
3. Command file format and metadata:
   - Use Markdown with optional YAML frontmatter for tool metadata (name/title, description, category/tags) when supported by the tool.
   - Place OpenSpec markers around the body only, never inside frontmatter.
   - Keep the visible slash name, file name, and any frontmatter `name`/`id` consistently aligned (e.g., `proposal`, `openspec-proposal`).
   - Namespacing: categorize these under “OpenSpec” and prefer unique IDs (e.g., `openspec-proposal`) to avoid collisions.
4. Centralize templates: define command bodies once and reuse across tools; apply minimal per-tool wrappers (frontmatter, categories, filenames).
5. During `openspec update`, refresh only existing slash command files (per-file basis) within markers; do not create missing files or new tools.

## Design Ideas
- Introduce `SlashCommandConfigurator` to manage multiple files per tool.
  - Expose targets rather than a single `configFileName` (e.g., `getTargets(): Array<{ path: string; kind: 'slash'; id: string }>`).
  - Provide `generateAll(projectPath, openspecDir)` for init and `updateExisting(projectPath, openspecDir)` for update.
- Per-tool adapters add only frontmatter and pathing; bodies come from shared templates.
- Templates live in `TemplateManager` with helpers that extract concise, authoritative snippets from `openspec/README.md`.
- Update flow logs per-file results so users see exactly which slash files were refreshed.

### Marker Placement
- Markers MUST wrap only the Markdown body contents:
  - Frontmatter (if present) goes first.
  - Then `<!-- OPENSPEC:START -->` … body … `<!-- OPENSPEC:END -->`.
  - Avoid inserting markers into the YAML block to prevent parse errors.

### Idempotency and Creation Rules
- `init`: create all three files for the chosen tool(s) once; subsequent `init` runs are no-ops for existing files.
- `update`: refresh only files that exist; skip missing ones without creating new files.
- Directory creation for `.claude/commands/openspec/` and `.cursor/commands/` is the configurator’s responsibility.

### Command Naming & UX
- Claude Code: use namespacing in the slash itself for readability and grouping: `/openspec/proposal`, `/openspec/apply`, `/openspec/archive`.
- Cursor: use flat names with an `openspec-` prefix: `/openspec-proposal`, `/openspec-apply`, `/openspec-archive`. Group via `category: OpenSpec` when supported.
- Consistency: align file names, visible slash names, and any frontmatter `id` (e.g., `id: openspec-apply`).
- Migration: do not rename existing commands during `update`; apply new naming only on `init` (or via an explicit migrate step).

## Open Questions
- Validate exact metadata/frontmatter supported by each tool version; if unsupported, omit frontmatter and ship Markdown body only.
- Confirm the final Cursor command file location for the targeted versions; fall back to Markdown-only if Cursor does not parse frontmatter.
- Evaluate additional commands beyond the initial three (e.g., `/show-change`, `/validate-all`) based on user demand.

## Alternatives
- Hard-code slash command text per tool (rejected: duplicates content; increases maintenance).
- Delay Cursor support until its config stabilizes (partial accept): gate Cursor behind a feature flag until verified in real environments.

## Risks
- Tool configuration formats may change, requiring updates to wrappers/frontmatter.
- Incorrect paths or categories can hide commands; add path existence checks and clear logging.
- Marker misuse (inside frontmatter) can break parsing; enforce placement rules in tests.

## Future Work
- Support additional editors/agents that expose slash command APIs.
- Allow users to customize command names and categories during `openspec init`.
- Provide a dedicated command to regenerate slash commands without running full `update`.

## File Format Examples
The following examples illustrate expected structure. If a tool does not support frontmatter, omit the YAML block and keep only the markers + body.

### Claude Code: `.claude/commands/openspec/proposal.md`
```markdown
---
name: OpenSpec: Proposal
description: Scaffold a new OpenSpec change and validate strictly.
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
...command body from shared template...
<!-- OPENSPEC:END -->
```

Slash invocation: `/openspec/proposal` (namespaced)

### Cursor: `.cursor/commands/openspec-proposal.md`
```markdown
---
name: /openspec-proposal
id: openspec-proposal
category: OpenSpec
description: Scaffold a new OpenSpec change and validate strictly.
---
<!-- OPENSPEC:START -->
...command body from shared template...
<!-- OPENSPEC:END -->
```

Slash invocation: `/openspec-proposal` (flat, prefixed)

## Template Content
Templates should be brief, actionable, and sourced from `openspec/README.md` to avoid duplication. Each command body includes:
- Guardrails: ask 1–2 clarifying questions if needed; follow minimal-complexity rules; use `pnpm` for Node projects.
- Step list tailored to the workflow stage (proposal, apply, archive), including strict validation commands.
- Pointers to `openspec show`, `openspec list`, and troubleshooting tips when validation fails.

## Testing Strategy
- Golden snapshots for generated files per tool (frontmatter + markers + body).
- Partial presence tests: if 1–2 files exist, `update` only refreshes those and does not create missing ones.
- Marker placement tests: ensure markers never appear inside frontmatter; cover missing/duplicated marker recovery behavior.
- Logging tests: `update` reports per-file updates for slash commands.
