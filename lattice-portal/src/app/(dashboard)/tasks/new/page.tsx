'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskStore } from '@/stores/task-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createTaskSchema = z.object({
  operation: z.string().min(1, 'Operation is required'),
  customOperation: z.string().optional(),
  inputDataJson: z.string().min(1, 'Input data is required'),
  targetAgentType: z.string().optional(),
  priority: z.number().min(1).max(10).default(5),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

const commonOperations = [
  { value: 'validate_spec', label: 'Validate Specification', example: { spec_id: 'spec-123', validation_type: 'schema' } },
  { value: 'run_mutation', label: 'Run Mutation', example: { mutation_id: 'mut-456', project_id: 'proj-789' } },
  { value: 'generate_code', label: 'Generate Code', example: { language: 'python', template: 'api_endpoint' } },
  { value: 'analyze_code', label: 'Analyze Code', example: { file_path: '/src/app.py', analysis_type: 'security' } },
  { value: 'custom', label: 'Custom Operation', example: { custom_param: 'value' } },
];

export default function NewTaskPage() {
  const router = useRouter();
  const { addTask } = useTaskStore();
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      operation: '',
      customOperation: '',
      inputDataJson: '',
      targetAgentType: '',
      priority: 5,
    },
  });

  const watchOperation = form.watch('operation');
  const watchInputDataJson = form.watch('inputDataJson');

  const handleOperationChange = (value: string) => {
    setSelectedOperation(value);
    form.setValue('operation', value);

    // Set example input data for common operations
    if (value !== 'custom') {
      const operation = commonOperations.find(op => op.value === value);
      if (operation) {
        form.setValue('inputDataJson', JSON.stringify(operation.example, null, 2));
      }
    }
  };

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (data: CreateTaskFormData) => {
    if (!user?.id) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'You must be logged in to create tasks',
      });
      return;
    }

    // Validate JSON
    if (!validateJson(data.inputDataJson)) {
      addNotification({
        type: 'error',
        title: 'Invalid JSON',
        message: 'Input data must be valid JSON',
      });
      return;
    }

    setIsCreating(true);
    try {
      const inputData = JSON.parse(data.inputDataJson);
      const operation = data.operation === 'custom' ? data.customOperation : data.operation;

      const response = await apiClient.requestTask({
        requesterId: user.id,
        operation,
        inputData,
        targetAgentType: data.targetAgentType || undefined,
        priority: data.priority,
      });

      if (response.success && response.data) {
        addTask(response.data);
        addNotification({
          type: 'success',
          title: 'Task Created',
          message: 'Your task has been created and is now pending',
        });
        router.push(`/dashboard/tasks/${response.data.taskId}`);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.error?.message || 'Failed to create task',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getSelectedOperationExample = () => {
    if (selectedOperation === 'custom') return '';
    const operation = commonOperations.find(op => op.value === selectedOperation);
    return operation ? JSON.stringify(operation.example, null, 2) : '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground">
            Request a new task to be processed by the system
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Configure your task request with the required parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Operation Selection */}
              <FormField
                control={form.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation Type</FormLabel>
                    <Select onValueChange={handleOperationChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonOperations.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of operation you want to perform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custom Operation Name */}
              {watchOperation === 'custom' && (
                <FormField
                  control={form.control}
                  name="customOperation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Operation Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter custom operation name..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify the name of your custom operation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Input Data */}
              <FormField
                control={form.control}
                name="inputDataJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter input data as JSON..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide the input data for the task in JSON format
                    </FormDescription>
                    {watchInputDataJson && !validateJson(watchInputDataJson) && (
                      <p className="text-sm text-destructive">
                        Invalid JSON format
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Example JSON */}
              {selectedOperation && selectedOperation !== 'custom' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Example Input Data</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        form.setValue('inputDataJson', getSelectedOperationExample());
                      }}
                      className="text-xs"
                    >
                      Use Example
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs font-mono">
                      {getSelectedOperationExample()}
                    </pre>
                  </div>
                </div>
              )}

              {/* Target Agent Type */}
              <FormField
                control={form.control}
                name="targetAgentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Agent Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any Available Agent</SelectItem>
                        <SelectItem value="validator">Validator</SelectItem>
                        <SelectItem value="executor">Executor</SelectItem>
                        <SelectItem value="analyzer">Analyzer</SelectItem>
                        <SelectItem value="generator">Generator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Specify the type of agent that should handle this task
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Lowest Priority</SelectItem>
                        <SelectItem value="2">2 - Low Priority</SelectItem>
                        <SelectItem value="3">3 - Low Priority</SelectItem>
                        <SelectItem value="4">4 - Normal Priority</SelectItem>
                        <SelectItem value="5">5 - Normal Priority</SelectItem>
                        <SelectItem value="6">6 - Normal Priority</SelectItem>
                        <SelectItem value="7">7 - High Priority</SelectItem>
                        <SelectItem value="8">8 - High Priority</SelectItem>
                        <SelectItem value="9">9 - High Priority</SelectItem>
                        <SelectItem value="10">10 - Highest Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Higher priority tasks will be processed first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isCreating || !watchOperation || !validateJson(watchInputDataJson)}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}