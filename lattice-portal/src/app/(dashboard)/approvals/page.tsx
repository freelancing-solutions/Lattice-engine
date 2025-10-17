'use client';

import { useEffect, useState } from 'react';
import { CheckSquare, Search, Filter, MoreHorizontal, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApprovalStore } from '@/stores/approval-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';
import { ApprovalRequest, ApprovalStatus } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ApprovalsDashboardPage() {
  const router = useRouter();
  const {
    approvals,
    setApprovals,
    filters,
    setFilters,
    isLoading,
    error,
    setLoading,
    setError,
  } = useApprovalStore();

  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);

  useEffect(() => {
    loadApprovals();
  }, [filters]);

  const loadApprovals = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getApprovals({
        ...filters,
        assignedTo: user?.id,
      });

      if (response.success && response.data) {
        setApprovals(response.data.items);
      } else {
        setError(response.error?.message || 'Failed to load approvals');
      }
    } catch (error: any) {
      setError(error.error?.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      status: status === 'all' ? undefined : status as ApprovalStatus,
    });
  };

  const handlePriorityFilter = (priority: string) => {
    setFilters({
      ...filters,
      priority: priority === 'all' ? undefined : priority,
    });
  };

  const handleRespond = async (approvalId: string, decision: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await apiClient.respondToApproval(approvalId, decision, notes);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Response Recorded',
          message: `Approval has been ${decision}d`,
          duration: 5000,
        });
        loadApprovals(); // Reload approvals
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to respond to approval',
        duration: 5000,
      });
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedApprovals.length === 0) return;

    try {
      const response = await apiClient.batchApprovalAction(action, selectedApprovals);
      if (response.success && response.data) {
        const { success, failed } = response.data;
        addNotification({
          type: 'info',
          title: 'Batch Action Complete',
          message: `${success.length} approvals ${action}d${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
          duration: 5000,
        });
        setSelectedApprovals([]);
        loadApprovals();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to perform batch action',
        duration: 5000,
      });
    }
  };

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

  const filteredApprovals = approvals.filter(approval =>
    approval.specId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.reasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.mutationType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">
            Review and respond to pending approval requests
          </p>
        </div>
        {selectedApprovals.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleBatchAction('approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Selected ({selectedApprovals.length})
            </Button>
            <Button
              onClick={() => handleBatchAction('reject')}
              variant="destructive"
            >
              Reject Selected ({selectedApprovals.length})
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search approvals..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={ApprovalStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={ApprovalStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={ApprovalStatus.REJECTED}>Rejected</SelectItem>
                <SelectItem value={ApprovalStatus.EXPIRED}>Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority || 'all'} onValueChange={handlePriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Approvals</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadApprovals}>Try Again</Button>
          </CardContent>
        </Card>
      ) : filteredApprovals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approvals Found</h3>
            <p className="text-gray-700">
              {searchTerm || filters.status || filters.priority
                ? 'Try adjusting your filters'
                : 'No approvals match your criteria'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <Card key={approval.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedApprovals.includes(approval.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApprovals([...selectedApprovals, approval.id]);
                          } else {
                            setSelectedApprovals(selectedApprovals.filter(id => id !== approval.id));
                          }
                        }}
                        className="h-4 w-4"
                      />
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

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{approval.specId}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{approval.mutationType}</span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {approval.reasoning}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>Confidence:</span>
                          <span className="font-medium">{Math.round(approval.confidence * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Created: {formatDate(approval.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Expires: {formatDate(approval.expiresAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {approval.status === ApprovalStatus.PENDING && !isExpired(approval.expiresAt) && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleRespond(approval.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRespond(approval.id, 'reject', 'Rejected via dashboard')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/approvals/${approval.id}`)}
                    >
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/approvals/${approval.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {approval.status === ApprovalStatus.PENDING && !isExpired(approval.expiresAt) && (
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/approvals/${approval.id}`)}
                          >
                            Request Changes
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/mutations/${approval.proposalId}`)}
                        >
                          View Mutation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}