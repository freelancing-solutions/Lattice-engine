# Lattice CLI Usage Guide

This guide summarizes common CLI commands, global flags, dry-run previews, and environment configuration.

## Installation

Install globally via npm and initialize a project:

```bash
npm install -g @lattice/cli
npx lattice project init --name "my-app" --type web
```

Supported Node.js versions: `18`, `20`, `22`. Platforms: Windows, macOS, Linux.

## Global Flags

- `--dry-run`: Print a preview of the request without executing it
- `--output`: Select preview format: `json` (default) or `table`
- `--non-interactive`: Disable interactive prompts (same as `NO_PROMPT=1`)

## Commands with Dry-run Support

- `auth login` / `auth logout`
- `project init`
- `spec show` (remote)
- `mutation list` / `mutation show`

## Examples

Auth login (JSON preview):

```bash
lattice auth login --email alice@example.com --password ****** --dry-run
# {
#   "method": "POST",
#   "url": "http://localhost:8000/api/auth/login",
#   "headers": { "Content-Type": "application/json" },
#   "body": { "email": "alice@example.com" },
#   "dryRun": true
# }
```

Project init (table preview):

```bash
lattice project init --name my-app --type web --dry-run --output table
# Method   URL                                      Dry Run
# POST     http://localhost:8000/api/projects       true
# Headers  Content-Type: application/json
# Body     {
#            "name": "my-app",
#            "type": "web"
#          }
```

## Environment Configuration

- `LATTICE_API_URL`: Override backend base URL (e.g., `https://api.project-lattice.site`)
- `HTTP_PROXY` / `HTTPS_PROXY`: Standard Node.js proxy variables for outbound HTTP(S)
- `NO_PROMPT`: Set to `1` to disable interactive prompts

Local config file: `.lattice/config.json` (repo root). Shared defaults: `cli/shared/config.json`.

## Related Documentation

- `cli/README.md` — command reference, dry-run mode, global flags
- `docs/cli-configuration.md` — configuration precedence and environment variables
- `docs/api-documentation.md` — REST API reference