import { z } from 'zod';

// Base types for Lattice Engine integration
export interface LatticeEngineConfig {
  apiUrl: string;
  wsUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export interface AgentOrchestrationRequest {
  id: string;
  type: 'mutation' | 'validation' | 'conflict_resolution' | 'impact_analysis' | 'semantic_analysis';
  payload: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requester: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface AgentOrchestrationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: Record<string, unknown>;
  error?: string;
  metadata: {
    processingTime: number;
    agentUsed: string;
    timestamp: string;
  };
}

// Spec Graph types
export interface SpecNode {
  id: string;
  type: 'SPEC' | 'MODULE' | 'FUNCTION' | 'CLASS' | 'INTERFACE' | 'ENUM' | 'TYPE';
  name: string;
  description?: string;
  properties: Record<string, unknown>;
  metadata: Record<string, unknown>;
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT' | 'ARCHIVED';
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'DEPENDS_ON' | 'IMPLEMENTS' | 'EXTENDS' | 'USES' | 'CONTAINS' | 'REFERENCES';
  properties: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SpecGraph {
  nodes: SpecNode[];
  edges: SpecEdge[];
  metadata: {
    version: string;
    lastUpdated: string;
    nodeCount: number;
    edgeCount: number;
  };
}

// Validation types
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'schema' | 'dependency' | 'semantic' | 'business' | 'naming' | 'structure' | 'consistency';
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  configuration: Record<string, unknown>;
}

export interface ValidationResult {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  edgeId?: string;
  path?: string;
  suggestions?: string[];
  metadata: Record<string, unknown>;
}

// Approval workflow types
export interface ApprovalRequest {
  id: string;
  type: 'node_creation' | 'node_update' | 'node_deletion' | 'edge_creation' | 'edge_update' | 'edge_deletion' | 'bulk_operation';
  title: string;
  description: string;
  requester: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  changes: {
    before?: SpecNode | SpecEdge;
    after?: SpecNode | SpecEdge;
    operation: 'create' | 'update' | 'delete';
  }[];
  metadata: {
    impactAnalysis?: Record<string, unknown>;
    validationResults?: ValidationResult[];
    estimatedRisk: 'low' | 'medium' | 'high';
    affectedNodes: string[];
    affectedEdges: string[];
  };
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

// MCP Tool definitions
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

// WebSocket message types
export interface WSMessage {
  type: 'agent_request' | 'agent_response' | 'approval_update' | 'validation_update' | 'graph_update' | 'heartbeat';
  id: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// Error types
export class LatticeEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LatticeEngineError';
  }
}

export class ValidationError extends LatticeEngineError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends LatticeEngineError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends LatticeEngineError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHZ_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends LatticeEngineError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends LatticeEngineError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

// Configuration types
export interface ServerConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  corsOrigin: string;
  helmetEnabled: boolean;
  trustProxy: boolean;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    latticeEngine: 'connected' | 'disconnected' | 'error';
    database: 'connected' | 'disconnected' | 'error';
    websocket: 'connected' | 'disconnected' | 'error';
  };
  metrics: {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}