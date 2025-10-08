import * as vscode from 'vscode';
import * as path from 'path';
import { 
    ChangeHistory, 
    ApprovalStatus, 
    TreeViewItem, 
    FileChange,
    ChangeType,
    ApiResponse,
    PaginatedResponse
} from '../types';
import { LatticeConnectionManager } from './connectionManager';

export class ChangeHistoryProvider implements vscode.TreeDataProvider<ChangeHistoryItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangeHistoryItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private changeHistory: ChangeHistory[] = [];
    private currentPage = 1;
    private readonly pageSize = 50;
    private hasMorePages = true;
    private isLoading = false;

    constructor(
        private context: vscode.ExtensionContext,
        private connectionManager: LatticeConnectionManager
    ) {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Listen for connection status changes
        this.connectionManager.onConnectionStatusChanged((connected) => {
            if (connected) {
                this.refresh();
            } else {
                this.changeHistory = [];
                this._onDidChangeTreeData.fire();
            }
        });

        // Listen for real-time updates
        this.connectionManager.onMessage((message) => {
            if (message.type === 'approval_completed' || message.type === 'change_history_update') {
                this.refresh();
            }
        });
    }

    public async refresh(): Promise<void> {
        if (!this.connectionManager.isConnected() || this.isLoading) {
            return;
        }

        try {
            this.isLoading = true;
            this.currentPage = 1;
            this.hasMorePages = true;
            
            const response = await this.connectionManager.get<PaginatedResponse<ChangeHistory>>(
                `/approvals/history?page=${this.currentPage}&limit=${this.pageSize}`
            );
            
            if (response.success && response.data) {
                this.changeHistory = response.data.items;
                this.hasMorePages = response.data.hasMore;
                this._onDidChangeTreeData.fire();
            }
        } catch (error) {
            console.error('Failed to refresh change history:', error);
            vscode.window.showErrorMessage('Failed to refresh change history');
        } finally {
            this.isLoading = false;
        }
    }

    public async loadMore(): Promise<void> {
        if (!this.connectionManager.isConnected() || this.isLoading || !this.hasMorePages) {
            return;
        }

        try {
            this.isLoading = true;
            this.currentPage++;
            
            const response = await this.connectionManager.get<PaginatedResponse<ChangeHistory>>(
                `/approvals/history?page=${this.currentPage}&limit=${this.pageSize}`
            );
            
            if (response.success && response.data) {
                this.changeHistory.push(...response.data.items);
                this.hasMorePages = response.data.hasMore;
                this._onDidChangeTreeData.fire();
            }
        } catch (error) {
            console.error('Failed to load more history:', error);
            vscode.window.showErrorMessage('Failed to load more history');
        } finally {
            this.isLoading = false;
        }
    }

    public getTreeItem(element: ChangeHistoryItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ChangeHistoryItem): Thenable<ChangeHistoryItem[]> {
        if (!this.connectionManager.isConnected()) {
            return Promise.resolve([new ChangeHistoryItem(
                'Not Connected',
                'Connect to Lattice Engine to view change history',
                vscode.TreeItemCollapsibleState.None,
                'disconnected'
            )]);
        }

        if (!element) {
            // Root level - show change history grouped by date
            return Promise.resolve(this.getGroupedHistory());
        } else if (element.type === 'date-group') {
            // Show changes for a specific date
            return Promise.resolve(this.getChangesForDate(element.date!));
        } else if (element.type === 'change-history' && element.changeHistory) {
            // Show details of a specific change
            return Promise.resolve(this.getChangeHistoryChildren(element.changeHistory));
        } else if (element.type === 'file-changes' && element.changeHistory) {
            // Show file changes
            return Promise.resolve(this.getFileChangesChildren(element.changeHistory));
        } else if (element.type === 'file-change' && element.fileChange) {
            // Show line changes for a specific file
            return Promise.resolve(this.getLineChangesChildren(element.fileChange));
        }

        return Promise.resolve([]);
    }

    private getGroupedHistory(): ChangeHistoryItem[] {
        const items: ChangeHistoryItem[] = [];

        if (this.changeHistory.length === 0) {
            if (this.isLoading) {
                items.push(new ChangeHistoryItem(
                    'Loading...',
                    'Loading change history',
                    vscode.TreeItemCollapsibleState.None,
                    'loading'
                ));
            } else {
                items.push(new ChangeHistoryItem(
                    'No History',
                    'No change history available',
                    vscode.TreeItemCollapsibleState.None,
                    'empty'
                ));
            }
            return items;
        }

        // Group changes by date
        const groupedByDate = new Map<string, ChangeHistory[]>();
        
        this.changeHistory.forEach(change => {
            const date = new Date(change.completedAt || change.createdAt).toDateString();
            if (!groupedByDate.has(date)) {
                groupedByDate.set(date, []);
            }
            groupedByDate.get(date)!.push(change);
        });

        // Sort dates in descending order (most recent first)
        const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
        );

        sortedDates.forEach(date => {
            const changes = groupedByDate.get(date)!;
            const approvedCount = changes.filter(c => c.status === ApprovalStatus.APPROVED).length;
            const rejectedCount = changes.filter(c => c.status === ApprovalStatus.REJECTED).length;
            
            items.push(new ChangeHistoryItem(
                this.formatDateLabel(date),
                `${changes.length} changes (${approvedCount} approved, ${rejectedCount} rejected)`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'date-group',
                undefined,
                undefined,
                date
            ));
        });

        // Add "Load More" button if there are more pages
        if (this.hasMorePages && !this.isLoading) {
            items.push(new ChangeHistoryItem(
                'Load More...',
                'Load more change history',
                vscode.TreeItemCollapsibleState.None,
                'load-more'
            ));
        }

        return items;
    }

    private getChangesForDate(date: string): ChangeHistoryItem[] {
        const changesForDate = this.changeHistory.filter(change => 
            new Date(change.completedAt || change.createdAt).toDateString() === date
        );

        // Sort by completion time (most recent first)
        changesForDate.sort((a, b) => {
            const aTime = new Date(a.completedAt || a.createdAt).getTime();
            const bTime = new Date(b.completedAt || b.createdAt).getTime();
            return bTime - aTime;
        });

        return changesForDate.map(change => {
            const fileCount = change.changes?.length || 0;
            const statusIcon = this.getStatusIcon(change.status);
            
            return new ChangeHistoryItem(
                `${statusIcon} ${change.title || `Change ${change.id.substring(0, 8)}`}`,
                `${fileCount} files • ${this.getTimeAgo(new Date(change.completedAt || change.createdAt))}`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'change-history',
                change
            );
        });
    }

    private getChangeHistoryChildren(change: ChangeHistory): ChangeHistoryItem[] {
        const items: ChangeHistoryItem[] = [];

        // Change info
        items.push(new ChangeHistoryItem(
            `ID: ${change.id}`,
            'Change identifier',
            vscode.TreeItemCollapsibleState.None,
            'info'
        ));

        items.push(new ChangeHistoryItem(
            `Status: ${change.status}`,
            'Final status of the change',
            vscode.TreeItemCollapsibleState.None,
            'status',
            undefined,
            undefined,
            undefined,
            this.getStatusIcon(change.status)
        ));

        items.push(new ChangeHistoryItem(
            `Created: ${new Date(change.createdAt).toLocaleString()}`,
            'Change creation time',
            vscode.TreeItemCollapsibleState.None,
            'timestamp'
        ));

        if (change.completedAt) {
            items.push(new ChangeHistoryItem(
                `Completed: ${new Date(change.completedAt).toLocaleString()}`,
                'Change completion time',
                vscode.TreeItemCollapsibleState.None,
                'timestamp'
            ));
        }

        if (change.approvedBy) {
            items.push(new ChangeHistoryItem(
                `Approved by: ${change.approvedBy}`,
                'User who approved the change',
                vscode.TreeItemCollapsibleState.None,
                'user'
            ));
        }

        if (change.rejectedBy) {
            items.push(new ChangeHistoryItem(
                `Rejected by: ${change.rejectedBy}`,
                'User who rejected the change',
                vscode.TreeItemCollapsibleState.None,
                'user'
            ));
        }

        if (change.rejectionReason) {
            items.push(new ChangeHistoryItem(
                'Rejection Reason',
                change.rejectionReason,
                vscode.TreeItemCollapsibleState.None,
                'reason'
            ));
        }

        // Description
        if (change.description) {
            items.push(new ChangeHistoryItem(
                'Description',
                change.description,
                vscode.TreeItemCollapsibleState.None,
                'description'
            ));
        }

        // File changes
        if (change.changes && change.changes.length > 0) {
            items.push(new ChangeHistoryItem(
                `File Changes (${change.changes.length})`,
                'Files modified in this change',
                vscode.TreeItemCollapsibleState.Collapsed,
                'file-changes',
                change
            ));
        }

        return items;
    }

    private getFileChangesChildren(change: ChangeHistory): ChangeHistoryItem[] {
        if (!change.changes) {
            return [];
        }

        return change.changes.map(fileChange => {
            const fileName = path.basename(fileChange.filePath);
            const changeCount = fileChange.lineChanges?.length || 0;
            
            return new ChangeHistoryItem(
                fileName,
                `${fileChange.filePath} (${changeCount} changes)`,
                changeCount > 0 ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                'file-change',
                undefined,
                fileChange,
                undefined,
                this.getChangeTypeIcon(fileChange.changeType)
            );
        });
    }

    private getLineChangesChildren(fileChange: FileChange): ChangeHistoryItem[] {
        if (!fileChange.lineChanges) {
            return [];
        }

        return fileChange.lineChanges.map(lineChange => {
            const title = `Line ${lineChange.lineNumber}: ${lineChange.changeType}`;
            const description = lineChange.newContent || lineChange.oldContent || '';
            
            return new ChangeHistoryItem(
                title,
                description,
                vscode.TreeItemCollapsibleState.None,
                'line-change',
                undefined,
                undefined,
                undefined,
                this.getChangeTypeIcon(lineChange.changeType)
            );
        });
    }

    private formatDateLabel(dateString: string): string {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    private getStatusIcon(status: ApprovalStatus): string {
        switch (status) {
            case ApprovalStatus.APPROVED:
                return '✅';
            case ApprovalStatus.REJECTED:
                return '❌';
            case ApprovalStatus.PENDING:
                return '⏳';
            case ApprovalStatus.EXPIRED:
                return '⏰';
            default:
                return '❓';
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
    public async filterByStatus(status?: ApprovalStatus): Promise<void> {
        if (!this.connectionManager.isConnected()) {
            return;
        }

        try {
            this.isLoading = true;
            this.currentPage = 1;
            this.hasMorePages = true;
            
            let endpoint = `/approvals/history?page=${this.currentPage}&limit=${this.pageSize}`;
            if (status) {
                endpoint += `&status=${status}`;
            }
            
            const response = await this.connectionManager.get<PaginatedResponse<ChangeHistory>>(endpoint);
            
            if (response.success && response.data) {
                this.changeHistory = response.data.items;
                this.hasMorePages = response.data.hasMore;
                this._onDidChangeTreeData.fire();
            }
        } catch (error) {
            console.error('Failed to filter change history:', error);
            vscode.window.showErrorMessage('Failed to filter change history');
        } finally {
            this.isLoading = false;
        }
    }

    public async searchHistory(query: string): Promise<void> {
        if (!this.connectionManager.isConnected()) {
            return;
        }

        try {
            this.isLoading = true;
            this.currentPage = 1;
            this.hasMorePages = true;
            
            const endpoint = `/approvals/history/search?q=${encodeURIComponent(query)}&page=${this.currentPage}&limit=${this.pageSize}`;
            
            const response = await this.connectionManager.get<PaginatedResponse<ChangeHistory>>(endpoint);
            
            if (response.success && response.data) {
                this.changeHistory = response.data.items;
                this.hasMorePages = response.data.hasMore;
                this._onDidChangeTreeData.fire();
            }
        } catch (error) {
            console.error('Failed to search change history:', error);
            vscode.window.showErrorMessage('Failed to search change history');
        } finally {
            this.isLoading = false;
        }
    }

    public async exportHistory(): Promise<void> {
        if (this.changeHistory.length === 0) {
            vscode.window.showInformationMessage('No history to export');
            return;
        }

        try {
            const content = this.formatHistoryForExport();
            const doc = await vscode.workspace.openTextDocument({
                content,
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(doc);
            
            const saveUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('lattice-change-history.md'),
                filters: {
                    'Markdown': ['md'],
                    'All Files': ['*']
                }
            });
            
            if (saveUri) {
                await vscode.workspace.fs.writeFile(saveUri, Buffer.from(content, 'utf8'));
                vscode.window.showInformationMessage(`History exported to ${saveUri.fsPath}`);
            }
        } catch (error) {
            console.error('Failed to export history:', error);
            vscode.window.showErrorMessage('Failed to export history');
        }
    }

    private formatHistoryForExport(): string {
        let content = `# Lattice Change History\n\n`;
        content += `Generated on: ${new Date().toLocaleString()}\n`;
        content += `Total changes: ${this.changeHistory.length}\n\n`;

        // Group by date for export
        const groupedByDate = new Map<string, ChangeHistory[]>();
        
        this.changeHistory.forEach(change => {
            const date = new Date(change.completedAt || change.createdAt).toDateString();
            if (!groupedByDate.has(date)) {
                groupedByDate.set(date, []);
            }
            groupedByDate.get(date)!.push(change);
        });

        const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
        );

        sortedDates.forEach(date => {
            const changes = groupedByDate.get(date)!;
            content += `## ${this.formatDateLabel(date)}\n\n`;
            
            changes.forEach(change => {
                content += `### ${change.title || `Change ${change.id}`}\n\n`;
                content += `- **ID:** ${change.id}\n`;
                content += `- **Status:** ${change.status}\n`;
                content += `- **Created:** ${new Date(change.createdAt).toLocaleString()}\n`;
                
                if (change.completedAt) {
                    content += `- **Completed:** ${new Date(change.completedAt).toLocaleString()}\n`;
                }
                
                if (change.approvedBy) {
                    content += `- **Approved by:** ${change.approvedBy}\n`;
                }
                
                if (change.rejectedBy) {
                    content += `- **Rejected by:** ${change.rejectedBy}\n`;
                }
                
                if (change.description) {
                    content += `- **Description:** ${change.description}\n`;
                }
                
                if (change.changes && change.changes.length > 0) {
                    content += `- **Files changed:** ${change.changes.length}\n`;
                    change.changes.forEach(fileChange => {
                        content += `  - ${fileChange.filePath} (${fileChange.changeType})\n`;
                    });
                }
                
                content += '\n';
            });
        });

        return content;
    }

    public dispose(): void {
        this._onDidChangeTreeData.dispose();
    }
}

export class ChangeHistoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: string,
        public readonly changeHistory?: ChangeHistory,
        public readonly fileChange?: FileChange,
        public readonly date?: string,
        public readonly iconPath?: vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
        
        this.tooltip = tooltip;
        this.contextValue = type;
        
        if (iconPath) {
            this.iconPath = iconPath;
        }

        // Add commands for actionable items
        if (type === 'load-more') {
            this.command = {
                command: 'lattice.loadMoreHistory',
                title: 'Load More',
                arguments: []
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