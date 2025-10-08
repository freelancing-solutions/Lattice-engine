import * as vscode from 'vscode';
import * as path from 'path';
import { 
    ApprovalRequest, 
    ApprovalResponse, 
    ApprovalStatus, 
    FileChange,
    LineChange,
    ChangeType,
    WorkflowEvent,
    WorkflowEventType,
    MutationAnalysis,
    ConflictInfo,
    ValidationResult,
    ApiResponse
} from '../types';
import { LatticeConnectionManager } from './connectionManager';

export class LatticeWorkflowManager {
    private activeWorkflows: Map<string, WorkflowSession> = new Map();
    private documentChangeListeners: Map<string, vscode.Disposable> = new Map();
    private workflowTimer?: NodeJS.Timeout;

    // Event emitters
    private workflowEventEmitter = new vscode.EventEmitter<WorkflowEvent>();
    private approvalRequestEmitter = new vscode.EventEmitter<ApprovalRequest>();

    public readonly onWorkflowEvent = this.workflowEventEmitter.event;
    public readonly onApprovalRequest = this.approvalRequestEmitter.event;

    constructor(
        private context: vscode.ExtensionContext,
        private connectionManager: LatticeConnectionManager
    ) {
        this.setupEventListeners();
        this.startWorkflowMonitoring();
    }

    private setupEventListeners(): void {
        // Listen for document changes
        vscode.workspace.onDidChangeTextDocument((event) => {
            this.handleDocumentChange(event);
        });

        // Listen for document saves
        vscode.workspace.onDidSaveTextDocument((document) => {
            this.handleDocumentSave(document);
        });

        // Listen for file system changes
        vscode.workspace.onDidCreateFiles((event) => {
            event.files.forEach(uri => this.handleFileCreate(uri));
        });

        vscode.workspace.onDidDeleteFiles((event) => {
            event.files.forEach(uri => this.handleFileDelete(uri));
        });

        vscode.workspace.onDidRenameFiles((event) => {
            event.files.forEach(rename => this.handleFileRename(rename.oldUri, rename.newUri));
        });

        // Listen for connection status changes
        this.connectionManager.onConnectionStatusChanged((connected) => {
            if (connected) {
                this.syncActiveWorkflows();
            } else {
                this.pauseAllWorkflows();
            }
        });

        // Listen for real-time workflow updates
        this.connectionManager.onMessage((message) => {
            if (message.type === 'workflow_update') {
                this.handleWorkflowUpdate(message.payload);
            }
        });
    }

    private startWorkflowMonitoring(): void {
        // Check for workflow updates every 10 seconds
        this.workflowTimer = setInterval(() => {
            if (this.connectionManager.isConnected()) {
                this.checkWorkflowStatus();
            }
        }, 10000);
    }

    public async startApprovalWorkflow(filePath?: string): Promise<string | undefined> {
        if (!this.connectionManager.isConnected()) {
            vscode.window.showErrorMessage('Not connected to Lattice Engine');
            return;
        }

        try {
            // Get the current active editor or use provided file path
            const activeEditor = vscode.window.activeTextEditor;
            const targetFile = filePath || activeEditor?.document.fileName;

            if (!targetFile) {
                vscode.window.showErrorMessage('No file selected for approval workflow');
                return;
            }

            // Check if there's already an active workflow for this file
            const existingWorkflow = this.findWorkflowByFile(targetFile);
            if (existingWorkflow) {
                vscode.window.showInformationMessage(
                    `Approval workflow already active for ${path.basename(targetFile)}`
                );
                return existingWorkflow.id;
            }

            // Analyze the file for potential mutations
            const analysis = await this.analyzeMutations(targetFile);
            if (!analysis.success) {
                vscode.window.showErrorMessage(`Failed to analyze file: ${analysis.error}`);
                return;
            }

            // Create a new workflow session
            const workflowId = this.generateWorkflowId();
            const session: WorkflowSession = {
                id: workflowId,
                filePath: targetFile,
                status: 'active',
                createdAt: new Date(),
                changes: [],
                pendingApproval: false,
                analysis: analysis.data
            };

            this.activeWorkflows.set(workflowId, session);

            // Start monitoring the file for changes
            this.startFileMonitoring(targetFile, workflowId);

            // Emit workflow started event
            this.workflowEventEmitter.fire({
                type: WorkflowEventType.WORKFLOW_STARTED,
                workflowId,
                filePath: targetFile,
                timestamp: new Date()
            });

            vscode.window.showInformationMessage(
                `Approval workflow started for ${path.basename(targetFile)}`
            );

            return workflowId;

        } catch (error) {
            console.error('Failed to start approval workflow:', error);
            vscode.window.showErrorMessage('Failed to start approval workflow');
            return;
        }
    }

    public async stopApprovalWorkflow(workflowId: string): Promise<void> {
        const session = this.activeWorkflows.get(workflowId);
        if (!session) {
            return;
        }

        try {
            // Stop file monitoring
            this.stopFileMonitoring(session.filePath);

            // Cancel any pending approval requests
            if (session.pendingApprovalId) {
                await this.cancelApprovalRequest(session.pendingApprovalId);
            }

            // Remove the workflow session
            this.activeWorkflows.delete(workflowId);

            // Emit workflow stopped event
            this.workflowEventEmitter.fire({
                type: WorkflowEventType.WORKFLOW_STOPPED,
                workflowId,
                filePath: session.filePath,
                timestamp: new Date()
            });

            vscode.window.showInformationMessage(
                `Approval workflow stopped for ${path.basename(session.filePath)}`
            );

        } catch (error) {
            console.error('Failed to stop approval workflow:', error);
            vscode.window.showErrorMessage('Failed to stop approval workflow');
        }
    }

    private async handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        const filePath = event.document.fileName;
        const workflow = this.findWorkflowByFile(filePath);
        
        if (!workflow || workflow.pendingApproval) {
            return;
        }

        // Collect changes
        const changes: LineChange[] = [];
        
        event.contentChanges.forEach(change => {
            const startLine = change.range.start.line + 1; // Convert to 1-based
            const endLine = change.range.end.line + 1;
            
            if (change.text === '') {
                // Deletion
                for (let line = startLine; line <= endLine; line++) {
                    changes.push({
                        lineNumber: line,
                        changeType: ChangeType.DELETED,
                        oldContent: change.text || '',
                        newContent: ''
                    });
                }
            } else if (change.rangeLength === 0) {
                // Addition
                const newLines = change.text.split('\n');
                newLines.forEach((content, index) => {
                    changes.push({
                        lineNumber: startLine + index,
                        changeType: ChangeType.ADDED,
                        oldContent: '',
                        newContent: content
                    });
                });
            } else {
                // Modification
                changes.push({
                    lineNumber: startLine,
                    changeType: ChangeType.MODIFIED,
                    oldContent: '', // Would need to track original content
                    newContent: change.text
                });
            }
        });

        // Add changes to workflow session
        workflow.changes.push(...changes);

        // Emit change detected event
        this.workflowEventEmitter.fire({
            type: WorkflowEventType.CHANGE_DETECTED,
            workflowId: workflow.id,
            filePath,
            changes,
            timestamp: new Date()
        });
    }

    private async handleDocumentSave(document: vscode.TextDocument): void {
        const filePath = document.fileName;
        const workflow = this.findWorkflowByFile(filePath);
        
        if (!workflow || workflow.changes.length === 0) {
            return;
        }

        // Check if approval is required for these changes
        const requiresApproval = await this.checkApprovalRequired(workflow);
        
        if (requiresApproval) {
            await this.requestApproval(workflow);
        } else {
            // Auto-approve minor changes
            await this.autoApproveChanges(workflow);
        }
    }

    private async handleFileCreate(uri: vscode.Uri): Promise<void> {
        // Check if this file creation should trigger an approval workflow
        const config = this.connectionManager.getConfig();
        if (config.autoConnect) {
            await this.startApprovalWorkflow(uri.fsPath);
        }
    }

    private async handleFileDelete(uri: vscode.Uri): Promise<void> {
        const workflow = this.findWorkflowByFile(uri.fsPath);
        if (workflow) {
            await this.stopApprovalWorkflow(workflow.id);
        }
    }

    private async handleFileRename(oldUri: vscode.Uri, newUri: vscode.Uri): Promise<void> {
        const workflow = this.findWorkflowByFile(oldUri.fsPath);
        if (workflow) {
            // Update the workflow with the new file path
            workflow.filePath = newUri.fsPath;
            this.stopFileMonitoring(oldUri.fsPath);
            this.startFileMonitoring(newUri.fsPath, workflow.id);
        }
    }

    private async requestApproval(workflow: WorkflowSession): Promise<void> {
        if (workflow.pendingApproval) {
            return;
        }

        try {
            workflow.pendingApproval = true;

            // Create file change object
            const fileChange: FileChange = {
                filePath: workflow.filePath,
                changeType: this.determineOverallChangeType(workflow.changes),
                lineChanges: workflow.changes
            };

            // Create approval request
            const approvalRequest: Partial<ApprovalRequest> = {
                title: `Changes to ${path.basename(workflow.filePath)}`,
                description: `${workflow.changes.length} line changes detected`,
                priority: this.determinePriority(workflow),
                changes: [fileChange],
                workflowId: workflow.id
            };

            // Submit approval request
            const response = await this.connectionManager.post<ApprovalRequest>('/approvals', approvalRequest);
            
            if (response.success && response.data) {
                workflow.pendingApprovalId = response.data.id;
                
                // Emit approval requested event
                this.workflowEventEmitter.fire({
                    type: WorkflowEventType.APPROVAL_REQUESTED,
                    workflowId: workflow.id,
                    filePath: workflow.filePath,
                    approvalId: response.data.id,
                    timestamp: new Date()
                });

                // Fire approval request event for UI updates
                this.approvalRequestEmitter.fire(response.data);

                vscode.window.showInformationMessage(
                    `Approval requested for changes to ${path.basename(workflow.filePath)}`,
                    'View Request'
                ).then(selection => {
                    if (selection === 'View Request') {
                        vscode.commands.executeCommand('lattice.viewRequestDetails', response.data!.id);
                    }
                });

            } else {
                throw new Error(response.error || 'Failed to create approval request');
            }

        } catch (error) {
            console.error('Failed to request approval:', error);
            workflow.pendingApproval = false;
            vscode.window.showErrorMessage('Failed to request approval for changes');
        }
    }

    private async autoApproveChanges(workflow: WorkflowSession): Promise<void> {
        try {
            // Clear the changes as they've been auto-approved
            workflow.changes = [];

            // Emit auto-approval event
            this.workflowEventEmitter.fire({
                type: WorkflowEventType.AUTO_APPROVED,
                workflowId: workflow.id,
                filePath: workflow.filePath,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Failed to auto-approve changes:', error);
        }
    }

    private async checkApprovalRequired(workflow: WorkflowSession): Promise<boolean> {
        if (!workflow.analysis) {
            return true; // Default to requiring approval if no analysis
        }

        // Check various factors to determine if approval is required
        const changeCount = workflow.changes.length;
        const hasHighRiskChanges = workflow.changes.some(change => 
            change.changeType === ChangeType.DELETED || 
            (change.newContent && change.newContent.includes('import '))
        );

        // Simple heuristics - can be made more sophisticated
        return changeCount > 5 || hasHighRiskChanges || workflow.analysis.riskLevel === 'high';
    }

    private async analyzeMutations(filePath: string): Promise<ApiResponse<MutationAnalysis>> {
        try {
            const response = await this.connectionManager.post<MutationAnalysis>('/analyze/mutations', {
                filePath: filePath
            });
            return response;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Analysis failed',
                timestamp: new Date()
            };
        }
    }

    private async cancelApprovalRequest(approvalId: string): Promise<void> {
        try {
            await this.connectionManager.delete(`/approvals/${approvalId}`);
        } catch (error) {
            console.error('Failed to cancel approval request:', error);
        }
    }

    private startFileMonitoring(filePath: string, workflowId: string): void {
        // File monitoring is handled by VSCode's document change events
        // This method can be used for additional file-specific monitoring if needed
    }

    private stopFileMonitoring(filePath: string): void {
        const listener = this.documentChangeListeners.get(filePath);
        if (listener) {
            listener.dispose();
            this.documentChangeListeners.delete(filePath);
        }
    }

    private findWorkflowByFile(filePath: string): WorkflowSession | undefined {
        return Array.from(this.activeWorkflows.values()).find(
            workflow => workflow.filePath === filePath
        );
    }

    private determineOverallChangeType(changes: LineChange[]): ChangeType {
        const hasAdditions = changes.some(c => c.changeType === ChangeType.ADDED);
        const hasDeletions = changes.some(c => c.changeType === ChangeType.DELETED);
        const hasModifications = changes.some(c => c.changeType === ChangeType.MODIFIED);

        if (hasAdditions && hasDeletions) {
            return ChangeType.MODIFIED;
        } else if (hasAdditions) {
            return ChangeType.ADDED;
        } else if (hasDeletions) {
            return ChangeType.DELETED;
        } else {
            return ChangeType.MODIFIED;
        }
    }

    private determinePriority(workflow: WorkflowSession): 'high' | 'medium' | 'low' {
        const changeCount = workflow.changes.length;
        const hasHighRiskChanges = workflow.changes.some(change => 
            change.changeType === ChangeType.DELETED ||
            (change.newContent && (
                change.newContent.includes('import ') ||
                change.newContent.includes('export ') ||
                change.newContent.includes('delete ')
            ))
        );

        if (hasHighRiskChanges || changeCount > 20) {
            return 'high';
        } else if (changeCount > 5) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    private generateWorkflowId(): string {
        return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async syncActiveWorkflows(): Promise<void> {
        // Sync active workflows with the server
        try {
            const response = await this.connectionManager.get('/workflows/active');
            if (response.success && response.data) {
                // Handle server-side workflow state
            }
        } catch (error) {
            console.error('Failed to sync workflows:', error);
        }
    }

    private pauseAllWorkflows(): void {
        this.activeWorkflows.forEach(workflow => {
            workflow.status = 'paused';
        });
    }

    private async checkWorkflowStatus(): Promise<void> {
        // Check status of active workflows
        for (const workflow of this.activeWorkflows.values()) {
            if (workflow.pendingApprovalId) {
                try {
                    const response = await this.connectionManager.get<ApprovalRequest>(
                        `/approvals/${workflow.pendingApprovalId}`
                    );
                    
                    if (response.success && response.data) {
                        await this.handleApprovalStatusUpdate(workflow, response.data);
                    }
                } catch (error) {
                    console.error('Failed to check approval status:', error);
                }
            }
        }
    }

    private async handleApprovalStatusUpdate(workflow: WorkflowSession, approval: ApprovalRequest): Promise<void> {
        if (approval.status === ApprovalStatus.APPROVED) {
            workflow.pendingApproval = false;
            workflow.pendingApprovalId = undefined;
            workflow.changes = [];

            this.workflowEventEmitter.fire({
                type: WorkflowEventType.APPROVAL_GRANTED,
                workflowId: workflow.id,
                filePath: workflow.filePath,
                approvalId: approval.id,
                timestamp: new Date()
            });

            vscode.window.showInformationMessage(
                `Changes approved for ${path.basename(workflow.filePath)}`
            );

        } else if (approval.status === ApprovalStatus.REJECTED) {
            workflow.pendingApproval = false;
            workflow.pendingApprovalId = undefined;

            this.workflowEventEmitter.fire({
                type: WorkflowEventType.APPROVAL_DENIED,
                workflowId: workflow.id,
                filePath: workflow.filePath,
                approvalId: approval.id,
                timestamp: new Date()
            });

            vscode.window.showWarningMessage(
                `Changes rejected for ${path.basename(workflow.filePath)}`,
                'View Reason'
            ).then(selection => {
                if (selection === 'View Reason') {
                    vscode.window.showInformationMessage(
                        approval.rejectionReason || 'No reason provided'
                    );
                }
            });
        }
    }

    private handleWorkflowUpdate(payload: any): void {
        // Handle real-time workflow updates from the server
        if (payload.workflowId && this.activeWorkflows.has(payload.workflowId)) {
            const workflow = this.activeWorkflows.get(payload.workflowId)!;
            
            // Update workflow based on payload
            if (payload.status) {
                workflow.status = payload.status;
            }
            
            // Emit workflow update event
            this.workflowEventEmitter.fire({
                type: WorkflowEventType.WORKFLOW_UPDATED,
                workflowId: payload.workflowId,
                filePath: workflow.filePath,
                timestamp: new Date()
            });
        }
    }

    // Public methods
    public getActiveWorkflows(): WorkflowSession[] {
        return Array.from(this.activeWorkflows.values());
    }

    public getWorkflow(workflowId: string): WorkflowSession | undefined {
        return this.activeWorkflows.get(workflowId);
    }

    public async pauseWorkflow(workflowId: string): Promise<void> {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow) {
            workflow.status = 'paused';
            this.stopFileMonitoring(workflow.filePath);
        }
    }

    public async resumeWorkflow(workflowId: string): Promise<void> {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow) {
            workflow.status = 'active';
            this.startFileMonitoring(workflow.filePath, workflowId);
        }
    }

    public dispose(): void {
        // Stop all workflows
        this.activeWorkflows.forEach(workflow => {
            this.stopFileMonitoring(workflow.filePath);
        });
        
        // Clear timers
        if (this.workflowTimer) {
            clearInterval(this.workflowTimer);
        }

        // Dispose event emitters
        this.workflowEventEmitter.dispose();
        this.approvalRequestEmitter.dispose();

        // Dispose document listeners
        this.documentChangeListeners.forEach(listener => listener.dispose());
        this.documentChangeListeners.clear();
    }
}

interface WorkflowSession {
    id: string;
    filePath: string;
    status: 'active' | 'paused' | 'completed';
    createdAt: Date;
    changes: LineChange[];
    pendingApproval: boolean;
    pendingApprovalId?: string;
    analysis?: MutationAnalysis;
}