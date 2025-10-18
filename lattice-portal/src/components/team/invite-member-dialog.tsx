/**
 * Invite Member Dialog
 *
 * A reusable dialog component for inviting new team members to an organization.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Mail } from 'lucide-react';
import { CreateInvitationRequest } from '@/types';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (invitation: CreateInvitationRequest) => Promise<void>;
  isLoading?: boolean;
}

const roleDescriptions = {
  admin: 'Can manage members, projects, and settings',
  developer: 'Can create and manage projects and specs',
  viewer: 'Can view projects and specs only',
};

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
  isLoading = false,
}: InviteMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateInvitationRequest>({
    defaultValues: {
      email: '',
      role: 'developer',
      message: '',
    },
  });

  const onSubmit = async (data: CreateInvitationRequest) => {
    setIsSubmitting(true);
    try {
      await onInvite(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Failed to send invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization. The invitation will be sent via email
            and will expire in 7 days.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="colleague@example.com"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isSubmitting}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex flex-col">
                          <span>Admin</span>
                          <span className="text-sm text-muted-foreground">
                            {roleDescriptions.admin}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="developer">
                        <div className="flex flex-col">
                          <span>Developer</span>
                          <span className="text-sm text-muted-foreground">
                            {roleDescriptions.developer}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex flex-col">
                          <span>Viewer</span>
                          <span className="text-sm text-muted-foreground">
                            {roleDescriptions.viewer}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a personal message to the invitation..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}