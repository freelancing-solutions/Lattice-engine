'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeploymentStore } from '@/stores/deployment-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import {
  Deployment,
  DeploymentStatus,
  DeploymentEnvironment,
  DeploymentStrategy
} from '@/types';
import {
  Plus,
  Search,
  Rocket,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  MoreHorizontal,
  Loader2
} from 'lucide-react';

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

export default function DeploymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Store state
  const {
    deployments,
    filters,
    isLoading,
    error,
    pendingCount,
    runningCount,
    setDeployments,
    setFilters,
    setLoading,
    setError
  } = useDeploymentStore();

  const { addNotification } = useUIStore();

  // Load deployments
  const loadDeployments = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestFilters: any = {};
      if (selectedEnvironment !== 'all') {
        requestFilters.environment = selectedEnvironment as DeploymentEnvironment;
      }
      if (selectedStatus !== 'all') {
        requestFilters.status = selectedStatus as DeploymentStatus;
      }
      if (searchTerm) {
        requestFilters.mutationId = searchTerm;
      }

      const response = await apiClient.getDeployments(requestFilters);

      if (response.success && response.data) {
        setDeployments(response.data.items);
      } else {
        setError(response.error?.message || 'Failed to load deployments');
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to load deployments';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle deployment actions
  const handleViewDetails = (deploymentId: string) => {
    // Navigate to deployment detail page
    window.location.href = `/dashboard/deployments/${deploymentId}`;
  };

  const handleRollback = async (deploymentId: string) => {
    try {
      const reason = prompt('Please provide a reason for the rollback:');
      if (!reason) return;

      const response = await apiClient.rollbackDeployment(deploymentId, { reason });

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Rollback Started',
          message: 'Rollback deployment has been initiated',
          duration: 3000
        });
        loadDeployments(); // Reload deployments
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Rollback Failed',
        message: error.error?.message || 'Failed to rollback deployment',
        duration: 5000
      });
    }
  };

  // Filter deployments based on search term
  const filteredDeployments = deployments.filter(deployment =>
    deployment.mutationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deployment.specId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load data on component mount and when filters change
  useEffect(() => {
    loadDeployments();
  }, [selectedEnvironment, selectedStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="text-muted-foreground">
            Monitor and manage deployments across environments
          </p>
        </div>
        <Link href="/dashboard/deployments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Deployment
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-destructive">{error}</div>
              <Button variant="outline" size="sm" onClick={loadDeployments}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by mutation ID or spec ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80"
              />
            </div>
            <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value={DeploymentEnvironment.DEVELOPMENT}>Development</SelectItem>
                <SelectItem value={DeploymentEnvironment.STAGING}>Staging</SelectItem>
                <SelectItem value={DeploymentEnvironment.PRODUCTION}>Production</SelectItem>
                <SelectItem value={DeploymentEnvironment.TESTING}>Testing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={DeploymentStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={DeploymentStatus.RUNNING}>Running</SelectItem>
                <SelectItem value={DeploymentStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={DeploymentStatus.FAILED}>Failed</SelectItem>
                <SelectItem value={DeploymentStatus.ROLLED_BACK}>Rolled Back</SelectItem>
                <SelectItem value={DeploymentStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deployment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredDeployments.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12">
            <Rocket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No deployments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedEnvironment !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Create your first deployment to get started'}
            </p>
            {!searchTerm && selectedEnvironment === 'all' && selectedStatus === 'all' && (
              <Link href="/dashboard/deployments/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Deployment
                </Button>
              </Link>
            )}
          </div>
        ) : (
          // Deployment cards
          filteredDeployments.map((deployment) => (
            <Card key={deployment.deploymentId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deployment.status)}
                    <Badge className={getStatusColor(deployment.status)}>
                      {deployment.status}
                    </Badge>
                  </div>
                  <Badge className={getEnvironmentColor(deployment.environment)}>
                    {deployment.environment}
                  </Badge>
                </div>
                <CardTitle className="text-lg">
                  Deployment {deployment.deploymentId.slice(0, 8)}...
                </CardTitle>
                <CardDescription>
                  {getStrategyLabel(deployment.strategy)} Strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mutation:</span>
                    <span className="font-mono text-xs">{deployment.mutationId.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spec:</span>
                    <span className="font-mono text-xs">{deployment.specId.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(deployment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress indicator for running deployments */}
                {deployment.status === DeploymentStatus.RUNNING && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span>Running...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(deployment.deploymentId)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {(deployment.status === DeploymentStatus.COMPLETED ||
                    deployment.status === DeploymentStatus.FAILED) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRollback(deployment.deploymentId)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Active deployments count */}
      {(pendingCount > 0 || runningCount > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{runningCount}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}