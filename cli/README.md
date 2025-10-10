# Lattice CLI (Monorepo)

This `cli/` folder contains two CLI implementations (Node.js and Python) with a shared environment for interacting with the Lattice Engine backend.

## Architecture Overview

The Lattice CLI provides a unified interface for managing Lattice Engine resources through two parallel implementations:

- **Node.js CLI** (`lattice`): Full-featured CLI with comprehensive command coverage
- **Python CLI** (`lattice-py`): Lightweight Python alternative with core functionality
- **Shared Configuration**: Common configuration and defaults used by both implementations

### Project Structure

```
cli/
├── shared/          # Common configuration and shared resources
├── node-cli/        # Node.js implementation (lattice command)
└── python-cli/      # Python implementation (lattice-py command)
```

### Key Features

Both CLI implementations provide:
- **Authentication**: Secure login/logout with token management
- **Project Management**: Initialize and configure Lattice projects
- **Spec Management**: Create, validate, generate, and sync API specifications
- **Mutation Workflow**: Propose, approve, reject, and track changes
- **Deployment**: Deploy mutations to different environments with strategies
- **MCP Integration**: Manage Model Context Protocol servers and sync
- **Risk Assessment**: Analyze deployment risks and dependencies
- **Dry-Run Mode**: Preview commands without executing them
- **Auto-Correction**: Intelligent typo detection and suggestions
- **Multiple Output Formats**: JSON, table, and human-readable formats

### Configuration System

Both tools read configuration from multiple sources in priority order:

1. **Environment Variables**: `LATTICE_API_URL` overrides API endpoint
2. **Repository Config**: `.lattice/config.json` at repository root
3. **Shared Config**: `cli/shared/config.json` as fallback defaults

The configuration includes:
- API endpoint and authentication tokens
- Deployment preferences and strategies
- Spec validation and sync settings
- Default behaviors for various commands

### Packaging & Distribution

- **Node.js**: Distributed as `@lattice/cli-node` npm package with `lattice` binary
- **Python**: Distributed as `lattice-py` package with `lattice-py` console script

Both provide the same core functionality with language-specific optimizations and idioms.

## Node CLI Usage

### Install

```bash
npm install -g @lattice/cli-node
# Or run directly
node cli/node-cli/bin/lattice.js --help
```

### Quick Start

```bash
# Login
lattice auth login --username your@email.com --password ******

# Initialize project
lattice project init --repo org/my-app

# Generate spec
lattice spec generate --description "Payment API endpoints" --save

# Deploy with dry-run preview
lattice deploy --mutation-id mut_123 --env production --dry-run

# Deploy for real
lattice deploy --mutation-id mut_123 --env production
```

### Configuration

Read from `.lattice/config.json`:

```json
{
  "api": {
    "endpoint": "https://api.project-lattice.site",
    "token": "your-auth-token"
  },
  "project": {
    "id": "my-project-id",
    "name": "My Project",
    "type": "javascript"
  },
  "specs": {
    "auto_sync": true,
    "validation": "strict"
  },
  "notifications": {
    "enabled": true,
    "types": ["mutation_created", "review_requested", "spec_updated"]
  }
}
```

Options:
- `api.endpoint` - API base URL (override with `LATTICE_API_URL`)
- `api.token` - Set via `lattice auth login`
- `project.id` - Project identifier
- `project.name` - Project display name
- `project.type` - Project type (javascript, python, etc.)
- `specs.auto_sync` - Auto-sync specs on changes
- `specs.validation` - Validation level (strict, loose)
- `notifications.enabled` - Enable notifications
- `notifications.types` - Array of notification types to receive

See more details in `docs/cli-configuration.md`.

### Commands

Authentication:
```bash
lattice auth login --username <email> --password <password>
lattice auth logout
```

Project:
```bash
lattice project init --repo <org/name>
```

Spec:
```bash
lattice spec generate --description "API description" [--save]
lattice spec create --name <spec-name> [--template <template>]
lattice spec validate --path <file.json>
lattice spec sync --direction <push|pull> [--filter <name>]
lattice spec list [--source <local|remote|all>] [--filter <name>]
lattice spec show --name <spec-name> [--source <local|remote>]
```

Mutation:
```bash
lattice mutation propose --spec <name> --change "Description" [--auto-apply]
lattice mutation status --id <mutation-id>
lattice mutation approve --id <mutation-id> [--note "reason"]
lattice mutation reject --id <mutation-id> [--reason "reason"]
lattice mutation list
lattice mutation show --id <mutation-id>
```

Deploy:
```bash
lattice deploy --mutation-id <id> --env <environment> [--strategy <rolling|blue-green|canary>] [--wait]
```

MCP:
```bash
lattice mcp status
lattice mcp sync --direction <push|pull> [--profile <name>]
```

### Dry-Run Mode

Preview commands without executing them using `--dry-run`:

```bash
# Preview deployment payload
lattice deploy --mutation-id mut_123 --env production --dry-run

# Preview spec sync with table output
lattice spec sync --direction push --dry-run --output table

# Preview mutation proposal
lattice mutation propose --spec payments-api --change "Rate limit increase" --dry-run
```

**Note**: Dry-run mode is only available in the Node.js CLI (`lattice`). The Python CLI (`lattice-py`) does not support dry-run functionality.

Supported dry-run commands (Node.js CLI only): `auth login`, `auth logout`, `deploy`, `spec sync`, `spec show`, `mutation propose`, `mutation status`, `mutation approve`, `mutation reject`, `mutation list`, `mutation show`, `risk assess`, `mcp status`, `mcp sync`

### Short Aliases

Common flags have short aliases:

| Full | Alias | Example |
|------|-------|---------|
| `--env` | `--e` | `lattice deploy --e production` |
| `--mutation-id` | `--mid` | `lattice deploy --mid mut_123` |
| `--repo` | `--r` | `lattice project init --r org/app` |
| `--id` | `--i` | `lattice mutation status --i mut_123` |
| `--direction` | `--dir` | `lattice spec sync --dir pull` |
| `--profile` | `--prof` | `lattice mcp sync --prof default` |
| `--dry-run` | `--dry`, `--dr` | `lattice deploy --dr` |
| `--username` | `--u` | `lattice auth login --u alice` |
| `--password` | `--pw` | `lattice auth login --pw ****` |
| `--description` | `--desc` | `lattice spec generate --desc "API"` |
| `--strategy` | `--strat` | `lattice deploy --strat rolling` |
| `--wait` | `--w` | `lattice deploy --w` |
| `--path` | `--file` | `lattice spec validate --file spec.json` |
| `--output` | `--fmt` | `lattice deploy --dry --fmt table` |
| `--name` | `--nm` | `lattice spec show --nm payments-api` |

### Auto-Correction

The CLI auto-corrects common typos and suggests alternatives.

### Output Formats

Select with `--output`:
- `json` - Structured JSON output (default)
- `table` - Compact tabular preview (dry-run)

### Global Options

- `--help`, `-h` - Show help
- `--version`, `-v` - Show version
- `--no-color` - Disable colored output
- `--api-url <url>` - Override API endpoint

### Environment Variables

- `LATTICE_API_URL` - Override API base URL
- `NO_PROMPT=1` - Disable interactive prompts
- `LATTICE_DEBUG=1` - Enable verbose debug logs
 - `HTTP_PROXY` / `HTTPS_PROXY` - Use a proxy for outbound HTTP(S) requests

### Examples

```bash
# Login
lattice auth login --u alice@company.com --pw ******

# Initialize project
lattice project init --r company/payment-service

# Generate spec
lattice spec generate --desc "Payment processing endpoints" --save

# Propose mutation
lattice mutation propose --spec payment-service --change "Add refund endpoint"

# Preview deployment
lattice deploy --mid mut_456 --e staging --dry --fmt table

# Deploy to staging and wait
lattice deploy --mid mut_456 --e staging --w

# Deploy to production
lattice deploy --mid mut_456 --e production --strat blue-green
```

### Testing

```bash
cd cli/node-cli
npm test
```

Tests cover argument parsing, alias correction, dry-run functionality, and error handling.

CI runs on Node.js `18`, `20`, and `22` across Linux, Windows, and macOS (see `.github/workflows/cli-node.yml`).