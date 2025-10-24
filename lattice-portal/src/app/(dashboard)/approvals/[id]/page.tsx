'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, FileText, User, Calendar, Shield, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useApprovalStore } from '@/stores/approval-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { ApprovalRequest, ApprovalStatus } from '@/types';

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const approvalId = params.id as string;

  const {
    selectedApproval,
    setSelectedApproval,
    isLoading: approvalLoading,
    error: approvalError,
  } = useApprovalStore();

  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [responseNotes, setResponseNotes] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    if (approvalId) {
      loadApproval();
    }
  }, [approvalId]);

  const loadApproval = async () => {
    try {
      const response = await apiClient.getApproval(approvalId);
      if (response.success && response.data) {
        setSelectedApproval(response.data);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to load approval',
        duration: 5000,
      });
    }
  };

  const handleApprove = async () => {
    setIsResponding(true);
    try {
      const response = await apiClient.respondToApproval(approvalId, 'approve', responseNotes);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Approved',
          message: 'Approval has been approved successfully',
          duration: 5000,
        });
        router.back();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to approve approval',
        duration: 5000,
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async () => {
    if (!responseNotes.trim()) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Rejection notes are required',
        duration: 5000,
      });
      return;
    }

    setIsResponding(true);
    try {
      const response = await apiClient.respondToApproval(approvalId, 'reject', responseNotes);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Rejected',
          message: 'Approval has been rejected',
          duration: 5000,
        });
        router.back();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to reject approval',
        duration: 5000,
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!responseNotes.trim()) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Change request notes are required',
        duration: 5000,
      });
      return;
    }

    setIsResponding(true);
    try {
      const response = await apiClient.respondToApproval(approvalId, 'request_changes', responseNotes);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Changes Requested',
          message: 'Changes have been requested for this approval',
          duration: 5000,
        });
        router.back();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to request changes',
        duration: 5000,
      });
    } finally {
      setIsResponding(false);
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (approvalLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (approvalError || !selectedApproval) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {approvalError ? 'Error Loading Approval' : 'Approval Not Found'}
            </h3>
            <p className="text-red-700 mb-4">
              {approvalError || 'The approval you are looking for does not exist.'}
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canRespond = selectedApproval.status === ApprovalStatus.PENDING && !isExpired(selectedApproval.expiresAt);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Approval Details</h1>
            <p className="text-muted-foreground">
              Review and respond to this approval request
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getPriorityColor(selectedApproval.priority)} text-white`}>
            {selectedApproval.priority}
          </Badge>
          <Badge className={`${getStatusColor(selectedApproval.status)} text-white`}>
            {selectedApproval.status}
          </Badge>
          {isExpired(selectedApproval.expiresAt) && (
            <Badge variant="destructive">Expired</Badge>
          )}
          {canRespond && (
            <>
              <Button
                onClick={handleApprove}
                disabled={isResponding}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={handleReject}
                disabled={isResponding}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleRequestChanges}
                disabled={isResponding}
                variant="outline"
              >
                Request Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Approval Info */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Spec ID</label>
                  <p className="font-medium">{selectedApproval.specId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mutation Type</label>
                  <p className="font-medium">{selectedApproval.mutationType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="font-medium">{formatDate(selectedApproval.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expires</label>
                  <p className="font-medium">{formatDate(selectedApproval.expiresAt)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Reasoning</label>
                <p className="mt-1 text-sm">{selectedApproval.reasoning}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Confidence Score</label>
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedApproval.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(selectedApproval.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="diff">Code Diff</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Original Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                    {selectedApproval.content.original}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proposed Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                    {selectedApproval.content.proposed}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diff" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Code Changes</CardTitle>
                  <CardDescription>
                    Added, removed, and modified code sections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedApproval.content.diff.additions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Additions</h4>
                        <pre className="bg-green-50 p-4 rounded text-sm overflow-x-auto">
                          {selectedApproval.content.diff.additions.join('\n')}
                        </pre>
                      </div>
                    )}
                    {selectedApproval.content.diff.deletions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Deletions</h4>
                        <pre className="bg-red-50 p-4 rounded text-sm overflow-x-auto">
                          {selectedApproval.content.diff.deletions.join('\n')}
                        </pre>
                      </div>
                    )}
                    {selectedApproval.content.diff.modifications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-700 mb-2">Modifications</h4>
                        <pre className="bg-yellow-50 p-4 rounded text-sm overflow-x-auto">
                          {selectedApproval.content.diff.modifications.join('\n')}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Risk Level</label>
                      <p className={`font-medium ${getRiskColor(selectedApproval.impactAnalysis.risk)}`}>
                        {selectedApproval.impactAnalysis.risk.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Complexity</label>
                      <p className="font-medium">{selectedApproval.impactAnalysis.complexity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Breaking Changes</label>
                      <p className="font-medium">
                        {selectedApproval.impactAnalysis.breakingChanges ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Est. Time</label>
                      <p className="font-medium">{selectedApproval.impactAnalysis.estimatedTime}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Affected Specs</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedApproval.impactAnalysis.affectedSpecs.map((spec, index) => (
                        <Badge key={index} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Response Form */}
          {canRespond && (
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>
                  Add notes for your response (required for rejection and change requests)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add your response notes here..."
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isResponding}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isResponding ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isResponding}
                    variant="destructive"
                  >
                    {isResponding ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    onClick={handleRequestChanges}
                    disabled={isResponding}
                    variant="outline"
                  >
                    {isResponding ? 'Processing...' : 'Request Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(selectedApproval.createdAt)}</p>
                  </div>
                </div>
                {selectedApproval.status !== ApprovalStatus.PENDING && (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedApproval.status === ApprovalStatus.APPROVED ? 'bg-green-500' :
                      selectedApproval.status === ApprovalStatus.REJECTED ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm capitalize">{selectedApproval.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedApproval.responses[selectedApproval.responses.length - 1]?.timestamp &&
                          formatDate(selectedApproval.responses[selectedApproval.responses.length - 1].timestamp)
                        }
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
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priority</span>
                <Badge className={`${getPriorityColor(selectedApproval.priority)} text-white`}>
                  {selectedApproval.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk</span>
                <span className={`font-medium ${getRiskColor(selectedApproval.impactAnalysis.risk)}`}>
                  {selectedApproval.impactAnalysis.risk.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <span className="font-medium">{Math.round(selectedApproval.confidence * 100)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">User: {selectedApproval.userId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Proposal: {selectedApproval.proposalId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Channels: {selectedApproval.channels.join(', ')}</span>
              </div>
              {selectedApproval.assignedTo && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Assigned: {selectedApproval.assignedTo}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}