import * as vscode from 'vscode';
import * as WebSocket from 'ws';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
    ConnectionStatus, 
    LatticeConfig, 
    WebSocketMessage, 
    MessageType, 
    ConnectionError,
    ApiResponse,
    EngineStatus
} from '../types';

export class LatticeConnectionManager {
    private context: vscode.ExtensionContext;
    private httpClient: AxiosInstance;
    private websocket?: WebSocket;
    private connectionStatus: ConnectionStatus;
    private reconnectTimer?: NodeJS.Timeout;
    private heartbeatTimer?: NodeJS.Timeout;
    private readonly maxReconnectAttempts = 5;
    private reconnectAttempts = 0;
    private readonly reconnectDelay = 5000; // 5 seconds

    // Event emitters
    private connectionStatusEmitter = new vscode.EventEmitter<boolean>();
    private messageEmitter = new vscode.EventEmitter<WebSocketMessage>();

    public readonly onConnectionStatusChanged = this.connectionStatusEmitter.event;
    public readonly onMessage = this.messageEmitter.event;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.connectionStatus = {
            connected: false,
            engineUrl: this.getEngineUrl()
        };

        this.httpClient = axios.create({
            baseURL: this.connectionStatus.engineUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'VSCode-Lattice-Extension/0.1.0'
            }
        });

        this.setupHttpInterceptors();
    }

    private setupHttpInterceptors() {
        // Request interceptor to add API key
        this.httpClient.interceptors.request.use((config) => {
            const apiKey = this.getApiKey();
            if (apiKey) {
                config.headers['Authorization'] = `Bearer ${apiKey}`;
            }
            return config;
        });

        // Response interceptor for error handling
        this.httpClient.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('HTTP request failed:', error);
                if (error.response?.status === 401) {
                    vscode.window.showErrorMessage('Invalid API key. Please check your Lattice configuration.');
                }
                return Promise.reject(error);
            }
        );
    }

    public async connect(): Promise<boolean> {
        try {
            console.log('Connecting to Lattice Mutation Engine...');
            
            // Test HTTP connection first
            const healthCheck = await this.checkEngineHealth();
            if (!healthCheck.success) {
                throw new ConnectionError('Engine health check failed');
            }

            // Establish WebSocket connection if real-time updates are enabled
            const config = this.getConfig();
            if (config.realTimeUpdates) {
                await this.connectWebSocket();
            }

            this.connectionStatus.connected = true;
            this.connectionStatus.lastConnected = new Date();
            this.connectionStatus.error = undefined;
            this.reconnectAttempts = 0;

            this.connectionStatusEmitter.fire(true);
            console.log('Successfully connected to Lattice Mutation Engine');
            return true;

        } catch (error) {
            console.error('Failed to connect to Lattice Mutation Engine:', error);
            this.connectionStatus.connected = false;
            this.connectionStatus.error = error instanceof Error ? error.message : 'Unknown error';
            
            this.connectionStatusEmitter.fire(false);
            this.scheduleReconnect();
            return false;
        }
    }

    public disconnect(): void {
        console.log('Disconnecting from Lattice Mutation Engine...');
        
        this.clearTimers();
        
        if (this.websocket) {
            this.websocket.close();
            this.websocket = undefined;
        }

        this.connectionStatus.connected = false;
        this.connectionStatusEmitter.fire(false);
        
        console.log('Disconnected from Lattice Mutation Engine');
    }

    public async reconnect(): Promise<boolean> {
        this.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
        return this.connect();
    }

    private async connectWebSocket(): Promise<void> {
        return new Promise((resolve, reject) => {
            const wsUrl = this.getWebSocketUrl();
            console.log('Connecting to WebSocket:', wsUrl);

            this.websocket = new WebSocket(wsUrl, {
                headers: {
                    'Authorization': `Bearer ${this.getApiKey()}`
                }
            });

            this.websocket.on('open', () => {
                console.log('WebSocket connected');
                this.startHeartbeat();
                resolve();
            });

            this.websocket.on('message', (data: WebSocket.Data) => {
                try {
                    const message: WebSocketMessage = JSON.parse(data.toString());
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            });

            this.websocket.on('error', (error) => {
                console.error('WebSocket error:', error);
                reject(new ConnectionError('WebSocket connection failed', error));
            });

            this.websocket.on('close', (code, reason) => {
                console.log('WebSocket closed:', code, reason.toString());
                this.websocket = undefined;
                this.clearTimers();
                
                if (this.connectionStatus.connected) {
                    this.scheduleReconnect();
                }
            });

            // Timeout for connection
            setTimeout(() => {
                if (this.websocket?.readyState !== WebSocket.OPEN) {
                    reject(new ConnectionError('WebSocket connection timeout'));
                }
            }, 10000);
        });
    }

    private handleWebSocketMessage(message: WebSocketMessage): void {
        console.log('Received WebSocket message:', message.type);
        
        switch (message.type) {
            case MessageType.HEARTBEAT:
                // Respond to heartbeat
                this.sendWebSocketMessage({
                    type: MessageType.HEARTBEAT,
                    payload: { timestamp: new Date() },
                    timestamp: new Date()
                });
                break;
                
            case MessageType.ENGINE_STATUS:
                // Handle engine status updates
                break;
                
            default:
                // Forward message to listeners
                this.messageEmitter.fire(message);
                break;
        }
    }

    private sendWebSocketMessage(message: WebSocketMessage): void {
        if (this.websocket?.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
        }
    }

    private startHeartbeat(): void {
        this.heartbeatTimer = setInterval(() => {
            this.sendWebSocketMessage({
                type: MessageType.HEARTBEAT,
                payload: { timestamp: new Date() },
                timestamp: new Date()
            });
        }, 30000); // 30 seconds
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            vscode.window.showErrorMessage(
                'Failed to connect to Lattice Mutation Engine after multiple attempts. Please check your configuration.'
            );
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
        
        console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    private clearTimers(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
    }

    // HTTP API methods
    public async checkEngineHealth(): Promise<ApiResponse<EngineStatus>> {
        try {
            const response: AxiosResponse<ApiResponse<EngineStatus>> = await this.httpClient.get('/health');
            return response.data;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Health check failed',
                timestamp: new Date()
            };
        }
    }

    public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.httpClient.get(endpoint);
            return response.data;
        } catch (error) {
            throw new ConnectionError(`GET ${endpoint} failed`, error);
        }
    }

    public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.httpClient.post(endpoint, data);
            return response.data;
        } catch (error) {
            throw new ConnectionError(`POST ${endpoint} failed`, error);
        }
    }

    public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.httpClient.put(endpoint, data);
            return response.data;
        } catch (error) {
            throw new ConnectionError(`PUT ${endpoint} failed`, error);
        }
    }

    public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.httpClient.delete(endpoint);
            return response.data;
        } catch (error) {
            throw new ConnectionError(`DELETE ${endpoint} failed`, error);
        }
    }

    // Configuration methods
    public getConfig(): LatticeConfig {
        const config = vscode.workspace.getConfiguration('lattice');
        return {
            engineUrl: config.get('engineUrl', 'http://localhost:8000'),
            apiKey: config.get('apiKey', ''),
            autoConnect: config.get('autoConnect', true),
            approvalNotifications: config.get('approvalNotifications', true),
            realTimeUpdates: config.get('realTimeUpdates', true),
            approvalTimeout: config.get('approvalTimeout', 300),
            showInlineDecorations: config.get('showInlineDecorations', true)
        };
    }

    public getEngineUrl(): string {
        return this.getConfig().engineUrl;
    }

    public getApiKey(): string {
        return this.getConfig().apiKey;
    }

    public updateEngineUrl(url: string): void {
        this.connectionStatus.engineUrl = url;
        this.httpClient.defaults.baseURL = url;
    }

    public setRealTimeUpdates(enabled: boolean): void {
        const currentlyEnabled = this.websocket !== undefined;
        
        if (enabled && !currentlyEnabled && this.connectionStatus.connected) {
            this.connectWebSocket().catch(console.error);
        } else if (!enabled && currentlyEnabled) {
            this.websocket?.close();
            this.websocket = undefined;
        }
    }

    private getWebSocketUrl(): string {
        const baseUrl = this.getEngineUrl();
        const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws';
        return wsUrl;
    }

    // Status methods
    public isConnected(): boolean {
        return this.connectionStatus.connected;
    }

    public getConnectionStatus(): ConnectionStatus {
        return { ...this.connectionStatus };
    }

    public dispose(): void {
        this.disconnect();
        this.connectionStatusEmitter.dispose();
        this.messageEmitter.dispose();
    }
}