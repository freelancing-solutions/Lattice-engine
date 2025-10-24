'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Agent, AgentPerformance, AgentPerformanceMetric } from '@/types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  RefreshCw,
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface AgentPerformanceDashboardProps {
  agent: Agent;
  metrics: AgentPerformanceMetric[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function AgentPerformanceDashboard({
  agent,
  metrics,
  onRefresh,
  isLoading = false
}: AgentPerformanceDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'tasks'>('overview');

  const getSuccessRateColor = (rate: number) => {
    if (rate > 0.9) return 'text-green-600';
    if (rate > 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms < 100) return 'text-green-600';
    if (ms < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorRateColor = (rate: number) => {
    if (rate < 0.05) return 'text-green-600';
    if (rate < 0.1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const calculateSuccessRateTrend = () => {
    // This would calculate trend from historical data
    // For now, return a mock trend
    return Math.random() > 0.5 ? 'up' : 'down';
  };

  const calculateResponseTimeTrend = () => {
    // This would calculate trend from historical data
    return Math.random() > 0.5 ? 'down' : 'up';
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string,
    trend?: 'up' | 'down' | 'stable',
    description?: string
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              {icon}
            </div>
            {trend && (
              <div className={`p-1 rounded ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}`}>
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {trend === 'down' && <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />}
                {trend === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full" />}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMiniChart = (data: number[], color: string) => {
    // This would render a real chart using a charting library
    // For now, render a placeholder
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-1 h-8">
        {data.map((value, index) => (
          <div
            key={index}
            className={`flex-1 ${color} rounded-t`}
            style={{
              height: `${((value - min) / range) * 100}%`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Performance Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            {agent.name} - {agent.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="tasks">Task History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {agent.performance ? (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderMetricCard(
                  'Success Rate',
                  `${Math.round(agent.performance.successRate * 100)}%`,
                  <CheckCircle className="h-5 w-5 text-green-600" />,
                  getSuccessRateColor(agent.performance.successRate),
                  calculateSuccessRateTrend(),
                  'Task completion success rate'
                )}

                {renderMetricCard(
                  'Avg Response Time',
                  formatResponseTime(agent.performance.averageResponseTime),
                  <Clock className="h-5 w-5 text-blue-600" />,
                  getResponseTimeColor(agent.performance.averageResponseTime),
                  calculateResponseTimeTrend(),
                  'Average task execution time'
                )}

                {renderMetricCard(
                  'Total Requests',
                  agent.performance.totalRequests.toLocaleString(),
                  <Activity className="h-5 w-5 text-purple-600" />,
                  'text-gray-900',
                  undefined,
                  'Total tasks processed'
                )}

                {renderMetricCard(
                  'Error Rate',
                  `${Math.round(agent.performance.errorRate * 100)}%`,
                  <XCircle className="h-5 w-5 text-red-600" />,
                  getErrorRateColor(agent.performance.errorRate),
                  undefined,
                  'Task failure rate'
                )}

                {renderMetricCard(
                  'Confidence Score',
                  agent.performance.confidenceScore
                    ? `${Math.round(agent.performance.confidenceScore * 100)}%`
                    : 'N/A',
                  <Zap className="h-5 w-5 text-yellow-600" />,
                  'text-gray-900',
                  undefined,
                  'Average confidence in results'
                )}

                {renderMetricCard(
                  'Last Activity',
                  agent.performance.lastActivity
                    ? formatTimestamp(agent.performance.lastActivity)
                    : 'Never',
                  <Calendar className="h-5 w-5 text-gray-600" />,
                  'text-gray-900',
                  undefined,
                  'Most recent task execution'
                )}
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Success Rate Trend</CardTitle>
                    <CardDescription>
                      Success rate over the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderMiniChart(
                      [85, 88, 92, 87, 90, 93, 91],
                      'bg-green-500'
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Response Time Trend</CardTitle>
                    <CardDescription>
                      Average response time over the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderMiniChart(
                      [120, 115, 125, 110, 105, 108, 95],
                      'bg-blue-500'
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Performance Data
                </h3>
                <p className="text-gray-600">
                  This agent hasn't executed any tasks yet. Performance metrics will appear here once the agent starts processing tasks.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate Over Time</CardTitle>
                <CardDescription>
                  Daily success rate for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time Distribution</CardTitle>
                <CardDescription>
                  Histogram of response times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Volume</CardTitle>
                <CardDescription>
                  Number of tasks processed per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Analysis</CardTitle>
                <CardDescription>
                  Breakdown of error types and frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Task History Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Task Executions</CardTitle>
              <CardDescription>
                History of individual task executions with detailed metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length > 0 ? (
                <div className="space-y-4">
                  {metrics.slice(0, 20).map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          metric.success ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {metric.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{metric.operation}</p>
                          <p className="text-sm text-gray-600">
                            Task ID: {metric.taskId}
                          </p>
                          {metric.errorMessage && (
                            <p className="text-sm text-red-600 mt-1">
                              {metric.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatResponseTime(metric.responseTimeMs)}</p>
                        <p className="text-sm text-gray-600">
                          {formatTimestamp(metric.createdAt)}
                        </p>
                        {metric.confidenceScore && (
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm">
                              {Math.round(metric.confidenceScore * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Task History
                  </h3>
                  <p className="text-gray-600">
                    This agent hasn't executed any tasks yet. Task history will appear here once the agent starts processing tasks.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}