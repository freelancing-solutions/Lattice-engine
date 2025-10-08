/**
 * Jest Global Teardown
 * This file is executed once after all tests
 */

import { rmdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up test files
  const testFiles = [
    join(__dirname, '..', 'config', 'test.json'),
    join(__dirname, '..', 'logs', 'test.log'),
    join(__dirname, '..', 'tmp')
  ];
  
  for (const file of testFiles) {
    try {
      if (existsSync(file)) {
        const stats = await import('fs').then(fs => fs.promises.stat(file));
        if (stats.isDirectory()) {
          await rmdir(file, { recursive: true });
        } else {
          await unlink(file);
        }
      }
    } catch (error) {
      // File might not exist or already cleaned up
      console.warn(`Failed to clean up ${file}:`, error);
    }
  }
  
  // Reset environment variables
  delete process.env.NODE_ENV;
  delete process.env.MCP_SERVER_PORT;
  delete process.env.LOG_LEVEL;
  delete process.env.LATTICE_ENGINE_BASE_URL;
  delete process.env.LATTICE_ENGINE_WS_URL;
  delete process.env.LATTICE_ENGINE_API_KEY;
  
  console.log('✅ Test environment cleanup complete');
};