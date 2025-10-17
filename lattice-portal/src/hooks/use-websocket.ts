import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useMutationStore } from '@/stores/mutation-store';
import { useApprovalStore } from '@/stores/approval-store';
import { useUIStore } from '@/stores/ui-store';
import { WebSocketEvent, MutationStatusEvent, NotificationEvent, ApprovalEvent } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.lattice.dev';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { updateMutation, addMutation } = useMutationStore();
  const { addApproval, updateApproval } = useApprovalStore();
  const { addNotification } = useUIStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
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
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, need to reconnect manually
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
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

    // Approval events
    socket.on('approval:request', (event: ApprovalEvent) => {
      console.log('Approval request received:', event);
      addApproval(event.data);

      addNotification({
        type: 'info',
        title: 'Approval Required',
        message: `Approval requested for ${event.data.specId}`,
        duration: event.data.priority === 'critical' ? 0 : 10000,
      });
    });

    socket.on('approval:updated', (event: any) => {
      console.log('Approval updated:', event);
      if (event.approvalId && event.updates) {
        updateApproval(event.approvalId, event.updates);
      }

      addNotification({
        type: 'info',
        title: 'Approval Updated',
        message: `Approval status has been updated`,
        duration: 5000,
      });
    });

    socket.on('approval:response', (event: any) => {
      console.log('Approval response:', event);
      if (event.approvalId && event.status) {
        updateApproval(event.approvalId, { status: event.status });
      }

      addNotification({
        type: 'info',
        title: 'Approval Responded',
        message: `Approval has been ${event.status}`,
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

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user, updateMutation, addMutation, addApproval, updateApproval, addNotification]);

  // Manual emit function
  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  // Subscribe to specific events
  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Unsubscribe from events
  const unsubscribe = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return {
    isConnected,
    connectionError,
    emit,
    subscribe,
    unsubscribe,
  };
};