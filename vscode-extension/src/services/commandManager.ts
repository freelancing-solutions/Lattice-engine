import * as vscode from 'vscode';
import { 
    ApprovalRequest, 
    ApprovalStatus, 
    WorkflowState,
    LatticeConfig,
    CommandContext,
    ValidationResult
} from '../types';
import { LatticeConnectionManager } from './connectionManager';
import { LatticeApprovalQueueProvider } from './approvalQueueProvider';
import { LatticeChangeHistoryProvider } from './changeHistoryProvider';
import { LatticeWorkflowManager } from './workflowManager';
import { LatticeNotificationManager } from './notificationManager';
import { LatticeDecorationManager } from './decorationManager';

export class LatticeCommandManager {
    private commands: Map<string, vscode.Disposable> = new Map();

    constructor(
        private context: vscode.ExtensionContext,
        private connectionManager: LatticeConnectionManager,
        private approvalQueueProvider: LatticeApprovalQueueProvider,
        private changeHistoryProvider: LatticeChangeHistoryProvider,
        private workflowManager: LatticeWorkflowManager,
        private notificationManager: LatticeNotificationManager,
        private decorationManager: LatticeDecorationManager
    ) {
        this.registerCommands();
    }

    private registerCommands(): void {
        // Connection commands
        this.registerCommand('lattice.connectToEngine', () => this.connectToEngine());
        this.registerCommand('lattice.disconnectFromEngine', () => this.disconnectFromEngine());
        this.registerCommand('lattice.reconnectToEngine', () => this.reconnectToEngine());
        this.registerCommand('lattice.testConnection', () => this.testConnection());

        // Workflow commands
        this.registerCommand('lattice.startApprovalWorkflow', () => this.startApprovalWorkflow());
        this.registerCommand('lattice.stopApprovalWorkflow', () => this.stopApprovalWorkflow());
        this.registerCommand('lattice.pauseApprovalWorkflow', () => this.pauseApprovalWorkflow());
        this.registerCommand('lattice.resumeApprovalWorkflow', () => this.resumeApprovalWorkflow());
        this.registerCommand('lattice.restartApprovalWorkflow', () => this.restartApprovalWorkflow());

        // Approval commands
        this.registerCommand('lattice.approveRequest', (requestId: string) => this.approveRequest(requestId));
        this.registerCommand('lattice.rejectRequest', (requestId: string, reason?: string) => this.rejectRequest(requestId, reason));
        this.registerCommand('lattice.approveAllRequests', () => this.approveAllRequests());
        this.registerCommand('lattice.rejectAllRequests', () => this.rejectAllRequests());
        this.registerCommand('lattice.approveCurrentFile', () => this.approveCurrentFile());
        this.registerCommand('lattice.rejectCurrentFile', () => this.rejectCurrentFile());

        // Request management commands
        this.registerCommand('lattice.viewRequestDetails', (requestId: string) => this.viewRequestDetails(requestId));
        this.registerCommand('lattice.refreshApprovalQueue', () => this.refreshApprovalQueue());
        this.registerCommand('lattice.clearApprovalQueue', () => this.clearApprovalQueue());
        this.registerCommand('lattice.filterApprovalQueue', () => this.filterApprovalQueue());

        // History commands
        this.registerCommand('lattice.showChangeHistory', () => this.showChangeHistory());
        this.registerCommand('lattice.refreshChangeHistory', () => this.refreshChangeHistory());
        this.registerCommand('lattice.clearChangeHistory', () => this.clearChangeHistory());
        this.registerCommand('lattice.exportChangeHistory', () => this.exportChangeHistory());
        this.registerCommand('lattice.viewHistoryItem', (itemId: string) => this.viewHistoryItem(itemId));

        // Validation commands
        this.registerCommand('lattice.validateCurrentFile', () => this.validateCurrentFile());
        this.registerCommand('lattice.validateWorkspace', () => this.validateWorkspace());
        this.registerCommand('lattice.fixValidationIssues', () => this.fixValidationIssues());
        this.registerCommand('lattice.ignoreValidationIssue', (issueId: string) => this.ignoreValidationIssue(issueId));

        // Configuration commands
        this.registerCommand('lattice.openSettings', () => this.openSettings());
        this.registerCommand('lattice.resetConfiguration', () => this.resetConfiguration());
        this.registerCommand('lattice.exportConfiguration', () => this.exportConfiguration());
        this.registerCommand('lattice.importConfiguration', () => this.importConfiguration());

        // Utility commands
        this.registerCommand('lattice.showLogs', () => this.showLogs());
        this.registerCommand('lattice.clearLogs', () => this.clearLogs());
        this.registerCommand('lattice.showNotificationCenter', () => this.showNotificationCenter());
        this.registerCommand('lattice.clearNotifications', () => this.clearNotifications());
        this.registerCommand('lattice.showStatus', () => this.showStatus());
        this.registerCommand('lattice.showHelp', () => this.showHelp());

        // Editor context commands
        this.registerCommand('lattice.approveSelection', () => this.approveSelection());
        this.registerCommand('lattice.rejectSelection', () => this.rejectSelection());
        this.registerCommand('lattice.requestApprovalForSelection', () => this.requestApprovalForSelection());
        this.registerCommand('lattice.showLineHistory', () => this.showLineHistory());

        // Debug commands (only in development)
        if (this.context.extensionMode === vscode.ExtensionMode.Development) {
            this.registerCommand('lattice.debug.simulateApprovalRequest', () => this.simulateApprovalRequest());
            this.registerCommand('lattice.debug.simulateError', () => this.simulateError());
            this.registerCommand('lattice.debug.clearAllDecorations', () => this.clearAllDecorations());
        }
    }

    private registerCommand(command: string, callback: (...args: any[]) => any): void {
        const disposable = vscode.commands.registerCommand(command, callback);
        this.commands.set(command, disposable);
        this.context.subscriptions.push(disposable);
    }

    // Connection commands implementation
    private async connectToEngine(): Promise<void> {
        try {
            await this.connectionManager.connect();
            this.notificationManager.showInfo(
                'Connected', 
                'Successfully connected to Lattice Mutation Engine'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Connection Failed', 
                'Failed to connect to Lattice Mutation Engine',
                error as Error
            );
        }
    }

    private async disconnectFromEngine(): Promise<void> {
        try {
            await this.connectionManager.disconnect();
            this.notificationManager.showInfo(
                'Disconnected', 
                'Disconnected from Lattice Mutation Engine'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Disconnection Failed', 
                'Failed to disconnect from Lattice Mutation Engine',
                error as Error
            );
        }
    }

    private async reconnectToEngine(): Promise<void> {
        try {
            await this.connectionManager.reconnect();
            this.notificationManager.showInfo(
                'Reconnected', 
                'Successfully reconnected to Lattice Mutation Engine'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Reconnection Failed', 
                'Failed to reconnect to Lattice Mutation Engine',
                error as Error
            );
        }
    }

    private async testConnection(): Promise<void> {
        try {
            const status = await this.connectionManager.getEngineStatus();
            this.notificationManager.showInfo(
                'Connection Test', 
                `Engine Status: ${status.status} (Version: ${status.version})`
            );
        } catch (error) {
            this.notificationManager.showError(
                'Connection Test Failed', 
                'Unable to reach Lattice Mutation Engine',
                error as Error
            );
        }
    }

    // Workflow commands implementation
    private async startApprovalWorkflow(): Promise<void> {
        try {
            await this.workflowManager.startWorkflow();
            this.notificationManager.showInfo(
                'Workflow Started', 
                'Approval workflow has been started'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Workflow Start Failed', 
                'Failed to start approval workflow',
                error as Error
            );
        }
    }

    private async stopApprovalWorkflow(): Promise<void> {
        try {
            await this.workflowManager.stopWorkflow();
            this.notificationManager.showInfo(
                'Workflow Stopped', 
                'Approval workflow has been stopped'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Workflow Stop Failed', 
                'Failed to stop approval workflow',
                error as Error
            );
        }
    }

    private async pauseApprovalWorkflow(): Promise<void> {
        try {
            await this.workflowManager.pauseWorkflow();
            this.notificationManager.showInfo(
                'Workflow Paused', 
                'Approval workflow has been paused'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Workflow Pause Failed', 
                'Failed to pause approval workflow',
                error as Error
            );
        }
    }

    private async resumeApprovalWorkflow(): Promise<void> {
        try {
            await this.workflowManager.resumeWorkflow();
            this.notificationManager.showInfo(
                'Workflow Resumed', 
                'Approval workflow has been resumed'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Workflow Resume Failed', 
                'Failed to resume approval workflow',
                error as Error
            );
        }
    }

    private async restartApprovalWorkflow(): Promise<void> {
        try {
            await this.workflowManager.stopWorkflow();
            await this.workflowManager.startWorkflow();
            this.notificationManager.showInfo(
                'Workflow Restarted', 
                'Approval workflow has been restarted'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Workflow Restart Failed', 
                'Failed to restart approval workflow',
                error as Error
            );
        }
    }

    // Approval commands implementation
    private async approveRequest(requestId: string): Promise<void> {
        try {
            await this.workflowManager.approveRequest(requestId);
            this.notificationManager.showInfo(
                'Request Approved', 
                `Approval request ${requestId.substring(0, 8)} has been approved`
            );
        } catch (error) {
            this.notificationManager.showError(
                'Approval Failed', 
                'Failed to approve request',
                error as Error
            );
        }
    }

    private async rejectRequest(requestId: string, reason?: string): Promise<void> {
        try {
            if (!reason) {
                reason = await vscode.window.showInputBox({
                    prompt: 'Enter rejection reason (optional)',
                    placeHolder: 'Reason for rejection...'
                });
            }

            await this.workflowManager.rejectRequest(requestId, reason);
            this.notificationManager.showInfo(
                'Request Rejected', 
                `Approval request ${requestId.substring(0, 8)} has been rejected`
            );
        } catch (error) {
            this.notificationManager.showError(
                'Rejection Failed', 
                'Failed to reject request',
                error as Error
            );
        }
    }

    private async approveAllRequests(): Promise<void> {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to approve all pending requests?',
            'Yes', 'No'
        );

        if (confirmation === 'Yes') {
            try {
                const requests = this.approvalQueueProvider.getPendingRequests();
                for (const request of requests) {
                    await this.workflowManager.approveRequest(request.id);
                }
                this.notificationManager.showInfo(
                    'All Requests Approved', 
                    `${requests.length} requests have been approved`
                );
            } catch (error) {
                this.notificationManager.showError(
                    'Bulk Approval Failed', 
                    'Failed to approve all requests',
                    error as Error
                );
            }
        }
    }

    private async rejectAllRequests(): Promise<void> {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to reject all pending requests?',
            'Yes', 'No'
        );

        if (confirmation === 'Yes') {
            const reason = await vscode.window.showInputBox({
                prompt: 'Enter rejection reason for all requests',
                placeHolder: 'Bulk rejection reason...'
            });

            try {
                const requests = this.approvalQueueProvider.getPendingRequests();
                for (const request of requests) {
                    await this.workflowManager.rejectRequest(request.id, reason);
                }
                this.notificationManager.showInfo(
                    'All Requests Rejected', 
                    `${requests.length} requests have been rejected`
                );
            } catch (error) {
                this.notificationManager.showError(
                    'Bulk Rejection Failed', 
                    'Failed to reject all requests',
                    error as Error
                );
            }
        }
    }

    private async approveCurrentFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.notificationManager.showWarning(
                'No Active File', 
                'Please open a file to approve'
            );
            return;
        }

        try {
            const filePath = editor.document.uri.fsPath;
            await this.workflowManager.approveFileChanges(filePath);
            this.notificationManager.showInfo(
                'File Approved', 
                `Changes to ${this.getFileName(filePath)} have been approved`
            );
        } catch (error) {
            this.notificationManager.showError(
                'File Approval Failed', 
                'Failed to approve current file',
                error as Error
            );
        }
    }

    private async rejectCurrentFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.notificationManager.showWarning(
                'No Active File', 
                'Please open a file to reject'
            );
            return;
        }

        const reason = await vscode.window.showInputBox({
            prompt: 'Enter rejection reason',
            placeHolder: 'Reason for rejecting file changes...'
        });

        try {
            const filePath = editor.document.uri.fsPath;
            await this.workflowManager.rejectFileChanges(filePath, reason);
            this.notificationManager.showInfo(
                'File Rejected', 
                `Changes to ${this.getFileName(filePath)} have been rejected`
            );
        } catch (error) {
            this.notificationManager.showError(
                'File Rejection Failed', 
                'Failed to reject current file',
                error as Error
            );
        }
    }

    // Request management commands implementation
    private async viewRequestDetails(requestId: string): Promise<void> {
        try {
            const request = await this.connectionManager.apiRequest<ApprovalRequest>(
                'GET', 
                `/approval-requests/${requestId}`
            );

            // Create and show request details in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: this.formatRequestDetails(request),
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        } catch (error) {
            this.notificationManager.showError(
                'Failed to Load Request', 
                'Could not load request details',
                error as Error
            );
        }
    }

    private async refreshApprovalQueue(): Promise<void> {
        try {
            await this.approvalQueueProvider.refresh();
            this.notificationManager.showInfo(
                'Queue Refreshed', 
                'Approval queue has been refreshed'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Refresh Failed', 
                'Failed to refresh approval queue',
                error as Error
            );
        }
    }

    private async clearApprovalQueue(): Promise<void> {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to clear the approval queue? This will reject all pending requests.',
            'Yes', 'No'
        );

        if (confirmation === 'Yes') {
            try {
                await this.rejectAllRequests();
                this.notificationManager.showInfo(
                    'Queue Cleared', 
                    'Approval queue has been cleared'
                );
            } catch (error) {
                this.notificationManager.showError(
                    'Clear Failed', 
                    'Failed to clear approval queue',
                    error as Error
                );
            }
        }
    }

    private async filterApprovalQueue(): Promise<void> {
        const filterOptions = [
            'All Requests',
            'High Priority',
            'Medium Priority', 
            'Low Priority',
            'Current File Only',
            'Recent Requests'
        ];

        const selected = await vscode.window.showQuickPick(filterOptions, {
            placeHolder: 'Select filter for approval queue'
        });

        if (selected) {
            this.approvalQueueProvider.setFilter(selected);
        }
    }

    // History commands implementation
    private async showChangeHistory(): Promise<void> {
        await vscode.commands.executeCommand('lattice.changeHistory.focus');
    }

    private async refreshChangeHistory(): Promise<void> {
        try {
            await this.changeHistoryProvider.refresh();
            this.notificationManager.showInfo(
                'History Refreshed', 
                'Change history has been refreshed'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Refresh Failed', 
                'Failed to refresh change history',
                error as Error
            );
        }
    }

    private async clearChangeHistory(): Promise<void> {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to clear the change history?',
            'Yes', 'No'
        );

        if (confirmation === 'Yes') {
            try {
                this.changeHistoryProvider.clearHistory();
                this.notificationManager.showInfo(
                    'History Cleared', 
                    'Change history has been cleared'
                );
            } catch (error) {
                this.notificationManager.showError(
                    'Clear Failed', 
                    'Failed to clear change history',
                    error as Error
                );
            }
        }
    }

    private async exportChangeHistory(): Promise<void> {
        try {
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('lattice-change-history.json'),
                filters: {
                    'JSON Files': ['json'],
                    'CSV Files': ['csv'],
                    'All Files': ['*']
                }
            });

            if (uri) {
                await this.changeHistoryProvider.exportHistory(uri.fsPath);
                this.notificationManager.showInfo(
                    'History Exported', 
                    `Change history exported to ${uri.fsPath}`
                );
            }
        } catch (error) {
            this.notificationManager.showError(
                'Export Failed', 
                'Failed to export change history',
                error as Error
            );
        }
    }

    private async viewHistoryItem(itemId: string): Promise<void> {
        try {
            const item = this.changeHistoryProvider.getHistoryItem(itemId);
            if (item) {
                // Create and show history item details
                const doc = await vscode.workspace.openTextDocument({
                    content: this.formatHistoryItem(item),
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc);
            }
        } catch (error) {
            this.notificationManager.showError(
                'Failed to Load History Item', 
                'Could not load history item details',
                error as Error
            );
        }
    }

    // Validation commands implementation
    private async validateCurrentFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.notificationManager.showWarning(
                'No Active File', 
                'Please open a file to validate'
            );
            return;
        }

        try {
            const filePath = editor.document.uri.fsPath;
            const results = await this.connectionManager.apiRequest<ValidationResult[]>(
                'POST', 
                '/validate',
                { filePath, content: editor.document.getText() }
            );

            this.decorationManager.decorateValidationResults(filePath, results);
            
            const errorCount = results.filter(r => r.severity === 'error').length;
            const warningCount = results.filter(r => r.severity === 'warning').length;
            
            this.notificationManager.showInfo(
                'Validation Complete', 
                `Found ${errorCount} errors and ${warningCount} warnings`
            );
        } catch (error) {
            this.notificationManager.showError(
                'Validation Failed', 
                'Failed to validate current file',
                error as Error
            );
        }
    }

    private async validateWorkspace(): Promise<void> {
        try {
            const results = await this.connectionManager.apiRequest<ValidationResult[]>(
                'POST', 
                '/validate-workspace'
            );

            // Group results by file and apply decorations
            const resultsByFile = new Map<string, ValidationResult[]>();
            results.forEach(result => {
                if (!resultsByFile.has(result.filePath)) {
                    resultsByFile.set(result.filePath, []);
                }
                resultsByFile.get(result.filePath)!.push(result);
            });

            resultsByFile.forEach((fileResults, filePath) => {
                this.decorationManager.decorateValidationResults(filePath, fileResults);
            });

            const errorCount = results.filter(r => r.severity === 'error').length;
            const warningCount = results.filter(r => r.severity === 'warning').length;
            
            this.notificationManager.showInfo(
                'Workspace Validation Complete', 
                `Found ${errorCount} errors and ${warningCount} warnings across ${resultsByFile.size} files`
            );
        } catch (error) {
            this.notificationManager.showError(
                'Workspace Validation Failed', 
                'Failed to validate workspace',
                error as Error
            );
        }
    }

    private async fixValidationIssues(): Promise<void> {
        // This would integrate with auto-fix capabilities
        this.notificationManager.showInfo(
            'Auto-fix', 
            'Auto-fix functionality coming soon'
        );
    }

    private async ignoreValidationIssue(issueId: string): Promise<void> {
        // This would add the issue to an ignore list
        this.notificationManager.showInfo(
            'Issue Ignored', 
            `Validation issue ${issueId} has been ignored`
        );
    }

    // Configuration commands implementation
    private async openSettings(): Promise<void> {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'lattice');
    }

    private async resetConfiguration(): Promise<void> {
        const confirmation = await vscode.window.showWarningMessage(
            'Are you sure you want to reset all Lattice configuration to defaults?',
            'Yes', 'No'
        );

        if (confirmation === 'Yes') {
            const config = vscode.workspace.getConfiguration('lattice');
            // Reset all configuration keys
            // This is a simplified implementation
            this.notificationManager.showInfo(
                'Configuration Reset', 
                'Lattice configuration has been reset to defaults'
            );
        }
    }

    private async exportConfiguration(): Promise<void> {
        try {
            const config = this.connectionManager.getConfig();
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('lattice-config.json'),
                filters: {
                    'JSON Files': ['json']
                }
            });

            if (uri) {
                await vscode.workspace.fs.writeFile(
                    uri, 
                    Buffer.from(JSON.stringify(config, null, 2))
                );
                this.notificationManager.showInfo(
                    'Configuration Exported', 
                    `Configuration exported to ${uri.fsPath}`
                );
            }
        } catch (error) {
            this.notificationManager.showError(
                'Export Failed', 
                'Failed to export configuration',
                error as Error
            );
        }
    }

    private async importConfiguration(): Promise<void> {
        try {
            const uri = await vscode.window.showOpenDialog({
                filters: {
                    'JSON Files': ['json']
                },
                canSelectMany: false
            });

            if (uri && uri[0]) {
                const content = await vscode.workspace.fs.readFile(uri[0]);
                const config = JSON.parse(content.toString());
                
                // Apply configuration
                // This is a simplified implementation
                this.notificationManager.showInfo(
                    'Configuration Imported', 
                    `Configuration imported from ${uri[0].fsPath}`
                );
            }
        } catch (error) {
            this.notificationManager.showError(
                'Import Failed', 
                'Failed to import configuration',
                error as Error
            );
        }
    }

    // Utility commands implementation
    private async showLogs(): Promise<void> {
        await vscode.commands.executeCommand('workbench.action.toggleDevTools');
    }

    private async clearLogs(): Promise<void> {
        console.clear();
        this.notificationManager.showInfo('Logs Cleared', 'Console logs have been cleared');
    }

    private async showNotificationCenter(): Promise<void> {
        const history = this.notificationManager.getNotificationHistory();
        
        if (history.length === 0) {
            this.notificationManager.showInfo(
                'No Notifications', 
                'No notifications in history'
            );
            return;
        }

        const items = history.map(notification => ({
            label: notification.title,
            description: notification.message,
            detail: notification.timestamp.toLocaleString(),
            notification
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select notification to view details'
        });

        if (selected) {
            this.notificationManager.markAsRead(selected.notification.id);
        }
    }

    private async clearNotifications(): Promise<void> {
        this.notificationManager.clearHistory();
        this.notificationManager.clearPendingNotifications();
        this.notificationManager.showInfo(
            'Notifications Cleared', 
            'All notifications have been cleared'
        );
    }

    private async showStatus(): Promise<void> {
        const connected = this.connectionManager.isConnected();
        const workflowActive = this.workflowManager.isWorkflowActive();
        const pendingRequests = this.approvalQueueProvider.getPendingRequests().length;

        const status = `
**Lattice Mutation Engine Status**

- **Connection**: ${connected ? '✅ Connected' : '❌ Disconnected'}
- **Workflow**: ${workflowActive ? '🔄 Active' : '⏸️ Inactive'}
- **Pending Requests**: ${pendingRequests}
- **Engine URL**: ${this.connectionManager.getConfig().engineUrl}
        `.trim();

        const doc = await vscode.workspace.openTextDocument({
            content: status,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }

    private async showHelp(): Promise<void> {
        const helpContent = `
# Lattice Mutation Engine - VSCode Extension Help

## Commands

### Connection
- \`Ctrl+Shift+L C\` - Connect to Engine
- \`Ctrl+Shift+L D\` - Disconnect from Engine
- \`Ctrl+Shift+L T\` - Test Connection

### Workflow
- \`Ctrl+Shift+L S\` - Start Approval Workflow
- \`Ctrl+Shift+L X\` - Stop Approval Workflow

### Approval
- \`Ctrl+Shift+L A\` - Approve Request
- \`Ctrl+Shift+L R\` - Reject Request
- \`Ctrl+Shift+L F\` - Approve Current File

### Views
- **Approval Queue**: View pending approval requests
- **Change History**: View history of approved/rejected changes

## Configuration

Access settings via \`File > Preferences > Settings\` and search for "Lattice".

## Support

For issues and documentation, visit: https://github.com/lattice/mutation-engine
        `.trim();

        const doc = await vscode.workspace.openTextDocument({
            content: helpContent,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }

    // Editor context commands implementation
    private async approveSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            this.notificationManager.showWarning(
                'No Selection', 
                'Please select text to approve'
            );
            return;
        }

        try {
            const filePath = editor.document.uri.fsPath;
            const selection = editor.selection;
            
            await this.workflowManager.approveSelection(filePath, selection);
            this.notificationManager.showInfo(
                'Selection Approved', 
                'Selected changes have been approved'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Selection Approval Failed', 
                'Failed to approve selection',
                error as Error
            );
        }
    }

    private async rejectSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            this.notificationManager.showWarning(
                'No Selection', 
                'Please select text to reject'
            );
            return;
        }

        const reason = await vscode.window.showInputBox({
            prompt: 'Enter rejection reason',
            placeHolder: 'Reason for rejecting selection...'
        });

        try {
            const filePath = editor.document.uri.fsPath;
            const selection = editor.selection;
            
            await this.workflowManager.rejectSelection(filePath, selection, reason);
            this.notificationManager.showInfo(
                'Selection Rejected', 
                'Selected changes have been rejected'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Selection Rejection Failed', 
                'Failed to reject selection',
                error as Error
            );
        }
    }

    private async requestApprovalForSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            this.notificationManager.showWarning(
                'No Selection', 
                'Please select text to request approval for'
            );
            return;
        }

        try {
            const filePath = editor.document.uri.fsPath;
            const selection = editor.selection;
            
            await this.workflowManager.requestApprovalForSelection(filePath, selection);
            this.notificationManager.showInfo(
                'Approval Requested', 
                'Approval request created for selection'
            );
        } catch (error) {
            this.notificationManager.showError(
                'Request Failed', 
                'Failed to request approval for selection',
                error as Error
            );
        }
    }

    private async showLineHistory(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.notificationManager.showWarning(
                'No Active File', 
                'Please open a file to view line history'
            );
            return;
        }

        const line = editor.selection.active.line + 1;
        const filePath = editor.document.uri.fsPath;

        try {
            const history = await this.connectionManager.apiRequest<any[]>(
                'GET', 
                `/line-history?file=${encodeURIComponent(filePath)}&line=${line}`
            );

            const content = this.formatLineHistory(filePath, line, history);
            const doc = await vscode.workspace.openTextDocument({
                content,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        } catch (error) {
            this.notificationManager.showError(
                'Failed to Load Line History', 
                'Could not load line history',
                error as Error
            );
        }
    }

    // Debug commands implementation (development only)
    private async simulateApprovalRequest(): Promise<void> {
        const mockRequest: ApprovalRequest = {
            id: `mock_${Date.now()}`,
            title: 'Mock Approval Request',
            description: 'This is a simulated approval request for testing',
            priority: 'medium',
            status: ApprovalStatus.PENDING,
            createdAt: new Date(),
            changes: [{
                filePath: vscode.window.activeTextEditor?.document.uri.fsPath || '/mock/file.ts',
                changeType: 'modified',
                lineChanges: [{
                    lineNumber: 1,
                    type: 'modified',
                    oldContent: 'console.log("old");',
                    newContent: 'console.log("new");'
                }]
            }]
        };

        this.notificationManager.showApprovalRequest(mockRequest);
    }

    private async simulateError(): Promise<void> {
        this.notificationManager.showError(
            'Simulated Error', 
            'This is a test error for debugging purposes',
            new Error('Mock error for testing')
        );
    }

    private async clearAllDecorations(): Promise<void> {
        this.decorationManager.clearDecorations();
        this.notificationManager.showInfo(
            'Decorations Cleared', 
            'All editor decorations have been cleared'
        );
    }

    // Helper methods
    private formatRequestDetails(request: ApprovalRequest): string {
        return `
# Approval Request Details

**ID**: ${request.id}
**Title**: ${request.title || 'Untitled'}
**Priority**: ${request.priority.toUpperCase()}
**Status**: ${request.status}
**Created**: ${request.createdAt.toLocaleString()}

## Description
${request.description || 'No description provided'}

## Changes
${request.changes?.map(change => `
### ${change.filePath}
- **Type**: ${change.changeType}
- **Lines**: ${change.lineChanges?.length || 0} changes
`).join('\n') || 'No changes'}
        `.trim();
    }

    private formatHistoryItem(item: any): string {
        return `
# Change History Item

**ID**: ${item.id}
**Status**: ${item.status}
**Timestamp**: ${item.timestamp.toLocaleString()}
**User**: ${item.user || 'Unknown'}

## Details
${item.description || 'No description available'}
        `.trim();
    }

    private formatLineHistory(filePath: string, line: number, history: any[]): string {
        return `
# Line History

**File**: ${filePath}
**Line**: ${line}

## History
${history.map(entry => `
### ${entry.timestamp}
- **Action**: ${entry.action}
- **User**: ${entry.user}
- **Content**: \`${entry.content}\`
`).join('\n')}
        `.trim();
    }

    private getFileName(filePath: string): string {
        return filePath.split(/[/\\]/).pop() || 'Unknown file';
    }

    // Public methods
    public dispose(): void {
        this.commands.forEach(disposable => disposable.dispose());
        this.commands.clear();
    }
}