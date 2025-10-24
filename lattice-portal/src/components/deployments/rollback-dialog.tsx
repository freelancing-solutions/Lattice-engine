'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RollbackDeploymentRequest } from '@/types';
import {
  AlertTriangle,
  RotateCcw,
  Loader2
} from 'lucide-react';

interface RollbackDialogProps {
  open: boolean;
  deploymentId: string;
  onClose: () => void;
  onConfirm: (reason: string, targetVersion?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function RollbackDialog({
  open,
  deploymentId,
  onClose,
  onConfirm,
  isSubmitting = false
}: RollbackDialogProps) {
  const [reason, setReason] = useState('');
  const [targetVersion, setTargetVersion] = useState('');

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setReason('');
      setTargetVersion('');
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!reason.trim()) {
      return; // Validation will be shown in UI
    }

    try {
      await onConfirm(reason.trim(), targetVersion.trim() || undefined);
      onClose();
    } catch (error) {
      // Error handling is managed by parent component
    }
  };

  // Validation
  const isValid = reason.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Rollback Deployment
          </DialogTitle>
          <DialogDescription>
            Rollback deployment {deploymentId.slice(0, 8)}... to the previous version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will create a rollback deployment that reverts the current deployment.
              This action cannot be undone and may cause temporary service disruption.
            </AlertDescription>
          </Alert>

          {/* Rollback Reason */}
          <div className="space-y-2">
            <Label htmlFor="rollback-reason">
              Rollback Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rollback-reason"
              placeholder="Please explain why you are rolling back this deployment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Please provide a detailed reason for this rollback</span>
              <span>{reason.length}/500</span>
            </div>
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-xs text-destructive">
                Reason must be at least 10 characters long
              </p>
            )}
          </div>

          {/* Target Version (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="target-version">
              Target Version <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="target-version"
              placeholder="Enter specific version to rollback to (optional)"
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to rollback to the previous stable version
            </p>
          </div>

          {/* Deployment Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deployment ID:</span>
                <span className="font-mono">{deploymentId}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                A new rollback deployment will be created with strategy: ROLLBACK
              </div>
            </div>
          </div>

          {/* Impact Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Impact:</strong> During rollback, the current version will be replaced with the previous version.
              This may result in temporary service unavailability or reduced capacity.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rolling back...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Confirm Rollback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RollbackDialog;