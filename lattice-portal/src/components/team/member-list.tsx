/**
 * Member List Component
 *
 * A component for displaying and managing organization members.
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
  DropdownMenuSeparator,
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
  Shield,
  Crown,
  User,
  UserMinus,
  Check,
  X,
} from 'lucide-react';
import { OrganizationMember } from '@/types';

interface MemberListProps {
  members: OrganizationMember[];
  currentUserId: string;
  currentUserRole: string;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

const roleConfig = {
  owner: {
    label: 'Owner',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
  },
  admin: {
    label: 'Admin',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Shield,
  },
  developer: {
    label: 'Developer',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: User,
  },
  viewer: {
    label: 'Viewer',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: User,
  },
};

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'developer', label: 'Developer' },
  { value: 'viewer', label: 'Viewer' },
];

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  onUpdateRole,
  onRemoveMember,
  isLoading = false,
}: MemberListProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  const getRoleBadge = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const canManageMember = (member: OrganizationMember): boolean => {
    // Users can't manage themselves
    if (member.userId === currentUserId) {
      return false;
    }

    // Owners can manage everyone
    if (currentUserRole === 'owner') {
      return true;
    }

    // Admins can manage developers and viewers
    if (currentUserRole === 'admin') {
      return member.role === 'developer' || member.role === 'viewer';
    }

    return false;
  };

  const handleRemoveMember = (member: OrganizationMember) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (memberToRemove) {
      await onRemoveMember(memberToRemove.userId);
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
        <p className="text-gray-500">Invite team members to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const canManage = canManageMember(member);
              const isCurrentUser = member.userId === currentUserId;

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.fullName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatDate(member.joinedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {canManage && (
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
                          <div className="px-2 py-1.5 text-sm font-medium text-gray-700">
                            Update Role
                          </div>
                          {roleOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => onUpdateRole(member.userId, option.value)}
                              disabled={option.value === member.role}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                {option.value === member.role && (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
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

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium">
                {memberToRemove?.fullName}
              </span>{' '}
              from the organization? They will lose access to all projects and resources.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}