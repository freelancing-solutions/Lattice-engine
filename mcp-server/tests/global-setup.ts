/**
 * Jest Global Setup
 * This file is executed once before all tests
 */

import { config } from 'dotenv';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

export default async function globalSetup() {
  console.log('🚀 Setting up test environment...');
  
  // Load test environment variables
  config({ path: join(__dirname, '..', '.env.test') });
  
  // Ensure test directories exist
  const testDirs = [
    join(__dirname, '..', 'logs'),
    join(__dirname, '..', 'test-results'),
    join(__dirname, '..', 'coverage'),
    join(__dirname, '..', 'tmp')
  ];
  
  for (const dir of testDirs) {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
  
  // Create test configuration file
  const testConfig = {
    server: {
      port: 0, // Use random port for tests
      host: 'localhost'
    },
    latticeEngine: {
      baseUrl: 'http://localhost:8000',
      wsUrl: 'ws://localhost:8001',
      apiKey: 'test-api-key'
    },
    logging: {
      level: 'error',
      filePath: join(__dirname, '..', 'logs', 'test.log')
    },
    mcp: {
      name: 'lattice-test-server',
      version: '1.0.0'
    }
  };
  
  await writeFile(
    join(__dirname, '..', 'config', 'test.json'),
    JSON.stringify(testConfig, null, 2)
  );
  
  // Set global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MCP_SERVER_PORT = '0';
  process.env.LOG_LEVEL = 'error';
  process.env.LATTICE_ENGINE_BASE_URL = 'http://localhost:8000';
  process.env.LATTICE_ENGINE_WS_URL = 'ws://localhost:8001';
  process.env.LATTICE_ENGINE_API_KEY = 'test-api-key';
  
  console.log('✅ Test environment setup complete');
};