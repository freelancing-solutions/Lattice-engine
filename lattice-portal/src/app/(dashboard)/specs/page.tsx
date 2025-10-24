'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, FileText, CheckCircle, Clock, Archive, MoreHorizontal } from 'lucide-react';
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
import { useSpecStore } from '@/stores/spec-store';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';
import { Spec, SpecStatus, NodeType } from '@/types';
import Link from 'next/link';

export default function SpecsPage() {
  const {
    specs,
    setSpecs,
    filters,
    setFilters,
    isLoading,
    error,
    setLoading,
    setError,
    setCurrentProjectId,
  } = useSpecStore();
  const { projects } = useProjectStore();
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    loadSpecs();
  }, [selectedProjectId, filters]);

  const loadSpecs = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    setError(null);
    setCurrentProjectId(selectedProjectId);

    try {
      const response = await apiClient.getSpecs(selectedProjectId, {
        ...filters,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setSpecs(response.data.items);
      } else {
        setError(response.error?.message || 'Failed to load specs');
      }
    } catch (error: any) {
      setError(error.error?.message || 'Failed to load specs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      status: status === 'all' ? undefined : status as SpecStatus,
    });
  };

  const handleTypeFilter = (type: string) => {
    setFilters({
      ...filters,
      type: type === 'all' ? undefined : type as NodeType,
    });
  };

  const handleProjectFilter = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleApproveSpec = async (specId: string) => {
    try {
      const response = await apiClient.approveSpec(specId);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Spec Approved',
          message: 'Specification has been approved successfully',
        });
        loadSpecs();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: error.error?.message || 'Failed to approve spec',
      });
    }
  };

  const handleDeleteSpec = async (specId: string) => {
    if (!confirm('Are you sure you want to delete this spec?')) return;

    try {
      const response = await apiClient.deleteSpec(specId);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Spec Deleted',
          message: 'Specification has been deleted successfully',
        });
        loadSpecs();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: error.error?.message || 'Failed to delete spec',
      });
    }
  };

  const getStatusColor = (status: SpecStatus) => {
    switch (status) {
      case SpecStatus.ACTIVE:
        return 'bg-green-500';
      case SpecStatus.DRAFT:
        return 'bg-yellow-500';
      case SpecStatus.DEPRECATED:
        return 'bg-gray-500';
      case SpecStatus.PENDING:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: NodeType) => {
    switch (type) {
      case NodeType.SPEC:
        return 'bg-blue-500';
      case NodeType.MODULE:
        return 'bg-purple-500';
      case NodeType.CONTROLLER:
        return 'bg-green-500';
      case NodeType.MODEL:
        return 'bg-orange-500';
      case NodeType.ROUTE_API:
        return 'bg-red-500';
      case NodeType.TASK:
        return 'bg-indigo-500';
      case NodeType.TEST:
        return 'bg-pink-500';
      case NodeType.AGENT:
        return 'bg-cyan-500';
      case NodeType.GOAL:
        return 'bg-emerald-500';
      case NodeType.CONSTRAINT:
        return 'bg-amber-500';
      case NodeType.DOCUMENTATION:
        return 'bg-slate-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatNodeType = (type: NodeType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Specifications</h1>
          <p className="text-muted-foreground">
            Manage your project specifications and documentation
          </p>
        </div>
        <Link href="/dashboard/specs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Spec
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search specs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Project Filter */}
            <Select onValueChange={handleProjectFilter} value={selectedProjectId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={SpecStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={SpecStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={SpecStatus.DEPRECATED}>Deprecated</SelectItem>
                <SelectItem value={SpecStatus.PENDING}>Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select onValueChange={handleTypeFilter} defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(NodeType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatNodeType(type)}
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
            <Button variant="outline" onClick={loadSpecs} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Project Selected */}
      {!selectedProjectId && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
              <p className="text-muted-foreground">
                Choose a project to view its specifications
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : specs.length === 0 && selectedProjectId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No specs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filters.status || filters.type
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first specification'
                }
              </p>
              <Link href="/dashboard/specs/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Spec
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : selectedProjectId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec) => (
            <Card key={spec.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getTypeColor(spec.type)}`} />
                        {formatNodeType(spec.type)}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(spec.status)}`} />
                        {spec.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{spec.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {spec.description
                        ? spec.description.length > 100
                          ? spec.description.substring(0, 100) + '...'
                          : spec.description
                        : 'No description provided'
                      }
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/specs/${spec.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {spec.status === SpecStatus.DRAFT && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/specs/${spec.id}/edit`}>
                            Edit Spec
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {spec.status === SpecStatus.PENDING && (
                        <DropdownMenuItem onClick={() => handleApproveSpec(spec.id)}>
                          Approve Spec
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSpec(spec.id)}>
                        Delete Spec
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Metadata Badge */}
                  {Object.keys(spec.metadata).length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(spec.metadata).length} metadata fields
                    </Badge>
                  )}

                  {/* Spec Info */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Created: {new Date(spec.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Updated: {new Date(spec.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/specs/${spec.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                    {spec.status === SpecStatus.DRAFT && (
                      <Link href={`/dashboard/specs/${spec.id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                    )}
                    {spec.status === SpecStatus.PENDING && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApproveSpec(spec.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}