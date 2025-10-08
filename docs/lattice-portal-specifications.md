# Lattice Portal - Technical Specifications v2.0

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Feature Specifications](#feature-specifications)
4. [API Specifications](#api-specifications)
5. [UI/UX Specifications](#uiux-specifications)
6. [Data Models](#data-models)
7. [Security & Authentication](#security--authentication)
8. [Performance Requirements](#performance-requirements)
9. [Integration Points](#integration-points)
10. [Deployment & Operations](#deployment--operations)

---

## System Overview

### Platform Purpose
The Lattice Portal is a dual-purpose web application serving as:
1. **Management Platform**: Comprehensive dashboard for managing AI agents, approvals, teams, and subscriptions
2. **Marketing Front**: Professional landing page and conversion funnel for new customers

### Core Capabilities
- **AI Agent Management**: Deploy, configure, and monitor specialized AI coding agents
- **Approval Workflows**: Multi-channel approval system with intelligent routing
- **Team Management**: User roles, permissions, and collaboration features
- **Subscription Management**: Billing, usage tracking, and plan management
- **Specification Management**: Interactive spec graphs and dependency tracking
- **Real-time Communication**: WebSocket-based notifications and updates

---

## Architecture & Technology Stack

### Frontend Architecture

```typescript
// Technology Stack
const techStack = {
  framework: "Next.js 14+",
  language: "TypeScript",
  styling: "Tailwind CSS",
  components: "shadcn/ui",
  stateManagement: {
    client: "Zustand",
    server: "React Query (TanStack Query)",
    realtime: "Socket.io Client"
  },
  authentication: "NextAuth.js",
  forms: "React Hook Form + Zod",
  charts: "Recharts",
  deployment: "Vercel/AWS"
};
```

### Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (marketing)/              # Public marketing pages
│   ├── (dashboard)/              # Protected dashboard
│   └── api/                      # API routes
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── charts/                   # Chart components
│   └── layout/                   # Layout components
├── lib/                          # Utilities and configurations
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores
├── types/                        # TypeScript type definitions
└── styles/                       # Global styles
```

### State Management Architecture

```typescript
// Global State Structure
interface AppState {
  auth: AuthState;
  agents: AgentState;
  approvals: ApprovalState;
  teams: TeamState;
  subscriptions: SubscriptionState;
  notifications: NotificationState;
  ui: UIState;
}

// Example Store (Zustand)
interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAgents: () => Promise<void>;
  createAgent: (agent: CreateAgentRequest) => Promise<void>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  selectAgent: (agent: Agent) => void;
}
```

---

## Feature Specifications

### 1. Authentication & Onboarding

#### 1.1 Authentication System

**Supported Methods:**
- Email/Password with email verification
- OAuth2 (Google, GitHub, Microsoft)
- Enterprise SSO (SAML, OIDC)
- Magic link authentication

**Implementation:**
```typescript
// Authentication Configuration
interface AuthConfig {
  providers: {
    email: boolean;
    google: boolean;
    github: boolean;
    microsoft: boolean;
    saml: boolean;
  };
  session: {
    strategy: "jwt" | "database";
    maxAge: number;
    updateAge: number;
  };
  pages: {
    signIn: "/auth/signin";
    signUp: "/auth/signup";
    error: "/auth/error";
    verifyRequest: "/auth/verify";
  };
}

// User Session Interface
interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: UserRole;
    organizationId?: string;
    permissions: Permission[];
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

#### 1.2 Onboarding Flow

**Steps:**
1. **Account Creation**: Email verification and basic profile setup
2. **Organization Setup**: Create or join existing organization
3. **Integration Setup**: Install VSCode extension and configure API keys
4. **First Project**: Create initial project and invite team members
5. **Agent Configuration**: Set up first AI agents and approval rules

**UI Components:**
```typescript
// Onboarding Step Component
interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

// Progress Tracking
interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  estimatedTimeRemaining: number;
}
```

### 2. Dashboard & Navigation

#### 2.1 Main Dashboard Layout

**Layout Structure:**
```typescript
interface DashboardLayout {
  sidebar: {
    navigation: NavigationItem[];
    userProfile: UserProfile;
    organizationSwitcher: OrganizationSwitcher;
  };
  header: {
    breadcrumbs: Breadcrumb[];
    notifications: NotificationCenter;
    search: GlobalSearch;
    userMenu: UserMenu;
  };
  main: {
    content: React.ReactNode;
    quickActions: QuickAction[];
  };
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  href: string;
  badge?: number;
  children?: NavigationItem[];
  permissions?: Permission[];
}
```

#### 2.2 Dashboard Widgets

**Available Widgets:**
```typescript
interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'status' | 'activity';
  title: string;
  size: 'small' | 'medium' | 'large';
  refreshInterval?: number;
  permissions?: Permission[];
}

// Widget Types
interface MetricWidget extends DashboardWidget {
  type: 'metric';
  value: number | string;
  change?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  format: 'number' | 'currency' | 'percentage' | 'duration';
}

interface ChartWidget extends DashboardWidget {
  type: 'chart';
  chartType: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData[];
  xAxis: string;
  yAxis: string;
}
```

### 3. AI Agent Management

#### 3.1 Agent Types & Configuration

**Agent Specifications:**
```typescript
interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  configuration: AgentConfiguration;
  performance: AgentPerformance;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

enum AgentType {
  SPEC_VALIDATOR = 'spec_validator',
  DEPENDENCY_RESOLVER = 'dependency_resolver',
  SEMANTIC_COHERENCE = 'semantic_coherence',
  MUTATION_GENERATOR = 'mutation_generator',
  IMPACT_ANALYZER = 'impact_analyzer',
  CONFLICT_RESOLVER = 'conflict_resolver'
}

enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRAINING = 'training',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

interface AgentConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  constraints: AgentConstraint[];
  triggers: AgentTrigger[];
}

interface AgentPerformance {
  successRate: number;
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  confidenceScore: number;
  lastActivity: Date;
}
```

#### 3.2 Agent Management Interface

**Agent Dashboard:**
```typescript
interface AgentDashboardProps {
  agents: Agent[];
  selectedAgent?: Agent;
  onAgentSelect: (agent: Agent) => void;
  onAgentCreate: () => void;
  onAgentEdit: (agent: Agent) => void;
  onAgentDelete: (agentId: string) => void;
}

// Agent Configuration Form
interface AgentConfigurationForm {
  basic: {
    name: string;
    description: string;
    type: AgentType;
  };
  model: {
    provider: 'openai' | 'anthropic' | 'custom';
    model: string;
    temperature: number;
    maxTokens: number;
  };
  behavior: {
    systemPrompt: string;
    constraints: AgentConstraint[];
    triggers: AgentTrigger[];
  };
  permissions: {
    allowedProjects: string[];
    allowedOperations: string[];
    requireApproval: boolean;
  };
}
```

### 4. Approval Workflow System

#### 4.1 Approval Request Management

**Approval Request Interface:**
```typescript
interface ApprovalRequest {
  id: string;
  proposalId: string;
  userId: string;
  specId: string;
  mutationType: MutationType;
  content: {
    original: string;
    proposed: string;
    diff: string;
  };
  reasoning: string;
  confidence: number;
  impactAnalysis: ImpactAnalysis;
  priority: Priority;
  timeout: number;
  status: ApprovalStatus;
  assignedTo?: string[];
  responses: ApprovalResponse[];
  createdAt: Date;
  expiresAt: Date;
  channels: {
    preferred: ApprovalChannel[];
    fallback: ApprovalChannel[];
  };
}

enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

enum ApprovalChannel {
  VSCODE = 'vscode',
  WEB = 'web',
  CLI = 'cli',
  EMAIL = 'email',
  SLACK = 'slack'
}

interface ApprovalResponse {
  id: string;
  userId: string;
  decision: 'approve' | 'reject' | 'request_changes';
  modifiedContent?: string;
  notes?: string;
  channel: ApprovalChannel;
  timestamp: Date;
}
```

#### 4.2 Approval Dashboard

**Dashboard Components:**
```typescript
interface ApprovalDashboardProps {
  requests: ApprovalRequest[];
  filters: ApprovalFilters;
  sorting: ApprovalSorting;
  onRequestSelect: (request: ApprovalRequest) => void;
  onBatchApprove: (requestIds: string[]) => void;
  onBatchReject: (requestIds: string[]) => void;
}

interface ApprovalFilters {
  status: ApprovalStatus[];
  priority: Priority[];
  assignedTo: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  mutationType: MutationType[];
}

// Approval Detail View
interface ApprovalDetailProps {
  request: ApprovalRequest;
  onApprove: (response: ApprovalResponse) => void;
  onReject: (response: ApprovalResponse) => void;
  onRequestChanges: (response: ApprovalResponse) => void;
}
```

#### 4.3 Approval Rules Engine

**Rule Configuration:**
```typescript
interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  conditions: ApprovalCondition[];
  actions: ApprovalAction[];
  priority: number;
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
}

interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface ApprovalAction {
  type: 'auto_approve' | 'auto_reject' | 'assign_to' | 'escalate' | 'notify';
  parameters: Record<string, any>;
}

// Example Rules
const exampleRules: ApprovalRule[] = [
  {
    id: 'auto-approve-low-risk',
    name: 'Auto-approve low-risk changes',
    conditions: [
      { field: 'confidence', operator: 'greater_than', value: 0.9 },
      { field: 'impactAnalysis.risk', operator: 'equals', value: 'low' }
    ],
    actions: [
      { type: 'auto_approve', parameters: {} }
    ]
  }
];
```

### 5. Team & Organization Management

#### 5.1 Organization Structure

**Organization Model:**
```typescript
interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  settings: OrganizationSettings;
  subscription: Subscription;
  members: OrganizationMember[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationSettings {
  defaultRole: UserRole;
  allowSelfSignup: boolean;
  requireEmailVerification: boolean;
  ssoEnabled: boolean;
  ssoProvider?: string;
  approvalRules: ApprovalRule[];
  securityPolicies: SecurityPolicy[];
}

interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  joinedAt: Date;
  invitedBy?: string;
  status: 'active' | 'invited' | 'suspended';
}
```

#### 5.2 User Roles & Permissions

**Role System:**
```typescript
enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer'
}

interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Permission Examples
const permissions = {
  // Agent Management
  'agents:create': 'Create new AI agents',
  'agents:read': 'View AI agents',
  'agents:update': 'Modify AI agent configuration',
  'agents:delete': 'Delete AI agents',
  
  // Approval Management
  'approvals:approve': 'Approve pending requests',
  'approvals:reject': 'Reject pending requests',
  'approvals:view_all': 'View all approval requests',
  
  // Team Management
  'team:invite': 'Invite new team members',
  'team:remove': 'Remove team members',
  'team:manage_roles': 'Manage user roles and permissions',
  
  // Billing & Subscription
  'billing:view': 'View billing information',
  'billing:manage': 'Manage subscription and billing'
};
```

#### 5.3 Team Management Interface

**Team Dashboard:**
```typescript
interface TeamDashboardProps {
  members: OrganizationMember[];
  invitations: Invitation[];
  onInviteMember: (invitation: CreateInvitationRequest) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onUpdatePermissions: (userId: string, permissions: Permission[]) => void;
}

interface CreateInvitationRequest {
  email: string;
  role: UserRole;
  permissions?: Permission[];
  message?: string;
  expiresIn?: number; // hours
}

// Member Activity Tracking
interface MemberActivity {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### 6. Subscription & Billing Management

#### 6.1 Subscription Model

**Subscription Structure:**
```typescript
interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  usage: UsageMetrics;
  billing: BillingInfo;
  addons: Addon[];
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  price: {
    monthly: number;
    annual: number;
  };
  limits: PlanLimits;
  features: PlanFeature[];
}

interface PlanLimits {
  maxUsers: number;
  maxProjects: number;
  maxAgents: number;
  maxSpecifications: number;
  apiCallsPerMonth: number;
  storageGB: number;
}

interface UsageMetrics {
  users: number;
  projects: number;
  agents: number;
  specifications: number;
  apiCalls: number;
  storage: number;
  lastUpdated: Date;
}
```

#### 6.2 Billing Interface

**Billing Dashboard:**
```typescript
interface BillingDashboardProps {
  subscription: Subscription;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  onUpgrade: (planId: string) => void;
  onDowngrade: (planId: string) => void;
  onAddPaymentMethod: (method: PaymentMethod) => void;
  onUpdateBilling: (info: BillingInfo) => void;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
  downloadUrl: string;
}

// Usage Monitoring
interface UsageMonitoringProps {
  usage: UsageMetrics;
  limits: PlanLimits;
  alerts: UsageAlert[];
  onSetAlert: (alert: CreateUsageAlertRequest) => void;
}
```

### 7. Specification Management

#### 7.1 Specification Graph

**Graph Structure:**
```typescript
interface SpecificationGraph {
  nodes: SpecNode[];
  edges: SpecEdge[];
  metadata: GraphMetadata;
}

interface SpecNode {
  id: string;
  type: 'specification' | 'component' | 'dependency';
  label: string;
  data: SpecificationData;
  position: { x: number; y: number };
  style?: NodeStyle;
}

interface SpecEdge {
  id: string;
  source: string;
  target: string;
  type: 'depends_on' | 'implements' | 'extends' | 'uses';
  label?: string;
  style?: EdgeStyle;
}

interface SpecificationData {
  id: string;
  name: string;
  version: string;
  description: string;
  content: string;
  schema: JSONSchema;
  status: 'draft' | 'active' | 'deprecated';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 7.2 Graph Visualization

**Interactive Graph Component:**
```typescript
interface SpecGraphViewerProps {
  graph: SpecificationGraph;
  selectedNode?: string;
  onNodeSelect: (nodeId: string) => void;
  onNodeEdit: (nodeId: string) => void;
  onEdgeCreate: (source: string, target: string, type: string) => void;
  onLayoutChange: (layout: GraphLayout) => void;
  filters: GraphFilters;
}

interface GraphFilters {
  nodeTypes: string[];
  edgeTypes: string[];
  tags: string[];
  status: string[];
  searchQuery: string;
}

// Graph Operations
interface GraphOperations {
  zoom: (factor: number) => void;
  pan: (x: number, y: number) => void;
  fit: () => void;
  center: (nodeId?: string) => void;
  export: (format: 'png' | 'svg' | 'json') => void;
}
```

### 8. Real-time Communication

#### 8.1 WebSocket Integration

**WebSocket Client:**
```typescript
interface WebSocketClient {
  connect: (token: string) => Promise<void>;
  disconnect: () => void;
  subscribe: (channel: string, callback: (data: any) => void) => void;
  unsubscribe: (channel: string) => void;
  emit: (event: string, data: any) => void;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// WebSocket Events
interface WebSocketEvents {
  // Approval Events
  'approval:created': ApprovalRequest;
  'approval:updated': ApprovalRequest;
  'approval:responded': ApprovalResponse;
  
  // Agent Events
  'agent:status_changed': { agentId: string; status: AgentStatus };
  'agent:performance_updated': { agentId: string; performance: AgentPerformance };
  
  // Notification Events
  'notification:new': Notification;
  'notification:read': { notificationId: string };
  
  // System Events
  'system:maintenance': { message: string; scheduledAt: Date };
  'system:update': { version: string; features: string[] };
}
```

#### 8.2 Notification System

**Notification Management:**
```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  expiresAt?: Date;
}

enum NotificationType {
  APPROVAL_REQUEST = 'approval_request',
  APPROVAL_RESPONSE = 'approval_response',
  AGENT_ERROR = 'agent_error',
  SYSTEM_UPDATE = 'system_update',
  BILLING_ALERT = 'billing_alert',
  SECURITY_ALERT = 'security_alert'
}

interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  types: Record<NotificationType, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;   // HH:mm
    timezone: string;
  };
}
```

---

## API Specifications

### 1. Authentication API

```typescript
// Authentication Endpoints
interface AuthAPI {
  // Sign up
  'POST /api/auth/signup': {
    body: {
      email: string;
      password: string;
      name: string;
      organizationName?: string;
    };
    response: {
      user: User;
      token: string;
      refreshToken: string;
    };
  };

  // Sign in
  'POST /api/auth/signin': {
    body: {
      email: string;
      password: string;
    };
    response: {
      user: User;
      token: string;
      refreshToken: string;
    };
  };

  // Refresh token
  'POST /api/auth/refresh': {
    body: {
      refreshToken: string;
    };
    response: {
      token: string;
      refreshToken: string;
    };
  };

  // Sign out
  'POST /api/auth/signout': {
    response: { success: boolean };
  };
}
```

### 2. Agent Management API

```typescript
interface AgentAPI {
  // List agents
  'GET /api/agents': {
    query?: {
      type?: AgentType;
      status?: AgentStatus;
      limit?: number;
      offset?: number;
    };
    response: {
      agents: Agent[];
      total: number;
    };
  };

  // Create agent
  'POST /api/agents': {
    body: CreateAgentRequest;
    response: Agent;
  };

  // Get agent
  'GET /api/agents/:id': {
    response: Agent;
  };

  // Update agent
  'PUT /api/agents/:id': {
    body: Partial<Agent>;
    response: Agent;
  };

  // Delete agent
  'DELETE /api/agents/:id': {
    response: { success: boolean };
  };

  // Agent performance
  'GET /api/agents/:id/performance': {
    query?: {
      period?: '1h' | '24h' | '7d' | '30d';
    };
    response: {
      metrics: PerformanceMetric[];
      summary: AgentPerformance;
    };
  };
}
```

### 3. Approval Management API

```typescript
interface ApprovalAPI {
  // List approval requests
  'GET /api/approvals': {
    query?: {
      status?: ApprovalStatus;
      assignedTo?: string;
      priority?: Priority;
      limit?: number;
      offset?: number;
    };
    response: {
      requests: ApprovalRequest[];
      total: number;
    };
  };

  // Get approval request
  'GET /api/approvals/:id': {
    response: ApprovalRequest;
  };

  // Respond to approval
  'POST /api/approvals/:id/respond': {
    body: {
      decision: 'approve' | 'reject' | 'request_changes';
      modifiedContent?: string;
      notes?: string;
    };
    response: ApprovalResponse;
  };

  // Batch operations
  'POST /api/approvals/batch': {
    body: {
      action: 'approve' | 'reject';
      requestIds: string[];
      notes?: string;
    };
    response: {
      success: string[];
      failed: string[];
    };
  };
}
```

### 4. Team Management API

```typescript
interface TeamAPI {
  // List organization members
  'GET /api/organizations/:orgId/members': {
    response: {
      members: OrganizationMember[];
      total: number;
    };
  };

  // Invite member
  'POST /api/organizations/:orgId/invitations': {
    body: CreateInvitationRequest;
    response: Invitation;
  };

  // Update member role
  'PUT /api/organizations/:orgId/members/:userId': {
    body: {
      role: UserRole;
      permissions?: Permission[];
    };
    response: OrganizationMember;
  };

  // Remove member
  'DELETE /api/organizations/:orgId/members/:userId': {
    response: { success: boolean };
  };
}
```

### 5. Subscription & Billing API

```typescript
interface BillingAPI {
  // Get subscription
  'GET /api/subscriptions/current': {
    response: Subscription;
  };

  // Update subscription
  'PUT /api/subscriptions/current': {
    body: {
      planId: string;
      addons?: string[];
    };
    response: Subscription;
  };

  // Get usage
  'GET /api/subscriptions/usage': {
    query?: {
      period?: '1d' | '7d' | '30d';
    };
    response: {
      current: UsageMetrics;
      history: UsageHistory[];
    };
  };

  // List invoices
  'GET /api/billing/invoices': {
    query?: {
      limit?: number;
      offset?: number;
    };
    response: {
      invoices: Invoice[];
      total: number;
    };
  };

  // Payment methods
  'GET /api/billing/payment-methods': {
    response: PaymentMethod[];
  };

  'POST /api/billing/payment-methods': {
    body: CreatePaymentMethodRequest;
    response: PaymentMethod;
  };
}
```

---

## UI/UX Specifications

### 1. Design System

**Color Palette:**
```css
:root {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

**Typography:**
```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Type Scale */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
```

**Component Library:**
```typescript
// Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType;
  children: React.ReactNode;
  onClick?: () => void;
}

// Card Component
interface CardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Table Component
interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  sorting?: SortingProps;
  selection?: SelectionProps<T>;
}
```

### 2. Responsive Design

**Breakpoints:**
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

**Layout Grid:**
```typescript
interface ResponsiveLayout {
  mobile: {
    columns: 1;
    sidebar: 'overlay' | 'hidden';
    navigation: 'bottom' | 'hamburger';
  };
  tablet: {
    columns: 2;
    sidebar: 'collapsible';
    navigation: 'sidebar';
  };
  desktop: {
    columns: 3;
    sidebar: 'fixed';
    navigation: 'sidebar';
  };
}
```

### 3. Accessibility

**WCAG 2.1 AA Compliance:**
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alternative text for images
- Semantic HTML structure

**Implementation:**
```typescript
// Accessibility Props
interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  role?: string;
  tabIndex?: number;
}

// Focus Management
interface FocusManagement {
  trapFocus: (element: HTMLElement) => void;
  restoreFocus: () => void;
  skipToContent: () => void;
  announceToScreenReader: (message: string) => void;
}
```

---

## Data Models

### 1. Core Entities

```typescript
// User Model
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  preferences: UserPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Organization Model
interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  settings: OrganizationSettings;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

// Project Model
interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  repository?: {
    url: string;
    branch: string;
    path: string;
  };
  settings: ProjectSettings;
  members: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Relationship Models

```typescript
// Many-to-Many Relationships
interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  joinedAt: Date;
  invitedBy?: string;
}

interface ProjectMember {
  userId: string;
  projectId: string;
  role: ProjectRole;
  permissions: Permission[];
  joinedAt: Date;
}

// Audit Trail
interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}
```

---

## Security & Authentication

### 1. Authentication Flow

```typescript
// JWT Token Structure
interface JWTPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: UserRole;
  org: string; // Organization ID
  permissions: string[];
  iat: number;
  exp: number;
}

// API Key Structure
interface APIKey {
  id: string;
  name: string;
  key: string; // Hashed
  userId: string;
  organizationId: string;
  permissions: Permission[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}
```

### 2. Authorization System

```typescript
// Permission Check Function
interface AuthorizationService {
  hasPermission: (
    user: User,
    resource: string,
    action: string,
    context?: Record<string, any>
  ) => boolean;
  
  checkOrganizationAccess: (
    user: User,
    organizationId: string
  ) => boolean;
  
  checkProjectAccess: (
    user: User,
    projectId: string,
    action: string
  ) => boolean;
}

// Rate Limiting
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: Request) => string;
}
```

### 3. Data Protection

```typescript
// Encryption Configuration
interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyDerivation: 'pbkdf2';
  iterations: 100000;
  saltLength: 32;
  ivLength: 16;
  tagLength: 16;
}

// Data Classification
enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

interface DataProtectionPolicy {
  classification: DataClassification;
  encryptionRequired: boolean;
  retentionPeriod: number; // days
  accessLogging: boolean;
  anonymizationRequired: boolean;
}
```

---

## Performance Requirements

### 1. Performance Targets

```typescript
interface PerformanceTargets {
  pageLoad: {
    initial: 2000; // ms
    subsequent: 1000; // ms
  };
  api: {
    p50: 200; // ms
    p95: 500; // ms
    p99: 1000; // ms
  };
  realtime: {
    latency: 100; // ms
    throughput: 10000; // messages/second
  };
  availability: {
    uptime: 99.9; // percentage
    rto: 4; // hours (Recovery Time Objective)
    rpo: 1; // hour (Recovery Point Objective)
  };
}
```

### 2. Optimization Strategies

```typescript
// Caching Strategy
interface CacheConfig {
  browser: {
    static: '1y';
    api: '5m';
    user: '1h';
  };
  cdn: {
    images: '30d';
    assets: '1y';
    api: '1m';
  };
  redis: {
    sessions: '24h';
    user_data: '1h';
    api_responses: '5m';
  };
}

// Code Splitting
interface CodeSplittingStrategy {
  routes: 'automatic'; // Next.js automatic code splitting
  components: 'lazy'; // React.lazy for heavy components
  libraries: 'dynamic'; // Dynamic imports for large libraries
  chunks: {
    vendor: ['react', 'react-dom', 'next'];
    common: ['lodash', 'date-fns'];
    charts: ['recharts', 'd3'];
  };
}
```

---

## Integration Points

### 1. External Services

```typescript
// Third-party Integrations
interface ExternalIntegrations {
  authentication: {
    google: GoogleOAuthConfig;
    github: GitHubOAuthConfig;
    microsoft: MicrosoftOAuthConfig;
    saml: SAMLConfig;
  };
  
  payments: {
    stripe: StripeConfig;
    paypal?: PayPalConfig;
  };
  
  monitoring: {
    sentry: SentryConfig;
    datadog?: DatadogConfig;
    newrelic?: NewRelicConfig;
  };
  
  communication: {
    sendgrid: SendGridConfig;
    slack: SlackConfig;
    teams?: TeamsConfig;
  };
  
  storage: {
    aws_s3: S3Config;
    cloudinary?: CloudinaryConfig;
  };
}
```

### 2. API Integrations

```typescript
// Lattice Backend Services
interface LatticeBackendAPIs {
  mutationEngine: {
    baseUrl: string;
    endpoints: {
      propose: '/api/mutations/propose';
      approve: '/api/approvals/{id}/respond';
      pending: '/api/approvals/pending';
      websocket: '/ws/{userId}/{clientType}';
    };
  };
  
  mcpServer: {
    baseUrl: string;
    endpoints: {
      specs: '/api/specs';
      agents: '/api/agents';
      projects: '/api/projects';
    };
  };
  
  analytics: {
    baseUrl: string;
    endpoints: {
      events: '/api/events';
      metrics: '/api/metrics';
      reports: '/api/reports';
    };
  };
}
```

---

## Deployment & Operations

### 1. Deployment Architecture

```typescript
// Environment Configuration
interface DeploymentConfig {
  environments: {
    development: {
      domain: 'localhost:3000';
      database: 'postgresql://localhost/lattice_dev';
      redis: 'redis://localhost:6379';
      apiUrl: 'http://localhost:8000';
    };
    
    staging: {
      domain: 'staging.lattice.dev';
      database: process.env.DATABASE_URL;
      redis: process.env.REDIS_URL;
      apiUrl: process.env.API_URL;
    };
    
    production: {
      domain: 'app.lattice.dev';
      database: process.env.DATABASE_URL;
      redis: process.env.REDIS_URL;
      apiUrl: process.env.API_URL;
    };
  };
}
```

### 2. Monitoring & Observability

```typescript
// Monitoring Configuration
interface MonitoringConfig {
  metrics: {
    business: [
      'user_signups',
      'subscription_conversions',
      'approval_rates',
      'agent_performance'
    ];
    technical: [
      'response_times',
      'error_rates',
      'throughput',
      'resource_usage'
    ];
  };
  
  alerts: {
    error_rate: { threshold: 5, window: '5m' };
    response_time: { threshold: 2000, window: '5m' };
    uptime: { threshold: 99.9, window: '1h' };
  };
  
  dashboards: [
    'application_overview',
    'user_engagement',
    'system_health',
    'business_metrics'
  ];
}
```

### 3. CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: Deploy Lattice Portal
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: .next/
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

This comprehensive specification provides the technical foundation for building the Lattice Portal as a sophisticated, scalable, and user-friendly platform that serves both as a powerful management tool and an effective marketing front for the Lattice ecosystem.