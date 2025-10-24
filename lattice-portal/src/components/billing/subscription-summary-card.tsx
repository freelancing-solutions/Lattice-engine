/**
 * Subscription Summary Card
 *
 * A reusable component for displaying current subscription information
 * including plan details, status, billing information, and management actions.
 */

import { Calendar, CreditCard, AlertCircle, CheckCircle, Crown, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubscriptionWithPlan } from '@/types';

interface SubscriptionSummaryCardProps {
  subscription: SubscriptionWithPlan | null;
  onUpgrade?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SubscriptionSummaryCard({
  subscription,
  onUpgrade,
  onCancel,
  isLoading = false,
}: SubscriptionSummaryCardProps) {
  const getPlanTier = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return { color: 'bg-gray-100 text-gray-800', icon: Star };
    if (name.includes('starter')) return { color: 'bg-blue-100 text-blue-800', icon: Zap };
    if (name.includes('professional')) return { color: 'bg-purple-100 text-purple-800', icon: Crown };
    if (name.includes('enterprise')) return { color: 'bg-amber-100 text-amber-800', icon: Crown };
    return { color: 'bg-gray-100 text-gray-800', icon: Star };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'trialing':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Trial
          </Badge>
        );
      case 'past_due':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Past Due
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTrialDaysRemaining = (trialEnd: string | null) => {
    if (!trialEnd) return null;
    const trialDate = new Date(trialEnd);
    const now = new Date();
    const diffTime = trialDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Subscription
            </h3>
            <p className="text-gray-500 mb-4">
              Upgrade to a paid plan to unlock all features
            </p>
            {onUpgrade && (
              <Button onClick={onUpgrade} disabled={isLoading}>
                Choose a Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const planTier = getPlanTier(subscription.plan.name);
  const TierIcon = planTier.icon;
  const trialDaysRemaining = subscription.trialEnd
    ? getTrialDaysRemaining(subscription.trialEnd)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Current Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TierIcon className="h-4 w-4" />
              <span className="font-semibold text-lg">{subscription.plan.name}</span>
              <Badge className={planTier.color}>
                {subscription.plan.name.includes('Free') ? 'Free' : 'Premium'}
              </Badge>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
          {subscription.plan.description && (
            <p className="text-sm text-gray-600">{subscription.plan.description}</p>
          )}
        </div>

        {/* Trial Information */}
        {subscription.status === 'trialing' && trialDaysRemaining !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Trial Period - {trialDaysRemaining} days remaining
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Upgrade now to continue using all features
            </p>
          </div>
        )}

        {/* Billing Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Billing Details</h4>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Plan Price</span>
              <div className="font-medium">
                {formatCurrency(subscription.plan.priceMonthly)}/month
                {subscription.plan.priceYearly && (
                  <div className="text-xs text-green-600">
                    {formatCurrency(subscription.plan.priceYearly)}/year
                  </div>
                )}
              </div>
            </div>

            <div>
              <span className="text-gray-500">Billing Interval</span>
              <div className="font-medium capitalize">
                {subscription.billingInterval}
              </div>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Period</span>
              <span>{formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}</span>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="flex justify-between text-amber-600">
                <span>Cancellation Scheduled</span>
                <span>{formatDate(subscription.cancelledAt || subscription.currentPeriodEnd)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Plan Features</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscription.plan.maxProjects > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Max Projects: {subscription.plan.maxProjects === -1 ? 'Unlimited' : subscription.plan.maxProjects}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscription.plan.maxMembers > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Max Members: {subscription.plan.maxMembers === -1 ? 'Unlimited' : subscription.plan.maxMembers}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscription.plan.maxApiCallsMonthly > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>API Calls: {subscription.plan.maxApiCallsMonthly === -1 ? 'Unlimited' : subscription.plan.maxApiCallsMonthly.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscription.plan.maxSpecsPerProject > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Specs/Project: {subscription.plan.maxSpecsPerProject === -1 ? 'Unlimited' : subscription.plan.maxSpecsPerProject}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {onUpgrade && subscription.plan.name.includes('Free') && (
            <Button
              onClick={onUpgrade}
              disabled={isLoading}
              className="flex-1"
            >
              Upgrade Plan
            </Button>
          )}

          {onUpgrade && !subscription.plan.name.includes('Free') && (
            <Button
              onClick={onUpgrade}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              Change Plan
            </Button>
          )}

          {onCancel && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}