'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AgentType, CreateAgentRequest, AgentConfiguration } from '@/types';
import { Plus, Bot, Info } from 'lucide-react';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (agent: CreateAgentRequest) => Promise<void>;
  initialData?: CreateAgentRequest;
  isLoading?: boolean;
}

const agentTypeDescriptions = {
  [AgentType.SPEC_VALIDATOR]: {
    title: 'Spec Validator',
    description: 'Validates specifications for completeness, consistency, and best practices',
    icon: '✓',
    color: 'bg-blue-100 text-blue-800'
  },
  [AgentType.DEPENDENCY_RESOLVER]: {
    title: 'Dependency Resolver',
    description: 'Analyzes and resolves dependencies between specifications and components',
    icon: '🔗',
    color: 'bg-purple-100 text-purple-800'
  },
  [AgentType.SEMANTIC_COHERENCE]: {
    title: 'Semantic Coherence',
    description: 'Ensures specifications are semantically consistent and meaningful',
    icon: '🧠',
    color: 'bg-green-100 text-green-800'
  },
  [AgentType.MUTATION_GENERATOR]: {
    title: 'Mutation Generator',
    description: 'Generates appropriate mutations based on specifications',
    icon: '⚡',
    color: 'bg-orange-100 text-orange-800'
  },
  [AgentType.IMPACT_ANALYZER]: {
    title: 'Impact Analyzer',
    description: 'Analyzes the impact of changes on the system',
    icon: '📊',
    color: 'bg-red-100 text-red-800'
  },
  [AgentType.CONFLICT_RESOLVER]: {
    title: 'Conflict Resolver',
    description: 'Resolves conflicts between specifications, mutations, or system states',
    icon: '🤝',
    color: 'bg-pink-100 text-pink-800'
  }
};

const modelOptions = [
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'custom', label: 'Custom Model' }
];

const defaultSystemPrompts = {
  [AgentType.SPEC_VALIDATOR]: `You are a specification validation agent. Your role is to:

1. Validate that specifications are complete and contain all required fields
2. Check for consistency within the specification
3. Ensure adherence to best practices and standards
4. Identify potential issues or improvements
5. Provide clear validation feedback with specific recommendations

Focus on thoroughness, clarity, and actionable feedback.`,

  [AgentType.DEPENDENCY_RESOLVER]: `You are a dependency resolution agent. Your role is to:

1. Analyze dependencies between specifications and components
2. Identify circular dependencies and potential conflicts
3. Suggest optimal dependency ordering
4. Resolve dependency conflicts when possible
5. Provide clear explanations of dependency relationships

Focus on creating efficient, maintainable dependency structures.`,

  [AgentType.SEMANTIC_COHERENCE]: `You are a semantic coherence agent. Your role is to:

1. Analyze the semantic meaning and consistency of specifications
2. Ensure terminology is used consistently
3. Validate that requirements are logically coherent
4. Check for contradictions or ambiguities
5. Suggest improvements for clarity and precision

Focus on making specifications clear, unambiguous, and semantically sound.`,

  [AgentType.MUTATION_GENERATOR]: `You are a mutation generation agent. Your role is to:

1. Generate appropriate mutations based on specifications
2. Ensure mutations are safe and follow best practices
3. Provide clear explanations of what each mutation does
4. Consider edge cases and potential side effects
5. Optimize mutations for performance and maintainability

Focus on creating effective, well-documented mutations.`,

  [AgentType.IMPACT_ANALYZER]: `You are an impact analysis agent. Your role is to:

1. Analyze the potential impact of proposed changes
2. Identify affected components and systems
3. Assess risk levels and potential issues
4. Suggest mitigation strategies
5. Provide comprehensive impact reports

Focus on thorough analysis and risk assessment.`,

  [AgentType.CONFLICT_RESOLVER]: `You are a conflict resolution agent. Your role is to:

1. Detect conflicts between specifications, mutations, or system states
2. Analyze the root causes of conflicts
3. Propose resolution strategies
4. Help negotiate between conflicting requirements
5. Ensure solutions maintain system integrity

Focus on finding win-win solutions that preserve system coherence.`
};

export function CreateAgentDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false
}: CreateAgentDialogProps) {
  const [selectedType, setSelectedType] = useState<AgentType | null>(
    initialData?.type || null
  );
  const [tools, setTools] = useState<string[]>(
    initialData?.configuration?.tools || []
  );
  const [newTool, setNewTool] = useState('');

  const form = useForm<CreateAgentRequest>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || AgentType.SPEC_VALIDATOR,
      configuration: initialData?.configuration || {
        model: 'claude-3-5-sonnet',
        temperature: 0.7,
        maxTokens: 4000,
        systemPrompt: defaultSystemPrompts[AgentType.SPEC_VALIDATOR],
        tools: [],
        constraints: [],
        triggers: []
      }
    }
  });

  const watchedType = form.watch('type');

  // Update system prompt when agent type changes
  const handleTypeChange = (type: AgentType) => {
    setSelectedType(type);
    const currentConfig = form.getValues('configuration');
    form.setValue('configuration', {
      ...currentConfig,
      systemPrompt: defaultSystemPrompts[type]
    });
  };

  const handleAddTool = () => {
    if (newTool.trim() && !tools.includes(newTool.trim())) {
      const updatedTools = [...tools, newTool.trim()];
      setTools(updatedTools);
      form.setValue('configuration.tools', updatedTools);
      setNewTool('');
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    const updatedTools = tools.filter(tool => tool !== toolToRemove);
    setTools(updatedTools);
    form.setValue('configuration.tools', updatedTools);
  };

  const handleSubmit = async (data: CreateAgentRequest) => {
    await onSubmit({
      ...data,
      configuration: {
        ...data.configuration,
        tools
      }
    });
    form.reset();
    setTools([]);
    setSelectedType(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {initialData ? 'Edit Agent' : 'Create New Agent'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the agent configuration and settings.'
              : 'Configure a new AI agent to assist with specification management and analysis.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Agent name is required', minLength: 3 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Production Spec Validator"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this agent does and when it should be used..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Agent Type Selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Type</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      handleTypeChange(value as AgentType);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(agentTypeDescriptions).map(([type, info]) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <span>{info.icon}</span>
                              <span>{info.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType && (
                <div className={`p-3 rounded-lg ${agentTypeDescriptions[selectedType].color}`}>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{agentTypeDescriptions[selectedType].title}</h4>
                      <p className="text-sm mt-1">{agentTypeDescriptions[selectedType].description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuration</h3>

              <FormField
                control={form.control}
                name="configuration.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configuration.temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configuration.maxTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="100"
                        max="100000"
                        placeholder="4000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 4000)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configuration.systemPrompt"
                rules={{ required: 'System prompt is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Define the agent's behavior and instructions..."
                        rows={8}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tools */}
              <div className="space-y-2">
                <FormLabel>Tools</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tool..."
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                  />
                  <Button type="button" onClick={handleAddTool} size="sm">
                    Add
                  </Button>
                </div>
                {tools.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="flex items-center gap-1">
                        {tool}
                        <button
                          type="button"
                          onClick={() => handleRemoveTool(tool)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : (initialData ? 'Update Agent' : 'Create Agent')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}