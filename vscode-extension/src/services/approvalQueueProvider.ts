import * as vscode from 'vscode';
import * as path from 'path';
import { 
    ApprovalRequest, 
    ApprovalResponse, 
    ApprovalStatus, 
    TreeViewItem, 
    FileChange,
    LineChange,
    ChangeType,
    ApiResponse,
    PaginatedResponse
} from '../types';
import { LatticeConnectionManager } from './connectionManager';

export class ApprovalQueueProvider implements vscode.TreeDataProvider<ApprovalQueueItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ApprovalQueueItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private approvalRequests: Map<string, ApprovalRequest> = new Map();
    private refreshTimer?: NodeJS.Timeout;

    constructor(
        private context: vscode.ExtensionContext,
        private connectionManager: LatticeConnectionManager
    ) {
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    private setupEventListeners(): void {
        // Listen for connection status changes
        this.connectionManager.onConnectionStatusChanged((connected) => {
            if (connected) {
                this.refresh();
            } else {
                this.approvalRequests.clear();
                this._onDidChangeTreeData.fire();
            }
        });

        // Listen for real-time approval updates
        this.connectionManager.onMessage((message) => {
            if (message.type === 'approval_request' || message.type === 'approval_update') {
                this.handleApprovalUpdate(message.payload);
            }
        });
    }

    private startAutoRefresh(): void {
        // Refresh every 30 seconds
        this.refreshTimer = setInterval(() => {
            if (this.connectionManager.isConnected()) {
                this.refresh();
            }
        }, 30000);
    }

    private handleApprovalUpdate(payload: any): void {
        if (payload.approval_request) {
            const request = payload.approval_request as ApprovalRequest;
            this.approvalRequests.set(request.id, request);
            this._onDidChangeTreeData.fire();
        }
    }

    public async refresh(): Promise<void> {
        if (!this.connectionManager.isConnected()) {
            return;
        }

        try {
            const response = await this.connectionManager.get<PaginatedResponse<ApprovalRequest>>('/approvals/pending');
            
            if (response.success && response.data) {
                this.approvalRequests.clear();
                response.data.items.forEach(request => {
                    this.approvalRequests.set(request.id, request);
                });
                this._onDidChangeTreeData.fire();
            }
        } catch (error) {
            console.error('Failed to refresh approval queue:', error);
            vscode.window.showErrorMessage('Failed to refresh approval queue');
        }
    }

    public getTreeItem(element: ApprovalQueueItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ApprovalQueueItem): Thenable<ApprovalQueueItem[]> {
        if (!this.connectionManager.isConnected()) {
            return Promise.resolve([new ApprovalQueueItem(
                'Not Connected',
                'Connect to Lattice Engine to view approval requests',
                vscode.TreeItemCollapsibleState.None,
                'disconnected'
            )]);
        }

        if (!element) {
            // Root level - show approval requests
            const items: ApprovalQueueItem[] = [];
            
            if (this.approvalRequests.size === 0) {
                items.push(new ApprovalQueueItem(
                    'No Pending Approvals',
                    'All changes have been processed',
                    vscode.TreeItemCollapsibleState.None,
                    'empty'
                ));
            } else {
                // Group by priority and status
                const sortedRequests = Array.from(this.approvalRequests.values())
                    .sort((a, b) => {
                        // Sort by priority first, then by creation time
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        const aPriority = priorityOrder[a.priority] ?? 3;
                        const bPriority = priorityOrder[b.priority] ?? 3;
                        
                        if (aPriority !== bPriority) {
                            return aPriority - bPriority;
                        }
                        
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    });

                sortedRequests.forEach(request => {
                    items.push(new ApprovalQueueItem(
                        this.getRequestTitle(request),
                        this.getRequestDescription(request),
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'approval-request',
                        request
                    ));
                });
            }
            
            return Promise.resolve(items);
        } else if (element.type === 'approval-request' && element.approvalRequest) {
            // Show details of the approval request
            return Promise.resolve(this.getApprovalRequestChildren(element.approvalRequest));
        } else if (element.type === 'file-changes' && element.approvalRequest) {
            // Show file changes
            return Promise.resolve(this.getFileChangesChildren(element.approvalRequest));
        } else if (element.type === 'file-change' && element.fileChange) {
            // Show line changes for a specific file
            return Promise.resolve(this.getLineChangesChildren(element.fileChange));
        }

        return Promise.resolve([]);
    }

    private getApprovalRequestChildren(request: ApprovalRequest): ApprovalQueueItem[] {
        const items: ApprovalQueueItem[] = [];

        // Request info
        items.push(new ApprovalQueueItem(
            `ID: ${request.id}`,
            'Request identifier',
            vscode.TreeItemCollapsibleState.None,
            'info'
        ));

        items.push(new ApprovalQueueItem(
            `Priority: ${request.priority.toUpperCase()}`,
            'Request priority level',
            vscode.TreeItemCollapsibleState.None,
            'priority',
            undefined,
            undefined,
            this.getPriorityIcon(request.priority)
        ));

        items.push(new ApprovalQueueItem(
            `Status: ${request.status}`,
            'Current request status',
            vscode.TreeItemCollapsibleState.None,
            'status'
        ));

        items.push(new ApprovalQueueItem(
            `Created: ${new Date(request.createdAt).toLocaleString()}`,
            'Request creation time',
            vscode.TreeItemCollapsibleState.None,
            'timestamp'
        ));

        if (request.expiresAt) {
            const expiresAt = new Date(request.expiresAt);
            const isExpired = expiresAt < new Date();
            items.push(new ApprovalQueueItem(
                `Expires: ${expiresAt.toLocaleString()}`,
                isExpired ? 'Request has expired' : 'Request expiration time',
                vscode.TreeItemCollapsibleState.None,
                isExpired ? 'expired' : 'timestamp'
            ));
        }

        // Description
        if (request.description) {
            items.push(new ApprovalQueueItem(
                'Description',
                request.description,
                vscode.TreeItemCollapsibleState.None,
                'description'
            ));
        }

        // File changes
        if (request.changes && request.changes.length > 0) {
            items.push(new ApprovalQueueItem(
                `File Changes (${request.changes.length})`,
                'Files modified in this request',
                vscode.TreeItemCollapsibleState.Collapsed,
                'file-changes',
                request
            ));
        }

        // Actions
        items.push(new ApprovalQueueItem(
            'Actions',
            'Available actions for this request',
            vscode.TreeItemCollapsibleState.Expanded,
            'actions',
            request
        ));

        return items;
    }

    private getFileChangesChildren(request: ApprovalRequest): ApprovalQueueItem[] {
        if (!request.changes) {
            return [];
        }

        return request.changes.map(change => {
            const fileName = path.basename(change.filePath);
            const changeCount = change.lineChanges?.length || 0;
            
            return new ApprovalQueueItem(
                fileName,
                `${change.filePath} (${changeCount} changes)`,
                changeCount > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                'file-change',
                undefined,
                change,
                this.getChangeTypeIcon(change.changeType)
            );
        });
    }

    private getLineChangesChildren(fileChange: FileChange): ApprovalQueueItem[] {
        if (!fileChange.lineChanges) {
            return [];
        }

        return fileChange.lineChanges.map(lineChange => {
            const title = `Line ${lineChange.lineNumber}: ${lineChange.changeType}`;
            const description = lineChange.newContent || lineChange.oldContent || '';
            
            return new ApprovalQueueItem(
                title,
                description,
                vscode.TreeItemCollapsibleState.None,
                'line-change',
                undefined,
                undefined,
                this.getChangeTypeIcon(lineChange.changeType)
            );
        });
    }

    private getRequestTitle(request: ApprovalRequest): string {
        const fileCount = request.changes?.length || 0;
        const priorityIcon = this.getPriorityEmoji(request.priority);
        return `${priorityIcon} ${request.title || `Request ${request.id.substring(0, 8)}`} (${fileCount} files)`;
    }

    private getRequestDescription(request: ApprovalRequest): string {
        const timeAgo = this.getTimeAgo(new Date(request.createdAt));
        return `${request.description || 'No description'} • ${timeAgo}`;
    }

    private getPriorityIcon(priority: string): vscode.ThemeIcon {
        switch (priority) {
            case 'high':
                return new vscode.ThemeIcon('warning', new vscode.ThemeColor('errorForeground'));
            case 'medium':
                return new vscode.ThemeIcon('info', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
            case 'low':
                return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('foreground'));
            default:
                return new vscode.ThemeIcon('circle-outline');
        }
    }

    private getPriorityEmoji(priority: string): string {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    }

    private getChangeTypeIcon(changeType: ChangeType): vscode.ThemeIcon {
        switch (changeType) {
            case ChangeType.ADDED:
                return new vscode.ThemeIcon('add', new vscode.ThemeColor('gitDecoration.addedResourceForeground'));
            case ChangeType.MODIFIED:
                return new vscode.ThemeIcon('edit', new vscode.ThemeColor('gitDecoration.modifiedResourceForeground'));
            case ChangeType.DELETED:
                return new vscode.ThemeIcon('remove', new vscode.ThemeColor('gitDecoration.deletedResourceForeground'));
            default:
                return new vscode.ThemeIcon('file');
        }
    }

    private getTimeAgo(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // Public methods for commands
    public async approveRequest(requestId: string): Promise<void> {
        try {
            const response = await this.connectionManager.post<ApprovalResponse>(`/approvals/${requestId}/approve`);
            
            if (response.success) {
                vscode.window.showInformationMessage(`Approval request ${requestId} approved successfully`);
                this.refresh();
            } else {
                vscode.window.showErrorMessage(`Failed to approve request: ${response.error}`);
            }
        } catch (error) {
            console.error('Failed to approve request:', error);
            vscode.window.showErrorMessage('Failed to approve request');
        }
    }

    public async rejectRequest(requestId: string, reason?: string): Promise<void> {
        try {
            const response = await this.connectionManager.post<ApprovalResponse>(`/approvals/${requestId}/reject`, {
                reason: reason || 'Rejected by user'
            });
            
            if (response.success) {
                vscode.window.showInformationMessage(`Approval request ${requestId} rejected`);
                this.refresh();
            } else {
                vscode.window.showErrorMessage(`Failed to reject request: ${response.error}`);
            }
        } catch (error) {
            console.error('Failed to reject request:', error);
            vscode.window.showErrorMessage('Failed to reject request');
        }
    }

    public async viewRequestDetails(requestId: string): Promise<void> {
        const request = this.approvalRequests.get(requestId);
        if (!request) {
            vscode.window.showErrorMessage('Request not found');
            return;
        }

        // Open a new document with request details
        const content = this.formatRequestDetails(request);
        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    }

    private formatRequestDetails(request: ApprovalRequest): string {
        let content = `# Approval Request: ${request.title || request.id}\n\n`;
        
        content += `**ID:** ${request.id}\n`;
        content += `**Priority:** ${request.priority.toUpperCase()}\n`;
        content += `**Status:** ${request.status}\n`;
        content += `**Created:** ${new Date(request.createdAt).toLocaleString()}\n`;
        
        if (request.expiresAt) {
            content += `**Expires:** ${new Date(request.expiresAt).toLocaleString()}\n`;
        }
        
        if (request.description) {
            content += `\n**Description:**\n${request.description}\n`;
        }

        if (request.changes && request.changes.length > 0) {
            content += `\n## File Changes (${request.changes.length})\n\n`;
            
            request.changes.forEach(change => {
                content += `### ${change.filePath}\n`;
                content += `**Change Type:** ${change.changeType}\n`;
                
                if (change.lineChanges && change.lineChanges.length > 0) {
                    content += `**Line Changes:** ${change.lineChanges.length}\n\n`;
                    
                    change.lineChanges.forEach(lineChange => {
                        content += `**Line ${lineChange.lineNumber}** (${lineChange.changeType}):\n`;
                        if (lineChange.oldContent) {
                            content += `- ${lineChange.oldContent}\n`;
                        }
                        if (lineChange.newContent) {
                            content += `+ ${lineChange.newContent}\n`;
                        }
                        content += '\n';
                    });
                }
            });
        }

        return content;
    }

    public dispose(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this._onDidChangeTreeData.dispose();
    }
}

export class ApprovalQueueItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: string,
        public readonly approvalRequest?: ApprovalRequest,
        public readonly fileChange?: FileChange,
        public readonly iconPath?: vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
        
        this.tooltip = tooltip;
        this.contextValue = type;
        
        if (iconPath) {
            this.iconPath = iconPath;
        }

        // Add commands for actionable items
        if (type === 'approval-request' && approvalRequest) {
            this.command = {
                command: 'lattice.viewRequestDetails',
                title: 'View Details',
                arguments: [approvalRequest.id]
            };
        } else if (type === 'file-change' && fileChange) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [vscode.Uri.file(fileChange.filePath)]
            };
        }
    }
}