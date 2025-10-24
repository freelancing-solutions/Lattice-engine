/**
 * Usage Metrics Card
 *
 * A reusable component for displaying usage metrics with progress bars,
 * showing current usage against plan limits with visual indicators for approaching limits.
 */

import { TrendingUp, AlertTriangle, CheckCircle, Users, FileText, Database, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UsageMetrics, Plan } from '@/types';

interface UsageMetricsCardProps {
  usage: UsageMetrics | null;
  plan: Plan | null;
  isLoading?: boolean;
}

interface MetricConfig {
  name: string;
  key: keyof UsageMetrics;
  icon: React.ElementType;
  color: string;
  unit: string;
  getLimit: (plan: Plan) => number;
}

export function UsageMetricsCard({
  usage,
  plan,
  isLoading = false,
}: UsageMetricsCardProps) {
  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 95) return AlertTriangle;
    if (percentage >= 80) return AlertTriangle;
    return CheckCircle;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getPercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // No limit
    return Math.min((current / limit) * 100, 100);
  };

  const metrics: MetricConfig[] = [
    {
      name: 'API Calls',
      key: 'apiCalls',
      icon: Code,
      color: 'text-blue-600',
      unit: 'calls',
      getLimit: (plan) => plan.maxApiCallsMonthly,
    },
    {
      name: 'Projects',
      key: 'projectsCreated',
      icon: Users,
      color: 'text-purple-600',
      unit: 'projects',
      getLimit: (plan) => plan.maxProjects,
    },
    {
      name: 'Team Members',
      key: 'membersActive',
      icon: Users,
      color: 'text-green-600',
      unit: 'members',
      getLimit: (plan) => plan.maxMembers,
    },
    {
      name: 'Specs Created',
      key: 'specsCreated',
      icon: FileText,
      color: 'text-orange-600',
      unit: 'specs',
      getLimit: (plan) => plan.maxSpecsPerProject,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage This Period
          </CardTitle>
          <CardDescription>
            Monitor your resource usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage || !plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage This Period
          </CardTitle>
          <CardDescription>
            Monitor your resource usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Usage Data Not Available
            </h3>
            <p className="text-gray-500">
              Your subscription and usage metrics will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const lastUpdated = usage.lastUpdated
    ? new Date(usage.lastUpdated).toLocaleString()
    : 'Unknown';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Usage This Period
        </CardTitle>
        <CardDescription>
          Monitor your resource usage against plan limits • Last updated: {lastUpdated}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const currentValue = usage[metric.key] as number;
            const limit = metric.getLimit(plan);
            const percentage = getPercentage(currentValue, limit);
            const isUnlimited = limit === -1;
            const isNearLimit = percentage >= 80;
            const isOverLimit = percentage >= 100;

            return (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="font-medium text-gray-900">{metric.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(currentValue)}
                    </span>

                    {isNearLimit && !isUnlimited && (
                      <Icon className={`h-4 w-4 ${percentage >= 95 ? 'text-red-500' : 'text-amber-500'}`} />
                    )}

                    {!isUnlimited && (
                      <span className="text-sm text-gray-500">
                        of {formatNumber(limit)} {metric.unit}
                      </span>
                    )}

                    {isUnlimited && (
                      <Badge variant="outline" className="text-xs">
                        Unlimited
                      </Badge>
                    )}
                  </div>
                </div>

                {!isUnlimited && (
                  <div className="space-y-1">
                    <Progress
                      value={percentage}
                      className="h-2"
                      indicatorColor={getUsageColor(percentage)}
                    />

                    {isOverLimit && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">
                          Limit exceeded by {formatNumber(currentValue - limit)} {metric.unit}
                        </span>
                      </div>
                    )}

                    {isNearLimit && !isOverLimit && (
                      <div className="flex items-center gap-2 text-amber-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          {100 - percentage}% of limit remaining
                        </span>
                      </div>
                    )}

                    {percentage < 80 && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          {100 - percentage}% of limit remaining
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Usage Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>Billing Period:</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Plan:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Next Reset:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}