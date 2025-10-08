import { EventEmitter } from 'events';
import { LatticeEngineClient } from './lattice-client.js';
import { componentLoggers } from '../utils/logger.js';
import { healthConfig } from '../config/index.js';
import { HealthStatus } from '../types/index.js';

const logger = componentLoggers.health;

export class HealthMonitor extends EventEmitter {
  private latticeClient: LatticeEngineClient;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    startTime: Date.now(),
  };

  constructor(latticeClient: LatticeEngineClient) {
    super();
    this.latticeClient = latticeClient;
    this.setupLatticeClientEvents();
  }

  private setupLatticeClientEvents(): void {
    this.latticeClient.on('connected', () => {
      this.emit('serviceStatusChanged', 'latticeEngine', 'connected');
    });

    this.latticeClient.on('disconnected', () => {
      this.emit('serviceStatusChanged', 'latticeEngine', 'disconnected');
    });

    this.latticeClient.on('error', () => {
      this.emit('serviceStatusChanged', 'latticeEngine', 'error');
      this.incrementErrorCount();
    });
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    logger.info('Starting health monitor', {
      interval: healthConfig.interval,
      timeout: healthConfig.timeout,
    });

    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      healthConfig.interval
    );

    this.isRunning = true;
    this.emit('started');
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping health monitor');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.isRunning = false;
    this.emit('stopped');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const status = await this.getHealthStatus();
      
      logger.debug('Health check completed', {
        status: status.status,
        services: status.services,
      });

      this.emit('healthCheck', status);

      // Emit alerts for unhealthy services
      if (status.status === 'unhealthy') {
        this.emit('healthAlert', {
          level: 'critical',
          message: 'System is unhealthy',
          details: status,
        });
      } else if (status.status === 'degraded') {
        this.emit('healthAlert', {
          level: 'warning',
          message: 'System is degraded',
          details: status,
        });
      }

    } catch (error) {
      logger.error('Health check failed', { error });
      this.emit('healthCheckError', error);
    }
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const now = Date.now();
    const uptime = now - this.metrics.startTime;

    // Check service statuses
    const services = {
      latticeEngine: await this.checkLatticeEngineHealth(),
      database: await this.checkDatabaseHealth(),
      websocket: this.checkWebSocketHealth(),
    };

    // Calculate overall status
    const status = this.calculateOverallStatus(services);

    // Get system metrics
    const metrics = {
      requestCount: this.metrics.requestCount,
      errorCount: this.metrics.errorCount,
      averageResponseTime: this.metrics.requestCount > 0 
        ? this.metrics.totalResponseTime / this.metrics.requestCount 
        : 0,
      memoryUsage: process.memoryUsage(),
    };

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      services,
      metrics,
    };
  }

  private async checkLatticeEngineHealth(): Promise<'connected' | 'disconnected' | 'error'> {
    try {
      const healthCheck = await Promise.race([
        this.latticeClient.healthCheck(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), healthConfig.timeout)
        ),
      ]);

      return 'connected';
    } catch (error) {
      logger.warn('Lattice Engine health check failed', { error });
      return this.latticeClient.isWebSocketConnected() ? 'error' : 'disconnected';
    }
  }

  private async checkDatabaseHealth(): Promise<'connected' | 'disconnected' | 'error'> {
    // For now, we assume database health is tied to Lattice Engine health
    // In a real implementation, you might check Neo4j, Qdrant, etc. directly
    try {
      await this.latticeClient.getSpecGraph();
      return 'connected';
    } catch (error) {
      logger.warn('Database health check failed', { error });
      return 'error';
    }
  }

  private checkWebSocketHealth(): 'connected' | 'disconnected' | 'error' {
    return this.latticeClient.isWebSocketConnected() ? 'connected' : 'disconnected';
  }

  private calculateOverallStatus(services: Record<string, string>): 'healthy' | 'unhealthy' | 'degraded' {
    const serviceStatuses = Object.values(services);
    
    if (serviceStatuses.every(status => status === 'connected')) {
      return 'healthy';
    }
    
    if (serviceStatuses.some(status => status === 'error')) {
      return 'unhealthy';
    }
    
    if (serviceStatuses.some(status => status === 'disconnected')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  // Metrics tracking methods
  incrementRequestCount(): void {
    this.metrics.requestCount++;
  }

  incrementErrorCount(): void {
    this.metrics.errorCount++;
  }

  recordResponseTime(duration: number): void {
    this.metrics.totalResponseTime += duration;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      averageResponseTime: this.metrics.requestCount > 0 
        ? this.metrics.totalResponseTime / this.metrics.requestCount 
        : 0,
      errorRate: this.metrics.requestCount > 0 
        ? this.metrics.errorCount / this.metrics.requestCount 
        : 0,
      memoryUsage: process.memoryUsage(),
    };
  }

  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
      startTime: Date.now(),
    };
    
    logger.info('Health metrics reset');
  }

  // Health status helpers
  isHealthy(): boolean {
    return this.latticeClient.isWebSocketConnected();
  }

  getServiceStatus(service: string): string {
    switch (service) {
      case 'latticeEngine':
        return this.latticeClient.isWebSocketConnected() ? 'connected' : 'disconnected';
      case 'websocket':
        return this.latticeClient.isWebSocketConnected() ? 'connected' : 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Event handlers for external monitoring
  onHealthAlert(callback: (alert: { level: string; message: string; details: any }) => void): void {
    this.on('healthAlert', callback);
  }

  onHealthCheck(callback: (status: HealthStatus) => void): void {
    this.on('healthCheck', callback);
  }

  onServiceStatusChanged(callback: (service: string, status: string) => void): void {
    this.on('serviceStatusChanged', callback);
  }

  // Diagnostic methods
  async runDiagnostics(): Promise<Record<string, any>> {
    const diagnostics: Record<string, any> = {};

    // System information
    diagnostics.system = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };

    // Service connectivity
    diagnostics.connectivity = {
      latticeEngine: await this.checkLatticeEngineHealth(),
      websocket: this.checkWebSocketHealth(),
    };

    // Performance metrics
    diagnostics.performance = this.getMetrics();

    // Configuration summary
    diagnostics.configuration = {
      healthCheckInterval: healthConfig.interval,
      healthCheckTimeout: healthConfig.timeout,
    };

    return diagnostics;
  }
}