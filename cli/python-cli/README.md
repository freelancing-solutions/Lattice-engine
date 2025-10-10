# Lattice CLI (Python)

A lightweight Python implementation of the Lattice CLI, providing core functionality for managing Lattice Engine resources. Built with Python 3.9+ and designed for simplicity and reliability.

## Features

- **Core Lattice Operations**: Authentication, project management, spec handling, mutations, and deployments
- **Lightweight & Fast**: Minimal dependencies, quick startup
- **Pythonic Design**: Follows Python conventions and best practices
- **Friendly Error Messages**: Clear error handling with actionable suggestions
- **Configuration Flexibility**: Multiple configuration sources with environment overrides
- **Proxy Support**: HTTP/HTTPS proxy configuration
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### From PyPI (Recommended)

```bash
pip install lattice-py
```

### Development Installation

```bash
cd cli/python-cli
pip install -e .
```

### Requirements

- Python 3.9 or higher
- pip package manager

## Quick Start

### 1. Authentication

```bash
# Login to Lattice Engine
lattice-py auth login --username your@email.com --password your-password

# Check authentication status
lattice-py auth status

# Logout when done
lattice-py auth logout
```

### 2. Project Initialization

```bash
# Initialize a new Lattice project
lattice-py project init --repo organization/my-app
```

### 3. Spec Management

```bash
# Generate spec from description
lattice-py spec generate --description "Payment API endpoints with refund capabilities" --save

# Validate local spec file
lattice-py spec validate --path ./specs/api-spec.json

# Sync specs with backend
lattice-py spec sync --direction pull
lattice-py spec sync --direction push --filter payments-*

# List available specs
lattice-py spec list --source all
lattice-py spec show --name payments-api
```

### 4. Mutation Workflow

```bash
# Propose a new mutation
lattice-py mutation propose --spec payments-api --change "Add refund endpoint" --auto-apply

# Check mutation status
lattice-py mutation status --id mut_123456

# Approve or reject mutations
lattice-py mutation approve --id mut_123456 --note "Looks good"
lattice-py mutation reject --id mut_123456 --reason "Needs more testing"

# List mutations
lattice-py mutation list
lattice-py mutation show --id mut_123456
```

### 5. Deployment

```bash
# Deploy to staging
lattice-py deploy --mutation-id mut_123456 --env staging

# Deploy to production with strategy
lattice-py deploy --mutation-id mut_123456 --env production --strategy blue-green --wait
```

### 6. Risk Assessment

```bash
# Assess mutation risk
lattice-py risk assess --id mut_123456
```

### 7. MCP Server Management

```bash
# Check MCP status
lattice-py mcp status

# Sync MCP metadata
lattice-py mcp sync --direction pull
lattice-py mcp sync --direction push --profile default
```

### 8. Dry-Run Mode and Output Formats

```bash
# Preview deployment without executing
lattice-py deploy --mutation-id mut_123456 --env staging --dry-run

# Use table output format
lattice-py spec list --output table
lattice-py mutation list -o table

# Combine dry-run with table output
lattice-py deploy -m mut_123456 -e staging --dry-run -o table
```

## Configuration

### Configuration Sources (Priority Order)

1. **Environment Variables**: Highest priority
   - `LATTICE_API_URL`: Override API endpoint
   - `LATTICE_TOKEN`: Authentication token
   - `NO_PROMPT=1`: Disable interactive prompts
   - `HTTP_PROXY` / `HTTPS_PROXY`: Proxy configuration

2. **Repository Configuration**: `.lattice/config.json`
   ```json
   {
     "api": {
       "endpoint": "https://api.project-lattice.site",
       "token": "your-auth-token"
     }
   }
   ```

3. **Shared Configuration**: `cli/shared/config.json` (fallback)

### Command-Line Options

- `--api-url <url>` / `-u`: Override API endpoint
- `--help`: Show help for commands
- `--version` / `-v`: Show version information
- `--dry-run` / `--dry` / `--dr`: Preview commands without executing
- `--output <format>` / `-o`: Choose output format (json, table)
- `--auto-fix`: Auto-apply close matches for typos
- `--no-color` / `-N`: Disable ANSI colors in output
- `--non-interactive` / `-y`: Disable interactive prompts (also set env `NO_PROMPT=1`)

## Command Reference

### Authentication Commands

```bash
lattice-py auth login --username <email> --password <password>
lattice-py auth login -u <email> -p <password>  # with short aliases
lattice-py auth status
lattice-py auth logout
```

### Project Commands

```bash
lattice-py project init --repo <owner/name>
lattice-py project init -r <owner/name>  # with short alias
```

### Spec Commands

```bash
lattice-py spec generate --description <text> [--save]
lattice-py spec generate -d <text> -s  # with short aliases
lattice-py spec validate --path <file> [--strict]
lattice-py spec validate -p <file>  # with short alias
lattice-py spec sync --direction <push|pull> [--filter <pattern>]
lattice-py spec sync -d <push|pull> -f <pattern>  # with short aliases
lattice-py spec list [--source <local|remote|all>] [--filter <pattern>]
lattice-py spec list -s all -f <pattern>  # with short aliases
lattice-py spec show --name <name> [--source <local|remote>]
lattice-py spec show -n <name>  # with short alias
```

### Mutation Commands

```bash
lattice-py mutation propose --spec <name> --change <description> [--auto-apply]
lattice-py mutation propose -s <name> -c <description> -a  # with short aliases
lattice-py mutation status --id <mutation-id>
lattice-py mutation status -i <mutation-id>  # with short alias
lattice-py mutation approve --id <mutation-id> [--note "reason"]
lattice-py mutation approve -i <mutation-id> -n "reason"  # with short aliases
lattice-py mutation reject --id <mutation-id> [--reason "reason"]
lattice-py mutation reject -i <mutation-id> -r "reason"  # with short aliases
lattice-py mutation list
lattice-py mutation show --id <mutation-id>
lattice-py mutation show -i <mutation-id>  # with short alias
```

### Deployment Commands

```bash
lattice-py deploy --mutation-id <id> --env <environment> [--strategy <rolling|blue-green|canary>] [--wait]
lattice-py deploy -m <id> -e <environment> -s <strategy> -w  # with short aliases
```

### Risk Assessment Commands

```bash
lattice-py risk assess --id <mutation-id> [--policy <policy-name>]
lattice-py risk assess -m <mutation-id> -p <policy-name>  # with short aliases
```

### MCP Commands

```bash
lattice-py mcp status
lattice-py mcp sync --direction <push|pull> [--profile <name>]
lattice-py mcp sync -d <push|pull> -p <name>  # with short aliases
```

## Python-Specific Features

### Error Handling

The Python CLI provides detailed error messages with:
- Clear problem description
- Actionable suggestions
- Technical details for debugging
- HTTP status code explanations

### Configuration Loading

Configuration is loaded in priority order:
1. Environment variables
2. Repository config file
3. Shared config file
4. Default values

### Dependencies

- **requests**: HTTP client for API communication
- **urllib3**: HTTP library (used by requests)
- **difflib**: Built-in Python module for suggestions

## Development

### Prerequisites

- Python 3.9 or higher
- pip package manager
- virtual environment (recommended)

### Setup

```bash
cd cli/python-cli
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
```

### Running Tests

```bash
python -m pytest  # If tests are available
python -m lattice_py --help  # Test CLI directly
```

### Project Structure

```
python-cli/
├── pyproject.toml          # Project configuration
├── README.md              # This file
└── src/
    └── lattice_py/
        ├── __init__.py    # Package initialization
        └── __main__.py    # CLI implementation
```

## Environment Variables

- `LATTICE_API_URL`: Override API base URL
- `LATTICE_TOKEN`: Authentication token (for CI/CD)
- `NO_PROMPT=1`: Disable interactive prompts
- `HTTP_PROXY` / `HTTPS_PROXY`: Proxy configuration
- `NO_COLOR`: Disable colored output

## Differences from Node.js CLI

The Python CLI (`lattice-py`) provides core functionality with these differences:

- **Simpler Interface**: Fewer command-line options
- **Python Conventions**: Follows Python naming and style conventions
- **Lightweight**: Smaller installation size, faster startup
- **Limited Auto-Correction**: Basic suggestion support
- **Core Commands Only**: Focuses on most commonly used operations

Both CLIs now support:
- **Dry-Run Mode**: Preview commands before execution with `--dry-run`
- **Short Aliases**: Short flag aliases like `-e` for `--environment`, `-m` for `--mutation-id`
- **Multiple Output Formats**: JSON and table output formats with `--output json|table`

## Support

For issues and questions:
- Check the [main documentation](../README.md)
- Review error messages and suggestions
- Visit the [GitHub repository](https://github.com/lattice-engine/lattice)
- Enable debug mode by setting environment variables

## License

MIT License - see the main project LICENSE file for details.