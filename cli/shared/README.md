# Shared Environment Configuration

This directory contains shared configuration and resources used by both the Node.js and Python CLI implementations. The shared configuration provides default settings and common behavior across both CLI tools.

## Configuration Hierarchy

Both CLI implementations follow a hierarchical configuration system:

1. **Environment Variables** (Highest Priority)
   - `LATTICE_API_URL`: Override API endpoint URL
   - `LATTICE_TOKEN`: Authentication token
   - `NO_PROMPT=1`: Disable interactive prompts
   - `HTTP_PROXY` / `HTTPS_PROXY`: Proxy configuration

2. **Repository Configuration** (`.lattice/config.json`)
   - Project-specific settings
   - User preferences
   - Authentication tokens

3. **Shared Configuration** (`cli/shared/config.json`) (Lowest Priority)
   - Default settings
   - Fallback values
   - Common configuration

## Configuration File Structure

### Shared Configuration (`config.json`)

```json
{
  "api": {
    "endpoint": "https://api.project-lattice.site",
    "version": "v1"
  }
}
```

### Repository Configuration (`.lattice/config.json`)

```json
{
  "api": {
    "endpoint": "https://api.project-lattice.site",
    "token": "your-auth-token-here"
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

## Configuration Options

### API Configuration

- **endpoint**: Base URL for Lattice Engine API
- **version**: API version to use (default: v1)
- **token**: Authentication token (repository config only)

### Project Configuration

- **id**: Project identifier
- **name**: Project display name
- **type**: Project type (javascript, python, etc.)

### Specs Configuration

- **auto_sync**: Automatically sync specs with backend (boolean)
- **validation**: Validation level (strict, loose, none)

### Notifications Configuration

- **enabled**: Enable notifications (boolean)
- **types**: Array of notification types to receive

## Environment Variables

### Core Environment Variables

- `LATTICE_API_URL`: Override API endpoint URL
- `LATTICE_TOKEN`: Authentication token
- `NO_PROMPT=1`: Disable interactive prompts
- `LATTICE_DEBUG=1`: Enable debug logging

### Proxy Configuration

- `HTTP_PROXY`: HTTP proxy URL
- `HTTPS_PROXY`: HTTPS proxy URL
- `NO_PROXY`: Comma-separated list of hosts to bypass proxy

### Output Configuration

- `NO_COLOR`: Disable colored output
- `FORCE_NO_COLOR`: Force disable colored output
- `LATTICE_OUTPUT_FORMAT`: Default output format

## Usage Examples

### Setting Environment Variables

```bash
# Override API endpoint
export LATTICE_API_URL="https://custom-api.lattice.engine"

# Set authentication token
export LATTICE_TOKEN="your-auth-token"

# Disable interactive prompts
export NO_PROMPT=1

# Configure proxy
export HTTP_PROXY="http://proxy.company.com:8080"
export HTTPS_PROXY="http://proxy.company.com:8080"
```

### Creating Repository Configuration

```bash
# Create .lattice directory
mkdir -p .lattice

# Create config.json file
cat > .lattice/config.json << EOF
{
  "api": {
    "endpoint": "https://api.project-lattice.site",
    "token": "your-auth-token"
  },
  "project": {
    "name": "my-service",
    "repository": "org/my-service"
  },
  "deploy": {
    "wait": true,
    "strategy": "rolling"
  }
}
EOF
```

### CLI Usage with Configuration

```bash
# Use default configuration
lattice auth login

# Override API endpoint via environment
LATTICE_API_URL=https://custom-api.lattice.engine lattice auth login

# Override via command line
lattice --api-url https://custom-api.lattice.engine auth login
```

## Best Practices

1. **Security**: Never commit authentication tokens to version control
2. **Flexibility**: Use environment variables for CI/CD and deployment
3. **Consistency**: Keep shared configuration minimal and focused on defaults
4. **Documentation**: Document project-specific settings in repository config
5. **Validation**: Validate configuration files before committing

## Troubleshooting

### Common Issues

1. **Configuration Not Loading**
   - Check file permissions and paths
   - Validate JSON syntax
   - Verify environment variable names

2. **Authentication Failures**
   - Ensure token is set in repository config
   - Check token expiration
   - Verify API endpoint accessibility

3. **Proxy Issues**
   - Set both HTTP_PROXY and HTTPS_PROXY
   - Configure NO_PROXY for local addresses
   - Test proxy connectivity

### Debug Configuration

```bash
# Enable debug logging
export LATTICE_DEBUG=1

# Test configuration loading
lattice --help  # Shows configuration being loaded

# Validate JSON syntax
python -m json.tool shared/config.json
```

## Files in This Directory

- **config.json**: Default shared configuration
- **README.md**: This documentation file

## Related Documentation

- [Main CLI Documentation](../README.md)
- [Node.js CLI Documentation](../node-cli/README.md)
- [Python CLI Documentation](../python-cli/README.md)
- [Lattice Engine API Documentation](https://docs.lattice.engine/api)