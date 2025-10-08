'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, GitBranch, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutationStore } from '@/stores/mutation-store';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { Mutation, Project } from '@/types';
import Link from 'next/link';

export default function MutationsPage() {
  const {
    mutations,
    setMutations,
    filters,
    setFilters,
    isLoading,
    error,
    setLoading,
    setError,
  } = useMutationStore();

  const { projects, setProjects } = useProjectStore();
  const { addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMutations();
    loadProjects();
  }, [filters]);

  const loadMutations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getMutations({
        ...filters,
        search: searchTerm || undefined,
      });
      
      if (response.success && response.data) {
        setMutations(response.data.items);
      } else {
        setError(response.error?.message || 'Failed to load mutations');
      }
    } catch (error: any) {
      setError(error.error?.message || 'Failed to load mutations');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      if (response.success && response.data) {
        setProjects(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      status: status === 'all' ? undefined : [status],
    });
  };

  const handleRiskFilter = (risk: string) => {
    setFilters({
      ...filters,
      risk_level: risk === 'all' ? undefined : [risk],
    });
  };

  const handleProjectFilter = (projectId: string) => {
    setFilters({
      ...filters,
      project_id: projectId === 'all' ? undefined : projectId,
    });
  };

  const handleApprove = async (mutationId: string) => {
    try {
      const response = await apiClient.approveMutation(mutationId);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Mutation Approved',
          message: 'The mutation has been approved successfully',
        });
        loadMutations(); // Refresh the list
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: error.error?.message || 'Failed to approve mutation',
      });
    }
  };

  const handleReject = async (mutationId: string) => {
    try {
      const response = await apiClient.rejectMutation(mutationId, 'Rejected from dashboard');
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Mutation Rejected',
          message: 'The mutation has been rejected',
        });
        loadMutations(); // Refresh the list
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: error.error?.message || 'Failed to reject mutation',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'executed':
        return <GitBranch className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'executed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mutations</h1>
          <p className="text-muted-foreground">
            Manage and review code mutations across all projects
          </p>
        </div>
        <Link href="/dashboard/mutations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Propose Mutation
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mutations..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="executed">Executed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Risk Filter */}
            <Select onValueChange={handleRiskFilter} defaultValue="all">
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            {/* Project Filter */}
            <Select onValueChange={handleProjectFilter} defaultValue="all">
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadMutations} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mutations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-muted rounded w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mutations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No mutations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filters.status || filters.risk_level || filters.project_id
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by proposing your first mutation'
                }
              </p>
              <Link href="/dashboard/mutations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Propose Mutation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mutations.map((mutation) => (
            <Card key={mutation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(mutation.status)}
                      <h3 className="font-semibold truncate">{mutation.description}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Project: {getProjectName(mutation.project_id)}</span>
                      <span>•</span>
                      <span>{new Date(mutation.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{mutation.operation_type}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(mutation.status)}`} />
                        {mutation.status}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getRiskColor(mutation.risk_level)}`} />
                        {mutation.risk_level} risk
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {mutation.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(mutation.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(mutation.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/mutations/${mutation.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {mutation.status === 'approved' && (
                          <DropdownMenuItem>
                            Execute Mutation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete Mutation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}