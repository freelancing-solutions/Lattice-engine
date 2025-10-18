import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { useMutationStore } from '@/stores/mutation-store';
import { useApprovalStore } from '@/stores/approval-store';
import { useSpecStore } from '@/stores/spec-store';
import { useTaskStore } from '@/stores/task-store';
import { useGraphStore } from '@/stores/graph-store';
import { useDeploymentStore } from '@/stores/deployment-store';
import { useUIStore } from '@/stores/ui-store';
import { useOrganizationStore } from '@/stores/organization-store';
import { useBillingStore } from '@/stores/billing-store';
import { WebSocketEvent, MutationStatusEvent, NotificationEvent, ApprovalEvent, SpecEvent, TaskEvent, DeploymentEvent, TeamEvent } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.lattice.dev';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { updateMutation, addMutation } = useMutationStore();
  const { addApproval, updateApproval } = useApprovalStore();
  const { addSpec, updateSpec, removeSpec } = useSpecStore();
  const { addTask, updateTask } = useTaskStore();
  const { addNode, updateNode, removeNode } = useGraphStore();
  const { addDeployment, updateDeployment } = useDeploymentStore();
  const { addNotification } = useUIStore();
  const { addMember, updateMember, removeMember, addInvitation, updateInvitation } = useOrganizationStore();
  const { setSubscription, setInvoices, addInvoice: addInvoiceToStore, updateInvoice, removeInvoice } = useBillingStore();
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

    // Spec events (future backend integration)
    socket.on('spec_created', (event: SpecEvent) => {
      console.log('Spec created:', event);
      addSpec(event.data);
      addNotification({
        type: 'info',
        title: 'Spec Created',
        message: `Specification "${event.data.name}" has been created`,
        duration: 5000,
      });
    });

    socket.on('spec_updated', (event: SpecEvent) => {
      console.log('Spec updated:', event);
      updateSpec(event.data.id, event.data);
      addNotification({
        type: 'info',
        title: 'Spec Updated',
        message: `Specification "${event.data.name}" has been updated`,
        duration: 5000,
      });
    });

    socket.on('spec_deleted', (event: { specId: string; timestamp: string }) => {
      console.log('Spec deleted:', event);
      removeSpec(event.specId);
      addNotification({
        type: 'info',
        title: 'Spec Deleted',
        message: 'A specification has been deleted',
        duration: 5000,
      });
    });

    socket.on('spec_approved', (event: { specId: string; status: string; timestamp: string }) => {
      console.log('Spec approved:', event);
      updateSpec(event.specId, { status: event.status as any });
      addNotification({
        type: 'success',
        title: 'Spec Approved',
        message: 'A specification has been approved',
        duration: 5000,
      });
    });

    // Task events
    socket.on('task:requested', (event: TaskEvent) => {
      console.log('Task requested:', event);
      addTask(event.data);
      addNotification({
        type: 'info',
        title: 'Task Requested',
        message: `Task "${event.data.operation}" has been requested`,
        duration: 5000,
      });
    });

    socket.on('task:clarify', (event: TaskEvent) => {
      console.log('Task clarification requested:', event);
      updateTask(event.data.taskId, event.data);
      addNotification({
        type: 'info',
        title: 'Clarification Requested',
        message: `Clarification requested for task: ${event.data.clarificationNotes[event.data.clarificationNotes.length - 1]?.note?.substring(0, 50) || ''}...`,
        duration: 5000,
      });
    });

    socket.on('task:completed', (event: TaskEvent) => {
      console.log('Task completed:', event);
      updateTask(event.data.taskId, {
        status: event.data.status,
        result: event.data.result,
        error: event.data.error,
        updatedAt: event.timestamp
      });

      const isSuccess = event.data.status === 'COMPLETED';
      addNotification({
        type: isSuccess ? 'success' : 'error',
        title: isSuccess ? 'Task Completed' : 'Task Failed',
        message: `Task "${event.data.operation}" has ${isSuccess ? 'completed' : 'failed'}`,
        duration: 5000,
      });
    });

    // Graph events (future implementation)
    // Note: Backend WebSocketHub doesn't currently emit graph events
    // These handlers are prepared for future backend implementation

    // socket.on('graph:node_created', (event: { data: any; timestamp: string }) => {
    //   console.log('Graph node created:', event);
    //   addNode(event.data);
    //   addNotification({
    //     type: 'info',
    //     title: 'Node Created',
    //     message: `Node "${event.data.name}" has been added to the graph`,
    //     duration: 5000,
    //   });
    // });

    // socket.on('graph:node_updated', (event: { data: any; timestamp: string }) => {
    //   console.log('Graph node updated:', event);
    //   updateNode(event.data.id, event.data);
    //   addNotification({
    //     type: 'info',
    //     title: 'Node Updated',
    //     message: `Node "${event.data.name}" has been updated`,
    //     duration: 5000,
    //   });
    // });

    // socket.on('graph:node_deleted', (event: { nodeId: string; timestamp: string }) => {
    //   console.log('Graph node deleted:', event);
    //   removeNode(event.nodeId);
    //   addNotification({
    //     type: 'info',
    //     title: 'Node Deleted',
    //     message: 'A node has been removed from the graph',
    //     duration: 5000,
    //   });
    // });

    // socket.on('graph:edge_created', (event: { data: any; timestamp: string }) => {
    //   console.log('Graph edge created:', event);
    //   // Add edge to graph store when edge management is implemented
    //   addNotification({
    //     type: 'info',
    //     title: 'Relationship Created',
    //     message: `New relationship "${event.data.type}" created in the graph`,
    //     duration: 5000,
    //   });
    // });

    // socket.on('graph:edge_deleted', (event: { edgeId: string; timestamp: string }) => {
    //   console.log('Graph edge deleted:', event);
    //   // Remove edge from graph store when edge management is implemented
    //   addNotification({
    //     type: 'info',
    //     title: 'Relationship Deleted',
    //     message: 'A relationship has been removed from the graph',
    //     duration: 5000,
    //   });
    // });

    // socket.on('graph:layout_changed', (event: { layout: string; timestamp: string }) => {
    //   console.log('Graph layout changed:', event);
    //   addNotification({
    //     type: 'info',
    //     title: 'Layout Updated',
    //     message: `Graph layout changed to ${event.layout}`,
    //     duration: 3000,
    //   });
    // });

    // Deployment events (future implementation)
    // Note: Backend WebSocketHub doesn't currently emit deployment events
    // These handlers are prepared for future backend implementation

    // socket.on('deployment:created', (event: DeploymentEvent) => {
    //   console.log('Deployment created:', event);
    //   addDeployment(event.data);
    //   addNotification({
    //     type: 'info',
    //     title: 'Deployment Created',
    //     message: `Deployment ${event.data.deploymentId.slice(0, 8)}... created for ${event.data.environment}`,
    //     duration: 5000,
    //   });
    // });

    // socket.on('deployment:updated', (event: DeploymentEvent) => {
    //   console.log('Deployment updated:', event);
    //   updateDeployment(event.data.deploymentId, {
    //     status: event.data.status,
    //     startedAt: event.data.startedAt,
    //     completedAt: event.data.completedAt,
    //     errorMessage: event.data.errorMessage
    //   });
    //
    //   // Show notification based on status change
    //   if (event.data.status === 'RUNNING') {
    //     addNotification({
    //       type: 'info',
    //       title: 'Deployment Started',
    //       message: `Deployment ${event.data.deploymentId.slice(0, 8)}... is now running`,
    //       duration: 3000,
    //     });
    //   } else if (event.data.status === 'COMPLETED') {
    //     addNotification({
    //       type: 'success',
    //       title: 'Deployment Completed',
    //       message: `Deployment ${event.data.deploymentId.slice(0, 8)}... completed successfully`,
    //       duration: 5000,
    //     });
    //   } else if (event.data.status === 'FAILED') {
    //     addNotification({
    //       type: 'error',
    //       title: 'Deployment Failed',
    //       message: `Deployment ${event.data.deploymentId.slice(0, 8)}... failed: ${event.data.errorMessage || 'Unknown error'}`,
    //       duration: 0, // Don't auto-dismiss
    //     });
    //   }
    // });

    // socket.on('deployment:completed', (event: DeploymentEvent) => {
    //   console.log('Deployment completed:', event);
    //   updateDeployment(event.data.deploymentId, {
    //     status: 'COMPLETED',
    //     completedAt: event.timestamp
    //   });
    //   addNotification({
    //     type: 'success',
    //     title: 'Deployment Completed',
    //     message: `Deployment ${event.data.deploymentId.slice(0, 8)}... completed successfully`,
    //     duration: 5000,
    //   });
    // });

    // socket.on('deployment:failed', (event: DeploymentEvent) => {
    //   console.log('Deployment failed:', event);
    //   updateDeployment(event.data.deploymentId, {
    //     status: 'FAILED',
    //     errorMessage: event.data.errorMessage,
    //     completedAt: event.timestamp
    //   });
    //   addNotification({
    //     type: 'error',
    //     title: 'Deployment Failed',
    //     message: `Deployment ${event.data.deploymentId.slice(0, 8)}... failed: ${event.data.errorMessage || 'Unknown error'}`,
    //     duration: 0, // Don't auto-dismiss
    //   });
    // });

    // socket.on('deployment:rollback_initiated', (event: DeploymentEvent) => {
    //   console.log('Rollback initiated:', event);
    //   addDeployment(event.data);
    //   updateDeployment(event.data.rollbackFor, {
    //     rollbackId: event.data.deploymentId
    //   });
    //   addNotification({
    //     type: 'warning',
    //     title: 'Rollback Initiated',
    //     message: `Rollback deployment ${event.data.deploymentId.slice(0, 8)}... has been started`,
    //     duration: 5000,
    //   });
    // });

    // Billing Events (prepared for future implementation)
    // Note: Backend WebSocketHub doesn't currently emit billing events,
    // but these handlers are ready for when real-time billing updates are added

    socket.on('billing:subscription_updated', (event: any) => {
      console.log('Subscription updated:', event);
      if (event.data) {
        setSubscription(event.data);
      }

      const status = event.data?.status?.toLowerCase();
      const isSuccess = ['active', 'trialing'].includes(status);

      addNotification({
        type: isSuccess ? 'success' : 'warning',
        title: 'Subscription Updated',
        message: `Your subscription is now ${event.data?.status || 'updated'}`,
        duration: 5000,
      });
    });

    socket.on('billing:subscription_cancelled', (event: any) => {
      console.log('Subscription cancelled:', event);
      if (event.data) {
        setSubscription(event.data);
      }

      addNotification({
        type: 'warning',
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled. You will continue to have access until the end of your billing period.',
        duration: 10000,
      });
    });

    socket.on('billing:payment_failed', (event: any) => {
      console.log('Payment failed:', event);
      addNotification({
        type: 'error',
        title: 'Payment Failed',
        message: 'We were unable to process your payment. Please update your payment method to avoid service interruption.',
        duration: 0, // Don't auto-dismiss
      });
    });

    socket.on('billing:payment_succeeded', (event: any) => {
      console.log('Payment succeeded:', event);
      addNotification({
        type: 'success',
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully.',
        duration: 5000,
      });
    });

    socket.on('billing:invoice_created', (event: any) => {
      console.log('Invoice created:', event);
      if (event.data) {
        addInvoiceToStore(event.data);
      }

      addNotification({
        type: 'info',
        title: 'New Invoice Available',
        message: `A new invoice for ${event.data?.amount || 'your subscription'} is now available.`,
        duration: 5000,
      });
    });

    socket.on('billing:usage_limit_warning', (event: any) => {
      console.log('Usage limit warning:', event);
      addNotification({
        type: 'warning',
        title: 'Usage Limit Warning',
        message: `You are approaching your ${event.data?.metric || 'usage'} limit. Consider upgrading your plan to avoid service interruption.`,
        duration: 10000,
      });
    });

    socket.on('billing:usage_limit_reached', (event: any) => {
      console.log('Usage limit reached:', event);
      addNotification({
        type: 'error',
        title: 'Usage Limit Reached',
        message: `You have reached your ${event.data?.metric || 'usage'} limit. Upgrade your plan to continue using the service.`,
        duration: 0, // Don't auto-dismiss
      });
    });

    socket.on('billing:plan_downgraded', (event: any) => {
      console.log('Plan downgraded:', event);
      if (event.data) {
        setSubscription(event.data);
      }

      addNotification({
        type: 'warning',
        title: 'Plan Downgraded',
        message: `Your plan has been downgraded to ${event.data?.planName || 'a lower tier'}. Some features may be limited.`,
        duration: 10000,
      });
    });

    socket.on('billing:plan_upgraded', (event: any) => {
      console.log('Plan upgraded:', event);
      if (event.data) {
        setSubscription(event.data);
      }

      addNotification({
        type: 'success',
        title: 'Plan Upgraded',
        message: `Your plan has been upgraded to ${event.data?.planName || 'a higher tier'}. Enjoy your new features!`,
        duration: 5000,
      });
    });

    socket.on('billing:trial_ending', (event: any) => {
      console.log('Trial ending:', event);
      addNotification({
        type: 'warning',
        title: 'Trial Ending Soon',
        message: `Your trial will end in ${event.data?.daysRemaining || '3 days'}. Add a payment method to continue using the service.`,
        duration: 0, // Don't auto-dismiss
      });
    });

    socket.on('billing:trial_expired', (event: any) => {
      console.log('Trial expired:', event);
      if (event.data) {
        setSubscription(event.data);
      }

      addNotification({
        type: 'error',
        title: 'Trial Expired',
        message: 'Your trial has expired. Add a payment method to continue using the service.',
        duration: 0, // Don't auto-dismiss
      });
    });

    socket.on('billing:refund_processed', (event: any) => {
      console.log('Refund processed:', event);
      addNotification({
        type: 'info',
        title: 'Refund Processed',
        message: `A refund of ${event.data?.amount || 'your requested amount'} has been processed.`,
        duration: 5000,
      });
    });

    // Team Management Events (prepared for future implementation)
    // Note: Backend WebSocketHub doesn't currently emit team events,
    // but these handlers are ready for when real-time team updates are added

    socket.on('team:member_invited', (event: TeamEvent) => {
      console.log('Team member invited:', event);
      addInvitation(event.data as any);
      addNotification({
        type: 'info',
        title: 'Member Invited',
        message: `Invitation sent to ${(event.data as any).email}`,
        duration: 5000,
      });
    });

    socket.on('team:member_joined', (event: TeamEvent) => {
      console.log('Team member joined:', event);
      addMember(event.data as any);
      addNotification({
        type: 'success',
        title: 'Member Joined',
        message: `${(event.data as any).fullName} has joined the team`,
        duration: 5000,
      });
    });

    socket.on('team:member_removed', (event: TeamEvent) => {
      console.log('Team member removed:', event);
      removeMember((event.data as any).userId);
      addNotification({
        type: 'info',
        title: 'Member Removed',
        message: 'A team member has been removed',
        duration: 5000,
      });
    });

    socket.on('team:member_role_updated', (event: TeamEvent) => {
      console.log('Team member role updated:', event);
      updateMember((event.data as any).userId, { role: (event.data as any).role });
      addNotification({
        type: 'info',
        title: 'Role Updated',
        message: `${(event.data as any).fullName}'s role has been updated to ${(event.data as any).role}`,
        duration: 5000,
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user, updateMutation, addMutation, addApproval, updateApproval, addSpec, updateSpec, removeSpec, addTask, updateTask, addNode, updateNode, removeNode, addDeployment, updateDeployment, addNotification, addMember, updateMember, removeMember, addInvitation, updateInvitation, setSubscription, setInvoices, addInvoiceToStore, updateInvoice, removeInvoice]);

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