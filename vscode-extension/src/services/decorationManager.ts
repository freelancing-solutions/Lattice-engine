import * as vscode from 'vscode';
import { 
    DecorationConfig, 
    ApprovalRequest, 
    ApprovalStatus,
    FileChange,
    LineChange,
    WorkflowState,
    ValidationResult,
    ConflictInfo
} from '../types';

export class LatticeDecorationManager {
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
    private activeDecorations: Map<string, EditorDecoration[]> = new Map();
    private config: DecorationConfig;

    // Decoration type keys
    private static readonly PENDING_APPROVAL = 'pendingApproval';
    private static readonly APPROVED = 'approved';
    private static readonly REJECTED = 'rejected';
    private static readonly CONFLICT = 'conflict';
    private static readonly VALIDATION_ERROR = 'validationError';
    private static readonly VALIDATION_WARNING = 'validationWarning';
    private static readonly AUTO_APPROVED = 'autoApproved';
    private static readonly MODIFIED = 'modified';
    private static readonly ADDED = 'added';
    private static readonly DELETED = 'deleted';

    constructor(private context: vscode.ExtensionContext) {
        this.loadConfiguration();
        this.createDecorationTypes();
        this.setupEventListeners();
    }

    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('lattice.decorations');
        
        this.config = {
            enabled: config.get('enabled', true),
            showGutterIcons: config.get('showGutterIcons', true),
            showInlineText: config.get('showInlineText', true),
            showOverviewRuler: config.get('showOverviewRuler', true),
            highlightFullLine: config.get('highlightFullLine', false),
            fadeApprovedChanges: config.get('fadeApprovedChanges', true),
            blinkOnUpdate: config.get('blinkOnUpdate', true),
            colors: {
                pendingApproval: config.get('colors.pendingApproval', '#FFA500'),
                approved: config.get('colors.approved', '#00FF00'),
                rejected: config.get('colors.rejected', '#FF0000'),
                conflict: config.get('colors.conflict', '#FF00FF'),
                validationError: config.get('colors.validationError', '#FF4444'),
                validationWarning: config.get('colors.validationWarning', '#FFAA00'),
                autoApproved: config.get('colors.autoApproved', '#00AA00'),
                modified: config.get('colors.modified', '#0088FF'),
                added: config.get('colors.added', '#00FF88'),
                deleted: config.get('colors.deleted', '#FF8800')
            }
        };
    }

    private createDecorationTypes(): void {
        // Clear existing decoration types
        this.decorationTypes.forEach(decoration => decoration.dispose());
        this.decorationTypes.clear();

        if (!this.config.enabled) {
            return;
        }

        // Pending approval decoration
        this.decorationTypes.set(LatticeDecorationManager.PENDING_APPROVAL, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.pendingApproval + '20',
                borderLeft: `3px solid ${this.config.colors.pendingApproval}`,
                gutterIconPath: this.getIconPath('clock.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.pendingApproval,
                overviewRulerLane: vscode.OverviewRulerLane.Right,
                isWholeLine: this.config.highlightFullLine,
                after: this.config.showInlineText ? {
                    contentText: ' ⏳ Pending Approval',
                    color: this.config.colors.pendingApproval,
                    fontStyle: 'italic'
                } : undefined
            })
        );

        // Approved decoration
        this.decorationTypes.set(LatticeDecorationManager.APPROVED, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.approved + '15',
                borderLeft: `2px solid ${this.config.colors.approved}`,
                gutterIconPath: this.getIconPath('check.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.approved,
                overviewRulerLane: vscode.OverviewRulerLane.Right,
                isWholeLine: this.config.highlightFullLine,
                opacity: this.config.fadeApprovedChanges ? '0.7' : '1.0',
                after: this.config.showInlineText ? {
                    contentText: ' ✓ Approved',
                    color: this.config.colors.approved,
                    fontStyle: 'italic'
                } : undefined
            })
        );

        // Rejected decoration
        this.decorationTypes.set(LatticeDecorationManager.REJECTED, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.rejected + '20',
                borderLeft: `3px solid ${this.config.colors.rejected}`,
                gutterIconPath: this.getIconPath('x.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.rejected,
                overviewRulerLane: vscode.OverviewRulerLane.Right,
                isWholeLine: this.config.highlightFullLine,
                textDecoration: 'line-through',
                after: this.config.showInlineText ? {
                    contentText: ' ✗ Rejected',
                    color: this.config.colors.rejected,
                    fontStyle: 'italic'
                } : undefined
            })
        );

        // Conflict decoration
        this.decorationTypes.set(LatticeDecorationManager.CONFLICT, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.conflict + '25',
                borderLeft: `4px solid ${this.config.colors.conflict}`,
                gutterIconPath: this.getIconPath('alert.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.conflict,
                overviewRulerLane: vscode.OverviewRulerLane.Full,
                isWholeLine: this.config.highlightFullLine,
                after: this.config.showInlineText ? {
                    contentText: ' ⚠ Conflict',
                    color: this.config.colors.conflict,
                    fontWeight: 'bold'
                } : undefined
            })
        );

        // Validation error decoration
        this.decorationTypes.set(LatticeDecorationManager.VALIDATION_ERROR, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.validationError + '20',
                borderLeft: `3px solid ${this.config.colors.validationError}`,
                gutterIconPath: this.getIconPath('error.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.validationError,
                overviewRulerLane: vscode.OverviewRulerLane.Left,
                textDecoration: 'underline wavy',
                after: this.config.showInlineText ? {
                    contentText: ' ❌ Validation Error',
                    color: this.config.colors.validationError
                } : undefined
            })
        );

        // Validation warning decoration
        this.decorationTypes.set(LatticeDecorationManager.VALIDATION_WARNING, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.validationWarning + '15',
                borderLeft: `2px solid ${this.config.colors.validationWarning}`,
                gutterIconPath: this.getIconPath('warning.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.validationWarning,
                overviewRulerLane: vscode.OverviewRulerLane.Left,
                textDecoration: 'underline dotted',
                after: this.config.showInlineText ? {
                    contentText: ' ⚠ Warning',
                    color: this.config.colors.validationWarning
                } : undefined
            })
        );

        // Auto-approved decoration
        this.decorationTypes.set(LatticeDecorationManager.AUTO_APPROVED, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.autoApproved + '10',
                borderLeft: `1px solid ${this.config.colors.autoApproved}`,
                gutterIconPath: this.getIconPath('check-circle.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.autoApproved,
                overviewRulerLane: vscode.OverviewRulerLane.Right,
                opacity: '0.8',
                after: this.config.showInlineText ? {
                    contentText: ' ✓ Auto-approved',
                    color: this.config.colors.autoApproved,
                    fontStyle: 'italic',
                    fontSize: '0.9em'
                } : undefined
            })
        );

        // Modified line decoration
        this.decorationTypes.set(LatticeDecorationManager.MODIFIED, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.modified + '15',
                borderLeft: `2px solid ${this.config.colors.modified}`,
                overviewRulerColor: this.config.colors.modified,
                overviewRulerLane: vscode.OverviewRulerLane.Center
            })
        );

        // Added line decoration
        this.decorationTypes.set(LatticeDecorationManager.ADDED, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.added + '15',
                borderLeft: `2px solid ${this.config.colors.added}`,
                gutterIconPath: this.getIconPath('plus.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.added,
                overviewRulerLane: vscode.OverviewRulerLane.Center
            })
        );

        // Deleted line decoration
        this.decorationTypes.set(LatticeDecorationManager.DELETED, 
            vscode.window.createTextEditorDecorationType({
                backgroundColor: this.config.colors.deleted + '15',
                borderLeft: `2px solid ${this.config.colors.deleted}`,
                gutterIconPath: this.getIconPath('minus.svg'),
                gutterIconSize: 'contain',
                overviewRulerColor: this.config.colors.deleted,
                overviewRulerLane: vscode.OverviewRulerLane.Center,
                textDecoration: 'line-through'
            })
        );
    }

    private setupEventListeners(): void {
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('lattice.decorations')) {
                this.loadConfiguration();
                this.createDecorationTypes();
                this.refreshAllDecorations();
            }
        });

        // Listen for active editor changes
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                this.updateEditorDecorations(editor);
            }
        });

        // Listen for document changes
        vscode.workspace.onDidChangeTextDocument((event) => {
            const editor = vscode.window.visibleTextEditors.find(
                e => e.document === event.document
            );
            if (editor) {
                // Debounce decoration updates
                setTimeout(() => {
                    this.updateEditorDecorations(editor);
                }, 100);
            }
        });
    }

    public decorateApprovalRequest(request: ApprovalRequest): void {
        if (!this.config.enabled) {
            return;
        }

        request.changes?.forEach(change => {
            this.decorateFileChange(change, ApprovalStatus.PENDING);
        });
    }

    public decorateApprovalResponse(
        requestId: string, 
        status: ApprovalStatus, 
        changes: FileChange[]
    ): void {
        if (!this.config.enabled) {
            return;
        }

        changes.forEach(change => {
            this.decorateFileChange(change, status);
        });

        // Add blink effect if enabled
        if (this.config.blinkOnUpdate) {
            this.addBlinkEffect(changes);
        }
    }

    public decorateValidationResults(filePath: string, results: ValidationResult[]): void {
        if (!this.config.enabled) {
            return;
        }

        const editor = this.getEditorForFile(filePath);
        if (!editor) {
            return;
        }

        const decorations: EditorDecoration[] = [];

        results.forEach(result => {
            const decorationType = result.severity === 'error' 
                ? LatticeDecorationManager.VALIDATION_ERROR
                : LatticeDecorationManager.VALIDATION_WARNING;

            const decoration: EditorDecoration = {
                type: decorationType,
                range: new vscode.Range(
                    result.line - 1, 
                    result.column || 0,
                    result.line - 1, 
                    result.endColumn || Number.MAX_SAFE_INTEGER
                ),
                hoverMessage: new vscode.MarkdownString(
                    `**${result.severity.toUpperCase()}**: ${result.message}\n\n` +
                    `Rule: \`${result.rule}\``
                ),
                metadata: {
                    type: 'validation',
                    severity: result.severity,
                    rule: result.rule,
                    message: result.message
                }
            };

            decorations.push(decoration);
        });

        this.setEditorDecorations(editor, decorations);
    }

    public decorateConflicts(filePath: string, conflicts: ConflictInfo[]): void {
        if (!this.config.enabled) {
            return;
        }

        const editor = this.getEditorForFile(filePath);
        if (!editor) {
            return;
        }

        const decorations: EditorDecoration[] = [];

        conflicts.forEach(conflict => {
            const decoration: EditorDecoration = {
                type: LatticeDecorationManager.CONFLICT,
                range: new vscode.Range(
                    conflict.startLine - 1, 
                    0,
                    conflict.endLine - 1, 
                    Number.MAX_SAFE_INTEGER
                ),
                hoverMessage: new vscode.MarkdownString(
                    `**CONFLICT**: ${conflict.type}\n\n` +
                    `${conflict.description}\n\n` +
                    `**Resolution**: ${conflict.resolution || 'Manual resolution required'}`
                ),
                metadata: {
                    type: 'conflict',
                    conflictType: conflict.type,
                    description: conflict.description
                }
            };

            decorations.push(decoration);
        });

        this.setEditorDecorations(editor, decorations);
    }

    public decorateWorkflowState(filePath: string, state: WorkflowState): void {
        if (!this.config.enabled) {
            return;
        }

        const editor = this.getEditorForFile(filePath);
        if (!editor) {
            return;
        }

        // Clear existing workflow decorations
        this.clearWorkflowDecorations(editor);

        // Add state-specific decorations
        switch (state.status) {
            case 'active':
                this.addWorkflowActiveDecorations(editor, state);
                break;
            case 'pending_approval':
                this.addWorkflowPendingDecorations(editor, state);
                break;
            case 'approved':
                this.addWorkflowApprovedDecorations(editor, state);
                break;
            case 'rejected':
                this.addWorkflowRejectedDecorations(editor, state);
                break;
        }
    }

    private decorateFileChange(change: FileChange, status: ApprovalStatus): void {
        const editor = this.getEditorForFile(change.filePath);
        if (!editor) {
            return;
        }

        const decorations: EditorDecoration[] = [];

        change.lineChanges?.forEach(lineChange => {
            const decorationType = this.getDecorationTypeForStatus(status, lineChange.type);
            
            const decoration: EditorDecoration = {
                type: decorationType,
                range: new vscode.Range(
                    lineChange.lineNumber - 1, 
                    0,
                    lineChange.lineNumber - 1, 
                    Number.MAX_SAFE_INTEGER
                ),
                hoverMessage: this.createHoverMessage(lineChange, status),
                metadata: {
                    type: 'approval',
                    status,
                    changeType: lineChange.type,
                    lineNumber: lineChange.lineNumber
                }
            };

            decorations.push(decoration);
        });

        this.setEditorDecorations(editor, decorations);
    }

    private getDecorationTypeForStatus(status: ApprovalStatus, changeType?: string): string {
        switch (status) {
            case ApprovalStatus.PENDING:
                return LatticeDecorationManager.PENDING_APPROVAL;
            case ApprovalStatus.APPROVED:
                return LatticeDecorationManager.APPROVED;
            case ApprovalStatus.REJECTED:
                return LatticeDecorationManager.REJECTED;
            case ApprovalStatus.AUTO_APPROVED:
                return LatticeDecorationManager.AUTO_APPROVED;
            default:
                // Use change type for basic decorations
                switch (changeType) {
                    case 'added': return LatticeDecorationManager.ADDED;
                    case 'deleted': return LatticeDecorationManager.DELETED;
                    case 'modified': return LatticeDecorationManager.MODIFIED;
                    default: return LatticeDecorationManager.MODIFIED;
                }
        }
    }

    private createHoverMessage(lineChange: LineChange, status: ApprovalStatus): vscode.MarkdownString {
        const statusText = status.replace('_', ' ').toUpperCase();
        const changeTypeText = lineChange.type?.toUpperCase() || 'MODIFIED';
        
        let message = `**${statusText}** - ${changeTypeText} Line ${lineChange.lineNumber}\n\n`;
        
        if (lineChange.oldContent && lineChange.newContent) {
            message += `**Before:**\n\`\`\`\n${lineChange.oldContent}\n\`\`\`\n\n`;
            message += `**After:**\n\`\`\`\n${lineChange.newContent}\n\`\`\``;
        } else if (lineChange.newContent) {
            message += `**Content:**\n\`\`\`\n${lineChange.newContent}\n\`\`\``;
        }

        return new vscode.MarkdownString(message);
    }

    private addBlinkEffect(changes: FileChange[]): void {
        // Create temporary blink decoration
        const blinkDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: '#FFFFFF40',
            borderRadius: '2px'
        });

        changes.forEach(change => {
            const editor = this.getEditorForFile(change.filePath);
            if (!editor) {
                return;
            }

            const ranges = change.lineChanges?.map(lineChange => 
                new vscode.Range(
                    lineChange.lineNumber - 1, 0,
                    lineChange.lineNumber - 1, Number.MAX_SAFE_INTEGER
                )
            ) || [];

            // Apply blink effect
            editor.setDecorations(blinkDecoration, ranges);

            // Remove after 500ms
            setTimeout(() => {
                editor.setDecorations(blinkDecoration, []);
                blinkDecoration.dispose();
            }, 500);
        });
    }

    private addWorkflowActiveDecorations(editor: vscode.TextEditor, state: WorkflowState): void {
        // Add subtle indication that workflow is active
        const decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ` 🔄 Workflow Active`,
                color: '#888888',
                fontStyle: 'italic'
            }
        });

        editor.setDecorations(decoration, [new vscode.Range(0, 0, 0, 0)]);
    }

    private addWorkflowPendingDecorations(editor: vscode.TextEditor, state: WorkflowState): void {
        // Highlight that approval is pending
        const decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ` ⏳ Pending Approval`,
                color: this.config.colors.pendingApproval,
                fontWeight: 'bold'
            }
        });

        editor.setDecorations(decoration, [new vscode.Range(0, 0, 0, 0)]);
    }

    private addWorkflowApprovedDecorations(editor: vscode.TextEditor, state: WorkflowState): void {
        // Show approval status
        const decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ` ✅ Approved`,
                color: this.config.colors.approved,
                fontWeight: 'bold'
            }
        });

        editor.setDecorations(decoration, [new vscode.Range(0, 0, 0, 0)]);
    }

    private addWorkflowRejectedDecorations(editor: vscode.TextEditor, state: WorkflowState): void {
        // Show rejection status
        const decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ` ❌ Rejected`,
                color: this.config.colors.rejected,
                fontWeight: 'bold'
            }
        });

        editor.setDecorations(decoration, [new vscode.Range(0, 0, 0, 0)]);
    }

    private clearWorkflowDecorations(editor: vscode.TextEditor): void {
        // Clear workflow-specific decorations
        // This is a simplified implementation - in practice, you'd track these decorations
    }

    private getEditorForFile(filePath: string): vscode.TextEditor | undefined {
        return vscode.window.visibleTextEditors.find(editor => 
            editor.document.uri.fsPath === filePath
        );
    }

    private setEditorDecorations(editor: vscode.TextEditor, decorations: EditorDecoration[]): void {
        const filePath = editor.document.uri.fsPath;
        
        // Store decorations for this editor
        this.activeDecorations.set(filePath, decorations);
        
        // Group decorations by type
        const decorationsByType = new Map<string, vscode.Range[]>();
        
        decorations.forEach(decoration => {
            if (!decorationsByType.has(decoration.type)) {
                decorationsByType.set(decoration.type, []);
            }
            decorationsByType.get(decoration.type)!.push(decoration.range);
        });

        // Apply decorations
        decorationsByType.forEach((ranges, type) => {
            const decorationType = this.decorationTypes.get(type);
            if (decorationType) {
                editor.setDecorations(decorationType, ranges);
            }
        });
    }

    private updateEditorDecorations(editor: vscode.TextEditor): void {
        const filePath = editor.document.uri.fsPath;
        const decorations = this.activeDecorations.get(filePath);
        
        if (decorations) {
            this.setEditorDecorations(editor, decorations);
        }
    }

    private refreshAllDecorations(): void {
        vscode.window.visibleTextEditors.forEach(editor => {
            this.updateEditorDecorations(editor);
        });
    }

    private getIconPath(iconName: string): vscode.Uri {
        return vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'icons', iconName);
    }

    // Public methods
    public clearDecorations(filePath?: string): void {
        if (filePath) {
            this.activeDecorations.delete(filePath);
            const editor = this.getEditorForFile(filePath);
            if (editor) {
                this.decorationTypes.forEach(decoration => {
                    editor.setDecorations(decoration, []);
                });
            }
        } else {
            this.activeDecorations.clear();
            vscode.window.visibleTextEditors.forEach(editor => {
                this.decorationTypes.forEach(decoration => {
                    editor.setDecorations(decoration, []);
                });
            });
        }
    }

    public updateConfiguration(config: Partial<DecorationConfig>): void {
        this.config = { ...this.config, ...config };
        this.createDecorationTypes();
        this.refreshAllDecorations();
    }

    public getActiveDecorations(filePath: string): EditorDecoration[] {
        return this.activeDecorations.get(filePath) || [];
    }

    public dispose(): void {
        this.decorationTypes.forEach(decoration => decoration.dispose());
        this.decorationTypes.clear();
        this.activeDecorations.clear();
    }
}

interface EditorDecoration {
    type: string;
    range: vscode.Range;
    hoverMessage?: vscode.MarkdownString;
    metadata?: any;
}