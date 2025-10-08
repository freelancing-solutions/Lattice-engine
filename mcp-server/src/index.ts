#!/usr/bin/env node

import { LatticeEngineServer } from './services/mcp-server.js';
import { componentLoggers } from './utils/logger.js';
import { serverConfig } from './config/index.js';

const logger = componentLoggers.server;

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

// Graceful shutdown handler
let server: LatticeEngineServer | null = null;

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  if (server) {
    try {
      await server.stop();
      logger.info('Server stopped successfully');
    } catch (error) {
      logger.error('Error during server shutdown', { error });
    }
  }
  
  process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Main function
async function main() {
  try {
    logger.info('Starting Lattice MCP Server', {
      nodeEnv: serverConfig.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    });

    // Create and start the MCP server
    server = new LatticeEngineServer();
    await server.start();

    logger.info('Lattice MCP Server is running and ready to accept connections');

    // Keep the process alive
    process.stdin.resume();

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  logger.error('Fatal error during startup', { error });
  process.exit(1);
});