import * as vscode from 'vscode';
import { LatticeConnectionManager } from './services/connectionManager';
import { ApprovalQueueProvider } from './providers/approvalQueueProvider';
import { ChangeHistoryProvider } from './providers/changeHistoryProvider';
import { ApprovalWorkflowManager } from './services/approvalWorkflowManager';
import { NotificationManager } from './services/notificationManager';
import { DecorationManager } from './services/decorationManager';
import { CommandManager } from './commands/commandManager';
import { AuthManager } from './auth/authManager';
import { ProjectManager } from './project/projectManager';
import { MutationManager } from './mutation/mutationManager';

let connectionManager: LatticeConnectionManager;
let approvalQueueProvider: ApprovalQueueProvider;
let changeHistoryProvider: ChangeHistoryProvider;
let workflowManager: ApprovalWorkflowManager;
let notificationManager: NotificationManager;
let decorationManager: DecorationManager;
let commandManager: CommandManager;
let authManager: AuthManager;
let projectManager: ProjectManager;
let mutationManager: MutationManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Lattice Mutation Engine extension is now active!');

    // Initialize new authentication and project managers
    authManager = new AuthManager(context);
    projectManager = new ProjectManager(authManager);
    mutationManager = new MutationManager(authManager, projectManager);

    // Initialize existing services
    connectionManager = new LatticeConnectionManager(context);
    approvalQueueProvider = new ApprovalQueueProvider(connectionManager);
    changeHistoryProvider = new ChangeHistoryProvider(connectionManager);
    workflowManager = new ApprovalWorkflowManager(connectionManager);
    notificationManager = new NotificationManager();
    decorationManager = new DecorationManager();
    commandManager = new CommandManager(
        connectionManager,
        workflowManager,
        approvalQueueProvider,
        changeHistoryProvider,
        notificationManager,
        decorationManager
    );

    // Register tree data providers
    vscode.window.createTreeView('latticeApprovalQueue', {
        treeDataProvider: approvalQueueProvider,
        showCollapseAll: true
    });

    vscode.window.createTreeView('latticeChangeHistory', {
        treeDataProvider: changeHistoryProvider,
        showCollapseAll: true
    });

    // Register new project tree view
    vscode.window.registerTreeDataProvider('latticeProjects', projectManager);

    // Register commands (existing and new)
    commandManager.registerCommands(context);
    registerNewCommands(context);

    // Initialize authentication on startup
    authManager.loadStoredAuth();

    // Set up event listeners
    setupEventListeners(context);

    // Auto-connect if configured
    const config = vscode.workspace.getConfiguration('lattice');
    if (config.get('autoConnect', true)) {
        connectionManager.connect();
    }

    // Set context for when clauses
    vscode.commands.executeCommand('setContext', 'lattice.connected', false);

    console.log('Lattice extension fully initialized with authentication and project management');
}

function registerNewCommands(context: vscode.ExtensionContext) {
    // Authentication commands
    const authenticateCommand = vscode.commands.registerCommand('lattice.authenticate', async () => {
        await authManager.authenticate();
    });

    const signOutCommand = vscode.commands.registerCommand('lattice.signOut', async () => {
        await authManager.signOut();
    });

    // Project commands
    const createProjectCommand = vscode.commands.registerCommand('lattice.createProject', async () => {
        await projectManager.createProject();
    });

    const selectProjectCommand = vscode.commands.registerCommand('lattice.selectProject', async () => {
        await projectManager.selectProject();
    });

    const refreshProjectsCommand = vscode.commands.registerCommand('lattice.refreshProjects', async () => {
        await projectManager.refresh();
    });

    const syncProjectSpecCommand = vscode.commands.registerCommand('lattice.syncProjectSpec', async (project) => {
        if (project && project.id) {
            await projectManager.syncProjectSpec(project.id);
        } else {
            const activeProject = projectManager.getActiveProject();
            if (activeProject) {
                await projectManager.syncProjectSpec(activeProject.id);
            } else {
                vscode.window.showErrorMessage('No project selected');
            }
        }
    });

    // Mutation commands
    const proposeMutationCommand = vscode.commands.registerCommand('lattice.proposeMutation', async () => {
        await mutationManager.proposeMutation();
    });

    const viewMutationsCommand = vscode.commands.registerCommand('lattice.viewMutations', async () => {
        await mutationManager.listMutations();
    });

    const approveMutationCommand = vscode.commands.registerCommand('lattice.approveMutation', async (mutationId?: string) => {
        if (mutationId) {
            await mutationManager.approveMutation(mutationId);
        } else {
            vscode.window.showErrorMessage('No mutation ID provided');
        }
    });

    const rejectMutationCommand = vscode.commands.registerCommand('lattice.rejectMutation', async (mutationId?: string) => {
        if (mutationId) {
            await mutationManager.rejectMutation(mutationId);
        } else {
            vscode.window.showErrorMessage('No mutation ID provided');
        }
    });

    // Context menu commands
    const proposeMutationFromContextCommand = vscode.commands.registerCommand('lattice.proposeMutationFromContext', async (uri: vscode.Uri) => {
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
        await mutationManager.proposeMutation();
    });

    // Register all new commands with context
    context.subscriptions.push(
        authenticateCommand,
        signOutCommand,
        createProjectCommand,
        selectProjectCommand,
        refreshProjectsCommand,
        syncProjectSpecCommand,
        proposeMutationCommand,
        viewMutationsCommand,
        approveMutationCommand,
        rejectMutationCommand,
        proposeMutationFromContextCommand
    );

    // Register disposables
    context.subscriptions.push(
        authManager,
        mutationManager
    );
}

function setupEventListeners(context: vscode.ExtensionContext) {
    // Connection status changes
    connectionManager.onConnectionStatusChanged((connected: boolean) => {
        vscode.commands.executeCommand('setContext', 'lattice.connected', connected);
        
        if (connected) {
            notificationManager.showInfo('Connected to Lattice Mutation Engine');
            approvalQueueProvider.refresh();
            changeHistoryProvider.refresh();
        } else {
            notificationManager.showWarning('Disconnected from Lattice Mutation Engine');
        }
    });

    // New approval requests
    workflowManager.onNewApprovalRequest((request) => {
        const config = vscode.workspace.getConfiguration('lattice');
        if (config.get('approvalNotifications', true)) {
            notificationManager.showApprovalRequest(request);
        }
        
        approvalQueueProvider.refresh();
        decorationManager.updateDecorations();
    });

    // Approval status changes
    workflowManager.onApprovalStatusChanged((approval) => {
        approvalQueueProvider.refresh();
        changeHistoryProvider.refresh();
        decorationManager.updateDecorations();
    });

    // Listen for workspace folder changes
    const workspaceFoldersChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
        if (authManager && authManager.isAuthenticated()) {
            await projectManager.refresh();
        }
    });

    // Listen for file changes that might affect project specs
    const fileChangeListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (projectManager) {
            const activeProject = projectManager.getActiveProject();
            if (activeProject && document.fileName.includes('lattice.spec')) {
                await projectManager.syncProjectSpec(activeProject.id);
            }
        }
    });

    // Listen for configuration changes
    const configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('lattice')) {
            handleConfigurationChange();
            if (authManager) {
                authManager.loadStoredAuth();
            }
        }
    });

    context.subscriptions.push(
        workspaceFoldersChangeListener,
        fileChangeListener,
        configChangeListener
    );

    // Document changes for real-time analysis
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (connectionManager.isConnected()) {
            workflowManager.handleDocumentChange(event);
        }
    });

    // Active editor changes
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && connectionManager.isConnected()) {
            decorationManager.updateDecorations();
        }
    });
}

function handleConfigurationChange() {
    const config = vscode.workspace.getConfiguration('lattice');
    
    // Update connection if URL changed
    const newUrl = config.get('engineUrl', 'http://localhost:8000');
    if (connectionManager.getEngineUrl() !== newUrl) {
        connectionManager.updateEngineUrl(newUrl);
        if (connectionManager.isConnected()) {
            connectionManager.reconnect();
        }
    }

    // Update real-time settings
    const realTimeEnabled = config.get('realTimeUpdates', true);
    connectionManager.setRealTimeUpdates(realTimeEnabled);

    // Update decoration settings
    const showDecorations = config.get('showInlineDecorations', true);
    decorationManager.setEnabled(showDecorations);
}

export function deactivate() {
    console.log('Lattice extension is now deactivated');
    
    // Clean up existing resources
    if (connectionManager) {
        connectionManager.dispose();
    }
    if (workflowManager) {
        workflowManager.dispose();
    }
    if (decorationManager) {
        decorationManager.dispose();
    }
    
    // Clean up new resources
    if (authManager) {
        authManager.dispose();
    }
    if (mutationManager) {
        mutationManager.dispose();
    }
}