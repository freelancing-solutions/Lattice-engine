import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useMutationStore } from '@/stores/mutation-store';
import { useUIStore } from '@/stores/ui-store';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { WebSocketEvent, MutationStatusEvent, NotificationEvent } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { updateMutation, addMutation } = useMutationStore();
  const { addNotification } = useUIStore();
  const { handleRealTimeUpdate, setConnectionStatus } = useAnalyticsStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionError('Maximum reconnection attempts reached');
      return;
    }

    clearReconnectTimeout();
    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && !isConnected) {
        setReconnectAttempts(prev => prev + 1);
        socketRef.current.connect();
      }
    }, RECONNECT_INTERVAL);
  }, [reconnectAttempts, isConnected, clearReconnectTimeout]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setReconnectAttempts(0);
        clearReconnectTimeout();
      }
      return;
    }

    // Initialize WebSocket connection
    const socket = io(WS_URL, {
      auth: {
        token: localStorage.getItem('access_token'),
        userId: user.id,
        clientType: 'portal',
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
      clearReconnectTimeout();
      setConnectionStatus('connected');
      
      addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Real-time updates are now active',
        duration: 3000,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, need to reconnect manually
        attemptReconnect();
      } else if (reason === 'transport close' || reason === 'transport error') {
        // Network issues, attempt reconnection
        attemptReconnect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      setConnectionStatus('error');
      attemptReconnect();
    });

    // Mutation events
    socket.on('mutation_status_update', (event: MutationStatusEvent) => {
      console.log('Mutation status update:', event);
      updateMutation(event.mutation_id, {
        status: event.status as any,
        updated_at: new Date().toISOString(),
      });

      addNotification({
        type: 'info',
        title: 'Mutation Status Updated',
        message: `Mutation ${event.mutation_id} is now ${event.status}`,
        duration: 5000,
      });
    });

    socket.on('mutation_proposed', (event: any) => {
      console.log('New mutation proposed:', event);
      if (event.data) {
        addMutation(event.data);
      }

      addNotification({
        type: 'info',
        title: 'New Mutation Proposed',
        message: event.data?.description || 'A new mutation has been proposed',
        duration: 5000,
      });
    });

    socket.on('mutation_approved', (event: any) => {
      console.log('Mutation approved:', event);
      if (event.mutation_id) {
        updateMutation(event.mutation_id, {
          status: 'approved',
          approved_by: event.approved_by,
          updated_at: new Date().toISOString(),
        });
      }

      addNotification({
        type: 'success',
        title: 'Mutation Approved',
        message: `Mutation ${event.mutation_id} has been approved`,
        duration: 5000,
      });
    });

    socket.on('mutation_rejected', (event: any) => {
      console.log('Mutation rejected:', event);
      if (event.mutation_id) {
        updateMutation(event.mutation_id, {
          status: 'rejected',
          updated_at: new Date().toISOString(),
        });
      }

      addNotification({
        type: 'warning',
        title: 'Mutation Rejected',
        message: `Mutation ${event.mutation_id} has been rejected`,
        duration: 5000,
      });
    });

    // Notification events
    socket.on('notification_new', (event: NotificationEvent) => {
      console.log('New notification:', event);
      addNotification({
        type: event.notification.type as any,
        title: event.notification.title,
        message: event.notification.message,
        duration: event.notification.priority === 'urgent' ? 0 : 5000,
      });
    });

    // System events
    socket.on('system_alert', (event: any) => {
      console.log('System alert:', event);
      addNotification({
        type: 'warning',
        title: 'System Alert',
        message: event.message || 'A system alert has been issued',
        duration: 0, // Don't auto-dismiss system alerts
      });
    });

    socket.on('system_maintenance', (event: any) => {
      console.log('System maintenance:', event);
      addNotification({
        type: 'info',
        title: 'Scheduled Maintenance',
        message: event.message || 'System maintenance is scheduled',
        duration: 10000,
      });
    });

    // Project events
    socket.on('project_updated', (event: any) => {
      console.log('Project updated:', event);
      addNotification({
        type: 'info',
        title: 'Project Updated',
        message: `Project ${event.project_name || event.project_id} has been updated`,
        duration: 4000,
      });
    });

    // Analytics events
    socket.on('analytics_update', (event: any) => {
      console.log('Analytics update:', event);
      handleRealTimeUpdate({
        type: 'metrics_update',
        data: event.metrics,
      });
    });

    socket.on('agent_metrics_update', (event: any) => {
      console.log('Agent metrics update:', event);
      handleRealTimeUpdate({
        type: 'agent_update',
        data: event,
      });
    });

    socket.on('system_metrics_update', (event: any) => {
      console.log('System metrics update:', event);
      handleRealTimeUpdate({
        type: 'system_update',
        data: event,
      });
    });

    socket.on('performance_metrics_update', (event: any) => {
      console.log('Performance metrics update:', event);
      handleRealTimeUpdate({
        type: 'performance_update',
        data: event,
      });
    });

    // Cleanup on unmount
    return () => {
      clearReconnectTimeout();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setReconnectAttempts(0);
    };
  }, [isAuthenticated, user, updateMutation, addMutation, addNotification, attemptReconnect, clearReconnectTimeout]);

  // Manual emit function
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
      return true;
    }
    return false;
  }, [isConnected]);

  // Subscribe to specific events
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    }
    return () => {};
  }, []);

  // Unsubscribe from events
  const unsubscribe = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Force reconnect
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      setReconnectAttempts(0);
      setConnectionError(null);
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    emit,
    subscribe,
    unsubscribe,
    reconnect,
  };
};