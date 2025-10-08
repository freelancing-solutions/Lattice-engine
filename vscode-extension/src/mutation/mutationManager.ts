/**
 * Mutation Manager for Lattice VSCode Extension
 * 
 * Handles mutation proposals, monitoring, and approval workflows
 */

import * as vscode from 'vscode';
import { AuthManager } from '../auth/authManager';
import { ProjectManager, Project } from '../project/projectManager';

export interface Mutation {
    id: string;
    projectId: string;
    operationType: string;
    changes: any;
    description?: string;
    status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: string;
    executedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    executionLog: string[];
}

export interface MutationResponse {
    status: string;
    mutationId: string;
    requiresApproval: boolean;
    estimatedDuration?: number;
    riskLevel: 'low' | 'medium' | 'high';
    affectedFiles: string[];
    previewUrl?: string;
}

export class MutationManager {
    private authManager: AuthManager;
    private projectManager: ProjectManager;
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;
    private activeMutations: Map<string, Mutation> = new Map();

    constructor(authManager: AuthManager, projectManager: ProjectManager) {
        this.authManager = authManager;
        this.projectManager = projectManager;
        this.outputChannel = vscode.window.createOutputChannel('Lattice Mutations');
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            99
        );
    }

    /**
     * Propose a mutation based on current selection or file
     */
    async proposeMutation(): Promise<void> {
        const activeProject = this.projectManager.getActiveProject();
        if (!activeProject) {
            vscode.window.showErrorMessage('No active project selected');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        // Get operation type from user
        const operationType = await vscode.window.showQuickPick([
            { label: 'Create', value: 'create', description: 'Create new code or files' },
            { label: 'Update', value: 'update', description: 'Modify existing code' },
            { label: 'Refactor', value: 'refactor', description: 'Restructure code without changing behavior' },
            { label: 'Optimize', value: 'optimize', description: 'Improve performance or efficiency' },
            { label: 'Fix', value: 'fix', description: 'Fix bugs or issues' },
            { label: 'Enhance', value: 'enhance', description: 'Add new features or capabilities' }
        ], {
            placeHolder: 'Select mutation type'
        });

        if (!operationType) {
            return;
        }

        // Get description from user
        const description = await vscode.window.showInputBox({
            prompt: 'Describe the mutation you want to perform',
            placeHolder: 'e.g., Add error handling to the login function'
        });

        if (!description) {
            return;
        }

        // Prepare mutation data
        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);
        
        const changes = {
            file: {
                path: vscode.workspace.asRelativePath(document.uri),
                content: document.getText(),
                selection: selectedText ? {
                    start: { line: selection.start.line, character: selection.start.character },
                    end: { line: selection.end.line, character: selection.end.character },
                    text: selectedText
                } : undefined
            },
            context: {
                language: document.languageId,
                workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
            }
        };

        try {
            this.outputChannel.appendLine(`Proposing ${operationType.value} mutation for ${activeProject.name}`);
            this.outputChannel.appendLine(`Description: ${description}`);
            this.outputChannel.show(true);

            const response = await this.authManager.getApiClient().post('/mutations/propose', {
                project_id: activeProject.id,
                operation_type: operationType.value,
                changes,
                description
            });

            const mutationResponse: MutationResponse = response.data;
            
            this.outputChannel.appendLine(`Mutation proposed: ${mutationResponse.mutationId}`);
            this.outputChannel.appendLine(`Risk Level: ${mutationResponse.riskLevel}`);
            this.outputChannel.appendLine(`Requires Approval: ${mutationResponse.requiresApproval}`);
            
            if (mutationResponse.affectedFiles.length > 0) {
                this.outputChannel.appendLine(`Affected Files: ${mutationResponse.affectedFiles.join(', ')}`);
            }

            // Show notification
            const message = `Mutation proposed (${mutationResponse.riskLevel} risk)`;
            const actions = ['View Details'];
            
            if (mutationResponse.requiresApproval) {
                actions.push('Approve', 'Reject');
            }

            const action = await vscode.window.showInformationMessage(message, ...actions);
            
            if (action === 'View Details') {
                await this.viewMutation(mutationResponse.mutationId);
            } else if (action === 'Approve') {
                await this.approveMutation(mutationResponse.mutationId);
            } else if (action === 'Reject') {
                await this.rejectMutation(mutationResponse.mutationId);
            }

        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to propose mutation';
            vscode.window.showErrorMessage(`Failed to propose mutation: ${message}`);
            this.outputChannel.appendLine(`Error: ${message}`);
        }
    }

    /**
     * View mutation details
     */
    async viewMutation(mutationId: string): Promise<void> {
        try {
            const response = await this.authManager.getApiClient().get(`/mutations/${mutationId}`);
            const mutation: Mutation = response.data.mutation;

            // Create and show mutation details in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: this.formatMutationDetails(mutation),
                language: 'markdown'
            });

            await vscode.window.showTextDocument(doc);

        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to load mutation';
            vscode.window.showErrorMessage(`Failed to load mutation: ${message}`);
        }
    }

    /**
     * Approve a mutation
     */
    async approveMutation(mutationId: string): Promise<void> {
        try {
            await this.authManager.getApiClient().post(`/mutations/${mutationId}/approve`);
            
            vscode.window.showInformationMessage(`Mutation ${mutationId} approved`);
            this.outputChannel.appendLine(`Mutation ${mutationId} approved`);
            
            // Start monitoring execution
            this.monitorMutation(mutationId);

        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to approve mutation';
            vscode.window.showErrorMessage(`Failed to approve mutation: ${message}`);
        }
    }

    /**
     * Reject a mutation
     */
    async rejectMutation(mutationId: string): Promise<void> {
        const reason = await vscode.window.showInputBox({
            prompt: 'Reason for rejection (optional)',
            placeHolder: 'Enter rejection reason'
        });

        try {
            await this.authManager.getApiClient().post(`/mutations/${mutationId}/reject`, {
                reason
            });
            
            vscode.window.showInformationMessage(`Mutation ${mutationId} rejected`);
            this.outputChannel.appendLine(`Mutation ${mutationId} rejected: ${reason || 'No reason provided'}`);

        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to reject mutation';
            vscode.window.showErrorMessage(`Failed to reject mutation: ${message}`);
        }
    }

    /**
     * List mutations for current project
     */
    async listMutations(): Promise<void> {
        const activeProject = this.projectManager.getActiveProject();
        if (!activeProject) {
            vscode.window.showErrorMessage('No active project selected');
            return;
        }

        try {
            const response = await this.authManager.getApiClient().get('/mutations', {
                params: { project_id: activeProject.id, limit: 50 }
            });

            const mutations: Mutation[] = response.data.mutations || [];

            if (mutations.length === 0) {
                vscode.window.showInformationMessage('No mutations found for this project');
                return;
            }

            // Show mutations in quick pick
            const mutationItems = mutations.map(mutation => ({
                label: `${mutation.operationType} - ${mutation.status}`,
                description: mutation.description || 'No description',
                detail: `Created: ${new Date(mutation.createdAt).toLocaleString()}`,
                mutation
            }));

            const selected = await vscode.window.showQuickPick(mutationItems, {
                placeHolder: 'Select a mutation to view details'
            });

            if (selected) {
                await this.viewMutation(selected.mutation.id);
            }

        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to load mutations';
            vscode.window.showErrorMessage(`Failed to load mutations: ${message}`);
        }
    }

    /**
     * Monitor mutation execution
     */
    private async monitorMutation(mutationId: string): Promise<void> {
        const checkStatus = async () => {
            try {
                const response = await this.authManager.getApiClient().get(`/mutations/${mutationId}`);
                const mutation: Mutation = response.data.mutation;
                
                this.activeMutations.set(mutationId, mutation);
                this.updateStatusBar();

                if (mutation.status === 'completed') {
                    vscode.window.showInformationMessage(`Mutation ${mutationId} completed successfully`);
                    this.outputChannel.appendLine(`Mutation ${mutationId} completed`);
                    this.activeMutations.delete(mutationId);
                    this.updateStatusBar();
                } else if (mutation.status === 'failed') {
                    vscode.window.showErrorMessage(`Mutation ${mutationId} failed: ${mutation.errorMessage}`);
                    this.outputChannel.appendLine(`Mutation ${mutationId} failed: ${mutation.errorMessage}`);
                    this.activeMutations.delete(mutationId);
                    this.updateStatusBar();
                } else if (mutation.status === 'executing') {
                    // Continue monitoring
                    setTimeout(checkStatus, 5000);
                }

            } catch (error) {
                console.error('Failed to check mutation status:', error);
                this.activeMutations.delete(mutationId);
                this.updateStatusBar();
            }
        };

        checkStatus();
    }

    /**
     * Format mutation details for display
     */
    private formatMutationDetails(mutation: Mutation): string {
        let content = `# Mutation Details\n\n`;
        content += `**ID:** ${mutation.id}\n`;
        content += `**Type:** ${mutation.operationType}\n`;
        content += `**Status:** ${mutation.status}\n`;
        content += `**Description:** ${mutation.description || 'No description'}\n`;
        content += `**Created:** ${new Date(mutation.createdAt).toLocaleString()}\n`;
        content += `**Created By:** ${mutation.createdBy}\n\n`;

        if (mutation.approvedBy) {
            content += `**Approved By:** ${mutation.approvedBy}\n`;
            content += `**Approved At:** ${new Date(mutation.approvedAt!).toLocaleString()}\n\n`;
        }

        if (mutation.executedAt) {
            content += `**Executed At:** ${new Date(mutation.executedAt).toLocaleString()}\n\n`;
        }

        if (mutation.completedAt) {
            content += `**Completed At:** ${new Date(mutation.completedAt).toLocaleString()}\n\n`;
        }

        if (mutation.errorMessage) {
            content += `## Error\n\n\`\`\`\n${mutation.errorMessage}\n\`\`\`\n\n`;
        }

        if (mutation.executionLog.length > 0) {
            content += `## Execution Log\n\n`;
            mutation.executionLog.forEach((log, index) => {
                content += `${index + 1}. ${log}\n`;
            });
            content += '\n';
        }

        content += `## Changes\n\n\`\`\`json\n${JSON.stringify(mutation.changes, null, 2)}\n\`\`\`\n`;

        return content;
    }

    /**
     * Update status bar with active mutations
     */
    private updateStatusBar(): void {
        const activeCount = this.activeMutations.size;
        
        if (activeCount > 0) {
            this.statusBarItem.text = `$(sync~spin) ${activeCount} mutation${activeCount > 1 ? 's' : ''}`;
            this.statusBarItem.tooltip = 'Active mutations running';
            this.statusBarItem.command = 'lattice.viewMutations';
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.outputChannel.dispose();
        this.statusBarItem.dispose();
    }
}