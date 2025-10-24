'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Deployment, DeploymentStatus, DeploymentEnvironment, DeploymentStrategy } from '@/types';
import {
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  MoreHorizontal,
  Eye,
  Loader2
} from 'lucide-react';

interface DeploymentCardProps {
  deployment: Deployment;
  onView: (deploymentId: string) => void;
  onRollback: (deploymentId: string) => void;
  className?: string;
}

export function DeploymentCard({
  deployment,
  onView,
  onRollback,
  className = ''
}: DeploymentCardProps) {
  // Helper functions
  const getStatusIcon = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case DeploymentStatus.RUNNING:
        return <PlayCircle className="h-4 w-4" />;
      case DeploymentStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case DeploymentStatus.FAILED:
        return <XCircle className="h-4 w-4" />;
      case DeploymentStatus.ROLLED_BACK:
        return <RotateCcw className="h-4 w-4" />;
      case DeploymentStatus.CANCELLED:
        return <AlertTriangle className="h-4 w-4" />;
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

  const getStrategyIcon = (strategy: DeploymentStrategy) => {
    switch (strategy) {
      case DeploymentStrategy.BLUE_GREEN:
        return <RotateCcw className="h-3 w-3" />;
      case DeploymentStrategy.ROLLING:
        return <Loader2 className="h-3 w-3" />;
      case DeploymentStrategy.CANARY:
        return <AlertTriangle className="h-3 w-3" />;
      case DeploymentStrategy.RECREATE:
        return <RotateCcw className="h-3 w-3" />;
      case DeploymentStrategy.ROLLBACK:
        return <RotateCcw className="h-3 w-3" />;
      default:
        return null;
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

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(deployment.status)}
            <Badge className={getStatusColor(deployment.status)}>
              {deployment.status}
            </Badge>
            {deployment.status === DeploymentStatus.RUNNING && (
              <div className="animate-pulse">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </div>
          <Badge className={getEnvironmentColor(deployment.environment)}>
            {deployment.environment}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          Deployment {deployment.deploymentId.slice(0, 8)}...
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {getStrategyIcon(deployment.strategy)}
          {getStrategyLabel(deployment.strategy)} Strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mutation:</span>
            <span className="font-mono text-xs truncate" title={deployment.mutationId}>
              {deployment.mutationId.slice(0, 12)}...
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spec:</span>
            <span className="font-mono text-xs truncate" title={deployment.specId}>
              {deployment.specId.slice(0, 12)}...
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(deployment.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created By:</span>
            <span className="truncate">{deployment.createdBy}</span>
          </div>
        </div>

        {/* Progress indicator for running deployments */}
        {deployment.status === DeploymentStatus.RUNNING && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress:</span>
              <span className="text-blue-600">Running...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Duration for completed deployments */}
        {(deployment.status === DeploymentStatus.COMPLETED ||
          deployment.status === DeploymentStatus.FAILED ||
          deployment.status === DeploymentStatus.ROLLED_BACK) &&
          deployment.startedAt && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span>{formatDuration(deployment.startedAt, deployment.completedAt || undefined)}</span>
          </div>
        )}

        {/* Error message for failed deployments */}
        {deployment.status === DeploymentStatus.FAILED && deployment.errorMessage && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-destructive">Error:</span>
            <p className="text-sm text-destructive truncate" title={deployment.errorMessage}>
              {deployment.errorMessage}
            </p>
          </div>
        )}

        {/* Rollback information */}
        {deployment.rollbackFor && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-orange-600">Rollback for:</span>
            <p className="text-sm text-orange-600 font-mono">
              {deployment.rollbackFor.slice(0, 8)}...
            </p>
            {deployment.rollbackReason && (
              <p className="text-xs text-muted-foreground italic">
                {deployment.rollbackReason}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(deployment.deploymentId)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {(deployment.status === DeploymentStatus.COMPLETED ||
            deployment.status === DeploymentStatus.FAILED) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRollback(deployment.deploymentId)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DeploymentCard;