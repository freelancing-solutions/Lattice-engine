# Railway Deployment Guide for Lattice Mutation Engine

This guide walks you through deploying the Lattice Mutation Engine API to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **API Keys**: Anthropic and/or OpenAI API keys for LLM functionality

## Step 1: Prepare Your Repository

Ensure these files are in your `lattice_mutation_engine` directory:
- `Dockerfile` ✅
- `railway.json` ✅
- `requirements.txt` ✅
- `.env.railway` (template for environment variables) ✅

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `lattice_mutation_engine` directory as the root

## Step 3: Add Database Services

### PostgreSQL Database
1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. Note the connection variables (automatically available as `${{ POSTGRES.* }}`)

### Redis Database
1. Click "New Service" again
2. Select "Database" → "Redis"
3. Railway will create a Redis instance
4. Connection URL available as `${{ REDIS.REDIS_URL }}`

## Step 4: Configure Environment Variables

In your Railway project dashboard, go to the API service and add these environment variables:

### Required Variables
```bash
# LLM API Keys (REQUIRED)
ANTHROPIC_API_KEY=your-anthropic-api-key-here
OPENAI_API_KEY=your-openai-api-key-here

# JWT Security (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here

# API Keys for authentication (OPTIONAL)
API_KEYS=["your-api-key-1", "your-api-key-2"]
```

### Automatic Variables (Railway provides these)
```bash
# Database connections (automatically set by Railway)
DATABASE_URL=${{ POSTGRES.DATABASE_URL }}
REDIS_URL=${{ REDIS.REDIS_URL }}
PORT=${{ PORT }}
RAILWAY_PUBLIC_DOMAIN=${{ RAILWAY_PUBLIC_DOMAIN }}
```

### Optional Configuration
```bash
# Engine Configuration
PRIMARY_MODEL=claude-sonnet-4-5
FALLBACK_MODEL=gpt-4o
TEMPERATURE=0.7
MAX_CONCURRENT_AGENTS=10
CELERY_ENABLED=true

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.com,https://app.lattice.dev

# Logging
LOG_LEVEL=info
```

## Step 5: Deploy

1. Railway will automatically deploy when you push to your main branch
2. Monitor the deployment in the Railway dashboard
3. Check the logs for any errors

## Step 6: Verify Deployment

Once deployed, test your API:

### Health Check
```bash
curl https://your-app.railway.app/health
```

### API Documentation
Visit: `https://your-app.railway.app/docs`

### Test Mutation Endpoint
```bash
curl -X POST https://your-app.railway.app/api/mutations/propose \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "spec_id": "test-spec",
    "operation_type": "create",
    "changes": {"title": "Test mutation"},
    "reason": "Testing deployment",
    "initiated_by": "deployment-test"
  }'
```

## Step 7: Custom Domain (Optional)

1. In Railway dashboard, go to your service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Environment Variables Reference

### Database Variables (Auto-configured by Railway)
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_HOST` - PostgreSQL host
- `POSTGRES_PORT` - PostgreSQL port
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `REDIS_URL` - Redis connection string

### Application Variables (You must set these)
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `OPENAI_API_KEY` - Your OpenAI API key (fallback)
- `JWT_SECRET` - Secret for JWT token signing
- `SESSION_SECRET` - Secret for session management

### Optional Variables
- `API_KEYS` - JSON array of valid API keys
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `PRIMARY_MODEL` - Default LLM model to use
- `CELERY_ENABLED` - Enable background task processing
- `LOG_LEVEL` - Logging level (debug, info, warning, error)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies in `requirements.txt` are valid
   - Ensure Python version compatibility (3.11+ recommended)

2. **Database Connection Issues**
   - Verify PostgreSQL and Redis services are running
   - Check environment variables are properly set

3. **API Key Errors**
   - Ensure `ANTHROPIC_API_KEY` is set and valid
   - Check API key permissions and quotas

4. **CORS Issues**
   - Set `CORS_ORIGINS` to include your frontend domain
   - Use `*` for development (not recommended for production)

### Viewing Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and view logs
railway login
railway logs
```

### Scaling
Railway automatically handles scaling, but you can configure:
- Memory limits in service settings
- CPU allocation
- Replica count (Pro plan)

## Security Considerations

1. **Environment Variables**: Never commit API keys to your repository
2. **CORS**: Set specific origins in production, avoid using `*`
3. **API Keys**: Use strong, unique API keys for authentication
4. **HTTPS**: Railway provides HTTPS by default
5. **Rate Limiting**: Configure appropriate rate limits for your use case

## Monitoring

Railway provides built-in monitoring:
- CPU and memory usage
- Request metrics
- Error rates
- Response times

For advanced monitoring, consider integrating:
- Sentry for error tracking
- DataDog for comprehensive monitoring
- Custom health check endpoints

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Lattice Support**: Check your project documentation

---

**Next Steps**: After successful deployment, you can integrate this API with your frontend applications, set up CI/CD pipelines, and configure monitoring and alerting.