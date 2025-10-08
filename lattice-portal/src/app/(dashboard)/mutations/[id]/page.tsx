'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, GitBranch, Clock, AlertCircle, User, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useMutationStore } from '@/stores/mutation-store';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { Mutation, Project } from '@/types';
import Link from 'next/link';

export default function MutationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mutationId = params.id as string;

  const {
    selectedMutation,
    setSelectedMutation,
    isLoading: mutationLoading,
    error: mutationError,
  } = useMutationStore();

  const { projects, setProjects } = useProjectStore();
  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (mutationId) {
      loadMutation();
      loadProjects();
    }
  }, [mutationId]);

  const loadMutation = async () => {
    try {
      const response = await apiClient.getMutation(mutationId);
      if (response.success && response.data) {
        setSelectedMutation(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load mutation:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load mutation details',
      });
    }
  };

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      if (response.success && response.data) {
        setProjects(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await apiClient.approveMutation(mutationId, approvalComment);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Mutation Approved',
          message: 'The mutation has been approved successfully',
        });
        loadMutation(); // Refresh the mutation details
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: error.error?.message || 'Failed to approve mutation',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Please provide a reason for rejection',
      });
      return;
    }

    setIsRejecting(true);
    try {
      const response = await apiClient.rejectMutation(mutationId, rejectionReason);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Mutation Rejected',
          message: 'The mutation has been rejected',
        });
        loadMutation(); // Refresh the mutation details
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: error.error?.message || 'Failed to reject mutation',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'executed':
        return <GitBranch className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'executed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  if (mutationLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2 mt-2" />
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-5/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mutationError || !selectedMutation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Mutation not found</h3>
              <p className="text-muted-foreground mb-4">
                The mutation you're looking for doesn't exist or you don't have access to it.
              </p>
              <Link href="/dashboard/mutations">
                <Button>Back to Mutations</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mutation Details</h1>
            <p className="text-muted-foreground">
              Review and manage this mutation
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedMutation.status === 'pending' && (
            <>
              <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isApproving || isRejecting}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </>
          )}
          {selectedMutation.status === 'approved' && (
            <Button>
              <GitBranch className="mr-2 h-4 w-4" />
              Execute
            </Button>
          )}
        </div>
      </div>

      {/* Status and Risk */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          {getStatusIcon(selectedMutation.status)}
          <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedMutation.status)}`} />
          {selectedMutation.status}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getRiskColor(selectedMutation.risk_level)}`} />
          {selectedMutation.risk_level} risk
        </Badge>
        <Badge variant="outline">
          {selectedMutation.operation_type}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mutation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Mutation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedMutation.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Project</h4>
                  <Link href={`/dashboard/projects/${selectedMutation.project_id}`}>
                    <Button variant="link" className="p-0 h-auto">
                      {getProjectName(selectedMutation.project_id)}
                    </Button>
                  </Link>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Operation Type</h4>
                  <p className="text-muted-foreground">{selectedMutation.operation_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Level</h4>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(selectedMutation.risk_level)}`} />
                    {selectedMutation.risk_level}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getStatusIcon(selectedMutation.status)}
                    {selectedMutation.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedMutation.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created by:</span>
                  <span className="text-sm font-medium">{selectedMutation.created_by}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Code Changes</CardTitle>
              <CardDescription>
                Files and modifications included in this mutation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(selectedMutation.changes).map(([filename, change]) => (
                  <div key={filename} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{filename}</h4>
                      <Badge variant="outline">
                        {(change as any).operation || 'modify'}
                      </Badge>
                    </div>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      <pre className="whitespace-pre-wrap">
                        {(change as any).content || JSON.stringify(change, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval/Rejection Form */}
          {selectedMutation.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Mutation</CardTitle>
                <CardDescription>
                  Approve or reject this mutation with comments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Approval Comment (Optional)</label>
                  <Textarea
                    placeholder="Add any comments for the approval..."
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Rejection Reason *</label>
                  <Textarea
                    placeholder="Provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedMutation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {selectedMutation.approved_by && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-muted-foreground">
                        By {selectedMutation.approved_by}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedMutation.executed_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Executed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedMutation.executed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Level</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(selectedMutation.risk_level)}`} />
                    {selectedMutation.risk_level}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Files Changed</span>
                  <span className="text-sm font-medium">{Object.keys(selectedMutation.changes).length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Operation</span>
                  <span className="text-sm font-medium">{selectedMutation.operation_type}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {selectedMutation.metadata && Object.keys(selectedMutation.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(selectedMutation.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{key}</span>
                      <span className="text-sm font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}