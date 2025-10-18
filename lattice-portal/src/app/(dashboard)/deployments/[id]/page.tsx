'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeploymentStore } from '@/stores/deployment-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import {
  Deployment,
  DeploymentStatus,
  DeploymentEnvironment,
  DeploymentStrategy,
  DeploymentStatusInfo,
  RollbackDeploymentRequest
} from '@/types';
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  GitBranch
} from 'lucide-react';

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deploymentId = params.id as string;

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'status' | 'logs'>('overview');
  const [rollbackReason, setRollbackReason] = useState('');
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [statusInfo, setStatusInfo] = useState<DeploymentStatusInfo | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);

  // Store state
  const {
    selectedDeployment,
    setSelectedDeployment,
    updateDeployment
  } = useDeploymentStore();

  const { addNotification } = useUIStore();

  // Helper functions
  const getStatusIcon = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.PENDING:
        return <Clock className="h-5 w-5" />;
      case DeploymentStatus.RUNNING:
        return <PlayCircle className="h-5 w-5" />;
      case DeploymentStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5" />;
      case DeploymentStatus.FAILED:
        return <XCircle className="h-5 w-5" />;
      case DeploymentStatus.ROLLED_BACK:
        return <RotateCcw className="h-5 w-5" />;
      case DeploymentStatus.CANCELLED:
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case DeploymentStatus.RUNNING:
        return 'bg-blue-100 text-blue-800';
      case DeploymentStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case DeploymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case DeploymentStatus.ROLLED_BACK:
        return 'bg-orange-100 text-orange-800';
      case DeploymentStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnvironmentColor = (environment: DeploymentEnvironment) => {
    switch (environment) {
      case DeploymentEnvironment.DEVELOPMENT:
        return 'bg-blue-100 text-blue-800';
      case DeploymentEnvironment.STAGING:
        return 'bg-yellow-100 text-yellow-800';
      case DeploymentEnvironment.PRODUCTION:
        return 'bg-red-100 text-red-800';
      case DeploymentEnvironment.TESTING:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrategyLabel = (strategy: DeploymentStrategy) => {
    switch (strategy) {
      case DeploymentStrategy.BLUE_GREEN:
        return 'Blue-Green';
      case DeploymentStrategy.ROLLING:
        return 'Rolling';
      case DeploymentStrategy.CANARY:
        return 'Canary';
      case DeploymentStrategy.RECREATE:
        return 'Recreate';
      case DeploymentStrategy.ROLLBACK:
        return 'Rollback';
      default:
        return strategy;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `~${minutes}m ${remainingSeconds}s remaining`;
  };

  // Load deployment
  const loadDeployment = async () => {
    try {
      const response = await apiClient.getDeployment(deploymentId);
      if (response.success && response.data) {
        setSelectedDeployment(response.data);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: error.error?.message || 'Failed to load deployment',
        duration: 5000
      });
    }
  };

  // Load deployment status
  const loadDeploymentStatus = async () => {
    try {
      const response = await apiClient.getDeploymentStatus(deploymentId);
      if (response.success && response.data) {
        setStatusInfo(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load deployment status:', error);
    }
  };

  // Handle rollback
  const handleRollback = async () => {
    if (!rollbackReason.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Rollback reason is required',
        duration: 3000
      });
      return;
    }

    setIsRollingBack(true);
    try {
      const request: RollbackDeploymentRequest = {
        reason: rollbackReason.trim()
      };

      const response = await apiClient.rollbackDeployment(deploymentId, request);
      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Rollback Started',
          message: 'Rollback deployment has been initiated',
          duration: 3000
        });
        setShowRollbackDialog(false);
        setRollbackReason('');
        loadDeployment(); // Reload current deployment
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Rollback Failed',
        message: error.error?.message || 'Failed to rollback deployment',
        duration: 5000
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  // Auto-refresh logic
  useEffect(() => {
    if (selectedDeployment?.status === DeploymentStatus.RUNNING ||
        selectedDeployment?.status === DeploymentStatus.PENDING) {
      // Set up interval to poll status every 5 seconds
      const interval = setInterval(() => {
        loadDeploymentStatus();
      }, 5000);
      setRefreshInterval(interval);

      return () => {
        clearInterval(interval);
        setRefreshInterval(null);
      };
    } else {
      // Clear interval when deployment is not running
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [selectedDeployment?.status]);

  // Initial load
  useEffect(() => {
    if (deploymentId) {
      loadDeployment();
      loadDeploymentStatus();
    }
  }, [deploymentId]);

  if (!selectedDeployment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Loading deployment...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Deployment {selectedDeployment.deploymentId.slice(0, 8)}...
              {getStatusIcon(selectedDeployment.status)}
              <Badge className={getStatusColor(selectedDeployment.status)}>
                {selectedDeployment.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              {getStrategyLabel(selectedDeployment.strategy)} deployment to {selectedDeployment.environment}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedDeployment.status === DeploymentStatus.RUNNING && (
            <Button variant="outline" size="sm" onClick={loadDeploymentStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          )}
          {(selectedDeployment.status === DeploymentStatus.COMPLETED ||
            selectedDeployment.status === DeploymentStatus.FAILED) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRollbackDialog(true)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Rollback
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Deployment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mutation ID</label>
                      <p className="font-mono text-sm">{selectedDeployment.mutationId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Spec ID</label>
                      <p className="font-mono text-sm">{selectedDeployment.specId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Environment</label>
                      <Badge className={getEnvironmentColor(selectedDeployment.environment)}>
                        {selectedDeployment.environment}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Strategy</label>
                      <Badge variant="outline">
                        {getStrategyLabel(selectedDeployment.strategy)}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created By</label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedDeployment.createdBy}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created At</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(selectedDeployment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-2">
                    {selectedDeployment.startedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Started:</span>
                        <span className="text-sm">{new Date(selectedDeployment.startedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedDeployment.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed:</span>
                        <span className="text-sm">{new Date(selectedDeployment.completedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedDeployment.startedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="text-sm">
                          {formatDuration(selectedDeployment.startedAt, selectedDeployment.completedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              {selectedDeployment.config && Object.keys(selectedDeployment.config).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-4 rounded overflow-auto">
                      {JSON.stringify(selectedDeployment.config, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              {/* Status Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statusInfo ? (
                    <>
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(statusInfo.progressPercentage)}%
                          </span>
                        </div>
                        <Progress value={statusInfo.progressPercentage} className="h-2" />
                      </div>

                      {/* Current Step */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Current Step</span>
                        <p className="text-sm text-muted-foreground">{statusInfo.currentStep}</p>
                      </div>

                      {/* Estimated Time */}
                      {statusInfo.estimatedRemainingSeconds && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Estimated Time</span>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeRemaining(statusInfo.estimatedRemainingSeconds)}
                          </p>
                        </div>
                      )}

                      {/* Status Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Started</span>
                          <p className="text-sm">
                            {statusInfo.startedAt
                              ? new Date(statusInfo.startedAt).toLocaleString()
                              : 'Not started'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Completed</span>
                          <p className="text-sm">
                            {statusInfo.completedAt
                              ? new Date(statusInfo.completedAt).toLocaleString()
                              : 'In progress'}
                          </p>
                        </div>
                      </div>

                      {/* Error Message */}
                      {statusInfo.errorMessage && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-destructive">Error Message</span>
                          <p className="text-sm text-destructive">{statusInfo.errorMessage}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading status information...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Logs</CardTitle>
                  <CardDescription>
                    Real-time deployment logs and events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <GitBranch className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Logs will be available here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This feature is coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Status Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(selectedDeployment.status)}
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`text-lg px-3 py-1 ${getStatusColor(selectedDeployment.status)}`}>
                  {selectedDeployment.status}
                </Badge>
              </div>
              {statusInfo && (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(statusInfo.progressPercentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge className={getEnvironmentColor(selectedDeployment.environment)}>
                  {selectedDeployment.environment}
                </Badge>
              </div>
              <div className="mt-2 text-center">
                <Badge variant="outline">
                  {getStrategyLabel(selectedDeployment.strategy)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Mutation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Mutation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-center">
                  <p className="font-mono text-sm break-all">{selectedDeployment.mutationId}</p>
                </div>
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View Mutation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {(selectedDeployment.status === DeploymentStatus.COMPLETED ||
            selectedDeployment.status === DeploymentStatus.FAILED) && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowRollbackDialog(true)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rollback Deployment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rollback Dialog */}
      {showRollbackDialog && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Rollback Deployment</CardTitle>
              <CardDescription>
                This will create a rollback deployment to revert the current deployment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rollback Reason</label>
                <Textarea
                  placeholder="Please provide a reason for this rollback..."
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRollbackDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleRollback}
                  disabled={isRollingBack}
                >
                  {isRollingBack ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rolling back...
                    </>
                  ) : (
                    'Confirm Rollback'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}