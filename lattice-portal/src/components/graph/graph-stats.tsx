'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GraphStats } from '@/types';
import {
  Database,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  FileText,
  Zap
} from 'lucide-react';

interface GraphStatsProps {
  stats: GraphStats | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function GraphStats({
  stats,
  isLoading = false,
  onRefresh,
  className = ''
}: GraphStatsProps) {
  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className={`text-center py-12 ${className}`}>
        <CardContent>
          <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Statistics Available</h3>
          <p className="text-muted-foreground mb-4">
            Graph statistics are currently unavailable
          </p>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Index Status',
      value: stats.available ? 'Available' : 'Unavailable',
      description: `Backend: ${stats.backend}`,
      icon: stats.available ? CheckCircle : XCircle,
      color: stats.available ? 'text-green-600' : 'text-red-600',
      bgColor: stats.available ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Total Documents',
      value: stats.totalDocuments?.toLocaleString() || 'N/A',
      description: 'Indexed specifications',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Index Size',
      value: formatBytes(stats.indexSizeMb ? stats.indexSizeMb * 1024 * 1024 : null),
      description: 'Storage used',
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Last Updated',
      value: formatDate(stats.lastUpdated),
      description: 'Index refresh time',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Graph Statistics</h3>
          <p className="text-muted-foreground">
            Overview of graph database and semantic index status
          </p>
        </div>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={card.bgColor}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backend Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backend Type</span>
              <Badge variant="outline">{stats.backend}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Index Status</span>
              <Badge
                variant={stats.available ? "default" : "destructive"}
                className={stats.available ? "bg-green-100 text-green-800" : ""}
              >
                {stats.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Index Health</span>
              <div className="flex items-center gap-2">
                <Activity className={`h-4 w-4 ${stats.available ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm ${stats.available ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.available ? 'Healthy' : 'Error'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Document Count</span>
              <span className="text-sm font-mono">
                {stats.totalDocuments?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Index Size</span>
              <span className="text-sm font-mono">
                {formatBytes(stats.indexSizeMb ? stats.indexSizeMb * 1024 * 1024 : null)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Refresh</span>
              <span className="text-sm font-mono">
                {stats.lastUpdated ?
                  new Date(stats.lastUpdated).toLocaleTimeString() :
                  'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      {!stats.available && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              Index Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                The semantic search index is currently unavailable. This may be due to:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Index initialization in progress</li>
                <li>Backend service maintenance</li>
                <li>Configuration issues</li>
                <li>Resource constraints</li>
              </ul>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.available && stats.totalDocuments === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Activity className="h-5 w-5" />
              Index Empty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-orange-700">
                The semantic search index is available but contains no documents.
              </p>
              <p className="text-sm text-orange-700">
                Start creating specifications to build the knowledge graph.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GraphStats;