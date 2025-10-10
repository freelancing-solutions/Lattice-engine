# MCP Server Environment Configuration

This document explains the environment variables required for the Lattice MCP Server deployment using the project-lattice.site domain structure.

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual configuration

3. Required variables to update:
   - `LATTICE_API_KEY`: Your Lattice Engine API key
   - `JWT_SECRET`: A secure JWT secret (minimum 32 characters)
   - `REDIS_PASSWORD`: Your Redis password
   - `GRAFANA_PASSWORD`: Grafana admin password
   - SSL certificate paths (if using SSL)

## Environment Variables

### Core Application Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Server port | `3001` |
| `MCP_SERVER_HOST` | Server host binding | `0.0.0.0` |
| `LOG_LEVEL` | Logging level | `info` |

### Lattice Engine Connection

| Variable | Description | Default |
|----------|-------------|---------|
| `LATTICE_ENGINE_URL` | Lattice Engine API URL | `https://api.project-lattice.site` |
| `LATTICE_ENGINE_WS_URL` | Lattice Engine WebSocket URL | `wss://api.project-lattice.site/ws` |
| `LATTICE_API_KEY` | Your Lattice Engine API key | **Required** |

### Authentication & Security

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret (min 32 chars) | **Required** |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` |
| `BCRYPT_ROUNDS` | Bcrypt hashing rounds | `12` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://app.project-lattice.site,https://www.project-lattice.site` |
| `HELMET_ENABLED` | Enable Helmet security headers | `true` |
| `TRUST_PROXY` | Trust proxy headers | `true` |

### Rate Limiting

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` |

### WebSocket Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `WS_HEARTBEAT_INTERVAL` | WebSocket heartbeat interval (ms) | `30000` |
| `WS_RECONNECT_INTERVAL` | Reconnection interval (ms) | `5000` |
| `WS_MAX_RECONNECT_ATTEMPTS` | Maximum reconnection attempts | `10` |

### MCP Server Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_SERVER_NAME` | MCP server name | `lattice-mcp-server` |
| `MCP_SERVER_VERSION` | MCP server version | `1.0.0` |
| `MCP_MAX_CONCURRENT_REQUESTS` | Max concurrent MCP requests | `50` |

### Database & Caching

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | **Required** |
| `REDIS_DB` | Redis database number | `0` |

### Monitoring & Health

| Variable | Description | Default |
|----------|-------------|---------|
| `PROMETHEUS_ENABLED` | Enable Prometheus metrics | `true` |
| `GRAFANA_ENABLED` | Enable Grafana dashboards | `true` |
| `GRAFANA_PASSWORD` | Grafana admin password | **Required** |
| `HEALTH_CHECK_INTERVAL` | Health check interval (ms) | `60000` |
| `HEALTH_CHECK_TIMEOUT` | Health check timeout (ms) | `5000` |

### SSL/TLS Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `SSL_CERT_PATH` | SSL certificate file path | `/etc/ssl/certs/project-lattice.crt` |
| `SSL_KEY_PATH` | SSL private key file path | `/etc/ssl/private/project-lattice.key` |
| `SSL_CA_PATH` | SSL CA certificate path | `/etc/ssl/certs/ca-bundle.crt` |

### Error Reporting

| Variable | Description | Default |
|----------|-------------|---------|
| `ERROR_REPORTING_ENABLED` | Enable error reporting | `true` |
| `SENTRY_DSN` | Sentry DSN for error reporting | Optional |
| `ERROR_REPORTING_LEVEL` | Error reporting level | `error` |

## Environment-Specific Configurations

### Development Environment
```bash
NODE_ENV=development
LATTICE_ENGINE_URL=http://localhost:8000
LATTICE_ENGINE_WS_URL=ws://localhost:8000/ws
CORS_ORIGIN=*
HELMET_ENABLED=false
LOG_LEVEL=debug
```

### Production Environment
```bash
NODE_ENV=production
LATTICE_ENGINE_URL=https://api.project-lattice.site
LATTICE_ENGINE_WS_URL=wss://api.project-lattice.site/ws
CORS_ORIGIN=https://app.project-lattice.site,https://www.project-lattice.site
HELMET_ENABLED=true
LOG_LEVEL=info
```

### Testing Environment
```bash
NODE_ENV=test
LATTICE_ENGINE_URL=https://api-staging.project-lattice.site
LATTICE_ENGINE_WS_URL=wss://api-staging.project-lattice.site/ws
LOG_LEVEL=debug
ERROR_REPORTING_ENABLED=false
```

## Security Notes

1. **API Keys**: Never commit API keys to version control
2. **JWT Secret**: Use a strong, randomly generated secret (minimum 32 characters)
3. **SSL Certificates**: Ensure proper SSL certificate configuration for production
4. **Redis Security**: Use strong passwords and consider Redis AUTH
5. **CORS**: Restrict CORS origins in production

## Validation

After setting up your environment variables, validate the configuration:

1. **Test Redis connection**:
   ```bash
   redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
   ```

2. **Test Lattice Engine connection**:
   ```bash
   curl -H "Authorization: Bearer $LATTICE_API_KEY" $LATTICE_ENGINE_URL/health
   ```

3. **Verify SSL certificates** (if applicable):
   ```bash
   openssl x509 -in $SSL_CERT_PATH -text -noout
   ```

## Docker Deployment

When using Docker, you can pass environment variables using:

```bash
docker run -d \
  --env-file .env \
  -p 3001:3001 \
  lattice-mcp-server:latest
```

Or use Docker Compose with the environment variables defined in your `.env` file.