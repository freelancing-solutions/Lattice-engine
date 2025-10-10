# Lattice CLI (Node.js)

A comprehensive command-line interface for managing Lattice Engine resources, built with Node.js. This CLI provides full-featured access to all Lattice Engine capabilities including authentication, project management, spec handling, mutation workflows, and deployment operations.

## Features

- **Complete Feature Coverage**: All Lattice Engine operations supported
- **Intelligent Auto-Correction**: Suggests fixes for typos and command errors
- **Dry-Run Mode**: Preview commands before execution
- **Multiple Output Formats**: JSON, table, and human-readable formats
- **Comprehensive Error Handling**: Friendly error messages with actionable suggestions
- **Configuration Management**: Flexible configuration from multiple sources
- **Environment Variable Support**: Override settings via environment variables
- **Proxy Support**: HTTP/HTTPS proxy configuration

## Installation

### Global Installation (Recommended)

```bash
npm install -g @lattice/cli-node
```

### Local Development

```bash
cd cli/node-cli
npm install
npm link  # Creates global symlink for development
```

### Direct Usage

```bash
node cli/node-cli/bin/lattice.js --help
```

## Quick Start

### 1. Authentication

```bash
# Login to Lattice Engine
lattice auth login --username your@email.com --password your-password

# Verify authentication
lattice auth status

# Logout when done
lattice auth logout
```

### 2. Project Initialization

```bash
# Initialize a new Lattice project
lattice project init --repo organization/my-app

# Initialize with specific settings
lattice project init --repo org/app --description "Payment processing service"
```

### 3. Spec Management

```bash
# Generate spec from description
lattice spec generate --description "Payment API endpoints with refund capabilities" --save

# Create spec from template
lattice spec create --name payments-api --template rest-api

# Validate local spec file
lattice spec validate --path ./specs/api-spec.json

# Sync specs with backend
lattice spec sync --direction pull
lattice spec sync --direction push --filter payments-*

# List available specs
lattice spec list --source all
lattice spec show --name payments-api
```

### 4. Mutation Workflow

```bash
# Propose a new mutation
lattice mutation propose --spec payments-api --change "Add refund endpoint" --auto-apply

# Check mutation status
lattice mutation status --id mut_123456

# Review and approve mutations
lattice mutation list
lattice mutation show --id mut_123456
lattice mutation approve --id mut_123456 --note "Approved for staging"
lattice mutation reject --id mut_123456 --reason "Needs security review"
```

### 5. Deployment

```bash
# Preview deployment (dry-run)
lattice deploy --mutation-id mut_123456 --env staging --dry-run --output table

# Deploy to staging
lattice deploy --mutation-id mut_123456 --env staging --strategy rolling --wait

# Deploy to production
lattice deploy --mutation-id mut_123456 --env production --strategy blue-green
```

## Configuration

### Configuration Sources (Priority Order)

1. **Environment Variables**: Highest priority
   - `LATTICE_API_URL`: Override API endpoint
   - `LATTICE_TOKEN`: Authentication token
   - `NO_PROMPT=1`: Disable interactive prompts
   - `LATTICE_DEBUG=1`: Enable verbose logging
   - `HTTP_PROXY` / `HTTPS_PROXY`: Proxy configuration

2. **Repository Configuration**: `.lattice/config.json`
   ```json
   {
     "api": {
       "endpoint": "https://api.project-lattice.site",
       "token": "your-auth-token"
     },
     "deploy": {
       "wait": true,
       "strategy": "rolling"
     },
     "specs": {
       "auto_sync": true,
       "validation": "strict"
     }
   }
   ```

3. **Shared Configuration**: `cli/shared/config.json` (fallback)

### Command-Line Options

- `--api-url <url>`: Override API endpoint
- `--no-color`: Disable colored output
- `--dry-run`: Preview without executing
- `--output <format>`: Choose output format (json, table)
- `--version`: Show version information
- `--help`: Show help for commands

## Command Reference

### Authentication Commands

```bash
lattice auth login --username <email> --password <password>
lattice auth logout
lattice auth status
```

### Project Commands

```bash
lattice project init --repo <owner/name> [--description <text>]
```

### Spec Commands

```bash
lattice spec generate --description <text> [--save]
lattice spec create --name <name> [--template <template>] [--description <text>]
lattice spec validate --path <file> [--strict]
lattice spec sync --direction <push|pull> [--filter <pattern>]
lattice spec list [--source <local|remote|all>] [--filter <pattern>]
lattice spec show --name <name> [--source <local|remote>]
```

### Mutation Commands

```bash
lattice mutation propose --spec <name> --change <description> [--auto-apply]
lattice mutation status --id <mutation-id>
lattice mutation approve --id <mutation-id> [--note <reason>]
lattice mutation reject --id <mutation-id> [--reason <reason>]
lattice mutation list
lattice mutation show --id <mutation-id>
```

### Deployment Commands

```bash
lattice deploy --mutation-id <id> --env <environment> [--strategy <strategy>] [--wait]
```

### MCP Commands

```bash
lattice mcp status
lattice mcp sync --direction <push|pull> [--profile <name>]
```

### Risk Assessment

```bash
lattice risk assess --mutation-id <id> --env <environment>
```

## Short Aliases

Common flags have short aliases for convenience:

| Full Flag | Alias | Example |
|-----------|-------|---------|
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

## Auto-Correction Features

The CLI automatically detects and suggests corrections for:
- Command typos (e.g., "mutate" → "mutation")
- Flag typos (e.g., "--descrip" → "--description")
- Value suggestions (e.g., invalid environment names)

Use `--auto-fix` to automatically apply the first suggestion.

## Error Handling

The CLI provides friendly error messages with:
- Clear problem description
- Actionable suggestions
- Technical details for support (when available)
- HTTP status code explanations

Common error scenarios:
- **Connection Issues**: Network connectivity, server availability
- **Authentication**: Invalid credentials, expired tokens
- **Authorization**: Insufficient permissions
- **Validation**: Invalid input parameters, malformed specs
- **Not Found**: Missing resources, incorrect IDs
- **Server Errors**: Backend issues, temporary unavailability

## Development

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Setup

```bash
cd cli/node-cli
npm install
npm test
```

### Running Locally

```bash
# Run directly
node bin/lattice.js --help

# Or use npm script
npm start
```

## Environment Variables

- `LATTICE_API_URL`: Override API base URL
- `LATTICE_TOKEN`: Authentication token (for CI/CD)
- `NO_PROMPT=1`: Disable interactive prompts
- `LATTICE_DEBUG=1`: Enable verbose debug logging
- `HTTP_PROXY` / `HTTPS_PROXY`: Proxy configuration
- `NO_COLOR`: Disable colored output

## Support

For issues and questions:
- Check the [main documentation](../README.md)
- Review error messages and suggestions
- Enable debug mode with `LATTICE_DEBUG=1`
- Visit the [GitHub repository](https://github.com/lattice-engine/lattice)

## License

MIT License - see the main project LICENSE file for details.