'use client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your projects, mutations, and approvals in Lattice Portal.',
  alternates: { canonical: '/dashboard' },
};

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  FolderOpen,
  GitBranch,
  Clock,
  CheckCircle,
  Plus,
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useMutationStore } from '@/stores/mutation-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  loading?: boolean;
}

function MetricCard({ title, value, description, icon: Icon, trend, loading }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 mt-1">
            <TrendingUp className={`h-3 w-3 ${
              trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
            }`} />
            <span className={`text-xs ${
              trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  type: 'mutation' | 'project' | 'approval';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

function ActivityItem({ type, title, description, timestamp, status }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'mutation':
        return <GitBranch className="h-4 w-4" />;
      case 'project':
        return <FolderOpen className="h-4 w-4" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'executed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-accent rounded-lg">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(timestamp).toLocaleString()}
        </p>
      </div>
      {status && (
        <Badge variant="secondary" className="text-xs">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} mr-1`} />
          {status}
        </Badge>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { projects, setProjects, setLoading: setProjectsLoading } = useProjectStore();
  const { mutations, setMutations, setLoading: setMutationsLoading } = useMutationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadDashboardData = async () => {
      setProjectsLoading(true);
      setMutationsLoading(true);

      try {
        // Load projects
        const projectsResponse = await apiClient.getProjects();
        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data.items);
        }

        // Load mutations
        const mutationsResponse = await apiClient.getMutations();
        if (mutationsResponse.success && mutationsResponse.data) {
          setMutations(mutationsResponse.data.items);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setProjectsLoading(false);
        setMutationsLoading(false);
      }
    };

    loadDashboardData();
  }, [setProjects, setMutations, setProjectsLoading, setMutationsLoading]);

  // Calculate metrics
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingMutations = mutations.filter(m => m.status === 'pending').length;
  const approvedMutations = mutations.filter(m => m.status === 'approved').length;
  const executedMutations = mutations.filter(m => m.status === 'executed').length;

  // Generate recent activity
  const recentActivity = [
    ...mutations.slice(0, 3).map(m => ({
      type: 'mutation' as const,
      title: `Mutation: ${m.description}`,
      description: `Project: ${projects.find(p => p.id === m.project_id)?.name || 'Unknown'}`,
      timestamp: m.created_at,
      status: m.status,
    })),
    ...projects.slice(0, 2).map(p => ({
      type: 'project' as const,
      title: `Project: ${p.name}`,
      description: p.description || 'No description',
      timestamp: p.created_at,
      status: p.status,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's what's happening with your projects.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Projects"
          value={activeProjects}
          description="Total active projects"
          icon={FolderOpen}
          trend={{ value: '+12%', direction: 'up' }}
        />
        <MetricCard
          title="Pending Mutations"
          value={pendingMutations}
          description="Awaiting approval"
          icon={Clock}
          trend={{ value: '-5%', direction: 'down' }}
        />
        <MetricCard
          title="Approved Mutations"
          value={approvedMutations}
          description="Ready to execute"
          icon={CheckCircle}
          trend={{ value: '+8%', direction: 'up' }}
        />
        <MetricCard
          title="Executed Mutations"
          value={executedMutations}
          description="Successfully completed"
          icon={TrendingUp}
          trend={{ value: '+15%', direction: 'up' }}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you can perform right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline">
              <GitBranch className="mr-2 h-4 w-4" />
              Propose Mutation
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your projects and mutations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index}>
                      <ActivityItem {...activity} />
                      {index < recentActivity.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current status of Lattice Engine services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">API Service</span>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">WebSocket</span>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">Mutation Queue</span>
                </div>
                <Badge variant="secondary" className="text-yellow-600">
                  {pendingMutations} pending
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  Healthy
                </Badge>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}