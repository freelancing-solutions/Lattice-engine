/**
 * Plan Comparison Card
 *
 * A responsive component for displaying plan comparison table with
 * pricing tiers, feature comparisons, and upgrade/downgrade actions.
 */

import { useState } from 'react';
import { Check, X, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plan } from '@/types';

interface PlanComparisonCardProps {
  plans: Plan[];
  currentPlanId: string | null;
  onSelectPlan: (planId: string, billingInterval: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
}

interface PlanFeatures {
  [key: string]: string | number | boolean;
}

interface FeatureRow {
  name: string;
  description: string;
  getValue: (plan: Plan) => string | number | boolean;
}

export function PlanComparisonCard({
  plans,
  currentPlanId,
  onSelectPlan,
  isLoading = false,
}: PlanComparisonCardProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPlanTier = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return { color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-200', buttonVariant: 'outline' as const };
    if (name.includes('starter')) return { color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-200', buttonVariant: 'outline' as const };
    if (name.includes('professional')) return { color: 'bg-purple-100 text-purple-800', borderColor: 'border-purple-200', buttonVariant: 'default' as const };
    if (name.includes('enterprise')) return { color: 'bg-amber-100 text-amber-800', borderColor: 'border-amber-200', buttonVariant: 'outline' as const };
    return { color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-200', buttonVariant: 'outline' as const };
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('free')) return Star;
    if (name.includes('starter')) return Zap;
    if (name.includes('professional')) return Crown;
    if (name.includes('enterprise')) return Crown;
    return Star;
  };

  const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number | null) => {
    if (!yearlyPrice) return 0;
    const yearlyMonthly = yearlyPrice / 12;
    const savings = ((monthlyPrice - yearlyMonthly) / monthlyPrice) * 100;
    return Math.round(savings);
  };

  const isCurrentPlan = (planId: string) => planId === currentPlanId;
  const isUpgrade = (plan: Plan) => {
    if (!currentPlanId) return true;
    const currentPlan = plans.find(p => p.id === currentPlanId);
    if (!currentPlan) return true;

    // Simple comparison by price - higher price is considered an upgrade
    const currentPrice = billingInterval === 'monthly' ? currentPlan.priceMonthly : (currentPlan.priceYearly || currentPlan.priceMonthly * 12);
    const planPrice = billingInterval === 'monthly' ? plan.priceMonthly : (plan.priceYearly || plan.priceMonthly * 12);

    return planPrice > currentPrice;
  };

  const getButtonVariant = (plan: Plan) => {
    if (!currentPlanId) return 'default';
    if (isCurrentPlan(plan.id)) return 'outline';
    if (isUpgrade(plan)) return 'default';
    return 'outline';
  };

  const getButtonText = (plan: Plan) => {
    if (!currentPlanId) return 'Get Started';
    if (isCurrentPlan(plan.id)) return 'Current Plan';
    if (isUpgrade(plan)) return 'Upgrade';
    return 'Downgrade';
  };

  // Feature rows for comparison
  const features: FeatureRow[] = [
    {
      name: 'Monthly Price',
      description: 'Cost per month',
      getValue: (plan) => formatCurrency(plan.priceMonthly),
    },
    {
      name: 'Yearly Price',
      description: 'Cost per year',
      getValue: (plan) => plan.priceYearly ? formatCurrency(plan.priceYearly) : 'Not Available',
    },
    {
      name: 'Max Projects',
      description: 'Number of projects you can create',
      getValue: (plan) => plan.maxProjects === -1 ? 'Unlimited' : plan.maxProjects.toString(),
    },
    {
      name: 'Max Team Members',
      description: 'Number of team members you can add',
      getValue: (plan) => plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers.toString(),
    },
    {
      name: 'API Calls per Month',
      description: 'Number of API calls allowed per month',
      getValue: (plan) => plan.maxApiCallsMonthly === -1 ? 'Unlimited' : plan.maxApiCallsMonthly.toLocaleString(),
    },
    {
      name: 'Specs per Project',
      description: 'Number of specs you can create per project',
      getValue: (plan) => plan.maxSpecsPerProject === -1 ? 'Unlimited' : plan.maxSpecsPerProject.toString(),
    },
  ];

  // Add plan-specific features
  plans.forEach(plan => {
    if (plan.features) {
      Object.entries(plan.features).forEach(([key, value]) => {
        if (!features.find(f => f.name === key)) {
          features.push({
            name: key,
            description: key,
            getValue: (p) => {
              const planFeatures = p.features || {};
              return planFeatures[key] ? '✓' : '✗';
            },
          });
        }
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Available Plans
        </CardTitle>
        <CardDescription>
          Choose the perfect plan for your needs. Upgrade or downgrade at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Billing Interval Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                {plans.map((plan) => {
                  const tier = getPlanTier(plan.name);
                  const Icon = getPlanIcon(plan.name);
                  const isPopular = plan.name.toLowerCase().includes('professional');

                  return (
                    <TableHead key={plan.id} className="text-center">
                      <div className="relative">
                        {isPopular && (
                          <Badge className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs">
                            Most Popular
                          </Badge>
                        )}
                        <div className="flex flex-col items-center gap-2">
                          <Icon className="h-6 w-6" />
                          <div>
                            <div className="font-semibold">{plan.name}</div>
                            <Badge className={tier.color + ' border'}>
                              {plan.name.includes('Free') ? 'Free' : 'Premium'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{feature.name}</div>
                      <div className="text-sm text-gray-500">{feature.description}</div>
                    </div>
                  </TableCell>
                  {plans.map((plan) => {
                    const value = feature.getValue(plan);
                    const isBoolean = typeof value === 'boolean';

                    return (
                      <TableCell key={plan.id} className="text-center">
                        {isBoolean ? (
                          <div className="flex justify-center">
                            {value === '✓' ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <X className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        ) : (
                          <div className="font-medium">{value}</div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6 pt-6 border-t">
            {plans.map((plan) => (
              <div key={plan.id} className="flex justify-center">
                <Button
                  onClick={() => onSelectPlan(plan.id, billingInterval)}
                  variant={getButtonVariant(plan)}
                  disabled={isLoading || isCurrentPlan(plan.id)}
                  className="min-w-[120px]"
                >
                  {getButtonText(plan)}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stacked Layout */}
        <div className="lg:hidden space-y-6">
          {plans.map((plan) => {
            const tier = getPlanTier(plan.name);
            const Icon = getPlanIcon(plan.name);
            const isPopular = plan.name.toLowerCase().includes('professional');
            const isCurrent = isCurrentPlan(plan.id);

            return (
              <Card key={plan.id} className={isCurrent ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader className="text-center">
                  {isPopular && (
                    <Badge className="mx-auto mb-2 bg-purple-600 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-8 w-8" />
                    <div>
                      <div className="font-semibold text-lg">{plan.name}</div>
                      <Badge className={tier.color + ' border'}>
                        {plan.name.includes('Free') ? 'Free' : 'Premium'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        billingInterval === 'monthly'
                          ? plan.priceMonthly
                          : plan.priceYearly || plan.priceMonthly * 12
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      per {billingInterval}
                    </div>
                    {billingInterval === 'yearly' && plan.priceYearly && (
                      <div className="text-green-600 text-sm">
                        Save {calculateYearlySavings(plan.priceMonthly, plan.priceYearly)}%
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {features.slice(0, 6).map((feature, index) => {
                      const value = feature.getValue(plan);
                      const isBoolean = typeof value === 'boolean';

                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{feature.name}:</span>
                          <div className="font-medium">
                            {isBoolean ? (
                              value === '✓' ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-gray-400" />
                              )
                            ) : (
                              value
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => onSelectPlan(plan.id, billingInterval)}
                    variant={getButtonVariant(plan)}
                    disabled={isLoading || isCurrent}
                    className="w-full"
                  >
                    {getButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}