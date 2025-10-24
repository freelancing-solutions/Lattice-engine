'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, FileText, CheckCircle, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSpecStore } from '@/stores/spec-store';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { NodeType, SpecStatus, ValidationResult } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createSpecSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(NodeType),
  description: z.string().optional(),
  content: z.string().optional(),
  specSource: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  projectId: z.string().min(1, 'Project is required'),
});

const generateSpecSchema = z.object({
  templateType: z.string().min(1, 'Template type is required'),
  name: z.string().optional(),
  description: z.string().optional(),
  parameters: z.string().optional(), // JSON string
});

const validateSpecSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  format: z.enum(['json', 'yaml', 'markdown']),
  requiredFields: z.string().optional(),
  schema: z.string().optional(), // JSON string
});

type CreateSpecFormData = z.infer<typeof createSpecSchema>;
type GenerateSpecFormData = z.infer<typeof generateSpecSchema>;
type ValidateSpecFormData = z.infer<typeof validateSpecSchema>;

export default function NewSpecPage() {
  const router = useRouter();
  const { addSpec, setCurrentProjectId } = useSpecStore();
  const { projects } = useProjectStore();
  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState('create');
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const createForm = useForm<CreateSpecFormData>({
    resolver: zodResolver(createSpecSchema),
    defaultValues: {
      name: '',
      type: NodeType.SPEC,
      description: '',
      content: '',
      specSource: '',
      metadata: {},
      projectId: '',
    },
  });

  const generateForm = useForm<GenerateSpecFormData>({
    resolver: zodResolver(generateSpecSchema),
    defaultValues: {
      templateType: '',
      name: '',
      description: '',
      parameters: '',
    },
  });

  const validateForm = useForm<ValidateSpecFormData>({
    resolver: zodResolver(validateSpecSchema),
    defaultValues: {
      content: '',
      format: 'json',
      requiredFields: '',
      schema: '',
    },
  });

  const handleCreateSpec = async (data: CreateSpecFormData) => {
    setIsCreating(true);
    try {
      const response = await apiClient.createSpec(data);
      if (response.success && response.data) {
        addSpec(response.data);
        addNotification({
          type: 'success',
          title: 'Spec Created',
          message: 'Specification has been created successfully',
        });
        router.push(`/dashboard/specs/${response.data.id}`);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.error?.message || 'Failed to create spec',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateSpec = async (data: GenerateSpecFormData) => {
    setIsGenerating(true);
    try {
      const parameters = data.parameters ? JSON.parse(data.parameters) : {};
      const response = await apiClient.generateSpec({
        templateType: data.templateType,
        name: data.name,
        description: data.description,
        parameters,
      });

      if (response.success && response.data) {
        setGeneratedSpec(response.data);
        addNotification({
          type: 'success',
          title: 'Spec Generated',
          message: 'Specification has been generated successfully',
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error.error?.message || 'Failed to generate spec',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidateSpec = async (data: ValidateSpecFormData) => {
    setIsValidating(true);
    try {
      const content = data.format === 'json' ? JSON.parse(data.content) : data.content;
      const requiredFields = data.requiredFields ? data.requiredFields.split(',').map(f => f.trim()) : undefined;
      const schema = data.schema ? JSON.parse(data.schema) : undefined;

      const response = await apiClient.validateSpec({
        content,
        format: data.format as any,
        requiredFields,
        schema,
      });

      if (response.success && response.data) {
        setValidationResult(response.data);
        addNotification({
          type: 'success',
          title: 'Validation Complete',
          message: 'Content validation has been completed',
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Validation Failed',
        message: error.error?.message || 'Failed to validate content',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveGeneratedSpec = () => {
    if (generatedSpec) {
      addSpec(generatedSpec);
      addNotification({
        type: 'success',
        title: 'Spec Saved',
        message: 'Generated specification has been saved',
      });
      router.push(`/dashboard/specs/${generatedSpec.id}`);
    }
  };

  const formatNodeType = (type: NodeType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <h1 className="text-3xl font-bold">Create Specification</h1>
          <p className="text-muted-foreground">
            Create a new specification from scratch, template, or validate existing content
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create from Scratch</TabsTrigger>
          <TabsTrigger value="generate">Generate from Template</TabsTrigger>
          <TabsTrigger value="validate">Validate Existing</TabsTrigger>
        </TabsList>

        {/* Create from Scratch Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Specification</CardTitle>
              <CardDescription>
                Create a new specification from scratch with custom content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateSpec)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter specification name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specification type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(NodeType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {formatNodeType(type)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="specSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter source..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter specification description..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter specification content..."
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the main content of your specification. This can be JSON, YAML, or markdown format.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Spec
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
        </TabsContent>

        {/* Generate from Template Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate from Template</CardTitle>
              <CardDescription>
                Generate a specification using predefined templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generateForm}>
                <form onSubmit={generateForm.handleSubmit(handleGenerateSpec)} className="space-y-6">
                  <FormField
                    control={generateForm.control}
                    name="templateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select template type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="api">API Specification</SelectItem>
                            <SelectItem value="database">Database Schema</SelectItem>
                            <SelectItem value="service">Service Specification</SelectItem>
                            <SelectItem value="default">Default Template</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={generateForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Generated spec name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generateForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Generated spec description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={generateForm.control}
                    name="parameters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameters (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='{"key": "value"}'
                            className="min-h-[150px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter parameters in JSON format to customize the template generation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Generate Spec
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Generated Spec Preview */}
              {generatedSpec && (
                <div className="mt-6 space-y-4">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Generated Specification</h3>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{generatedSpec.name}</CardTitle>
                            <CardDescription>{generatedSpec.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{formatNodeType(generatedSpec.type)}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {JSON.stringify(generatedSpec.content, null, 2)}
                          </pre>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button onClick={handleSaveGeneratedSpec}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Save Spec
                          </Button>
                          <Button variant="outline" onClick={() => setGeneratedSpec(null)}>
                            Discard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validate Existing Tab */}
        <TabsContent value="validate">
          <Card>
            <CardHeader>
              <CardTitle>Validate Existing Content</CardTitle>
              <CardDescription>
                Validate specification content against formats and schemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...validateForm}>
                <form onSubmit={validateForm.handleSubmit(handleValidateSpec)} className="space-y-6">
                  <FormField
                    control={validateForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your content to validate..."
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={validateForm.control}
                      name="format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="yaml">YAML</SelectItem>
                              <SelectItem value="markdown">Markdown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={validateForm.control}
                      name="requiredFields"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Fields</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="field1, field2, field3"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of required fields
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={validateForm.control}
                      name="schema"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schema (JSON)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="JSON schema (optional)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional JSON schema for validation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isValidating}>
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      'Validate Content'
                    )}
                  </Button>
                </form>
              </Form>

              {/* Validation Results */}
              {validationResult && (
                <div className="mt-6 space-y-4">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Validation Results</h3>

                    {/* Errors */}
                    {validationResult.errors.length > 0 && (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                          <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Errors ({validationResult.errors.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {validationResult.errors.map((error, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-red-700">{error}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Warnings */}
                    {validationResult.warnings.length > 0 && (
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                          <CardTitle className="text-yellow-700 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Warnings ({validationResult.warnings.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {validationResult.warnings.map((warning, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-yellow-700">{warning}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Suggestions */}
                    {validationResult.suggestions.length > 0 && (
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-blue-700 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Suggestions ({validationResult.suggestions.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {validationResult.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-blue-700">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Success */}
                    {validationResult.isValid && validationResult.errors.length === 0 && (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-700 font-medium">Validation passed successfully!</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={() => setValidationResult(null)}>
                        Clear Results
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}