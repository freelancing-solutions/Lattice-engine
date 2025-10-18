'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { DeploymentStatus, DeploymentStatusInfo } from '@/types';
import {
  RefreshCw,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Timer
} from 'lucide-react';

interface DeploymentProgressProps {
  deploymentId: string;
  status: DeploymentStatus;
  progressPercentage: number;
  currentStep: string;
  estimatedRemainingSeconds: number | null;
  autoRefresh?: boolean;
  className?: string;
}

export function DeploymentProgress({
  deploymentId,
  status,
  progressPercentage,
  currentStep,
  estimatedRemainingSeconds,
  autoRefresh = true,
  className = ''
}: DeploymentProgressProps) {
  // State
  const [statusInfo, setStatusInfo] = useState<DeploymentStatusInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const shouldRefresh = status === DeploymentStatus.PENDING || status === DeploymentStatus.RUNNING;

    if (shouldRefresh) {
      const interval = setInterval(async () => {
        try {
          setRefreshing(true);
          const response = await apiClient.getDeploymentStatus(deploymentId);
          if (response.success && response.data) {
            setStatusInfo(response.data);
            setError(null);
          }
        } catch (err: any) {
          console.error('Failed to refresh deployment status:', err);
          setError(err.error?.message || 'Failed to refresh status');
        } finally {
          setRefreshing(false);
        }
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, status, deploymentId]);

  // Manual refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.getDeploymentStatus(deploymentId);
      if (response.success && response.data) {
        setStatusInfo(response.data);
        setError(null);
      }
    } catch (err: any) {
      setError(err.error?.message || 'Failed to refresh status');
    } finally {
      setRefreshing(false);
    }
  };

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
        return <AlertTriangle className="h-5 w-5" />;
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

  const getProgressColor = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.PENDING:
        return 'bg-yellow-500';
      case DeploymentStatus.RUNNING:
        return 'bg-blue-500';
      case DeploymentStatus.COMPLETED:
        return 'bg-green-500';
      case DeploymentStatus.FAILED:
        return 'bg-red-500';
      case DeploymentStatus.ROLLED_BACK:
        return 'bg-orange-500';
      case DeploymentStatus.CANCELLED:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (!seconds || seconds <= 0) return 'Unknown';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `~${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `~${minutes}m ${remainingSeconds}s remaining`;
    } else {
      return `~${remainingSeconds}s remaining`;
    }
  };

  // Use current status or statusInfo status if available
  const currentStatus = statusInfo?.status || status;
  const currentProgress = statusInfo?.progressPercentage || progressPercentage;
  const currentStep = statusInfo?.currentStep || currentStep;
  const currentTimeRemaining = statusInfo?.estimatedRemainingSeconds || estimatedRemainingSeconds;

  // Deployment steps for timeline visualization
  const deploymentSteps = [
    { name: 'Validating environment', status: 'completed' },
    { name: 'Preparing infrastructure', status: currentProgress > 20 ? 'completed' : currentProgress > 0 ? 'current' : 'pending' },
    { name: 'Deploying changes', status: currentProgress > 40 ? 'completed' : currentProgress > 20 ? 'current' : 'pending' },
    { name: 'Running health checks', status: currentProgress > 60 ? 'completed' : currentProgress > 40 ? 'current' : 'pending' },
    { name: 'Finalizing deployment', status: currentProgress > 80 ? 'completed' : currentProgress > 60 ? 'current' : 'pending' },
    { name: 'Deployment completed', status: currentProgress === 100 ? 'completed' : currentProgress > 80 ? 'current' : 'pending' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(currentStatus)}
              Deployment Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {Math.round(currentProgress)}%
              </span>
            </div>
            <Progress
              value={currentProgress}
              className="h-3"
              style={{
                '--progress-foreground': `hsl(var(--${getProgressColor(currentStatus).replace('bg-', '').replace('-500', '-500')}))`
              } as any}
            />
          </div>

          {/* Current Step */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Current Step</span>
            <div className="flex items-center gap-2">
              {currentStatus === DeploymentStatus.RUNNING && (
                <div className="animate-pulse">
                  <PlayCircle className="h-4 w-4 text-blue-500" />
                </div>
              )}
              <p className="text-sm">{currentStep}</p>
            </div>
          </div>

          {/* Estimated Time */}
          {currentTimeRemaining && currentTimeRemaining > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Estimated Time</span>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {formatTimeRemaining(currentTimeRemaining)}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-destructive">Error</span>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Refresh Status */}
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Refreshing status...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deploymentSteps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const isPending = step.status === 'pending';

              return (
                <div key={index} className="flex items-center gap-3">
                  {/* Step Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      isCompleted ? 'text-green-700' :
                      isCurrent ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-blue-600 mt-1">
                        In progress...
                      </div>
                    )}
                    {isCompleted && (
                      <div className="text-xs text-green-600 mt-1">
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Connection Line */}
                  {index < deploymentSteps.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                      isCompleted ? 'bg-green-200' : 'bg-gray-200'
                    }`} style={{ marginLeft: '-12px' }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DeploymentProgress;