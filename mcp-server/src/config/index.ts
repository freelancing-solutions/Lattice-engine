import dotenv from 'dotenv';
import { z } from 'zod';
import { ServerConfig, LatticeEngineConfig } from '../types/index.js';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Lattice Engine Configuration
  LATTICE_ENGINE_URL: z.string().url().default('http://localhost:8000'),
  LATTICE_ENGINE_WS_URL: z.string().url().default('ws://localhost:8000/ws'),
  LATTICE_API_KEY: z.string().min(1),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  
  // WebSocket Configuration
  WS_HEARTBEAT_INTERVAL: z.string().default('30000').transform(Number),
  WS_RECONNECT_INTERVAL: z.string().default('5000').transform(Number),
  WS_MAX_RECONNECT_ATTEMPTS: z.string().default('10').transform(Number),
  
  // MCP Configuration
  MCP_SERVER_NAME: z.string().default('lattice-mutation-engine'),
  MCP_SERVER_VERSION: z.string().default('1.0.0'),
  MCP_MAX_CONCURRENT_REQUESTS: z.string().default('50').transform(Number),
  
  // Security
  CORS_ORIGIN: z.string().default('*'),
  HELMET_ENABLED: z.string().default('true').transform(val => val === 'true'),
  TRUST_PROXY: z.string().default('false').transform(val => val === 'true'),
  
  // Logging
  LOG_FILE_PATH: z.string().default('./logs/mcp-server.log'),
  LOG_MAX_SIZE: z.string().default('10m'),
  LOG_MAX_FILES: z.string().default('5').transform(Number),
  
  // Health Check
  HEALTH_CHECK_INTERVAL: z.string().default('60000').transform(Number),
  HEALTH_CHECK_TIMEOUT: z.string().default('5000').transform(Number),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Server configuration
export const serverConfig: ServerConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
  corsOrigin: env.CORS_ORIGIN,
  helmetEnabled: env.HELMET_ENABLED,
  trustProxy: env.TRUST_PROXY,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  bcryptRounds: env.BCRYPT_ROUNDS,
};

// Lattice Engine configuration
export const latticeEngineConfig: LatticeEngineConfig = {
  apiUrl: env.LATTICE_ENGINE_URL,
  wsUrl: env.LATTICE_ENGINE_WS_URL,
  apiKey: env.LATTICE_API_KEY,
  timeout: 30000,
  retryAttempts: 3,
};

// WebSocket configuration
export const wsConfig = {
  heartbeatInterval: env.WS_HEARTBEAT_INTERVAL,
  reconnectInterval: env.WS_RECONNECT_INTERVAL,
  maxReconnectAttempts: env.WS_MAX_RECONNECT_ATTEMPTS,
};

// MCP configuration
export const mcpConfig = {
  serverName: env.MCP_SERVER_NAME,
  serverVersion: env.MCP_SERVER_VERSION,
  maxConcurrentRequests: env.MCP_MAX_CONCURRENT_REQUESTS,
};

// Logging configuration
export const loggingConfig = {
  level: env.LOG_LEVEL,
  filePath: env.LOG_FILE_PATH,
  maxSize: env.LOG_MAX_SIZE,
  maxFiles: env.LOG_MAX_FILES,
};

// Health check configuration
export const healthConfig = {
  interval: env.HEALTH_CHECK_INTERVAL,
  timeout: env.HEALTH_CHECK_TIMEOUT,
};

// Validation function for runtime config changes
export function validateConfig(config: Partial<ServerConfig>): boolean {
  try {
    // Validate critical configuration values
    if (config.port && (config.port < 1 || config.port > 65535)) {
      throw new Error('Port must be between 1 and 65535');
    }
    
    if (config.rateLimitMaxRequests && config.rateLimitMaxRequests < 1) {
      throw new Error('Rate limit max requests must be positive');
    }
    
    if (config.rateLimitWindowMs && config.rateLimitWindowMs < 1000) {
      throw new Error('Rate limit window must be at least 1000ms');
    }
    
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
}

// Get configuration summary for health checks
export function getConfigSummary() {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    mcpServerName: env.MCP_SERVER_NAME,
    mcpServerVersion: env.MCP_SERVER_VERSION,
    latticeEngineUrl: env.LATTICE_ENGINE_URL,
    corsOrigin: env.CORS_ORIGIN,
    helmetEnabled: env.HELMET_ENABLED,
    rateLimitEnabled: true,
    rateLimitWindow: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  };
}