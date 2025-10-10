# Environment Configuration Guide

This guide explains the environment variables used by the Lattice Mutation Engine.

## Quick Start

1. Copy the example file: `cp .env.example .env`
2. Update the values in `.env` for your environment
3. Start the application

## Required Variables

### Core Application
- `APP_ENV`: Application environment (`development`, `staging`, `production`)
- `DEBUG`: Enable debug mode (`true`/`false`)
- `LOG_LEVEL`: Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`)

### API Keys
- `ANTHROPIC_API_KEY`: Required for Claude AI integration
- `OPENAI_API_KEY`: Required for OpenAI fallback
- `API_KEYS`: Comma-separated list of valid API keys for authentication

### Database
- `NEO4J_URI`: Neo4j connection URI
- `NEO4J_USER`: Neo4j username
- `NEO4J_PASSWORD`: Neo4j password

### Redis
- `REDIS_URL`: Redis connection URL for caching and WebSocket
- `CELERY_BROKER_URL`: Redis URL for Celery broker
- `CELERY_RESULT_BACKEND`: Redis URL for Celery results

## Optional Variables

### Vector Database (Qdrant)
- `QDRANT_URL`: Qdrant server URL
- `QDRANT_API_KEY`: Qdrant API key (if required)

### PostgreSQL (for pgvector)
- `POSTGRES_DSN`: PostgreSQL connection string

### Monitoring
- `METRICS_ENABLED`: Enable metrics collection
- `SLACK_WEBHOOK_URL`: Slack notifications

### Development
- `DEVELOPMENT_MODE`: Enable development features
- `TESTING_MODE`: Enable testing mode
- `MOCK_EXTERNAL_SERVICES`: Mock external service calls

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique API keys
- Rotate API keys regularly
- Use environment-specific configurations
- Consider using a secrets management service in production

## Environment-Specific Configurations

### Development
```bash
APP_ENV=development
DEBUG=true
LOG_LEVEL=DEBUG
DEVELOPMENT_MODE=true
```

### Production
```bash
APP_ENV=production
DEBUG=false
LOG_LEVEL=INFO
RATE_LIMIT_ENABLED=true
CIRCUIT_BREAKER_ENABLED=true
```

### Testing
```bash
APP_ENV=testing
TESTING_MODE=true
MOCK_EXTERNAL_SERVICES=true
```

## Validation

The application validates required environment variables at startup. Missing required variables will cause the application to fail with clear error messages.