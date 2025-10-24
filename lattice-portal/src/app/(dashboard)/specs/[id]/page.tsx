'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, FileText, Clock, Calendar, User, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSpecStore } from '@/stores/spec-store';
import { useProjectStore } from '@/stores/project-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { Spec, SpecStatus, NodeType, Project } from '@/types';
import Link from 'next/link';

export default function SpecDetailPage() {
  const params = useParams();
  const router = useRouter();
  const specId = params.id as string;

  const {
    selectedSpec,
    setSelectedSpec,
    currentProjectId,
    isLoading: specLoading,
    error: specError,
    updateSpec,
    removeSpec,
  } = useSpecStore();

  const { projects } = useProjectStore();
  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (specId && currentProjectId) {
      loadSpec();
    }
  }, [specId, currentProjectId]);

  const loadSpec = async () => {
    try {
      // Since backend doesn't have GET /specs/{id}, we need to load all specs and filter
      const response = await apiClient.getSpecs(currentProjectId!);
      if (response.success && response.data) {
        const spec = response.data.items.find(s => s.id === specId);
        if (spec) {
          setSelectedSpec(spec);
          setEditedContent(spec.content || '');
        } else {
          throw new Error('Spec not found');
        }
      }
    } catch (error: any) {
      console.error('Failed to load spec:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load spec details',
      });
    }
  };

  const handleApprove = async () => {
    try {
      const response = await apiClient.approveSpec(specId);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Spec Approved',
          message: 'The specification has been approved successfully',
        });
        updateSpec(specId, { status: SpecStatus.ACTIVE });
        if (selectedSpec) {
          setSelectedSpec({ ...selectedSpec, status: SpecStatus.ACTIVE });
        }
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: error.error?.message || 'Failed to approve spec',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this spec? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await apiClient.deleteSpec(specId);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Spec Deleted',
          message: 'The specification has been deleted successfully',
        });
        removeSpec(specId);
        router.push('/dashboard/specs');
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: error.error?.message || 'Failed to delete spec',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.updateSpec({
        specId,
        content: editedContent,
        diffSummary: 'Updated spec content'
      });
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Spec Updated',
          message: 'The specification has been updated successfully',
        });
        updateSpec(specId, { content: editedContent });
        if (selectedSpec) {
          setSelectedSpec({ ...selectedSpec, content: editedContent });
        }
        setIsEditing(false);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.error?.message || 'Failed to update spec',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(selectedSpec?.content || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(selectedSpec?.content || '');
  };

  const getStatusColor = (status: SpecStatus) => {
    switch (status) {
      case SpecStatus.ACTIVE:
        return 'bg-green-500';
      case SpecStatus.DRAFT:
        return 'bg-yellow-500';
      case SpecStatus.DEPRECATED:
        return 'bg-gray-500';
      case SpecStatus.PENDING:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: NodeType) => {
    switch (type) {
      case NodeType.SPEC:
        return 'bg-blue-500';
      case NodeType.MODULE:
        return 'bg-purple-500';
      case NodeType.CONTROLLER:
        return 'bg-green-500';
      case NodeType.MODEL:
        return 'bg-orange-500';
      case NodeType.ROUTE_API:
        return 'bg-red-500';
      case NodeType.TASK:
        return 'bg-indigo-500';
      case NodeType.TEST:
        return 'bg-pink-500';
      case NodeType.AGENT:
        return 'bg-cyan-500';
      case NodeType.GOAL:
        return 'bg-emerald-500';
      case NodeType.CONSTRAINT:
        return 'bg-amber-500';
      case NodeType.DOCUMENTATION:
        return 'bg-slate-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatNodeType = (type: NodeType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (specLoading) {
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

  if (specError || !selectedSpec) {
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
              <h3 className="text-lg font-semibold mb-2">Specification not found</h3>
              <p className="text-muted-foreground mb-4">
                The specification you're looking for doesn't exist or you don't have access to it.
              </p>
              <Link href="/dashboard/specs">
                <Button>Back to Specifications</Button>
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
            <h1 className="text-3xl font-bold">{selectedSpec.name}</h1>
            <p className="text-muted-foreground">
              Specification details and management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedSpec.status === SpecStatus.PENDING && (
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {selectedSpec.status === SpecStatus.DRAFT && !isEditing && (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                onClick={handleSaveContent}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Status and Type */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getTypeColor(selectedSpec.type)}`} />
          {formatNodeType(selectedSpec.type)}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedSpec.status)}`} />
          {selectedSpec.status}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Spec Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Specification Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {selectedSpec.description || 'No description provided'}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Type</h4>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <div className={`w-2 h-2 rounded-full ${getTypeColor(selectedSpec.type)}`} />
                        {formatNodeType(selectedSpec.type)}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Status</h4>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedSpec.status)}`} />
                        {selectedSpec.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {selectedSpec.specSource && (
                    <div>
                      <h4 className="font-semibold mb-2">Source</h4>
                      <p className="text-muted-foreground">{selectedSpec.specSource}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedSpec.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Updated:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedSpec.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Edit the specification content' : 'Specification content'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={isEditing ? editedContent : (selectedSpec.content || '')}
                    onChange={(e) => isEditing && setEditedContent(e.target.value)}
                    placeholder="Specification content..."
                    className="min-h-[400px] font-mono text-sm"
                    disabled={!isEditing}
                  />
                  {!selectedSpec.content && !isEditing && (
                    <p className="text-muted-foreground text-center py-8">
                      No content available for this specification
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-6">
              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(selectedSpec.metadata).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(selectedSpec.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No metadata available for this specification
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {/* Version History */}
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>
                    Track changes and updates to this specification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Version History</h3>
                    <p className="text-muted-foreground">
                      Version history tracking will be available in a future update
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Status</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedSpec.status)}`} />
                    {selectedSpec.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Type</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getTypeColor(selectedSpec.type)}`} />
                    {formatNodeType(selectedSpec.type)}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedSpec.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Updated:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedSpec.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedSpec.status === SpecStatus.DRAFT && !isEditing && (
                <Button onClick={handleEdit} className="w-full" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Content
                </Button>
              )}

              {selectedSpec.status === SpecStatus.PENDING && (
                <Button onClick={handleApprove} className="w-full" variant="outline">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Spec
                </Button>
              )}

              <Button variant="destructive" onClick={handleDelete} className="w-full" disabled={isDeleting}>
                Delete Spec
              </Button>
            </CardContent>
          </Card>

          {/* Metadata Summary */}
          {Object.keys(selectedSpec.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Object.keys(selectedSpec.metadata).length}
                  </div>
                  <p className="text-sm text-muted-foreground">metadata fields</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}