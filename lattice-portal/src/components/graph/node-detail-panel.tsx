'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraphNode, NodeType, SpecStatus } from '@/types';
import {
  X,
  ExternalLink,
  Edit,
  Trash,
  Eye,
  Code,
  GitBranch,
  Calendar,
  User,
  FileText,
  Tag
} from 'lucide-react';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
  onEdit?: (node: GraphNode) => void;
  onDelete?: (nodeId: string) => void;
  onViewSpec?: (node: GraphNode) => void;
  className?: string;
}

export function NodeDetailPanel({
  node,
  onClose,
  onEdit,
  onDelete,
  onViewSpec,
  className = ''
}: NodeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!node) {
    return null;
  }

  // Get node type color
  const getNodeTypeColor = (type: NodeType) => {
    switch (type) {
      case NodeType.SPEC: return 'bg-blue-100 text-blue-800';
      case NodeType.MODULE: return 'bg-green-100 text-green-800';
      case NodeType.CONTROLLER: return 'bg-purple-100 text-purple-800';
      case NodeType.MODEL: return 'bg-orange-100 text-orange-800';
      case NodeType.ROUTE_API: return 'bg-red-100 text-red-800';
      case NodeType.TASK: return 'bg-yellow-100 text-yellow-800';
      case NodeType.TEST: return 'bg-pink-100 text-pink-800';
      case NodeType.AGENT: return 'bg-indigo-100 text-indigo-800';
      case NodeType.GOAL: return 'bg-teal-100 text-teal-800';
      case NodeType.CONSTRAINT: return 'bg-gray-100 text-gray-800';
      case NodeType.DOCUMENTATION: return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: SpecStatus) => {
    switch (status) {
      case SpecStatus.ACTIVE: return 'bg-green-500';
      case SpecStatus.DRAFT: return 'bg-yellow-500';
      case SpecStatus.DEPRECATED: return 'bg-red-500';
      case SpecStatus.PENDING: return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // Handle edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit(node);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${node.name}"?`)) {
      onDelete(node.id);
      onClose();
    }
  };

  // Handle view spec
  const handleViewSpec = () => {
    if (onViewSpec) {
      onViewSpec(node);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl z-50 ${className}`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)}`} />
                <div>
                  <h2 className="text-lg font-semibold truncate max-w-[200px]">
                    {node.name}
                  </h2>
                  <Badge className={getNodeTypeColor(node.type)}>
                    {node.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
              {node.type === NodeType.SPEC && onViewSpec && (
                <Button variant="outline" size="sm" onClick={handleViewSpec}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Spec
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    {/* Description */}
                    {node.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {node.description}
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Status</h4>
                      <Badge variant="outline">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)} mr-2`} />
                        {node.status}
                      </Badge>
                    </div>

                    {/* Source */}
                    {node.specSource && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Source</h4>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {node.specSource}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(node.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Updated</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(node.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-6">
                    {node.content ? (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Content</h4>
                        <Card>
                          <CardContent className="p-4">
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[400px] whitespace-pre-wrap">
                              {node.content}
                            </pre>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No content available for this node
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="metadata" className="space-y-4 mt-6">
                    {Object.keys(node.metadata).length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Metadata</h4>
                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              {Object.entries(node.metadata).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{key}:</span>
                                  <span className="text-sm text-muted-foreground">{value}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No metadata available for this node
                        </p>
                      </div>
                    )}

                    {/* Node ID */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Node ID</h4>
                      <Card>
                        <CardContent className="p-4">
                          <code className="text-xs bg-muted p-2 rounded block">
                            {node.id}
                          </code>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default NodeDetailPanel;