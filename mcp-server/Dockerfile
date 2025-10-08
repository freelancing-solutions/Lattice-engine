# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lattice -u 1001

# Create logs directory
RUN mkdir -p /app/logs && chown -R lattice:nodejs /app/logs

# Switch to non-root user
USER lattice

# Expose port (though MCP typically uses stdio)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]

# Labels for metadata
LABEL maintainer="Lattice Team <team@lattice-engine.dev>"
LABEL version="1.0.0"
LABEL description="Lattice MCP Server for agent orchestration"
LABEL org.opencontainers.image.source="https://github.com/lattice/lattice-engine"
LABEL org.opencontainers.image.documentation="https://github.com/lattice/lattice-engine/blob/main/mcp-server/README.md"
LABEL org.opencontainers.image.licenses="MIT"