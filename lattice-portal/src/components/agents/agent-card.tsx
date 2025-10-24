'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Agent, AgentType, AgentStatus } from '@/types';
import {
  Bot,
  MoreHorizontal,
  Edit,
  BarChart3,
  Power,
  PowerOff,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onView: (agentId: string) => void;
  onEdit: (agentId: string) => void;
  onToggleStatus: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  className?: string;
}

export function AgentCard({
  agent,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  className = ''
}: AgentCardProps) {
  // Helper functions
  const getTypeColor = (type: AgentType): string => {
    switch (type) {
      case AgentType.SPEC_VALIDATOR:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case AgentType.DEPENDENCY_RESOLVER:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case AgentType.SEMANTIC_COHERENCE:
        return 'bg-green-100 text-green-800 border-green-200';
      case AgentType.MUTATION_GENERATOR:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case AgentType.IMPACT_ANALYZER:
        return 'bg-red-100 text-red-800 border-red-200';
      case AgentType.CONFLICT_RESOLVER:
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: AgentType): string => {
    switch (type) {
      case AgentType.SPEC_VALIDATOR:
        return 'Spec Validator';
      case AgentType.DEPENDENCY_RESOLVER:
        return 'Dependency Resolver';
      case AgentType.SEMANTIC_COHERENCE:
        return 'Semantic Coherence';
      case AgentType.MUTATION_GENERATOR:
        return 'Mutation Generator';
      case AgentType.IMPACT_ANALYZER:
        return 'Impact Analyzer';
      case AgentType.CONFLICT_RESOLVER:
        return 'Conflict Resolver';
      default:
        return type;
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.ACTIVE:
        return <CheckCircle className="h-3 w-3" />;
      case AgentStatus.INACTIVE:
        return <PowerOff className="h-3 w-3" />;
      case AgentStatus.TRAINING:
        return <Clock className="h-3 w-3" />;
      case AgentStatus.ERROR:
        return <XCircle className="h-3 w-3" />;
      case AgentStatus.MAINTENANCE:
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AgentStatus): string => {
    switch (status) {
      case AgentStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200';
      case AgentStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case AgentStatus.TRAINING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case AgentStatus.ERROR:
        return 'bg-red-100 text-red-800 border-red-200';
      case AgentStatus.MAINTENANCE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate > 0.9) return 'text-green-600';
    if (rate > 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (ms: number): string => {
    if (ms < 100) return 'text-green-600';
    if (ms < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatLastActivity = (date: string | null): string => {
    if (!date) return 'Never';

    const activityDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const isSuccessRateTrending = (): 'up' | 'down' | 'stable' => {
    // This would be calculated from historical data
    // For now, return stable as default
    return 'stable';
  };

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Bot className="h-5 w-5 text-gray-600 flex-shrink-0" />
            <CardTitle className="text-lg font-semibold truncate">
              {agent.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={getTypeColor(agent.type)}>
              {getTypeLabel(agent.type)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(agent.id)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Performance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(agent.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleStatus(agent.id)}>
                  {agent.status === AgentStatus.ACTIVE ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                {!agent.isSystemAgent && (
                  <DropdownMenuItem
                    onClick={() => onDelete(agent.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(agent.status)}>
            {getStatusIcon(agent.status)}
            <span className="ml-1">{agent.status}</span>
          </Badge>
          {agent.isSystemAgent && (
            <Badge variant="outline" className="text-xs">
              System
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {agent.description && (
          <div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {agent.description}
            </p>
          </div>
        )}

        {/* Performance Summary */}
        {agent.performance && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${getSuccessRateColor(agent.performance.successRate)}`}>
                  {Math.round(agent.performance.successRate * 100)}%
                </span>
                {isSuccessRateTrending() === 'up' && (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                )}
                {isSuccessRateTrending() === 'down' && (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {isSuccessRateTrending() === 'stable' && (
                  <Minus className="h-3 w-3 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response</span>
              <span className={`text-sm font-medium ${getResponseTimeColor(agent.performance.averageResponseTime)}`}>
                {formatResponseTime(agent.performance.averageResponseTime)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Requests</span>
              <span className="text-sm font-medium">
                {agent.performance.totalRequests.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Confidence</span>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span className="text-sm font-medium">
                  {agent.performance.confidenceScore
                    ? `${Math.round(agent.performance.confidenceScore * 100)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Last Activity */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">Last Activity</span>
          <span className="text-sm text-gray-500">
            {formatLastActivity(agent.lastActivityAt)}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(agent.id)}
            className="flex-1"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </Button>
          {agent.status === AgentStatus.ACTIVE ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(agent.id)}
              className="flex-1"
            >
              <PowerOff className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(agent.id)}
              className="flex-1"
            >
              <Power className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}