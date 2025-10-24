/**
 * Invitation List Component
 *
 * A component for displaying and managing pending organization invitations.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import {
  MoreHorizontal,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import { OrganizationInvitation, InvitationStatus } from '@/types';

interface InvitationListProps {
  invitations: OrganizationInvitation[];
  onResend: (invitationId: string) => Promise<void>;
  onCancel: (invitationId: string) => Promise<void>;
  isLoading?: boolean;
}

const statusConfig = {
  [InvitationStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  [InvitationStatus.ACCEPTED]: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  [InvitationStatus.EXPIRED]: {
    label: 'Expired',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  [InvitationStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: X,
  },
};

const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  developer: {
    label: 'Developer',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  viewer: {
    label: 'Viewer',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function InvitationList({
  invitations,
  onResend,
  onCancel,
  isLoading = false,
}: InvitationListProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState<OrganizationInvitation | null>(null);

  const getStatusBadge = (status: InvitationStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer;
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 0) {
      return 'expires today';
    } else if (diffDays === 1) {
      return 'expires tomorrow';
    } else {
      return `expires in ${diffDays} days`;
    }
  };

  const isExpired = (invitation: OrganizationInvitation) => {
    return new Date(invitation.expiresAt) < new Date();
  };

  const canResend = (invitation: OrganizationInvitation) => {
    return invitation.status === InvitationStatus.PENDING && !isExpired(invitation);
  };

  const canCancel = (invitation: OrganizationInvitation) => {
    return invitation.status === InvitationStatus.PENDING;
  };

  const handleCancelInvitation = (invitation: OrganizationInvitation) => {
    setInvitationToCancel(invitation);
    setCancelDialogOpen(true);
  };

  const confirmCancelInvitation = async () => {
    if (invitationToCancel) {
      await onCancel(invitationToCancel.id);
      setCancelDialogOpen(false);
      setInvitationToCancel(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
        <p className="text-gray-500">Invite team members to see their invitations here</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const expired = isExpired(invitation);
              const resendEnabled = canResend(invitation);
              const cancelEnabled = canCancel(invitation);
              const hasActions = resendEnabled || cancelEnabled;

              return (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {invitation.email}
                        </div>
                        {invitation.message && (
                          <div className="text-sm text-gray-500 italic">
                            "{invitation.message}"
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatDate(invitation.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className={`h-3 w-3 ${expired ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${expired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {getRelativeTime(invitation.expiresAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                  <TableCell>
                    {hasActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={isLoading}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {resendEnabled && (
                            <DropdownMenuItem
                              onClick={() => onResend(invitation.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Resend Invitation
                            </DropdownMenuItem>
                          )}
                          {cancelEnabled && (
                            <DropdownMenuItem
                              onClick={() => handleCancelInvitation(invitation)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel Invitation
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to{' '}
              <span className="font-medium">
                {invitationToCancel?.email}
              </span>
              ? The invitation link will no longer work.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelInvitation}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}