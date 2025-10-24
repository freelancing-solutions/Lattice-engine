// Core entity interfaces matching API responses
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive';
  organizations: string[];
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organization_id: string;
  status: 'active' | 'archived';
  visibility: 'private' | 'internal' | 'public';
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectSettings {
  autoApproveSafeMutations: boolean;
  requireApprovalForDeletions: boolean;
  maxConcurrentMutations: number;
  syncIntervalMinutes: number;
  ignorePatterns: string[];
  includePatterns: string[];
  validateOnSync: boolean;
  validationRules: string[];
  notifyOnMutationComplete: boolean;
  notifyOnSyncErrors: boolean;
  notificationChannels: string[];
}

export interface ProjectMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  email: string;
  fullName: string;
  invitedBy: string | null;
  invitedAt: string;
  joinedAt: string | null;
}

export interface InviteProjectMemberRequest {
  email: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface ProjectStats {
  mutations: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    deployed: number;
    failed: number;
  };
  specs: {
    total: number;
    valid: number;
    invalid: number;
  };
  team: {
    totalMembers: number;
    activeMembers: number;
  };
  performance: {
    avgReviewTime: number;
    avgDeployTime: number;
    successRate: number;
  };
  period: string;
}

export interface Mutation {
  id: string;
  project_id: string;
  operation_type: 'create' | 'update' | 'delete';
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  changes: Record<string, any>;
  metadata: Record<string, any>;
  created_by: string;
  approved_by?: string;
  executed_at?: string;
  created_at: string;
  updated_at: string;
}

// Standardized API response format
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Authentication interfaces
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organization_name?: string;
}

// Form interfaces
export interface CreateProjectRequest {
  name: string;
  description?: string;
  visibility?: 'private' | 'internal' | 'public';
}

export interface CreateMutationRequest {
  project_id: string;
  operation_type: 'create' | 'update' | 'delete';
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  changes: Record<string, any>;
  metadata?: Record<string, any>;
}

// Filter and search interfaces
export interface MutationFilters {
  status?: string[];
  risk_level?: string[];
  project_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ProjectFilters {
  status?: string[];
  visibility?: string[];
  search?: string;
}

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface MutationStatusEvent {
  type: 'mutation_status_update';
  mutation_id: string;
  status: string;
  updated_by: string;
}

export interface NotificationEvent {
  type: 'notification_new';
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
}

// Approval interfaces
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum ApprovalChannel {
  VSCODE = 'vscode',
  WEB = 'web',
  CLI = 'cli',
  EMAIL = 'email',
  SLACK = 'slack'
}

export interface ImpactAnalysis {
  risk: 'low' | 'medium' | 'high' | 'critical';
  affectedSpecs: string[];
  breakingChanges: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTime: string;
}

export interface ApprovalContent {
  original: string;
  proposed: string;
  diff: {
    additions: string[];
    deletions: string[];
    modifications: string[];
  };
}

export interface ApprovalRequest {
  id: string;
  proposalId: string;
  userId: string;
  specId: string;
  mutationType: string;
  content: ApprovalContent;
  reasoning: string;
  confidence: number;
  impactAnalysis: ImpactAnalysis;
  priority: 'critical' | 'high' | 'normal' | 'low';
  timeout: number;
  status: ApprovalStatus;
  assignedTo?: string;
  responses: ApprovalResponse[];
  createdAt: string;
  expiresAt: string;
  channels: ApprovalChannel[];
}

export interface ApprovalResponse {
  id: string;
  userId: string;
  decision: 'approve' | 'reject' | 'request_changes';
  modifiedContent?: string;
  notes?: string;
  channel: ApprovalChannel;
  timestamp: string;
}

export interface ApprovalFilters {
  status?: ApprovalStatus;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  mutationType?: string;
}

export interface ApprovalEvent {
  type: 'approval_request' | 'approval_updated' | 'approval_response';
  data: ApprovalRequest;
  timestamp: string;
}

// Spec-related interfaces
export enum NodeType {
  SPEC = 'SPEC',
  MODULE = 'MODULE',
  CONTROLLER = 'CONTROLLER',
  MODEL = 'MODEL',
  ROUTE_API = 'ROUTE_API',
  TASK = 'TASK',
  TEST = 'TEST',
  AGENT = 'AGENT',
  GOAL = 'GOAL',
  CONSTRAINT = 'CONSTRAINT',
  DOCUMENTATION = 'DOCUMENTATION'
}

export enum SpecStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  DEPRECATED = 'DEPRECATED',
  PENDING = 'PENDING'
}

export interface Spec {
  id: string;
  name: string;
  type: NodeType;
  description: string | null;
  content: string | null;
  specSource: string | null;
  metadata: Record<string, string>;
  status: SpecStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SpecFilters {
  status?: SpecStatus;
  type?: NodeType;
  search?: string;
  projectId?: string;
}

export interface CreateSpecRequest {
  name: string;
  description?: string;
  content?: string;
  specSource?: string;
  metadata?: Record<string, string>;
}

export interface UpdateSpecRequest {
  specId: string;
  content?: string;
  diffSummary?: string;
}

export interface GenerateSpecRequest {
  templateId?: string;
  templateType: string;
  parameters: Record<string, any>;
  name?: string;
  description?: string;
}

export interface ValidateSpecRequest {
  content: string | Record<string, any>;
  format: 'json' | 'yaml' | 'markdown';
  requiredFields?: string[];
  schema?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SpecEvent {
  type: 'spec_created' | 'spec_updated' | 'spec_deleted' | 'spec_approved';
  data: Spec;
  timestamp: string;
}

// Task-related interfaces
export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  CLARIFICATION_REQUESTED = 'CLARIFICATION_REQUESTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Task {
  taskId: string;
  requesterId: string;
  operation: string;
  inputData: Record<string, any>;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  assignedAgentId: string | null;
  targetAgentType: string | null;
  result: Record<string, any> | null;
  error: string | null;
  clarificationNotes: Array<{
    note: string;
    fromUserId: string | null;
    timestamp: string;
  }>;
}

export interface TaskRequestPayload {
  requesterId: string;
  operation: string;
  inputData: Record<string, any>;
  targetAgentType?: string;
  priority?: number;
}

export interface TaskClarificationPayload {
  taskId: string;
  note: string;
  fromUserId?: string;
}

export interface TaskCompletionPayload {
  taskId: string;
  success: boolean;
  result?: Record<string, any>;
  notes?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  operation?: string;
  requesterId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TaskEvent {
  type: 'task_requested' | 'task_clarify' | 'task_completed';
  data: Task;
  timestamp: string;
}

// Graph-related interfaces
export enum GraphQueryType {
  CYPHER = 'CYPHER',
  TRAVERSAL = 'TRAVERSAL',
  NEIGHBORS = 'NEIGHBORS'
}

export enum GraphLayout {
  DAGRE = 'DAGRE',
  FORCE = 'FORCE',
  HIERARCHICAL = 'HIERARCHICAL',
  CIRCULAR = 'CIRCULAR'
}

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  description: string | null;
  content: string | null;
  specSource: string | null;
  metadata: Record<string, string>;
  status: SpecStatus;
  createdAt: string;
  updatedAt: string;
  // Reactflow specific fields
  position: { x: number; y: number };
  selected: boolean;
  data: any;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string; // RelationshipType as string
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface GraphQuery {
  queryType: GraphQueryType;
  query?: string;
  parameters?: Record<string, any>;
  startNode?: string;
  nodeId?: string;
  relationshipTypes?: string[];
  maxDepth?: number;
}

export interface SemanticSearchRequest {
  query: string;
  limit?: number;
  similarityThreshold?: number;
  filters?: GraphFilters;
}

export interface GraphFilters {
  nodeTypes?: NodeType[];
  edgeTypes?: string[]; // RelationshipType as string
  status?: SpecStatus[];
  search?: string;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  queryTimeMs: number;
  totalResults: number;
}

export interface SemanticSearchResult {
  nodes: GraphNode[];
  query: string;
  similarityThreshold: number;
  searchTimeMs: number;
}

export interface GraphStats {
  available: boolean;
  backend: string;
  totalDocuments: number | null;
  indexSizeMb: number | null;
  lastUpdated: string | null;
}

// Deployment-related interfaces
export enum DeploymentStrategy {
  BLUE_GREEN = 'BLUE_GREEN',
  ROLLING = 'ROLLING',
  CANARY = 'CANARY',
  RECREATE = 'RECREATE',
  ROLLBACK = 'ROLLBACK'
}

export enum DeploymentEnvironment {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TESTING = 'TESTING'
}

export enum DeploymentStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
  CANCELLED = 'CANCELLED'
}

export interface Deployment {
  deploymentId: string;
  mutationId: string;
  specId: string;
  environment: DeploymentEnvironment;
  strategy: DeploymentStrategy;
  status: DeploymentStatus;
  createdAt: string;
  createdBy: string;
  config: Record<string, any> | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  rollbackFor: string | null;
  rollbackReason: string | null;
  rollbackId: string | null;
}

export interface DeploymentFilters {
  environment?: DeploymentEnvironment;
  status?: DeploymentStatus;
  mutationId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CreateDeploymentRequest {
  mutationId: string;
  specId: string;
  environment: DeploymentEnvironment;
  strategy: DeploymentStrategy;
  config?: Record<string, any>;
}

export interface DeploymentStatusInfo {
  deploymentId: string;
  status: DeploymentStatus;
  progressPercentage: number;
  currentStep: string;
  estimatedRemainingSeconds: number | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
}

export interface RollbackDeploymentRequest {
  reason: string;
  targetVersion?: string;
}

export interface DeploymentEvent {
  type: 'deployment_created' | 'deployment_updated' | 'deployment_completed' | 'deployment_failed';
  data: Deployment;
  timestamp: string;
}

// MCP (Model Context Protocol) Types
export enum MCPStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  SYNCING = 'syncing'
}

export enum MCPSyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  port: number;
  status: MCPStatus;
  config: MCPServerConfig;
  lastHealthCheck?: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MCPServerConfig {
  timeout?: number;
  retryInterval?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'custom';
    token?: string;
    username?: string;
    password?: string;
    customHeader?: string;
    customValue?: string;
  };
}

export interface MCPStatusResponse {
  serverId: string;
  status: MCPStatus;
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

export interface MCPSyncRequest {
  serverId: string;
  syncType: 'full' | 'incremental';
  options?: Record<string, any>;
}

export interface MCPSyncResponse {
  syncId: string;
  serverId: string;
  status: MCPSyncStatus;
  startTime: string;
  endTime?: string;
  itemsProcessed?: number;
  errors?: string[];
}

export interface MCPHealthCheck {
  serverId: string;
  status: 'healthy' | 'unhealthy';
  lastCheck: string;
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface MCPFilters {
  status?: MCPStatus;
  search?: string;
}

export interface MCPEvent {
  type: 'mcp_server_registered' | 'mcp_server_updated' | 'mcp_server_status_changed' |
        'mcp_sync_started' | 'mcp_sync_completed' | 'mcp_sync_failed' | 'mcp_health_check';
  data: MCPServer | MCPStatusResponse | MCPSyncResponse | MCPHealthCheck;
  timestamp: string;
}

// Spec Sync Types
export interface SpecSyncStatus {
  enabled: boolean;
  running: boolean;
  dir: string;
}

export interface SpecSyncActivityLog {
  id: string;
  action: 'start' | 'stop' | 'status_check';
  timestamp: string;
  success: boolean;
  error: string | null;
}

// Organization and Team Management Types
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  email: string;
  fullName: string;
  invitedBy: string | null;
  invitedAt: string;
  joinedAt: string | null;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  invitedBy: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  token: string;
  status: InvitationStatus;
  message: string | null;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
}

export interface CreateInvitationRequest {
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  message?: string;
}

export interface UpdateMemberRoleRequest {
  role: 'owner' | 'admin' | 'developer' | 'viewer';
}

export interface TeamEvent {
  type: 'member_invited' | 'member_joined' | 'member_removed' | 'member_role_updated';
  data: OrganizationMember | OrganizationInvitation;
}

// Subscription and Billing Types
export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  PAUSED = 'paused',
  DELETED = 'deleted',
  CANCELLED = 'cancelled'
}

export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible'
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  maxProjects: number;
  maxMembers: number;
  maxApiCallsMonthly: number;
  maxSpecsPerProject: number;
  features: Record<string, boolean>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  paddleSubscriptionId: string;
  paddleCustomerId: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  paddleData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  paddleInvoiceId: string;
  paddleTransactionId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  amountTotal: number;
  amountSubtotal: number;
  amountTax: number;
  currency: string;
  invoiceDate: string;
  dueDate: string | null;
  paidAt: string | null;
  paddleData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UsageMetrics {
  apiCalls: number;
  specsCreated: number;
  projectsCreated: number;
  membersActive: number;
  storageUsedMb: number;
  lastUpdated: string;
}

export interface UsageSummary {
  subscriptionId: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  metrics: Record<string, number>;
  overLimits: Record<string, boolean>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4: string | null;
  brand: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
}

export interface CreateCheckoutRequest {
  planId: string;
  billingInterval: BillingInterval;
}

export interface UpdateSubscriptionRequest {
  planId: string;
  addons?: string[];
}

export interface BillingEvent {
  type: 'subscription_updated' | 'invoice_paid' | 'payment_failed' | 'usage_limit_exceeded';
  data: Subscription | Invoice | UsageMetrics;
}

// Webhook-related interfaces
export enum WebhookStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR'
}

export enum WebhookDeliveryStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING'
}

export enum WebhookEventType {
  MUTATION_CREATED = 'mutation.created',
  MUTATION_APPROVED = 'mutation.approved',
  MUTATION_DEPLOYED = 'mutation.deployed',
  MUTATION_REJECTED = 'mutation.rejected',
  DEPLOYMENT_CREATED = 'deployment.created',
  DEPLOYMENT_COMPLETED = 'deployment.completed',
  DEPLOYMENT_FAILED = 'deployment.failed',
  APPROVAL_REQUESTED = 'approval.requested',
  APPROVAL_RESPONDED = 'approval.responded',
  SPEC_CREATED = 'spec.created',
  SPEC_UPDATED = 'spec.updated',
  TASK_COMPLETED = 'task.completed'
}

export interface Webhook {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  active: boolean;
  headers: Record<string, string>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt: string | null;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, any>;
  status: WebhookDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  responseStatusCode: number | null;
  responseBody: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  nextRetryAt: string | null;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  events: WebhookEventType[];
  secret?: string;
  active?: boolean;
  headers?: Record<string, string>;
}

export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  events?: WebhookEventType[];
  active?: boolean;
  headers?: Record<string, string>;
}

export interface WebhookFilters {
  active?: boolean;
  search?: string;
}

export interface WebhookTestRequest {
  webhookId: string;
}

export interface WebhookEvent {
  type: 'webhook_delivery_success' | 'webhook_delivery_failed';
  data: WebhookDelivery;
}

// Agent Types
export enum AgentType {
  SPEC_VALIDATOR = 'spec_validator',
  DEPENDENCY_RESOLVER = 'dependency_resolver',
  SEMANTIC_COHERENCE = 'semantic_coherence',
  MUTATION_GENERATOR = 'mutation_generator',
  IMPACT_ANALYZER = 'impact_analyzer',
  CONFLICT_RESOLVER = 'conflict_resolver'
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRAINING = 'training',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

export interface AgentConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  constraints: Array<{type: string, value: any}>;
  triggers: Array<{event: string, condition: any}>;
}

export interface AgentPerformance {
  successRate: number;
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  confidenceScore: number | null;
  lastActivity: string | null;
}

export interface Agent {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  type: AgentType;
  status: AgentStatus;
  configuration: AgentConfiguration | null;
  performance: AgentPerformance | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
  isSystemAgent: boolean;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  type: AgentType;
  configuration: AgentConfiguration;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  status?: AgentStatus;
  configuration?: AgentConfiguration;
}

export interface AgentFilters {
  type?: AgentType;
  status?: AgentStatus;
  search?: string;
}

export interface AgentPerformanceMetric {
  id: string;
  agentId: string;
  taskId: string;
  operation: string;
  success: boolean;
  responseTimeMs: number;
  confidenceScore: number | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AgentEvent {
  type: 'agent_created' | 'agent_updated' | 'agent_deleted' | 'agent_status_changed' | 'agent_performance_updated';
  data: Agent | AgentPerformance;
}