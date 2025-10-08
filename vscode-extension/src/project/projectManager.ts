/**
 * Project Manager for Lattice VSCode Extension
 * 
 * Handles project creation, selection, and management within VSCode
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { AuthManager } from '../auth/authManager';

export interface Project {
    id: string;
    name: string;
    slug: string;
    description?: string;
    organizationId: string;
    status: string;
    specContent?: string;
    specVersion: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    mutationCount: number;
}

export interface ProjectTreeItem extends vscode.TreeItem {
    project?: Project;
    type: 'project' | 'spec' | 'mutations';
}

export class ProjectManager implements vscode.TreeDataProvider<ProjectTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectTreeItem | undefined | null | void> = new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private projects: Project[] = [];
    private activeProject: Project | undefined;
    private authManager: AuthManager;

    constructor(authManager: AuthManager) {
        this.authManager = authManager;
    }

    /**
     * Refresh project list
     */
    async refresh(): Promise<void> {
        if (!this.authManager.isAuthenticated()) {
            this.projects = [];
            this._onDidChangeTreeData.fire();
            return;
        }

        try {
            const response = await this.authManager.getApiClient().get('/projects');
            this.projects = response.data.projects || [];
            this._onDidChangeTreeData.fire();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to load projects: ${error.message}`);
        }
    }

    /**
     * Create a new project
     */
    async createProject(): Promise<void> {
        if (!this.authManager.isAuthenticated()) {
            vscode.window.showErrorMessage('Please authenticate first');
            return;
        }

        const name = await vscode.window.showInputBox({
            prompt: 'Enter project name',
            placeHolder: 'My New Project'
        });

        if (!name) {
            return;
        }

        const description = await vscode.window.showInputBox({
            prompt: 'Enter project description (optional)',
            placeHolder: 'Project description'
        });

        // Generate initial spec content based on workspace
        let specContent = '# Project Specification\n\n';
        
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            specContent += `## Workspace\n\nProject root: ${workspaceFolder.uri.fsPath}\n\n`;
            
            // Try to detect project type
            const packageJsonPath = path.join(workspaceFolder.uri.fsPath, 'package.json');
            const requirementsPath = path.join(workspaceFolder.uri.fsPath, 'requirements.txt');
            
            try {
                await vscode.workspace.fs.stat(vscode.Uri.file(packageJsonPath));
                specContent += '## Project Type\n\nNode.js/JavaScript project detected\n\n';
            } catch {
                try {
                    await vscode.workspace.fs.stat(vscode.Uri.file(requirementsPath));
                    specContent += '## Project Type\n\nPython project detected\n\n';
                } catch {
                    specContent += '## Project Type\n\nGeneric project\n\n';
                }
            }
        }

        specContent += '## Description\n\n' + (description || 'No description provided');

        try {
            const response = await this.authManager.getApiClient().post('/projects', {
                name,
                description,
                spec_content: specContent
            });

            const newProject: Project = response.data.project;
            this.projects.push(newProject);
            this._onDidChangeTreeData.fire();

            vscode.window.showInformationMessage(`Project "${name}" created successfully`);
            
            // Ask if user wants to set as active project
            const setActive = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Set this as your active project?'
            });

            if (setActive === 'Yes') {
                await this.setActiveProject(newProject);
            }

        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to create project';
            vscode.window.showErrorMessage(`Failed to create project: ${message}`);
        }
    }

    /**
     * Select and set active project
     */
    async selectProject(): Promise<void> {
        if (!this.authManager.isAuthenticated()) {
            vscode.window.showErrorMessage('Please authenticate first');
            return;
        }

        if (this.projects.length === 0) {
            const action = await vscode.window.showInformationMessage(
                'No projects found. Would you like to create one?',
                'Create Project'
            );
            
            if (action === 'Create Project') {
                await this.createProject();
            }
            return;
        }

        const projectItems = this.projects.map(project => ({
            label: project.name,
            description: project.description,
            detail: `${project.mutationCount} mutations • ${project.status}`,
            project
        }));

        const selected = await vscode.window.showQuickPick(projectItems, {
            placeHolder: 'Select a project to work with'
        });

        if (selected) {
            await this.setActiveProject(selected.project);
        }
    }

    /**
     * Set active project
     */
    async setActiveProject(project: Project): Promise<void> {
        this.activeProject = project;
        
        // Update context
        await vscode.commands.executeCommand('setContext', 'lattice.hasActiveProject', true);
        
        // Store in workspace state
        await vscode.workspace.getConfiguration('lattice').update(
            'activeProjectId', 
            project.id, 
            vscode.ConfigurationTarget.Workspace
        );

        this._onDidChangeTreeData.fire();
        
        vscode.window.showInformationMessage(`Active project: ${project.name}`);
    }

    /**
     * Get active project
     */
    getActiveProject(): Project | undefined {
        return this.activeProject;
    }

    /**
     * Sync project specification with current workspace
     */
    async syncProjectSpec(): Promise<void> {
        if (!this.activeProject) {
            vscode.window.showErrorMessage('No active project selected');
            return;
        }

        // Generate updated spec content
        let specContent = `# ${this.activeProject.name}\n\n`;
        
        if (this.activeProject.description) {
            specContent += `${this.activeProject.description}\n\n`;
        }

        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0];
            specContent += `## Workspace\n\nProject root: ${workspaceFolder.uri.fsPath}\n\n`;
            
            // Add file structure
            try {
                const files = await this.getWorkspaceFiles(workspaceFolder.uri);
                specContent += '## File Structure\n\n```\n';
                specContent += files.join('\n');
                specContent += '\n```\n\n';
            } catch (error) {
                console.error('Failed to read workspace files:', error);
            }
        }

        specContent += `## Last Updated\n\n${new Date().toISOString()}\n`;

        try {
            await this.authManager.getApiClient().put(`/projects/${this.activeProject.id}`, {
                spec_content: specContent
            });

            vscode.window.showInformationMessage('Project specification synced successfully');
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Failed to sync specification';
            vscode.window.showErrorMessage(`Failed to sync specification: ${message}`);
        }
    }

    /**
     * Get workspace files for spec generation
     */
    private async getWorkspaceFiles(uri: vscode.Uri, maxDepth: number = 3, currentDepth: number = 0): Promise<string[]> {
        if (currentDepth >= maxDepth) {
            return [];
        }

        const files: string[] = [];
        
        try {
            const entries = await vscode.workspace.fs.readDirectory(uri);
            
            for (const [name, type] of entries) {
                // Skip common ignore patterns
                if (name.startsWith('.') || name === 'node_modules' || name === '__pycache__') {
                    continue;
                }

                const indent = '  '.repeat(currentDepth);
                
                if (type === vscode.FileType.Directory) {
                    files.push(`${indent}${name}/`);
                    const subFiles = await this.getWorkspaceFiles(
                        vscode.Uri.joinPath(uri, name), 
                        maxDepth, 
                        currentDepth + 1
                    );
                    files.push(...subFiles);
                } else {
                    files.push(`${indent}${name}`);
                }
            }
        } catch (error) {
            // Ignore errors for individual directories
        }

        return files;
    }

    // TreeDataProvider implementation
    getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ProjectTreeItem): Thenable<ProjectTreeItem[]> {
        if (!this.authManager.isAuthenticated()) {
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - show projects
            return Promise.resolve(this.projects.map(project => {
                const item = new vscode.TreeItem(
                    project.name,
                    vscode.TreeItemCollapsibleState.Collapsed
                );
                item.description = project.status;
                item.tooltip = project.description || project.name;
                item.contextValue = 'project';
                
                if (this.activeProject?.id === project.id) {
                    item.iconPath = new vscode.ThemeIcon('star-full');
                } else {
                    item.iconPath = new vscode.ThemeIcon('folder');
                }

                return {
                    ...item,
                    project,
                    type: 'project'
                } as ProjectTreeItem;
            }));
        } else if (element.type === 'project' && element.project) {
            // Project children - show spec and mutations
            return Promise.resolve([
                {
                    ...new vscode.TreeItem('Specification', vscode.TreeItemCollapsibleState.None),
                    iconPath: new vscode.ThemeIcon('file-text'),
                    contextValue: 'spec',
                    command: {
                        command: 'lattice.viewSpec',
                        title: 'View Specification',
                        arguments: [element.project]
                    },
                    type: 'spec'
                } as ProjectTreeItem,
                {
                    ...new vscode.TreeItem(
                        `Mutations (${element.project.mutationCount})`,
                        vscode.TreeItemCollapsibleState.None
                    ),
                    iconPath: new vscode.ThemeIcon('git-branch'),
                    contextValue: 'mutations',
                    command: {
                        command: 'lattice.viewMutations',
                        title: 'View Mutations',
                        arguments: [element.project]
                    },
                    type: 'mutations'
                } as ProjectTreeItem
            ]);
        }

        return Promise.resolve([]);
    }
}