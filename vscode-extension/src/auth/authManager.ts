/**
 * Authentication Manager for Lattice VSCode Extension
 * 
 * Handles API key storage, user authentication, and session management
 */

import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

export interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    organizationId?: string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    status: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user?: User;
    organization?: Organization;
    apiKey?: string;
}

export class AuthManager {
    private context: vscode.ExtensionContext;
    private apiClient: AxiosInstance;
    private authState: AuthState = { isAuthenticated: false };
    private statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        
        // Initialize API client
        const apiUrl = vscode.workspace.getConfiguration('lattice').get<string>('apiUrl', 'http://localhost:8000');
        this.apiClient = axios.create({
            baseURL: apiUrl,
            timeout: 30000,
            headers: {
                'User-Agent': 'Lattice-VSCode-Extension/1.0.0'
            }
        });

        // Setup request interceptor for authentication
        this.apiClient.interceptors.request.use((config) => {
            if (this.authState.apiKey) {
                config.headers['X-API-Key'] = this.authState.apiKey;
            }
            return config;
        });

        // Setup response interceptor for error handling
        this.apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    this.handleAuthenticationError();
                }
                return Promise.reject(error);
            }
        );

        // Load stored authentication
        this.loadStoredAuth();
        this.updateStatusBar();
    }

    /**
     * Authenticate with API key
     */
    async authenticate(apiKey?: string): Promise<boolean> {
        try {
            // Prompt for API key if not provided
            if (!apiKey) {
                apiKey = await vscode.window.showInputBox({
                    prompt: 'Enter your Lattice Engine API Key',
                    password: true,
                    placeHolder: 'API Key'
                });

                if (!apiKey) {
                    return false;
                }
            }

            // Test the API key
            const response = await this.apiClient.get('/auth/me', {
                headers: { 'X-API-Key': apiKey }
            });

            // Store authentication state
            this.authState = {
                isAuthenticated: true,
                user: response.data.user,
                organization: response.data.organization,
                apiKey: apiKey
            };

            // Store API key securely
            await this.context.secrets.store('lattice.apiKey', apiKey);

            // Update context and UI
            await vscode.commands.executeCommand('setContext', 'lattice.authenticated', true);
            await vscode.commands.executeCommand('setContext', 'lattice.hasActiveProject', false);
            
            this.updateStatusBar();
            
            vscode.window.showInformationMessage(
                `Successfully authenticated as ${this.authState.user?.email}`
            );

            return true;

        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Authentication failed';
            vscode.window.showErrorMessage(`Authentication failed: ${message}`);
            return false;
        }
    }

    /**
     * Sign out and clear stored credentials
     */
    async signOut(): Promise<void> {
        // Clear stored API key
        await this.context.secrets.delete('lattice.apiKey');
        
        // Reset authentication state
        this.authState = { isAuthenticated: false };
        
        // Update context
        await vscode.commands.executeCommand('setContext', 'lattice.authenticated', false);
        await vscode.commands.executeCommand('setContext', 'lattice.hasActiveProject', false);
        
        this.updateStatusBar();
        
        vscode.window.showInformationMessage('Signed out from Lattice Engine');
    }

    /**
     * Get current authentication state
     */
    getAuthState(): AuthState {
        return { ...this.authState };
    }

    /**
     * Get authenticated API client
     */
    getApiClient(): AxiosInstance {
        return this.apiClient;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.authState.isAuthenticated;
    }

    /**
     * Get current user
     */
    getCurrentUser(): User | undefined {
        return this.authState.user;
    }

    /**
     * Get current organization
     */
    getCurrentOrganization(): Organization | undefined {
        return this.authState.organization;
    }

    /**
     * Load stored authentication from secure storage
     */
    private async loadStoredAuth(): Promise<void> {
        try {
            const storedApiKey = await this.context.secrets.get('lattice.apiKey');
            
            if (storedApiKey) {
                // Validate stored API key
                const response = await this.apiClient.get('/auth/me', {
                    headers: { 'X-API-Key': storedApiKey }
                });

                this.authState = {
                    isAuthenticated: true,
                    user: response.data.user,
                    organization: response.data.organization,
                    apiKey: storedApiKey
                };

                await vscode.commands.executeCommand('setContext', 'lattice.authenticated', true);
            }
        } catch (error) {
            // Invalid stored key, clear it
            await this.context.secrets.delete('lattice.apiKey');
        }
    }

    /**
     * Handle authentication errors
     */
    private async handleAuthenticationError(): Promise<void> {
        this.authState = { isAuthenticated: false };
        await vscode.commands.executeCommand('setContext', 'lattice.authenticated', false);
        await vscode.commands.executeCommand('setContext', 'lattice.hasActiveProject', false);
        
        this.updateStatusBar();
        
        const action = await vscode.window.showErrorMessage(
            'Authentication expired. Please sign in again.',
            'Sign In'
        );

        if (action === 'Sign In') {
            await this.authenticate();
        }
    }

    /**
     * Update status bar display
     */
    private updateStatusBar(): void {
        if (this.authState.isAuthenticated && this.authState.user) {
            this.statusBarItem.text = `$(account) ${this.authState.user.email}`;
            this.statusBarItem.tooltip = `Lattice Engine - ${this.authState.user.email}`;
            this.statusBarItem.command = 'lattice.showStatus';
        } else {
            this.statusBarItem.text = '$(account) Sign In to Lattice';
            this.statusBarItem.tooltip = 'Click to authenticate with Lattice Engine';
            this.statusBarItem.command = 'lattice.authenticate';
        }
        
        this.statusBarItem.show();
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.statusBarItem.dispose();
    }
}