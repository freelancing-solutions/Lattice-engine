import { useState } from 'react';
import { Spec } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle, Copy } from 'lucide-react';

interface SpecGenerationFormProps {
  onGenerate: (data: { mode: 'template' | 'existing'; templateType?: string; existingSpecId?: string; name?: string; description?: string; parameters?: Record<string, any> }) => void;
  isGenerating: boolean;
  generatedSpec?: Spec | null;
  existingSpecs?: Spec[];
  onSaveGeneratedSpec?: (spec: Spec) => void;
}

export function SpecGenerationForm({ onGenerate, isGenerating, generatedSpec, existingSpecs = [], onSaveGeneratedSpec }: SpecGenerationFormProps) {
  const [mode, setMode] = useState<'template' | 'existing'>('template');
  const [templateType, setTemplateType] = useState('');
  const [existingSpecId, setExistingSpecId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState('');

  const handleGenerate = () => {
    let parsedParameters: Record<string, any> = {};
    if (parameters.trim()) {
      try {
        parsedParameters = JSON.parse(parameters);
      } catch (error) {
        console.error('Invalid JSON parameters:', error);
        return;
      }
    }

    onGenerate({
      mode,
      templateType: mode === 'template' ? templateType : undefined,
      existingSpecId: mode === 'existing' ? existingSpecId : undefined,
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      parameters: Object.keys(parsedParameters).length > 0 ? parsedParameters : undefined,
    });
  };

  const handleSaveGeneratedSpec = () => {
    if (generatedSpec && onSaveGeneratedSpec) {
      onSaveGeneratedSpec(generatedSpec);
    }
  };

  const handleCopyParameters = async () => {
    try {
      await navigator.clipboard.writeText(getExampleParameters());
    } catch (error) {
      console.error('Failed to copy parameters:', error);
    }
  };

  const getExampleParameters = () => {
    switch (templateType) {
      case 'api':
        return JSON.stringify({
          baseUrl: "https://api.example.com",
          version: "v1",
          endpoints: [
            {
              path: "/users",
              method: "GET",
              description: "Get all users"
            }
          ]
        }, null, 2);
      case 'database':
        return JSON.stringify({
          tables: [
            {
              name: "users",
              columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "email", type: "VARCHAR", unique: true }
              ]
            }
          ]
        }, null, 2);
      case 'service':
        return JSON.stringify({
          serviceName: "user-service",
          port: 3000,
          dependencies: ["database", "auth-service"]
        }, null, 2);
      default:
        return JSON.stringify({
          key: "value",
          description: "Example parameter"
        }, null, 2);
    }
  };

  const resetForm = () => {
    setMode('template');
    setTemplateType('');
    setExistingSpecId('');
    setName('');
    setDescription('');
    setParameters('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Specification
        </CardTitle>
        <CardDescription>
          Generate specifications from templates or existing specs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Generation Mode</Label>
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'template' | 'existing')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="template" id="template" />
              <Label htmlFor="template">From Template</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">From Existing Spec</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Template Selection */}
        {mode === 'template' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Template Type</Label>
            <Select value={templateType} onValueChange={setTemplateType} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API Specification</SelectItem>
                <SelectItem value="database">Database Schema</SelectItem>
                <SelectItem value="service">Service Specification</SelectItem>
                <SelectItem value="default">Default Template</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Existing Spec Selection */}
        {mode === 'existing' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Existing Spec</Label>
            <Select value={existingSpecId} onValueChange={setExistingSpecId} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Select existing specification" />
              </SelectTrigger>
              <SelectContent>
                {existingSpecs.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Name and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Name (Optional)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Generated spec name"
              disabled={isGenerating}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description (Optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Generated spec description"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Parameters */}
        {mode === 'template' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Parameters (JSON)</Label>
              {templateType && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyParameters}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Example
                </Button>
              )}
            </div>
            <Textarea
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              placeholder='{"key": "value"}'
              className="min-h-[150px] font-mono text-sm"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              {templateType
                ? `Enter parameters to customize the ${templateType} template`
                : 'Select a template type to see example parameters'
              }
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (mode === 'template' && !templateType) || (mode === 'existing' && !existingSpecId)}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Specification
            </>
          )}
        </Button>

        {/* Generated Spec Preview */}
        {generatedSpec && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Specification</h3>
              <Badge variant="outline">Generated</Badge>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{generatedSpec.name}</CardTitle>
                    <CardDescription>{generatedSpec.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Spec Metadata */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{generatedSpec.type}</Badge>
                    <Badge variant="outline">{generatedSpec.status}</Badge>
                  </div>

                  {/* Spec Content */}
                  {generatedSpec.content && (
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                        {typeof generatedSpec.content === 'string'
                          ? generatedSpec.content
                          : JSON.stringify(generatedSpec.content, null, 2)
                        }
                      </pre>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {onSaveGeneratedSpec && (
                      <Button onClick={handleSaveGeneratedSpec}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Spec
                      </Button>
                    )}
                    <Button variant="outline" onClick={resetForm}>
                      Generate Another
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}