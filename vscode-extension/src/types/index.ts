/**
 * Type definitions for the Lattice Mutation Engine VSCode Extension
 */

export interface LatticeConfig {
    engineUrl: string;
    apiKey: string;
    autoConnect: boolean;
    approvalNotifications: boolean;
    realTimeUpdates: boolean;
    approvalTimeout: number;
    showInlineDecorations: boolean;
}

export interface ConnectionStatus {
    connected: boolean;
    engineUrl: string;
    lastConnected?: Date;
    error?: string;
}

export interface ApprovalRequest {
    id: string;
    title: string;
    description: string;
    changeType: ChangeType;
    priority: Priority;
    status: ApprovalStatus;
    requestedBy: string;
    requestedAt: Date;
    expiresAt?: Date;
    fileChanges: FileChange[];
    metadata: Record<string, any>;
}

export interface FileChange {
    filePath: string;
    changeType: 'create' | 'modify' | 'delete' | 'rename';
    oldContent?: string;
    newContent?: string;
    oldPath?: string; // For renames
    lineChanges: LineChange[];
}

export interface LineChange {
    lineNumber: number;
    type: 'add' | 'remove' | 'modify';
    oldText?: string;
    newText?: string;
}

export interface ApprovalResponse {
    requestId: string;
    action: ApprovalAction;
    comment?: string;
    modifications?: string[];
    respondedBy: string;
    respondedAt: Date;
}

export interface ChangeHistoryItem {
    id: string;
    title: string;
    changeType: ChangeType;
    status: ApprovalStatus;
    requestedAt: Date;
    completedAt?: Date;
    requestedBy: string;
    approvedBy?: string;
    fileCount: number;
    linesChanged: number;
}

export interface WebSocketMessage {
    type: MessageType;
    payload: any;
    timestamp: Date;
}

export interface NotificationOptions {
    type: 'info' | 'warning' | 'error' | 'approval';
    message: string;
    actions?: NotificationAction[];
    timeout?: number;
}

export interface NotificationAction {
    title: string;
    command: string;
    arguments?: any[];
}

export interface DecorationOptions {
    range: import('vscode').Range;
    hoverMessage?: string;
    renderOptions?: import('vscode').DecorationRenderOptions;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    message: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
    message: string;
    line?: number;
    column?: number;
    suggestion?: string;
}

export interface MutationAnalysis {
    impactScore: number;
    affectedComponents: string[];
    riskLevel: RiskLevel;
    recommendations: string[];
    dependencies: string[];
    conflicts: ConflictInfo[];
}

export interface ConflictInfo {
    type: 'merge' | 'dependency' | 'semantic';
    description: string;
    severity: 'low' | 'medium' | 'high';
    resolution?: string;
}

export interface EngineStatus {
    version: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    activeConnections: number;
    pendingApprovals: number;
    lastActivity: Date;
}

// Enums
export enum ChangeType {
    FEATURE = 'feature',
    BUGFIX = 'bugfix',
    REFACTOR = 'refactor',
    DOCUMENTATION = 'documentation',
    TEST = 'test',
    CONFIGURATION = 'configuration',
    DEPENDENCY = 'dependency'
}

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    MODIFICATION_REQUESTED = 'modification_requested',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled'
}

export enum ApprovalAction {
    APPROVE = 'approve',
    REJECT = 'reject',
    REQUEST_MODIFICATION = 'request_modification',
    CANCEL = 'cancel'
}

export enum MessageType {
    APPROVAL_REQUEST = 'approval_request',
    APPROVAL_RESPONSE = 'approval_response',
    STATUS_UPDATE = 'status_update',
    VALIDATION_RESULT = 'validation_result',
    ENGINE_STATUS = 'engine_status',
    ERROR = 'error',
    HEARTBEAT = 'heartbeat'
}

export enum RiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// Event types
export interface ConnectionEvent {
    type: 'connected' | 'disconnected' | 'error' | 'reconnecting';
    timestamp: Date;
    error?: string;
}

export interface ApprovalEvent {
    type: 'new_request' | 'status_changed' | 'expired' | 'cancelled';
    request: ApprovalRequest;
    timestamp: Date;
}

export interface ValidationEvent {
    type: 'validation_started' | 'validation_completed' | 'validation_failed';
    filePath: string;
    result?: ValidationResult;
    timestamp: Date;
}

// Tree view item types
export interface TreeItemData {
    id: string;
    label: string;
    description?: string;
    tooltip?: string;
    contextValue?: string;
    iconPath?: string | import('vscode').ThemeIcon;
    collapsibleState?: import('vscode').TreeItemCollapsibleState;
    command?: import('vscode').Command;
    children?: TreeItemData[];
}

// Command types
export interface CommandContext {
    request?: ApprovalRequest;
    historyItem?: ChangeHistoryItem;
    filePath?: string;
    selection?: import('vscode').Selection;
}

// Settings types
export interface ExtensionSettings {
    engineUrl: string;
    apiKey: string;
    autoConnect: boolean;
    approvalNotifications: boolean;
    realTimeUpdates: boolean;
    approvalTimeout: number;
    showInlineDecorations: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    maxRetries: number;
    retryDelay: number;
}

// Error types
export class LatticeError extends Error {
    constructor(
        message: string,
        public code?: string,
        public statusCode?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'LatticeError';
    }
}

export class ConnectionError extends LatticeError {
    constructor(message: string, details?: any) {
        super(message, 'CONNECTION_ERROR', undefined, details);
        this.name = 'ConnectionError';
    }
}

export class ValidationError extends LatticeError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', undefined, details);
        this.name = 'ValidationError';
    }
}

export class ApprovalError extends LatticeError {
    constructor(message: string, details?: any) {
        super(message, 'APPROVAL_ERROR', undefined, details);
        this.name = 'ApprovalError';
    }
}