# Design: Verb–Noun CLI Structure Adoption

## Overview
We will make verb commands (`list`, `show`, `validate`, `diff`, `archive`) the primary interface and keep noun commands (`spec`, `change`) as deprecated aliases for one release.

## Decisions

1. Keep routing centralized in `src/cli/index.ts`.
2. Add `--specs`/`--changes` to `openspec list`, with `--changes` as default.
3. Show deprecation warnings for `openspec change list` and, more generally, for any `openspec change ...` and `openspec spec ...` subcommands.
4. Do not change `show`/`validate` behavior beyond help text; they already support `--type` for disambiguation.

## Backward Compatibility
All noun-based commands continue to work with clear deprecation warnings directing users to verb-first equivalents.

## Out of Scope
JSON output parity for `openspec list` across modes and `show --specs/--changes` discovery are follow-ups.


