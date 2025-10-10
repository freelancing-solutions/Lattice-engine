import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config/index.js';
import { componentLoggers } from '../utils/logger.js';
import type { 
  SpecGraph, 
  SpecNode, 
  SpecEdge, 
  AgentOrchestrationRequest, 
  AgentOrchestrationResponse, 
  ApprovalRequest, 
  ValidationResult, 
  HealthStatus,
  LatticeEngineError 
} from '../types/index.js';
import { latticeEngineConfig, wsConfig } from '../config/index.js';

const logger = componentLoggers.lattice;

export class LatticeEngineClient extends EventEmitter {
  private httpClient: AxiosInstance;
  private wsClient: WebSocket | null = null;
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor() {
    super();
    
    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: latticeEngineConfig.apiUrl,
      timeout: latticeEngineConfig.timeout,
      headers: {
        'Authorization': `Bearer ${latticeEngineConfig.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Lattice-MCP-Server/1.0.0',
      },
    });

    // Add request/response interceptors
    this.setupHttpInterceptors();
    
    // Initialize WebSocket connection
    this.connectWebSocket();
  }

  private setupHttpInterceptors(): void {
    // Request interceptor
    this.httpClient.interceptors.request.use(
      (config) => {
        logger.debug('HTTP request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('HTTP request error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.httpClient.interceptors.response.use(
      (response) => {
        logger.debug('HTTP response', {
          status: response.status,
          url: response.config.url,
          duration: response.headers['x-response-time'],
        });
        return response;
      },
      (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        logger.error('HTTP response error', {
          status,
          message,
          url: error.config?.url,
        });

        // Transform axios errors to LatticeEngineError
        throw new LatticeEngineError(
          message,
          'HTTP_ERROR',
          status || 500,
          error.response?.data
        );
      }
    );
  }

  private connectWebSocket(): void {
    try {
      logger.info('Connecting to Lattice Engine WebSocket', {
        url: latticeEngineConfig.wsUrl,
      });

      this.wsClient = new WebSocket(latticeEngineConfig.wsUrl, {
        headers: {
          'Authorization': `Bearer ${latticeEngineConfig.apiKey}`,
        },
      });

      this.wsClient.on('open', this.handleWebSocketOpen.bind(this));
      this.wsClient.on('message', this.handleWebSocketMessage.bind(this));
      this.wsClient.on('close', this.handleWebSocketClose.bind(this));
      this.wsClient.on('error', this.handleWebSocketError.bind(this));

    } catch (error) {
      logger.error('WebSocket connection failed', { error });
      this.scheduleReconnect();
    }
  }

  private handleWebSocketOpen(): void {
    logger.info('WebSocket connected to Lattice Engine');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.emit('connected');
  }

  private handleWebSocketMessage(data: WebSocket.Data): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      logger.debug('WebSocket message received', { type: message.type, id: message.id });

      // Handle different message types
      switch (message.type) {
        case 'agent_response':
          this.handleAgentResponse(message);
          break;
        case 'approval_update':
          this.emit('approvalUpdate', message.payload);
          break;
        case 'validation_update':
          this.emit('validationUpdate', message.payload);
          break;
        case 'graph_update':
          this.emit('graphUpdate', message.payload);
          break;
        case 'heartbeat':
          this.handleHeartbeat(message);
          break;
        default:
          logger.warn('Unknown WebSocket message type', { type: message.type });
      }
    } catch (error) {
      logger.error('Failed to parse WebSocket message', { error, data: data.toString() });
    }
  }

  private handleWebSocketClose(code: number, reason: Buffer): void {
    logger.warn('WebSocket connection closed', { code, reason: reason.toString() });
    this.isConnected = false;
    this.stopHeartbeat();
    this.emit('disconnected', { code, reason: reason.toString() });
    this.scheduleReconnect();
  }

  private handleWebSocketError(error: Error): void {
    logger.error('WebSocket error', { error: error.message });
    this.emit('error', error);
  }

  private handleAgentResponse(message: WSMessage): void {
    const requestId = message.id;
    const pendingRequest = this.pendingRequests.get(requestId);
    
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      this.pendingRequests.delete(requestId);
      
      if (message.payload.status === 'completed') {
        pendingRequest.resolve(message.payload);
      } else if (message.payload.status === 'failed') {
        pendingRequest.reject(new LatticeEngineError(
          message.payload.error || 'Agent request failed',
          'AGENT_ERROR'
        ));
      }
    }
  }

  private handleHeartbeat(message: WSMessage): void {
    // Respond to heartbeat
    this.sendWebSocketMessage({
      type: 'heartbeat',
      id: message.id,
      payload: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.wsClient?.readyState === WebSocket.OPEN) {
        this.sendWebSocketMessage({
          type: 'heartbeat',
          id: `heartbeat-${Date.now()}`,
          payload: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString(),
        });
      }
    }, wsConfig.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= wsConfig.maxReconnectAttempts) {
      logger.error('Max WebSocket reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    const delay = Math.min(
      wsConfig.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000
    );

    logger.info('Scheduling WebSocket reconnection', {
      attempt: this.reconnectAttempts + 1,
      delay,
    });

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connectWebSocket();
    }, delay);
  }

  private sendWebSocketMessage(message: WSMessage): void {
    if (this.wsClient?.readyState === WebSocket.OPEN) {
      this.wsClient.send(JSON.stringify(message));
    } else {
      logger.warn('Cannot send WebSocket message: connection not open');
    }
  }

  // HTTP API methods
  async getSpecGraph(): Promise<SpecGraph> {
    const response = await this.httpClient.get('/api/graph');
    return response.data;
  }

  async getNode(nodeId: string): Promise<SpecNode> {
    const response = await this.httpClient.get(`/api/graph/nodes/${nodeId}`);
    return response.data;
  }

  async createNode(node: Omit<SpecNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpecNode> {
    const response = await this.httpClient.post('/api/graph/nodes', node);
    return response.data;
  }

  async updateNode(nodeId: string, updates: Partial<SpecNode>): Promise<SpecNode> {
    const response = await this.httpClient.put(`/api/graph/nodes/${nodeId}`, updates);
    return response.data;
  }

  async deleteNode(nodeId: string): Promise<void> {
    await this.httpClient.delete(`/api/graph/nodes/${nodeId}`);
  }

  async getEdge(edgeId: string): Promise<SpecEdge> {
    const response = await this.httpClient.get(`/api/graph/edges/${edgeId}`);
    return response.data;
  }

  async createEdge(edge: Omit<SpecEdge, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpecEdge> {
    const response = await this.httpClient.post('/api/graph/edges', edge);
    return response.data;
  }

  async updateEdge(edgeId: string, updates: Partial<SpecEdge>): Promise<SpecEdge> {
    const response = await this.httpClient.put(`/api/graph/edges/${edgeId}`, updates);
    return response.data;
  }

  async deleteEdge(edgeId: string): Promise<void> {
    await this.httpClient.delete(`/api/graph/edges/${edgeId}`);
  }

  // Agent orchestration methods
  async requestAgentOrchestration(request: AgentOrchestrationRequest): Promise<AgentOrchestrationResponse> {
    if (this.wsClient?.readyState === WebSocket.OPEN) {
      // Use WebSocket for real-time communication
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pendingRequests.delete(request.id);
          reject(new LatticeEngineError('Agent request timeout', 'TIMEOUT'));
        }, 60000); // 60 second timeout

        this.pendingRequests.set(request.id, { resolve, reject, timeout });

        this.sendWebSocketMessage({
          type: 'agent_request',
          id: request.id,
          payload: request,
          timestamp: new Date().toISOString(),
        });
      });
    } else {
      // Fallback to HTTP
      const response = await this.httpClient.post('/api/agents/orchestrate', request);
      return response.data;
    }
  }

  // Approval workflow methods
  async getApprovalRequests(): Promise<ApprovalRequest[]> {
    const response = await this.httpClient.get('/api/approval/requests');
    return response.data;
  }

  async getApprovalRequest(requestId: string): Promise<ApprovalRequest> {
    const response = await this.httpClient.get(`/api/approval/requests/${requestId}`);
    return response.data;
  }

  async approveRequest(requestId: string, comment?: string): Promise<ApprovalRequest> {
    const response = await this.httpClient.post(`/api/approval/requests/${requestId}/approve`, {
      comment,
    });
    return response.data;
  }

  async rejectRequest(requestId: string, reason: string): Promise<ApprovalRequest> {
    const response = await this.httpClient.post(`/api/approval/requests/${requestId}/reject`, {
      reason,
    });
    return response.data;
  }

  // Validation methods
  async validateGraph(): Promise<ValidationResult[]> {
    const response = await this.httpClient.post('/api/validation/graph');
    return response.data;
  }

  async validateNode(nodeId: string): Promise<ValidationResult[]> {
    const response = await this.httpClient.post(`/api/validation/nodes/${nodeId}`);
    return response.data;
  }

  async validateEdge(edgeId: string): Promise<ValidationResult[]> {
    const response = await this.httpClient.post(`/api/validation/edges/${edgeId}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.httpClient.get('/health');
    return response.data;
  }

  // Connection management
  isWebSocketConnected(): boolean {
    return this.isConnected && this.wsClient?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    logger.info('Disconnecting from Lattice Engine');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }

    // Reject all pending requests
    for (const [id, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new LatticeEngineError('Connection closed', 'CONNECTION_CLOSED'));
    }
    this.pendingRequests.clear();

    this.isConnected = false;
    this.emit('disconnected', { code: 1000, reason: 'Manual disconnect' });
  }

  reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connectWebSocket(), 1000);
  }
}