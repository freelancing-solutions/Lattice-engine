'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeploymentStore } from '@/stores/deployment-store';
import { useUIStore } from '@/stores/ui-store';
import { useMutationStore } from '@/stores/mutation-store';
import { apiClient } from '@/lib/api';
import {
  CreateDeploymentRequest,
  DeploymentEnvironment,
  DeploymentStrategy
} from '@/types';
import {
  ArrowLeft,
  Rocket,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';

interface FormData {
  mutationId: string;
  specId: string;
  environment: DeploymentEnvironment;
  strategy: DeploymentStrategy;
  config: string;
}

const defaultConfigs: Record<DeploymentStrategy, string> = {
  [DeploymentStrategy.BLUE_GREEN]: JSON.stringify({
    timeout_minutes: 30,
    health_check_enabled: true,
    health_check_interval_seconds: 30
  }, null, 2),
  [DeploymentStrategy.ROLLING]: JSON.stringify({
    timeout_minutes: 30,
    max_concurrent_pods: 2,
    health_check_enabled: true,
    health_check_interval_seconds: 30
  }, null, 2),
  [DeploymentStrategy.CANARY]: JSON.stringify({
    timeout_minutes: 30,
    canary_percentage: 10,
    health_check_enabled: true,
    health_check_interval_seconds: 30
  }, null, 2),
  [DeploymentStrategy.RECREATE]: JSON.stringify({
    timeout_minutes: 30,
    health_check_enabled: true,
    health_check_interval_seconds: 30
  }, null, 2),
  [DeploymentStrategy.ROLLBACK]: JSON.stringify({
    timeout_minutes: 15,
    health_check_enabled: true,
    health_check_interval_seconds: 30
  }, null, 2)
};

export default function NewDeploymentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store state
  const { addDeployment } = useDeploymentStore();
  const { addNotification } = useUIStore();
  const { mutations } = useMutationStore();

  // Form setup
  const form = useForm<FormData>({
    defaultValues: {
      mutationId: '',
      specId: '',
      environment: DeploymentEnvironment.DEVELOPMENT,
      strategy: DeploymentStrategy.ROLLING,
      config: defaultConfigs[DeploymentStrategy.ROLLING]
    }
  });

  const selectedStrategy = form.watch('strategy');

  // Handle strategy change
  const handleStrategyChange = (strategy: DeploymentStrategy) => {
    form.setValue('strategy', strategy);
    form.setValue('config', defaultConfigs[strategy]);
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Validate JSON config
      let config = {};
      if (data.config.trim()) {
        try {
          config = JSON.parse(data.config);
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Invalid Configuration',
            message: 'Please enter valid JSON configuration',
            duration: 5000
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Production deployment warning
      if (data.environment === DeploymentEnvironment.PRODUCTION) {
        const confirmed = window.confirm(
          'You are about to deploy to PRODUCTION environment. This is a critical action. Are you sure you want to continue?'
        );
        if (!confirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      // Create deployment request
      const request: CreateDeploymentRequest = {
        mutationId: data.mutationId.trim(),
        specId: data.specId.trim(),
        environment: data.environment,
        strategy: data.strategy,
        config: Object.keys(config).length > 0 ? config : undefined
      };

      const response = await apiClient.createDeployment(request);

      if (response.success && response.data) {
        addDeployment(response.data);
        addNotification({
          type: 'success',
          title: 'Deployment Created',
          message: `Deployment ${response.data.deploymentId.slice(0, 8)}... has been created successfully`,
          duration: 3000
        });
        router.push(`/dashboard/deployments/${response.data.deploymentId}`);
      } else {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: response.error?.message || 'Failed to create deployment',
          duration: 5000
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Creation Error',
        message: error.error?.message || 'Failed to create deployment',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Deployment</h1>
          <p className="text-muted-foreground">
            Create and configure a new deployment
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the basic deployment parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mutation ID */}
                <FormField
                  control={form.control}
                  name="mutationId"
                  rules={{
                    required: 'Mutation ID is required',
                    pattern: {
                      value: /^[a-zA-Z0-9\-_]+$/,
                      message: 'Invalid mutation ID format'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mutation ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter mutation ID..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The ID of the mutation to deploy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Spec ID */}
                <FormField
                  control={form.control}
                  name="specId"
                  rules={{
                    required: 'Spec ID is required',
                    pattern: {
                      value: /^[a-zA-Z0-9\-_]+$/,
                      message: 'Invalid spec ID format'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spec ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter spec ID..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The ID of the specification to deploy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Environment */}
                <FormField
                  control={form.control}
                  name="environment"
                  rules={{ required: 'Environment is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DeploymentEnvironment.DEVELOPMENT}>
                            Development
                          </SelectItem>
                          <SelectItem value={DeploymentEnvironment.TESTING}>
                            Testing
                          </SelectItem>
                          <SelectItem value={DeploymentEnvironment.STAGING}>
                            Staging
                          </SelectItem>
                          <SelectItem value={DeploymentEnvironment.PRODUCTION}>
                            Production
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Target deployment environment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Strategy */}
                <FormField
                  control={form.control}
                  name="strategy"
                  rules={{ required: 'Strategy is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployment Strategy</FormLabel>
                      <Select onValueChange={handleStrategyChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DeploymentStrategy.ROLLING}>
                            Rolling Update
                          </SelectItem>
                          <SelectItem value={DeploymentStrategy.BLUE_GREEN}>
                            Blue-Green
                          </SelectItem>
                          <SelectItem value={DeploymentStrategy.CANARY}>
                            Canary
                          </SelectItem>
                          <SelectItem value={DeploymentStrategy.RECREATE}>
                            Recreate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How the deployment should be executed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Advanced deployment configuration (JSON format)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Strategy Information */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {selectedStrategy === DeploymentStrategy.BLUE_GREEN && (
                      <span>Blue-Green deployment creates a new environment alongside the current one, then switches traffic when ready.</span>
                    )}
                    {selectedStrategy === DeploymentStrategy.ROLLING && (
                      <span>Rolling update gradually replaces old instances with new ones, ensuring zero downtime.</span>
                    )}
                    {selectedStrategy === DeploymentStrategy.CANARY && (
                      <span>Canary deployment routes a small percentage of traffic to the new version for testing.</span>
                    )}
                    {selectedStrategy === DeploymentStrategy.RECREATE && (
                      <span>Recreate deployment shuts down old instances before creating new ones, causing brief downtime.</span>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Config JSON */}
                <FormField
                  control={form.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuration (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter configuration as JSON..."
                          className="font-mono text-sm"
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional configuration in JSON format. Leave empty to use defaults.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Production Warning */}
            {form.watch('environment') === DeploymentEnvironment.PRODUCTION && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Production Deployment Warning:</strong> You are about to deploy to the production environment. Please ensure you have thoroughly tested this deployment in staging before proceeding.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Deployment...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Create Deployment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}