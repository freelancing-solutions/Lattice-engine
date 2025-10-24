# Lattice Portal - Integration Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication Setup](#authentication-setup)
3. [API Client Configuration](#api-client-configuration)
4. [WebSocket Integration](#websocket-integration)
5. [State Management](#state-management)
6. [Component Integration](#component-integration)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)
9. [Testing Strategies](#testing-strategies)
10. [Deployment Considerations](#deployment-considerations)

---

## Getting Started

### Prerequisites

Before integrating the Lattice Portal with the Mutation Engine, ensure you have:

- **Node.js 18+**: Required for Next.js 14
- **TypeScript 5+**: For type safety and development experience
- **Lattice Mutation Engine**: Running instance with API access
- **API Key**: Valid authentication credentials

### Project Setup

#### Install Dependencies

```bash
npm install @tanstack/react-query zustand axios ws
npm install -D @types/ws
```

#### Environment Configuration

Create a `.env.local` file in your project root:

```env
# Lattice Engine Configuration
NEXT_PUBLIC_LATTICE_ENGINE_URL=http://localhost:8000
NEXT_PUBLIC_LATTICE_WS_URL=ws://localhost:8000
LATTICE_API_KEY=lk_live_your_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Lattice Portal
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional: Analytics and Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn
```

#### TypeScript Configuration

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Authentication Setup

### API Key Management

Create a secure API key management system:

```typescript
// src/lib/auth.ts
export class LatticeAuth {
  private static instance: LatticeAuth;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): LatticeAuth {
    if (!LatticeAuth.instance) {
      LatticeAuth.instance = new LatticeAuth();
    }
    return LatticeAuth.instance;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    // Store securely (consider encryption for sensitive environments)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lattice_api_key', key);
    }
  }

  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('lattice_api_key');
    }
    
    return this.apiKey || process.env.LATTICE_API_KEY || null;
  }

  clearApiKey(): void {
    this.apiKey = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lattice_api_key');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getApiKey();
  }
}
```

### Authentication Hook

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { LatticeAuth } from '@/lib/auth';
import { latticeApi } from '@/lib/api';

interface AuthUser {
  user_id: string;
  organization_id: string;
  project_ids: string[];
  scopes: string[];
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = LatticeAuth.getInstance();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.isAuthenticated()) {
        setUser(null);
        return;
      }

      const response = await latticeApi.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      setError('Authentication failed');
      auth.clearApiKey();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (apiKey: string) => {
    try {
      setLoading(true);
      setError(null);

      auth.setApiKey(apiKey);
      await checkAuth();
    } catch (err) {
      setError('Invalid API key');
      throw err;
    }
  };

  const logout = () => {
    auth.clearApiKey();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };
}
```

---

## API Client Configuration

### Base API Client

```typescript
// src/lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { LatticeAuth } from './auth';

class LatticeApiClient {
  private client: AxiosInstance;
  private auth: LatticeAuth;

  constructor() {
    this.auth = LatticeAuth.getInstance();
    
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_LATTICE_ENGINE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = this.auth.getApiKey();
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.auth.clearApiKey();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

export const latticeApi = new LatticeApiClient();
```

### Typed API Services

```typescript
// src/lib/services/mutations.ts
import { latticeApi } from '../api';

export interface MutationProposal {
  spec_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'merge' | 'split' | 'refactor';
  changes: Record<string, any>;
  reason: string;
  initiated_by: string;
  priority: number;
}

export interface MutationResponse {
  mutation_id: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface MutationDetails {
  proposal_id: string;
  spec_id: string;
  operation_type: string;
  current_version: string;
  proposed_changes: Record<string, any>;
  reasoning: string;
  confidence: number;
  impact_analysis: {
    affected_specs: string[];
    risk_level: string;
    estimated_effort: string;
  };
  requires_approval: boolean;
  status: string;
  created_at: string;
}

export class MutationService {
  static async proposeMutation(proposal: MutationProposal): Promise<MutationResponse> {
    const response = await latticeApi.post('/api/mutations/propose', proposal);
    return response.data;
  }

  static async listMutations(params?: {
    kind?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ mutations: MutationDetails[]; total: number }> {
    const response = await latticeApi.get('/api/mutations', { params });
    return response.data;
  }

  static async getMutation(mutationId: string): Promise<MutationDetails> {
    const response = await latticeApi.get(`/api/mutations/${mutationId}`);
    return response.data;
  }

  static async getMutationStatus(mutationId: string): Promise<{
    mutation_id: string;
    status: string;
    progress: number;
    current_step: string;
    estimated_completion: string;
    logs: Array<{ timestamp: string; level: string; message: string }>;
  }> {
    const response = await latticeApi.get(`/api/mutations/${mutationId}/status`);
    return response.data;
  }

  static async assessRisk(assessment: {
    spec_id: string;
    operation_type: string;
    changes: Record<string, any>;
    context?: Record<string, any>;
  }): Promise<{
    risk_level: string;
    confidence: number;
    factors: string[];
    recommendations: string[];
  }> {
    const response = await latticeApi.post('/api/mutations/risk-assess', assessment);
    return response.data;
  }
}
```

---

## WebSocket Integration

### WebSocket Client

```typescript
// src/lib/websocket.ts
import { LatticeAuth } from './auth';

export interface WebSocketMessage {
  type: string;
  timestamp: string;
  data: any;
}

export type MessageHandler = (message: WebSocketMessage) => void;

export class LatticeWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private auth: LatticeAuth;

  constructor(private userId: string, private clientType: 'web' | 'vscode' | 'cli' = 'web') {
    this.auth = LatticeAuth.getInstance();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_LATTICE_WS_URL;
        const apiKey = this.auth.getApiKey();
        
        if (!apiKey) {
          reject(new Error('No API key available'));
          return;
        }

        this.ws = new WebSocket(`${wsUrl}/ws/${this.userId}/${this.clientType}?api_key=${apiKey}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.handlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });

    // Also call handlers for 'all' message types
    const allHandlers = this.handlers.get('*') || [];
    allHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in universal message handler:', error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  subscribe(messageType: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(messageType)) {
      this.handlers.set(messageType, []);
    }
    
    this.handlers.get(messageType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
```

### WebSocket Hook

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { LatticeWebSocket, WebSocketMessage, MessageHandler } from '@/lib/websocket';
import { useAuth } from './useAuth';

export function useWebSocket() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<LatticeWebSocket | null>(null);

  useEffect(() => {
    if (!user?.user_id) return;

    const ws = new LatticeWebSocket(user.user_id, 'web');
    wsRef.current = ws;

    ws.connect()
      .then(() => {
        setConnected(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setConnected(false);
      });

    return () => {
      ws.disconnect();
      wsRef.current = null;
      setConnected(false);
    };
  }, [user?.user_id]);

  const subscribe = (messageType: string, handler: MessageHandler) => {
    if (!wsRef.current) return () => {};
    return wsRef.current.subscribe(messageType, handler);
  };

  return {
    connected,
    error,
    subscribe,
    isConnected: () => wsRef.current?.isConnected() || false
  };
}
```

---

## State Management

### Zustand Store Setup

```typescript
// src/stores/mutationStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MutationDetails, MutationService } from '@/lib/services/mutations';

interface MutationState {
  mutations: MutationDetails[];
  loading: boolean;
  error: string | null;
  selectedMutation: MutationDetails | null;
  
  // Actions
  fetchMutations: (params?: any) => Promise<void>;
  selectMutation: (mutation: MutationDetails | null) => void;
  proposeMutation: (proposal: any) => Promise<void>;
  updateMutationStatus: (mutationId: string, status: string, progress?: number) => void;
}

export const useMutationStore = create<MutationState>()(
  devtools(
    (set, get) => ({
      mutations: [],
      loading: false,
      error: null,
      selectedMutation: null,

      fetchMutations: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await MutationService.listMutations(params);
          set({ mutations: response.mutations, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch mutations',
            loading: false 
          });
        }
      },

      selectMutation: (mutation) => {
        set({ selectedMutation: mutation });
      },

      proposeMutation: async (proposal) => {
        set({ loading: true, error: null });
        try {
          await MutationService.proposeMutation(proposal);
          // Refresh mutations list
          await get().fetchMutations();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to propose mutation',
            loading: false 
          });
          throw error;
        }
      },

      updateMutationStatus: (mutationId, status, progress) => {
        set((state) => ({
          mutations: state.mutations.map(mutation =>
            mutation.proposal_id === mutationId
              ? { ...mutation, status, progress }
              : mutation
          )
        }));
      }
    }),
    { name: 'mutation-store' }
  )
);
```

### React Query Integration

```typescript
// src/lib/queries/mutations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MutationService, MutationProposal } from '@/lib/services/mutations';

export const mutationKeys = {
  all: ['mutations'] as const,
  lists: () => [...mutationKeys.all, 'list'] as const,
  list: (params: any) => [...mutationKeys.lists(), params] as const,
  details: () => [...mutationKeys.all, 'detail'] as const,
  detail: (id: string) => [...mutationKeys.details(), id] as const,
  status: (id: string) => [...mutationKeys.detail(id), 'status'] as const,
};

export function useMutations(params?: any) {
  return useQuery({
    queryKey: mutationKeys.list(params),
    queryFn: () => MutationService.listMutations(params),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}

export function useMutation(mutationId: string) {
  return useQuery({
    queryKey: mutationKeys.detail(mutationId),
    queryFn: () => MutationService.getMutation(mutationId),
    enabled: !!mutationId,
  });
}

export function useMutationStatus(mutationId: string) {
  return useQuery({
    queryKey: mutationKeys.status(mutationId),
    queryFn: () => MutationService.getMutationStatus(mutationId),
    enabled: !!mutationId,
    refetchInterval: (data) => {
      // Stop polling if mutation is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds for active mutations
    },
  });
}

export function useProposeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposal: MutationProposal) => MutationService.proposeMutation(proposal),
    onSuccess: () => {
      // Invalidate and refetch mutations list
      queryClient.invalidateQueries({ queryKey: mutationKeys.lists() });
    },
  });
}
```

---

## Component Integration

### Mutation List Component

```typescript
// src/components/mutations/MutationList.tsx
import React, { useState } from 'react';
import { useMutations } from '@/lib/queries/mutations';
import { useMutationStore } from '@/stores/mutationStore';
import { MutationCard } from './MutationCard';
import { MutationFilters } from './MutationFilters';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface MutationListProps {
  projectId?: string;
}

export function MutationList({ projectId }: MutationListProps) {
  const [filters, setFilters] = useState({
    status: '',
    kind: '',
    limit: 50,
    offset: 0,
  });

  const { data, isLoading, error, refetch } = useMutations({
    ...filters,
    project_id: projectId,
  });

  const { selectMutation } = useMutationStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Failed to load mutations" 
        onRetry={() => refetch()}
      />
    );
  }

  const mutations = data?.mutations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mutations
        </h2>
        <button
          onClick={() => {/* Open mutation proposal modal */}}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Propose Mutation
        </button>
      </div>

      <MutationFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="space-y-4">
        {mutations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No mutations found matching your criteria.
            </p>
          </div>
        ) : (
          mutations.map((mutation) => (
            <MutationCard
              key={mutation.proposal_id}
              mutation={mutation}
              onClick={() => selectMutation(mutation)}
            />
          ))
        )}
      </div>

      {data && data.total > filters.limit && (
        <div className="flex justify-center">
          <button
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              offset: prev.offset + prev.limit 
            }))}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
```

### Real-time Updates Integration

```typescript
// src/components/mutations/MutationCard.tsx
import React, { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMutationStore } from '@/stores/mutationStore';
import { MutationDetails } from '@/lib/services/mutations';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface MutationCardProps {
  mutation: MutationDetails;
  onClick: () => void;
}

export function MutationCard({ mutation, onClick }: MutationCardProps) {
  const { subscribe } = useWebSocket();
  const { updateMutationStatus } = useMutationStore();

  useEffect(() => {
    // Subscribe to mutation updates
    const unsubscribe = subscribe('mutation_update', (message) => {
      if (message.data.mutation_id === mutation.proposal_id) {
        updateMutationStatus(
          mutation.proposal_id,
          message.data.status,
          message.data.progress
        );
      }
    });

    return unsubscribe;
  }, [mutation.proposal_id, subscribe, updateMutationStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'yellow';
      case 'validating': return 'blue';
      case 'pending_approval': return 'orange';
      case 'executing': return 'green';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {mutation.operation_type.charAt(0).toUpperCase() + mutation.operation_type.slice(1)} {mutation.spec_id}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {mutation.reasoning}
          </p>
        </div>
        <StatusBadge 
          status={mutation.status}
          color={getStatusColor(mutation.status)}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Confidence: {Math.round(mutation.confidence * 100)}%</span>
          <span>Priority: {mutation.requires_approval ? 'High' : 'Low'}</span>
        </div>
        <span>{new Date(mutation.created_at).toLocaleDateString()}</span>
      </div>

      {mutation.status === 'executing' && (
        <div className="mt-4">
          <ProgressBar 
            progress={mutation.progress || 0}
            className="h-2"
          />
        </div>
      )}
    </div>
  );
}
```

---

## Error Handling

### Global Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Something went wrong
                </h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// src/lib/errorHandler.ts
import { AxiosError } from 'axios';

export interface ApiError {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class ErrorHandler {
  static handleApiError(error: unknown): string {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      
      switch (error.response?.status) {
        case 400:
          return apiError?.message || 'Invalid request. Please check your input.';
        case 401:
          return 'Authentication failed. Please check your API key.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return apiError?.message || 'A conflict occurred. The resource may already exist.';
        case 422:
          return apiError?.message || 'The request could not be processed.';
        case 429:
          return 'Too many requests. Please wait before trying again.';
        case 500:
          return 'An internal server error occurred. Please try again later.';
        case 503:
          return 'The service is temporarily unavailable. Please try again later.';
        default:
          return apiError?.message || 'An unexpected error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred.';
  }

  static isRetryableError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      return status === 429 || status === 503 || status === 502 || status === 504;
    }
    return false;
  }

  static getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}
```

---

## Performance Optimization

### Query Optimization

```typescript
// src/lib/queries/optimizations.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { MutationService } from '@/lib/services/mutations';

// Infinite scrolling for large datasets
export function useInfiniteMutations(filters: any) {
  return useInfiniteQuery({
    queryKey: ['mutations', 'infinite', filters],
    queryFn: ({ pageParam = 0 }) => 
      MutationService.listMutations({
        ...filters,
        offset: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage, pages) => {
      const totalLoaded = pages.length * 20;
      return totalLoaded < lastPage.total ? totalLoaded : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Prefetch related data
export function usePrefetchMutationDetails() {
  const queryClient = useQueryClient();

  return (mutationId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['mutations', 'detail', mutationId],
      queryFn: () => MutationService.getMutation(mutationId),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };
}
```

### Component Optimization

```typescript
// src/components/optimized/VirtualizedMutationList.tsx
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { MutationDetails } from '@/lib/services/mutations';

interface VirtualizedMutationListProps {
  mutations: MutationDetails[];
  onMutationClick: (mutation: MutationDetails) => void;
  height: number;
}

const MutationItem = React.memo(({ index, style, data }: any) => {
  const { mutations, onMutationClick } = data;
  const mutation = mutations[index];

  return (
    <div style={style} className="px-4">
      <MutationCard 
        mutation={mutation}
        onClick={() => onMutationClick(mutation)}
      />
    </div>
  );
});

export function VirtualizedMutationList({ 
  mutations, 
  onMutationClick, 
  height 
}: VirtualizedMutationListProps) {
  const itemData = useMemo(() => ({
    mutations,
    onMutationClick,
  }), [mutations, onMutationClick]);

  return (
    <List
      height={height}
      itemCount={mutations.length}
      itemSize={120}
      itemData={itemData}
    >
      {MutationItem}
    </List>
  );
}
```

### Caching Strategy

```typescript
// src/lib/cache.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Prefetch strategies
export class CacheManager {
  static prefetchProjectData(projectId: string) {
    // Prefetch commonly accessed data
    queryClient.prefetchQuery({
      queryKey: ['projects', projectId],
      queryFn: () => ProjectService.getProject(projectId),
    });

    queryClient.prefetchQuery({
      queryKey: ['specs', projectId],
      queryFn: () => SpecService.listSpecs(projectId),
    });

    queryClient.prefetchQuery({
      queryKey: ['mutations', 'list', { project_id: projectId }],
      queryFn: () => MutationService.listMutations({ project_id: projectId }),
    });
  }

  static invalidateProjectData(projectId: string) {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    queryClient.invalidateQueries({ queryKey: ['specs', projectId] });
    queryClient.invalidateQueries({ 
      queryKey: ['mutations'], 
      predicate: (query) => 
        query.queryKey.includes(projectId)
    });
  }
}
```

---

## Testing Strategies

### API Testing

```typescript
// src/__tests__/services/mutations.test.ts
import { MutationService } from '@/lib/services/mutations';
import { latticeApi } from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api');
const mockedApi = latticeApi as jest.Mocked<typeof latticeApi>;

describe('MutationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('proposeMutation', () => {
    it('should propose a mutation successfully', async () => {
      const mockResponse = {
        data: {
          mutation_id: 'test-id',
          status: 'proposed',
          message: 'Success',
          timestamp: '2024-01-15T10:30:00Z'
        }
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      const proposal = {
        spec_id: 'spec-1',
        operation_type: 'update' as const,
        changes: { field: 'value' },
        reason: 'Test reason',
        initiated_by: 'user-1',
        priority: 5
      };

      const result = await MutationService.proposeMutation(proposal);

      expect(mockedApi.post).toHaveBeenCalledWith('/api/mutations/propose', proposal);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedApi.post.mockRejectedValue(error);

      const proposal = {
        spec_id: 'spec-1',
        operation_type: 'update' as const,
        changes: { field: 'value' },
        reason: 'Test reason',
        initiated_by: 'user-1',
        priority: 5
      };

      await expect(MutationService.proposeMutation(proposal)).rejects.toThrow('API Error');
    });
  });
});
```

### Component Testing

```typescript
// src/__tests__/components/MutationList.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MutationList } from '@/components/mutations/MutationList';
import { useMutations } from '@/lib/queries/mutations';

// Mock the query hook
jest.mock('@/lib/queries/mutations');
const mockedUseMutations = useMutations as jest.MockedFunction<typeof useMutations>;

// Mock the store
jest.mock('@/stores/mutationStore', () => ({
  useMutationStore: () => ({
    selectMutation: jest.fn(),
  }),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('MutationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockedUseMutations.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);

    renderWithQueryClient(<MutationList />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render mutations list', async () => {
    const mockMutations = [
      {
        proposal_id: '1',
        spec_id: 'spec-1',
        operation_type: 'update',
        status: 'proposed',
        reasoning: 'Test mutation',
        confidence: 0.9,
        requires_approval: true,
        created_at: '2024-01-15T10:30:00Z',
      },
    ];

    mockedUseMutations.mockReturnValue({
      data: { mutations: mockMutations, total: 1 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    renderWithQueryClient(<MutationList />);

    await waitFor(() => {
      expect(screen.getByText('Test mutation')).toBeInTheDocument();
    });
  });

  it('should render error state', () => {
    mockedUseMutations.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Test error'),
      refetch: jest.fn(),
    } as any);

    renderWithQueryClient(<MutationList />);

    expect(screen.getByText('Failed to load mutations')).toBeInTheDocument();
  });
});
```

### E2E Testing

```typescript
// cypress/e2e/mutations.cy.ts
describe('Mutation Management', () => {
  beforeEach(() => {
    // Set up authentication
    cy.window().then((win) => {
      win.localStorage.setItem('lattice_api_key', 'test-api-key');
    });

    // Mock API responses
    cy.intercept('GET', '/api/mutations*', { fixture: 'mutations.json' }).as('getMutations');
    cy.intercept('POST', '/api/mutations/propose', { fixture: 'mutation-response.json' }).as('proposeMutation');

    cy.visit('/mutations');
  });

  it('should display mutations list', () => {
    cy.wait('@getMutations');
    cy.get('[data-testid="mutation-card"]').should('have.length.greaterThan', 0);
  });

  it('should propose a new mutation', () => {
    cy.get('[data-testid="propose-mutation-button"]').click();
    
    cy.get('[data-testid="mutation-form"]').within(() => {
      cy.get('select[name="spec_id"]').select('spec-1');
      cy.get('select[name="operation_type"]').select('update');
      cy.get('textarea[name="reason"]').type('Test mutation proposal');
      cy.get('button[type="submit"]').click();
    });

    cy.wait('@proposeMutation');
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should filter mutations by status', () => {
    cy.wait('@getMutations');
    
    cy.get('[data-testid="status-filter"]').select('proposed');
    cy.get('[data-testid="mutation-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="status-badge"]').should('contain', 'Proposed');
    });
  });
});
```

---

## Deployment Considerations

### Environment Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/lattice/:path*',
        destination: `${process.env.LATTICE_ENGINE_URL}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Production Checklist

#### Security
- [ ] API keys stored securely (environment variables, not in code)
- [ ] HTTPS enabled for all communications
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection implemented

#### Performance
- [ ] Code splitting implemented
- [ ] Images optimized and lazy loaded
- [ ] Bundle size analyzed and optimized
- [ ] Caching strategies implemented
- [ ] CDN configured for static assets
- [ ] Database queries optimized
- [ ] API response caching enabled

#### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation setup
- [ ] Metrics dashboard created
- [ ] Alerting rules configured

#### Deployment
- [ ] CI/CD pipeline configured
- [ ] Environment variables properly set
- [ ] Database migrations automated
- [ ] Health checks implemented
- [ ] Rollback strategy defined
- [ ] Load balancing configured

---

This integration guide provides a comprehensive foundation for connecting the Lattice Portal dashboard to the Mutation Engine. Follow the patterns and examples provided to ensure a robust, scalable, and maintainable integration.