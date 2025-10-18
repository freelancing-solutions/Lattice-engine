'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DeploymentFilters, DeploymentEnvironment, DeploymentStatus } from '@/types';
import {
  Filter,
  X,
  Rocket,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface DeploymentFiltersProps {
  filters: DeploymentFilters;
  onFiltersChange: (filters: DeploymentFilters) => void;
  className?: string;
}

export function DeploymentFilters({
  filters,
  onFiltersChange,
  className = ''
}: DeploymentFiltersProps) {
  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.environment) count++;
    if (filters.status) count++;
    if (filters.mutationId) count++;
    if (filters.dateRange) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  // Handle individual filter changes
  const handleEnvironmentChange = (environment: string) => {
    onFiltersChange({
      ...filters,
      environment: environment === 'all' ? undefined : environment as DeploymentEnvironment
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : status as DeploymentStatus
    });
  };

  const handleMutationIdChange = (mutationId: string) => {
    onFiltersChange({
      ...filters,
      mutationId: mutationId.trim() || undefined
    });
  };

  // Quick filter actions
  const handleActiveDeployments = () => {
    onFiltersChange({
      status: DeploymentStatus.RUNNING
    });
  };

  const handleFailedDeployments = () => {
    onFiltersChange({
      status: DeploymentStatus.FAILED
    });
  };

  const handleProductionOnly = () => {
    onFiltersChange({
      environment: DeploymentEnvironment.PRODUCTION
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Deployment Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Environment Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Environment</label>
            <Select value={filters.environment || 'all'} onValueChange={handleEnvironmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="All environments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value={DeploymentEnvironment.DEVELOPMENT}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Development
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentEnvironment.TESTING}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Testing
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentEnvironment.STAGING}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Staging
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentEnvironment.PRODUCTION}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Production
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={DeploymentStatus.PENDING}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentStatus.RUNNING}>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-3 w-3" />
                    Running
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentStatus.COMPLETED}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentStatus.FAILED}>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3" />
                    Failed
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentStatus.ROLLED_BACK}>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3 w-3" />
                    Rolled Back
                  </div>
                </SelectItem>
                <SelectItem value={DeploymentStatus.CANCELLED}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Cancelled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mutation ID Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mutation ID</label>
            <Input
              placeholder="Search by mutation ID..."
              value={filters.mutationId || ''}
              onChange={(e) => handleMutationIdChange(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Filter Actions */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleActiveDeployments}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-3 w-3" />
              Active Deployments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFailedDeployments}
              className="flex items-center gap-2"
            >
              <XCircle className="h-3 w-3" />
              Failed Deployments
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleProductionOnly}
              className="flex items-center gap-2"
            >
              <Rocket className="h-3 w-3" />
              Production Only
            </Button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">Active Filters:</label>
            <div className="flex flex-wrap gap-2">
              {filters.environment && (
                <Badge variant="outline" className="text-xs">
                  Environment: {filters.environment}
                </Badge>
              )}
              {filters.status && (
                <Badge variant="outline" className="text-xs">
                  Status: {filters.status}
                </Badge>
              )}
              {filters.mutationId && (
                <Badge variant="outline" className="text-xs">
                  Mutation: {filters.mutationId.slice(0, 8)}...
                </Badge>
              )}
              {filters.dateRange && (
                <Badge variant="outline" className="text-xs">
                  Date Range: {filters.dateRange.start} - {filters.dateRange.end}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DeploymentFilters;