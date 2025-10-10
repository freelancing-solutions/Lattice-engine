import winston from 'winston';
import { loggingConfig } from '../config/index.js';
import type { HealthStatus } from '../types/index.js';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: process.env['NODE_ENV'] === 'production' ? logFormat : consoleFormat,
    level: loggingConfig.level,
  }),
];

// File transport for production
if (process.env['NODE_ENV'] === 'production') {
  transports.push(
    new winston.transports.File({
      filename: loggingConfig.filePath,
      format: logFormat,
      level: loggingConfig.level,
      maxsize: parseInt(loggingConfig.maxSize.replace('m', '')) * 1024 * 1024,
      maxFiles: loggingConfig.maxFiles,
      tailable: true,
    })
  );
  
  // Separate error log file
  transports.push(
    new winston.transports.File({
      filename: loggingConfig.filePath.replace('.log', '.error.log'),
      format: logFormat,
      level: 'error',
      maxsize: parseInt(loggingConfig.maxSize.replace('m', '')) * 1024 * 1024,
      maxFiles: loggingConfig.maxFiles,
      tailable: true,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: loggingConfig.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Request logging middleware
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const { method, url, ip, headers } = req;
    
    // Log request
    logger.info('HTTP Request', {
      method,
      url,
      ip,
      userAgent: headers['user-agent'],
      contentType: headers['content-type'],
      contentLength: headers['content-length'],
    });
    
    // Log response
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      
      const logLevel = statusCode >= 400 ? 'warn' : 'info';
      logger.log(logLevel, 'HTTP Response', {
        method,
        url,
        statusCode,
        duration,
        contentLength: res.get('content-length'),
      });
    });
    
    next();
  };
}

// Error logging helper
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error('Error occurred', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

// Performance logging helper
export function logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>) {
  logger.info('Performance metric', {
    operation,
    duration,
    ...metadata,
  });
}

// Agent orchestration logging
export function logAgentRequest(requestId: string, type: string, requester: string) {
  logger.info('Agent orchestration request', {
    requestId,
    type,
    requester,
    timestamp: new Date().toISOString(),
  });
}

export function logAgentResponse(requestId: string, status: string, duration: number, agent?: string) {
  logger.info('Agent orchestration response', {
    requestId,
    status,
    duration,
    agent,
    timestamp: new Date().toISOString(),
  });
}

// WebSocket logging
export function logWebSocketEvent(event: string, clientId?: string, metadata?: Record<string, unknown>) {
  logger.info('WebSocket event', {
    event,
    clientId,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

// MCP protocol logging
export function logMCPRequest(method: string, params?: Record<string, unknown>) {
  logger.debug('MCP request', {
    method,
    params,
    timestamp: new Date().toISOString(),
  });
}

export function logMCPResponse(method: string, success: boolean, duration: number, error?: string) {
  const logLevel = success ? 'debug' : 'warn';
  logger.log(logLevel, 'MCP response', {
    method,
    success,
    duration,
    error,
    timestamp: new Date().toISOString(),
  });
}

// Security logging
export function logSecurityEvent(event: string, ip: string, details?: Record<string, unknown>) {
  logger.warn('Security event', {
    event,
    ip,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

// Health check logging
export function logHealthCheck(status: string, services: Record<string, string>, metrics?: Record<string, unknown>) {
  logger.info('Health check', {
    status,
    services,
    metrics,
    timestamp: new Date().toISOString(),
  });
}

// Structured logging for different components
export const componentLoggers = {
  server: logger.child({ component: 'server' }),
  mcp: logger.child({ component: 'mcp' }),
  lattice: logger.child({ component: 'lattice-engine' }),
  websocket: logger.child({ component: 'websocket' }),
  auth: logger.child({ component: 'auth' }),
  validation: logger.child({ component: 'validation' }),
  orchestration: logger.child({ component: 'orchestration' }),
  health: logger.child({ component: 'health' }),
};

// Export default logger
export default logger;