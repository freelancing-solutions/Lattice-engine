'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon, ActivityIcon, AlertTriangleIcon, ClockIcon, CheckCircleIcon, RefreshCwIcon, WifiIcon, WifiOffIcon } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useMutationStore } from '@/stores/mutation-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { useWebSocket } from '@/hooks/use-websocket';
import { apiClient } from '@/lib/api-client';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  mutationTrends: Array<{
    date: string;
    proposed: number;
    approved: number;
    rejected: number;
    pending: number;
  }>;
  projectMetrics: Array<{
    name: string;
    active: number;
    completed: number;
    archived: number;
  }>;
  riskDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  performanceMetrics: {
    avgApprovalTime: number;
    successRate: number;
    totalMutations: number;
    activeMutations: number;
  };
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  secondary: '#6b7280'
};

const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  
  // Use the new analytics store
  const { 
    analyticsData, 
    isLoading, 
    error, 
    connectionStatus, 
    isRealTimeEnabled, 
    fetchAnalyticsData, 
    refreshData, 
    setRealTimeEnabled,
    clearCache 
  } = useAnalyticsStore();
  
  // Initialize WebSocket connection
  useWebSocket();

  useEffect(() => {
    // Fetch initial data
    fetchAnalyticsData(timeRange);
  }, [timeRange, fetchAnalyticsData]);

  useEffect(() => {
    // Refresh data when time range changes
    refreshData();
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-red-600">Failed to load analytics data</p>
          </div>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangleIcon className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
            <CardDescription className="text-red-600">
              We encountered an issue while fetching your analytics data. This could be due to:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-red-700 space-y-1 ml-4">
              <li>• Network connectivity issues</li>
              <li>• Server maintenance or downtime</li>
              <li>• Authentication problems</li>
              <li>• Data processing delays</li>
            </ul>
            
            <div className="bg-red-100 p-3 rounded-md">
              <p className="text-sm font-medium text-red-800">Error Details:</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                 onClick={() => {
                   clearCache();
                   refreshData();
                   fetchAnalyticsData(timeRange);
                 }} 
                 variant="outline"
                 className="border-red-300 text-red-700 hover:bg-red-100"
               >
                 <RefreshCwIcon className="h-4 w-4 mr-2" />
                 Retry Loading
               </Button>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost"
                className="text-red-700 hover:bg-red-100"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your Lattice Engine performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Real-time connection status */}
          <div className="flex items-center space-x-2">
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
              className="flex items-center space-x-1"
            >
              {connectionStatus === 'connected' ? (
                <WifiIcon className="h-3 w-3" />
              ) : (
                <WifiOffIcon className="h-3 w-3" />
              )}
              <span className="text-xs">
                {connectionStatus === 'connected' ? 'Live' : 'Offline'}
              </span>
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setRealTimeEnabled(!isRealTimeEnabled)}
            >
              {isRealTimeEnabled ? 'Disable' : 'Enable'} Real-time
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              clearCache();
              refreshData();
              fetchAnalyticsData(timeRange);
            }}
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mutations</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.metrics.totalMutations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.metrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                +2.1% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Approval Time</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.metrics.averageApprovalTime.toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDownIcon className="h-3 w-3 mr-1" />
                +0.3m from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Mutations</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.metrics.pendingMutations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">Currently in queue</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Mutation Trends</TabsTrigger>
          <TabsTrigger value="projects">Project Metrics</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mutation Activity Over Time</CardTitle>
              <CardDescription>
                Track mutation proposals, approvals, and rejections over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.trends.mutationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="proposed"
                    stackId="1"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stackId="1"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stackId="1"
                    stroke={COLORS.danger}
                    fill={COLORS.danger}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke={COLORS.warning}
                    fill={COLORS.warning}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Status by Team</CardTitle>
              <CardDescription>
                Compare project completion rates across different teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.projectBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill={COLORS.primary} />
                  <Bar dataKey="completed" fill={COLORS.success} />
                  <Bar dataKey="archived" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Breakdown of mutations by risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
                <CardDescription>
                  Detailed risk analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.riskDistribution.map((risk) => (
                  <div key={risk.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: risk.color }}
                      />
                      <span className="font-medium">{risk.name} Risk</span>
                    </div>
                    <Badge variant={risk.name === 'Critical' ? 'destructive' : 'secondary'}>
                      {risk.value} mutations
                    </Badge>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Recommendation:</strong> Focus on reducing high and critical risk mutations
                    through better testing and validation processes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>
                  Monitor agent processing times and success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trends.performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="agentResponseTime" 
                      stroke={COLORS.primary} 
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="agentSuccessRate" 
                      stroke={COLORS.success} 
                      strokeWidth={2}
                      name="Success Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>
                  Track system performance and resource usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.trends.performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cpuUsage"
                      stackId="1"
                      stroke={COLORS.warning}
                      fill={COLORS.warning}
                      fillOpacity={0.6}
                      name="CPU Usage (%)"
                    />
                    <Area
                      type="monotone"
                      dataKey="memoryUsage"
                      stackId="1"
                      stroke={COLORS.danger}
                      fill={COLORS.danger}
                      fillOpacity={0.6}
                      name="Memory Usage (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Key performance indicators and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analyticsData.metrics.averageResponseTime.toFixed(0)}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {analyticsData.metrics.systemUptime.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {analyticsData.metrics.activeAgents}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">
                    {analyticsData.metrics.queuedTasks}
                  </div>
                  <p className="text-sm text-muted-foreground">Queued Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}