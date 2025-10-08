/**
 * Jest Test Setup
 * This file is executed before each test file
 */

import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock console methods to reduce noise
const originalConsole = { ...console };

beforeAll(() => {
  // Mock console methods but keep error for debugging
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.debug = jest.fn();
});

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole);
});

// Global test timeout
jest.setTimeout(30000);

// Mock WebSocket for tests
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

// Mock fetch for HTTP requests
global.fetch = jest.fn();

// Setup global test utilities
global.testUtils = {
  // Helper to create mock MCP request
  createMockMCPRequest: (method: string, params?: any) => ({
    jsonrpc: '2.0',
    id: Math.random().toString(36).substr(2, 9),
    method,
    params: params || {}
  }),
  
  // Helper to create mock MCP response
  createMockMCPResponse: (id: string, result?: any, error?: any) => ({
    jsonrpc: '2.0',
    id,
    ...(result !== undefined ? { result } : {}),
    ...(error !== undefined ? { error } : {})
  }),
  
  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create mock spec graph node
  createMockNode: (overrides?: any) => ({
    id: 'test-node-' + Math.random().toString(36).substr(2, 9),
    type: 'SPEC',
    name: 'Test Node',
    description: 'Test node description',
    metadata: {},
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),
  
  // Helper to create mock edge
  createMockEdge: (sourceId: string, targetId: string, overrides?: any) => ({
    id: 'test-edge-' + Math.random().toString(36).substr(2, 9),
    source_id: sourceId,
    target_id: targetId,
    type: 'DEPENDS_ON',
    metadata: {},
    created_at: new Date().toISOString(),
    ...overrides
  }),
  
  // Helper to create mock validation result
  createMockValidationResult: (overrides?: any) => ({
    rule_id: 'test-rule',
    severity: 'ERROR',
    message: 'Test validation error',
    node_id: 'test-node',
    metadata: {},
    ...overrides
  })
};

// Extend Jest matchers
expect.extend({
  toBeValidMCPRequest(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      received.jsonrpc === '2.0' &&
      typeof received.method === 'string' &&
      (typeof received.id === 'string' || typeof received.id === 'number')
    );
    
    if (pass) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid MCP request`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${JSON.stringify(received)} to be a valid MCP request`,
        pass: false
      };
    }
  },
  
  toBeValidMCPResponse(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      received.jsonrpc === '2.0' &&
      (typeof received.id === 'string' || typeof received.id === 'number') &&
      (received.result !== undefined || received.error !== undefined)
    );
    
    if (pass) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid MCP response`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${JSON.stringify(received)} to be a valid MCP response`,
        pass: false
      };
    }
  }
});

// Declare global types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMCPRequest(): R;
      toBeValidMCPResponse(): R;
    }
  }
  
  var testUtils: {
    createMockMCPRequest: (method: string, params?: any) => any;
    createMockMCPResponse: (id: string, result?: any, error?: any) => any;
    waitFor: (ms: number) => Promise<void>;
    createMockNode: (overrides?: any) => any;
    createMockEdge: (sourceId: string, targetId: string, overrides?: any) => any;
    createMockValidationResult: (overrides?: any) => any;
  };
  
  var WebSocket: jest.MockedClass<typeof WebSocket>;
  var fetch: jest.MockedFunction<typeof fetch>;
}

export {};