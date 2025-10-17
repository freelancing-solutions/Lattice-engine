import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApprovalRequest, ApprovalStatus } from '@/types';
import Link from 'next/link';

interface ApprovalCardProps {
  approval: ApprovalRequest;
  onApprove?: (approvalId: string, notes?: string) => void;
  onReject?: (approvalId: string, notes?: string) => void;
  onViewDetails?: (approvalId: string) => void;
  isSelected?: boolean;
  onSelect?: (approvalId: string, selected: boolean) => void;
}

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
  onViewDetails,
  isSelected = false,
  onSelect,
}: ApprovalCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.PENDING: return 'bg-yellow-500';
      case ApprovalStatus.APPROVED: return 'bg-green-500';
      case ApprovalStatus.REJECTED: return 'bg-red-500';
      case ApprovalStatus.EXPIRED: return 'bg-gray-500';
      case ApprovalStatus.CANCELLED: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const canRespond = approval.status === ApprovalStatus.PENDING && !isExpired(approval.expiresAt);

  const handleApprove = () => {
    onApprove?.(approval.id);
  };

  const handleReject = () => {
    onReject?.(approval.id, 'Rejected via dashboard');
  };

  const handleViewDetails = () => {
    onViewDetails?.(approval.id);
  };

  const handleSelect = (checked: boolean) => {
    onSelect?.(approval.id, checked);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleSelect(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            )}
            <Badge className={`${getPriorityColor(approval.priority)} text-white`}>
              {approval.priority}
            </Badge>
            <Badge className={`${getStatusColor(approval.status)} text-white`}>
              {approval.status}
            </Badge>
            {isExpired(approval.expiresAt) && (
              <Badge variant="destructive">Expired</Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleViewDetails}>
                View Details
              </DropdownMenuItem>
              {canRespond && (
                <DropdownMenuItem onClick={() => onViewDetails?.(approval.id)}>
                  Request Changes
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/mutations/${approval.proposalId}`}>
                  View Mutation
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{approval.specId}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{approval.mutationType}</span>
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {approval.reasoning}
          </p>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence</span>
            <span className="text-sm font-medium">{Math.round(approval.confidence * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${approval.confidence * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Impact Analysis Summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Risk:</span>
            <span className={`font-medium ${
              approval.impactAnalysis.risk === 'critical' ? 'text-red-600' :
              approval.impactAnalysis.risk === 'high' ? 'text-orange-600' :
              approval.impactAnalysis.risk === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {approval.impactAnalysis.risk.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Affected:</span>
            <span className="font-medium">{approval.impactAnalysis.affectedSpecs.length}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created: {formatDate(approval.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Expires: {formatDate(approval.expiresAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {canRespond ? (
            <>
              <Button
                size="sm"
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button size="sm" variant="outline" onClick={handleViewDetails}>
                View Details
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={handleViewDetails} className="w-full">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}