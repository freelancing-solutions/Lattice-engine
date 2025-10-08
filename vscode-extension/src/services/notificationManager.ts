import * as vscode from 'vscode';
import { 
    NotificationConfig, 
    NotificationType, 
    ApprovalRequest, 
    ApprovalStatus,
    WorkflowEvent,
    WorkflowEventType,
    LatticeConfig
} from '../types';
import { LatticeConnectionManager } from './connectionManager';

export class LatticeNotificationManager {
    private notificationQueue: QueuedNotification[] = [];
    private isProcessingQueue = false;
    private notificationHistory: NotificationHistory[] = [];
    private readonly maxHistorySize = 100;

    // Notification settings
    private config: NotificationConfig = {
        enabled: true,
        approvalRequests: true,
        workflowEvents: true,
        connectionStatus: true,
        errors: true,
        soundEnabled: false,
        showInStatusBar: true,
        autoHide: true,
        autoHideDelay: 5000
    };

    // Status bar items
    private statusBarItem: vscode.StatusBarItem;
    private connectionStatusItem: vscode.StatusBarItem;

    constructor(
        private context: vscode.ExtensionContext,
        private connectionManager: LatticeConnectionManager
    ) {
        this.loadConfiguration();
        this.setupStatusBar();
        this.setupEventListeners();
        this.startQueueProcessor();
    }

    private loadConfiguration(): void {
        const latticeConfig = this.connectionManager.getConfig();
        this.config = {
            enabled: latticeConfig.approvalNotifications,
            approvalRequests: latticeConfig.approvalNotifications,
            workflowEvents: true,
            connectionStatus: true,
            errors: true,
            soundEnabled: vscode.workspace.getConfiguration('lattice.notifications').get('soundEnabled', false),
            showInStatusBar: vscode.workspace.getConfiguration('lattice.notifications').get('showInStatusBar', true),
            autoHide: vscode.workspace.getConfiguration('lattice.notifications').get('autoHide', true),
            autoHideDelay: vscode.workspace.getConfiguration('lattice.notifications').get('autoHideDelay', 5000)
        };
    }

    private setupStatusBar(): void {
        // Main status bar item for Lattice
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            100
        );
        this.statusBarItem.command = 'lattice.showNotificationCenter';
        this.statusBarItem.tooltip = 'Lattice Mutation Engine';
        
        // Connection status item
        this.connectionStatusItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            99
        );
        this.connectionStatusItem.command = 'lattice.connectToEngine';
        
        this.updateStatusBar();
        
        if (this.config.showInStatusBar) {
            this.statusBarItem.show();
            this.connectionStatusItem.show();
        }
    }

    private setupEventListeners(): void {
        // Listen for connection status changes
        this.connectionManager.onConnectionStatusChanged((connected) => {
            this.handleConnectionStatusChange(connected);
        });

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('lattice')) {
                this.loadConfiguration();
                this.updateStatusBar();
            }
        });
    }

    private startQueueProcessor(): void {
        // Process notification queue every 100ms
        setInterval(() => {
            this.processNotificationQueue();
        }, 100);
    }

    public showApprovalRequest(request: ApprovalRequest): void {
        if (!this.config.enabled || !this.config.approvalRequests) {
            return;
        }

        const notification: QueuedNotification = {
            id: `approval_${request.id}`,
            type: NotificationType.APPROVAL_REQUEST,
            title: 'Approval Request',
            message: `${request.title || 'New approval request'} - ${request.changes?.length || 0} files`,
            priority: this.mapPriorityToNumber(request.priority),
            timestamp: new Date(),
            actions: [
                {
                    title: 'Approve',
                    command: 'lattice.approveRequest',
                    arguments: [request.id],
                    isDefault: true
                },
                {
                    title: 'Reject',
                    command: 'lattice.rejectRequest',
                    arguments: [request.id]
                },
                {
                    title: 'View Details',
                    command: 'lattice.viewRequestDetails',
                    arguments: [request.id]
                }
            ],
            autoHide: false, // Approval requests should not auto-hide
            data: request
        };

        this.queueNotification(notification);
    }

    public showApprovalResponse(requestId: string, status: ApprovalStatus, message?: string): void {
        if (!this.config.enabled || !this.config.approvalRequests) {
            return;
        }

        const isApproved = status === ApprovalStatus.APPROVED;
        const notification: QueuedNotification = {
            id: `approval_response_${requestId}`,
            type: isApproved ? NotificationType.SUCCESS : NotificationType.WARNING,
            title: isApproved ? 'Request Approved' : 'Request Rejected',
            message: message || `Approval request ${requestId.substring(0, 8)} was ${status.toLowerCase()}`,
            priority: isApproved ? 2 : 3,
            timestamp: new Date(),
            actions: [
                {
                    title: 'View History',
                    command: 'lattice.showChangeHistory'
                }
            ],
            autoHide: this.config.autoHide,
            autoHideDelay: this.config.autoHideDelay
        };

        this.queueNotification(notification);
    }

    public showWorkflowEvent(event: WorkflowEvent): void {
        if (!this.config.enabled || !this.config.workflowEvents) {
            return;
        }

        let notification: QueuedNotification | undefined;

        switch (event.type) {
            case WorkflowEventType.WORKFLOW_STARTED:
                notification = {
                    id: `workflow_started_${event.workflowId}`,
                    type: NotificationType.INFO,
                    title: 'Workflow Started',
                    message: `Approval workflow started for ${this.getFileName(event.filePath)}`,
                    priority: 4,
                    timestamp: new Date(),
                    autoHide: this.config.autoHide,
                    autoHideDelay: this.config.autoHideDelay
                };
                break;

            case WorkflowEventType.APPROVAL_REQUESTED:
                notification = {
                    id: `approval_requested_${event.workflowId}`,
                    type: NotificationType.WARNING,
                    title: 'Approval Required',
                    message: `Changes to ${this.getFileName(event.filePath)} require approval`,
                    priority: 2,
                    timestamp: new Date(),
                    actions: [
                        {
                            title: 'View Request',
                            command: 'lattice.viewRequestDetails',
                            arguments: [event.approvalId]
                        }
                    ],
                    autoHide: false
                };
                break;

            case WorkflowEventType.APPROVAL_GRANTED:
                notification = {
                    id: `approval_granted_${event.workflowId}`,
                    type: NotificationType.SUCCESS,
                    title: 'Changes Approved',
                    message: `Your changes to ${this.getFileName(event.filePath)} have been approved`,
                    priority: 3,
                    timestamp: new Date(),
                    autoHide: this.config.autoHide,
                    autoHideDelay: this.config.autoHideDelay
                };
                break;

            case WorkflowEventType.APPROVAL_DENIED:
                notification = {
                    id: `approval_denied_${event.workflowId}`,
                    type: NotificationType.ERROR,
                    title: 'Changes Rejected',
                    message: `Your changes to ${this.getFileName(event.filePath)} have been rejected`,
                    priority: 1,
                    timestamp: new Date(),
                    actions: [
                        {
                            title: 'View Reason',
                            command: 'lattice.viewRequestDetails',
                            arguments: [event.approvalId]
                        }
                    ],
                    autoHide: false
                };
                break;

            case WorkflowEventType.AUTO_APPROVED:
                notification = {
                    id: `auto_approved_${event.workflowId}`,
                    type: NotificationType.SUCCESS,
                    title: 'Changes Auto-Approved',
                    message: `Minor changes to ${this.getFileName(event.filePath)} were automatically approved`,
                    priority: 4,
                    timestamp: new Date(),
                    autoHide: this.config.autoHide,
                    autoHideDelay: this.config.autoHideDelay
                };
                break;
        }

        if (notification) {
            this.queueNotification(notification);
        }
    }

    public showConnectionStatus(connected: boolean, error?: string): void {
        if (!this.config.enabled || !this.config.connectionStatus) {
            return;
        }

        const notification: QueuedNotification = {
            id: 'connection_status',
            type: connected ? NotificationType.SUCCESS : NotificationType.ERROR,
            title: connected ? 'Connected' : 'Connection Failed',
            message: connected 
                ? 'Successfully connected to Lattice Mutation Engine'
                : `Failed to connect to Lattice Mutation Engine${error ? `: ${error}` : ''}`,
            priority: connected ? 3 : 1,
            timestamp: new Date(),
            actions: connected ? [] : [
                {
                    title: 'Retry',
                    command: 'lattice.connectToEngine'
                },
                {
                    title: 'Settings',
                    command: 'lattice.openSettings'
                }
            ],
            autoHide: connected ? this.config.autoHide : false,
            autoHideDelay: this.config.autoHideDelay
        };

        this.queueNotification(notification);
    }

    public showError(title: string, message: string, error?: Error): void {
        if (!this.config.enabled || !this.config.errors) {
            return;
        }

        const notification: QueuedNotification = {
            id: `error_${Date.now()}`,
            type: NotificationType.ERROR,
            title,
            message: error ? `${message}: ${error.message}` : message,
            priority: 1,
            timestamp: new Date(),
            actions: [
                {
                    title: 'View Logs',
                    command: 'lattice.showLogs'
                }
            ],
            autoHide: false
        };

        this.queueNotification(notification);
    }

    public showInfo(title: string, message: string, actions?: NotificationAction[]): void {
        if (!this.config.enabled) {
            return;
        }

        const notification: QueuedNotification = {
            id: `info_${Date.now()}`,
            type: NotificationType.INFO,
            title,
            message,
            priority: 4,
            timestamp: new Date(),
            actions: actions || [],
            autoHide: this.config.autoHide,
            autoHideDelay: this.config.autoHideDelay
        };

        this.queueNotification(notification);
    }

    public showWarning(title: string, message: string, actions?: NotificationAction[]): void {
        if (!this.config.enabled) {
            return;
        }

        const notification: QueuedNotification = {
            id: `warning_${Date.now()}`,
            type: NotificationType.WARNING,
            title,
            message,
            priority: 2,
            timestamp: new Date(),
            actions: actions || [],
            autoHide: this.config.autoHide,
            autoHideDelay: this.config.autoHideDelay
        };

        this.queueNotification(notification);
    }

    private queueNotification(notification: QueuedNotification): void {
        // Remove existing notification with same ID
        this.notificationQueue = this.notificationQueue.filter(n => n.id !== notification.id);
        
        // Add to queue
        this.notificationQueue.push(notification);
        
        // Sort by priority (lower number = higher priority)
        this.notificationQueue.sort((a, b) => a.priority - b.priority);
        
        // Update status bar
        this.updateStatusBar();
    }

    private async processNotificationQueue(): Promise<void> {
        if (this.isProcessingQueue || this.notificationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        try {
            const notification = this.notificationQueue.shift()!;
            await this.showNotification(notification);
            
            // Add to history
            this.addToHistory(notification);
            
        } catch (error) {
            console.error('Failed to process notification:', error);
        } finally {
            this.isProcessingQueue = false;
        }
    }

    private async showNotification(notification: QueuedNotification): Promise<void> {
        const actions = notification.actions?.map(action => action.title) || [];
        
        let result: string | undefined;

        switch (notification.type) {
            case NotificationType.ERROR:
                result = await vscode.window.showErrorMessage(
                    `${notification.title}: ${notification.message}`,
                    ...actions
                );
                break;
                
            case NotificationType.WARNING:
                result = await vscode.window.showWarningMessage(
                    `${notification.title}: ${notification.message}`,
                    ...actions
                );
                break;
                
            case NotificationType.SUCCESS:
            case NotificationType.INFO:
                result = await vscode.window.showInformationMessage(
                    `${notification.title}: ${notification.message}`,
                    ...actions
                );
                break;
                
            case NotificationType.APPROVAL_REQUEST:
                // Special handling for approval requests
                result = await this.showApprovalDialog(notification);
                break;
        }

        // Handle action selection
        if (result && notification.actions) {
            const selectedAction = notification.actions.find(action => action.title === result);
            if (selectedAction) {
                await vscode.commands.executeCommand(
                    selectedAction.command,
                    ...(selectedAction.arguments || [])
                );
            }
        }

        // Auto-hide handling
        if (notification.autoHide && notification.autoHideDelay) {
            setTimeout(() => {
                // Notification will auto-hide by VSCode
            }, notification.autoHideDelay);
        }

        // Play sound if enabled
        if (this.config.soundEnabled) {
            this.playNotificationSound(notification.type);
        }
    }

    private async showApprovalDialog(notification: QueuedNotification): Promise<string | undefined> {
        const request = notification.data as ApprovalRequest;
        
        // Create a more detailed approval dialog
        const message = `
Approval Request: ${request.title || 'Untitled'}
Files: ${request.changes?.length || 0}
Priority: ${request.priority.toUpperCase()}

${request.description || 'No description provided'}
        `.trim();

        const options = notification.actions?.map(action => action.title) || [];
        
        return vscode.window.showInformationMessage(message, ...options);
    }

    private handleConnectionStatusChange(connected: boolean): void {
        this.updateStatusBar();
        
        if (connected) {
            this.showConnectionStatus(true);
        } else {
            this.showConnectionStatus(false, 'Connection lost');
        }
    }

    private updateStatusBar(): void {
        const pendingCount = this.notificationQueue.length;
        const connected = this.connectionManager.isConnected();
        
        // Update main status bar item
        if (pendingCount > 0) {
            this.statusBarItem.text = `$(bell) Lattice (${pendingCount})`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            this.statusBarItem.text = '$(lattice) Lattice';
            this.statusBarItem.backgroundColor = undefined;
        }
        
        // Update connection status item
        if (connected) {
            this.connectionStatusItem.text = '$(check) Connected';
            this.connectionStatusItem.color = new vscode.ThemeColor('statusBar.foreground');
            this.connectionStatusItem.backgroundColor = undefined;
        } else {
            this.connectionStatusItem.text = '$(x) Disconnected';
            this.connectionStatusItem.color = new vscode.ThemeColor('errorForeground');
            this.connectionStatusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
    }

    private addToHistory(notification: QueuedNotification): void {
        const historyItem: NotificationHistory = {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            timestamp: notification.timestamp,
            read: false
        };

        this.notificationHistory.unshift(historyItem);
        
        // Limit history size
        if (this.notificationHistory.length > this.maxHistorySize) {
            this.notificationHistory = this.notificationHistory.slice(0, this.maxHistorySize);
        }
    }

    private playNotificationSound(type: NotificationType): void {
        // VSCode doesn't have built-in sound APIs, but we can trigger system sounds
        // This is a placeholder for potential future sound implementation
    }

    private mapPriorityToNumber(priority: string): number {
        switch (priority) {
            case 'high': return 1;
            case 'medium': return 2;
            case 'low': return 3;
            default: return 4;
        }
    }

    private getFileName(filePath?: string): string {
        if (!filePath) return 'Unknown file';
        return filePath.split(/[/\\]/).pop() || 'Unknown file';
    }

    // Public methods
    public getNotificationHistory(): NotificationHistory[] {
        return [...this.notificationHistory];
    }

    public markAsRead(notificationId: string): void {
        const notification = this.notificationHistory.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }

    public clearHistory(): void {
        this.notificationHistory = [];
    }

    public updateConfiguration(config: Partial<NotificationConfig>): void {
        this.config = { ...this.config, ...config };
        this.updateStatusBar();
    }

    public getPendingNotifications(): QueuedNotification[] {
        return [...this.notificationQueue];
    }

    public clearPendingNotifications(): void {
        this.notificationQueue = [];
        this.updateStatusBar();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
        this.connectionStatusItem.dispose();
    }
}

interface QueuedNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: number;
    timestamp: Date;
    actions?: NotificationAction[];
    autoHide?: boolean;
    autoHideDelay?: number;
    data?: any;
}

interface NotificationAction {
    title: string;
    command: string;
    arguments?: any[];
    isDefault?: boolean;
}

interface NotificationHistory {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}