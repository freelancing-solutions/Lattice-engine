'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Settings, GitBranch, Users, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useProjectStore } from '@/stores/project-store';
import { useMutationStore } from '@/stores/mutation-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { Project, Mutation } from '@/types';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    selectedProject,
    setSelectedProject,
    isLoading: projectLoading,
    error: projectError,
  } = useProjectStore();

  const {
    mutations,
    setMutations,
    isLoading: mutationsLoading,
  } = useMutationStore();

  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadProjectMutations();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await apiClient.getProject(projectId);
      if (response.success && response.data) {
        setSelectedProject(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load project:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load project details',
      });
    }
  };

  const loadProjectMutations = async () => {
    try {
      const response = await apiClient.getMutations({
        project_id: projectId,
      });
      if (response.success && response.data) {
        setMutations(response.data.items);
      }
    } catch (error: any) {
      console.error('Failed to load mutations:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'bg-red-500';
      case 'internal':
        return 'bg-yellow-500';
      case 'public':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMutationStatusColor = (status: string) => {
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

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2 mt-2" />
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-5/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectError || !selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Project not found</h3>
              <p className="text-muted-foreground mb-4">
                The project you're looking for doesn't exist or you don't have access to it.
              </p>
              <Link href="/dashboard/projects">
                <Button>Back to Projects</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate project statistics
  const totalMutations = mutations.length;
  const pendingMutations = mutations.filter(m => m.status === 'pending').length;
  const approvedMutations = mutations.filter(m => m.status === 'approved').length;
  const executedMutations = mutations.filter(m => m.status === 'executed').length;
  const successRate = totalMutations > 0 ? (executedMutations / totalMutations) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
            <p className="text-muted-foreground">
              {selectedProject.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${projectId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/projects/${projectId}/mutations/new`}>
            <Button>
              <GitBranch className="mr-2 h-4 w-4" />
              Propose Mutation
            </Button>
          </Link>
        </div>
      </div>

      {/* Project Status */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedProject.status)}`} />
          {selectedProject.status}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getVisibilityColor(selectedProject.visibility)}`} />
          {selectedProject.visibility}
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mutations">Mutations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Mutations</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMutations}</div>
                <p className="text-xs text-muted-foreground">
                  All time mutations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingMutations}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Executed</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{executedMutations}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Execution success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Project Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedProject.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Updated:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedProject.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Project ID:</span>
                  <span className="text-sm font-medium">{selectedProject.id}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {mutations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {mutations.slice(0, 5).map((mutation) => (
                      <div key={mutation.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {mutation.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(mutation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getMutationStatusColor(mutation.status)}`} />
                          {mutation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mutations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mutations</CardTitle>
                  <CardDescription>
                    All mutations for this project
                  </CardDescription>
                </div>
                <Link href={`/dashboard/projects/${projectId}/mutations/new`}>
                  <Button>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Propose Mutation
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {mutations.length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No mutations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by proposing your first mutation
                  </p>
                  <Link href={`/dashboard/projects/${projectId}/mutations/new`}>
                    <Button>
                      <GitBranch className="mr-2 h-4 w-4" />
                      Propose Mutation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {mutations.map((mutation) => (
                    <div key={mutation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{mutation.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(mutation.created_at).toLocaleDateString()} • {mutation.operation_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getMutationStatusColor(mutation.status)}`} />
                          {mutation.status}
                        </Badge>
                        <Link href={`/dashboard/mutations/${mutation.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent activity for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Activity tracking coming soon</h3>
                <p className="text-muted-foreground">
                  Detailed activity timeline will be available in future updates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Configure project settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Settings coming soon</h3>
                <p className="text-muted-foreground">
                  Advanced project settings will be available in future updates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}