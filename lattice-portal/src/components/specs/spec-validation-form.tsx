import { useState } from 'react';
import { ValidationResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, Loader2, Copy } from 'lucide-react';

interface SpecValidationFormProps {
  onValidate: (data: { content: string; format: string; requiredFields?: string[]; schema?: Record<string, any> }) => void;
  isValidating: boolean;
  validationResult?: ValidationResult | null;
}

export function SpecValidationForm({ onValidate, isValidating, validationResult }: SpecValidationFormProps) {
  const [content, setContent] = useState('');
  const [format, setFormat] = useState('json');
  const [requiredFields, setRequiredFields] = useState('');
  const [schema, setSchema] = useState('');

  const handleValidate = () => {
    const parsedRequiredFields = requiredFields
      ? requiredFields.split(',').map(f => f.trim()).filter(f => f.length > 0)
      : undefined;

    const parsedSchema = schema
      ? (() => {
          try {
            return JSON.parse(schema);
          } catch {
            return undefined;
          }
        })()
      : undefined;

    let parsedContent = content;
    if (format === 'json') {
      try {
        parsedContent = JSON.parse(content);
      } catch {
        // If JSON parsing fails, send as string
      }
    }

    onValidate({
      content: parsedContent,
      format,
      requiredFields: parsedRequiredFields,
      schema: parsedSchema,
    });
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(schema);
    } catch (error) {
      console.error('Failed to copy schema:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validate Specification Content</CardTitle>
        <CardDescription>
          Validate your specification content against formats, required fields, and schemas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <div className="relative">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your specification content here..."
              className="min-h-[200px] font-mono text-sm pr-10"
              disabled={isValidating}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={handleCopyContent}
              disabled={!content}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <Select value={format} onValueChange={setFormat} disabled={isValidating}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Required Fields */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Required Fields (Optional)</label>
          <Textarea
            value={requiredFields}
            onChange={(e) => setRequiredFields(e.target.value)}
            placeholder="field1, field2, field3"
            className="min-h-[80px] font-mono text-sm"
            disabled={isValidating}
          />
          <p className="text-xs text-muted-foreground">
            Enter comma-separated list of required field names
          </p>
        </div>

        {/* JSON Schema */}
        <div className="space-y-2">
          <label className="text-sm font-medium">JSON Schema (Optional)</label>
          <div className="relative">
            <Textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder='{"type": "object", "properties": {...}}'
              className="min-h-[150px] font-mono text-sm pr-10"
              disabled={isValidating}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={handleCopySchema}
              disabled={!schema}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a JSON schema for advanced validation
          </p>
        </div>

        {/* Validate Button */}
        <Button
          onClick={handleValidate}
          disabled={isValidating || !content.trim()}
          className="w-full"
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate Content'
          )}
        </Button>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Validation Results</h3>

            {/* Success Message */}
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

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                    <XCircle className="h-5 w-5" />
                    Errors ({validationResult.errors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-yellow-700 flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5" />
                    Warnings ({validationResult.warnings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-700 flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5" />
                    Suggestions ({validationResult.suggestions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
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

            {/* Summary */}
            <div className="flex gap-2 pt-2">
              <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                {validationResult.isValid ? 'Valid' : 'Invalid'}
              </Badge>
              {validationResult.errors.length > 0 && (
                <Badge variant="destructive">{validationResult.errors.length} errors</Badge>
              )}
              {validationResult.warnings.length > 0 && (
                <Badge variant="secondary">{validationResult.warnings.length} warnings</Badge>
              )}
              {validationResult.suggestions.length > 0 && (
                <Badge variant="outline">{validationResult.suggestions.length} suggestions</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}