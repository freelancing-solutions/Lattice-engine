import { CheckCircle, XCircle, Edit } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ApprovalChannel } from '@/types';

interface ApprovalResponseFormProps {
  approvalId: string;
  onSubmit: (decision: 'approve' | 'reject' | 'request_changes', notes: string, modifiedContent?: string) => void;
  isSubmitting?: boolean;
  initialNotes?: string;
}

export function ApprovalResponseForm({
  approvalId,
  onSubmit,
  isSubmitting = false,
  initialNotes = '',
}: ApprovalResponseFormProps) {
  const [decision, setDecision] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [notes, setNotes] = useState(initialNotes);
  const [modifiedContent, setModifiedContent] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<{
    decision: 'approve' | 'reject' | 'request_changes';
    notes: string;
    modifiedContent: string;
  }>({
    defaultValues: {
      decision: 'approve',
      notes: initialNotes,
      modifiedContent: '',
    },
  });

  const watchedDecision = watch('decision');

  const handleFormSubmit = (data: any) => {
    onSubmit(data.decision, data.notes, data.modifiedContent || undefined);
  };

  const handleDecisionChange = (value: 'approve' | 'reject' | 'request_changes') => {
    setDecision(value);
    setValue('decision', value);

    // Trigger validation for notes when decision changes
    if (value !== 'approve') {
      trigger('notes');
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'request_changes':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getDecisionDescription = (decision: string) => {
    switch (decision) {
      case 'approve':
        return 'Approve this approval request as is';
      case 'reject':
        return 'Reject this approval request with reasons';
      case 'request_changes':
        return 'Request changes to the proposed modifications';
      default:
        return '';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approve':
        return 'border-green-200 bg-green-50';
      case 'reject':
        return 'border-red-200 bg-red-50';
      case 'request_changes':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Form</CardTitle>
        <CardDescription>
          Choose your response and add any relevant notes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Decision Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Decision</Label>
            <RadioGroup
              value={watchedDecision}
              onValueChange={handleDecisionChange}
              className="space-y-3"
            >
              {[
                { value: 'approve', label: 'Approve', description: 'Approve this approval request as is' },
                { value: 'reject', label: 'Reject', description: 'Reject this approval request with reasons' },
                { value: 'request_changes', label: 'Request Changes', description: 'Request changes to the proposed modifications' },
              ].map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      {getDecisionIcon(option.value)}
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Response Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-medium">
              Response Notes
              {watchedDecision !== 'approve' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                watchedDecision === 'approve'
                  ? 'Optional notes for approval (optional)'
                  : watchedDecision === 'reject'
                  ? 'Please provide reasons for rejection (required)'
                  : 'Please specify the changes needed (required)'
              }
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setValue('notes', e.target.value);
              }}
              className="min-h-[100px]"
              {...register('notes', {
                required: watchedDecision !== 'approve' ? 'Notes are required for this action' : false,
                minLength: watchedDecision !== 'approve' ? {
                  value: 10,
                  message: 'Please provide at least 10 characters of feedback'
                } : undefined,
              })}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
            {watchedDecision !== 'approve' && (
              <p className="text-xs text-muted-foreground">
                {watchedDecision === 'reject'
                  ? 'Please provide clear reasons for rejection to help the submitter understand the issues.'
                  : 'Please provide specific details about what changes are needed.'}
              </p>
            )}
          </div>

          {/* Modified Content (for request_changes) */}
          {watchedDecision === 'request_changes' && (
            <div className="space-y-2">
              <Label htmlFor="modifiedContent" className="font-medium">
                Suggested Changes (Optional)
              </Label>
              <Textarea
                id="modifiedContent"
                placeholder="Provide suggested modifications or corrections..."
                value={modifiedContent}
                onChange={(e) => {
                  setModifiedContent(e.target.value);
                  setValue('modifiedContent', e.target.value);
                }}
                className="min-h-[120px] font-mono text-sm"
                {...register('modifiedContent')}
              />
              <p className="text-xs text-muted-foreground">
                You can provide specific code changes or suggestions here to help the submitter make the required modifications.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Approval ID: {approvalId}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDecision('approve');
                  setValue('decision', 'approve');
                  setNotes('');
                  setValue('notes', '');
                  setModifiedContent('');
                  setValue('modifiedContent', '');
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={
                  watchedDecision === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : watchedDecision === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {getDecisionIcon(watchedDecision)}
                    <span className="ml-2">
                      {watchedDecision === 'approve' ? 'Approve' :
                       watchedDecision === 'reject' ? 'Reject' : 'Request Changes'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className={`p-4 rounded-lg border ${getDecisionColor(watchedDecision)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getDecisionIcon(watchedDecision)}
              <span className="font-medium">
                {watchedDecision === 'approve' ? 'Approval Summary' :
                 watchedDecision === 'reject' ? 'Rejection Summary' : 'Change Request Summary'}
              </span>
            </div>
            <p className="text-sm">
              {watchedDecision === 'approve'
                ? 'This approval will be accepted and the proposed changes will be implemented.'
                : watchedDecision === 'reject'
                ? 'This approval will be rejected and the submitter will need to address the feedback before resubmitting.'
                : 'Changes will be requested and the submitter will need to modify the proposal based on your feedback.'}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}