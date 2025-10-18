'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraphQuery, GraphQueryType } from '@/types';
import {
  Play,
  Save,
  Trash,
  Plus,
  Code,
  GitBranch,
  Network,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface GraphQueryBuilderProps {
  onExecute: (query: GraphQuery) => void;
  savedQueries?: GraphQuery[];
  onSaveQuery?: (query: GraphQuery, name: string) => void;
  onLoadQuery?: (query: GraphQuery) => void;
  className?: string;
}

// Relationship types that might be filtered
const relationshipTypes = [
  'DEPENDS_ON',
  'IMPLEMENTS',
  'CONTAINS',
  'EXTENDS',
  'REFERENCES',
  'CALLS',
  'VALIDATES',
  'TESTS',
  'DOCUMENTS',
  'CONFIGURES'
];

export function GraphQueryBuilder({
  onExecute,
  savedQueries = [],
  onSaveQuery,
  onLoadQuery,
  className = ''
}: GraphQueryBuilderProps) {
  // Query form state
  const [queryType, setQueryType] = useState<GraphQueryType>(GraphQueryType.TRAVERSAL);
  const [query, setQuery] = useState('');
  const [parameters, setParameters] = useState('{}');
  const [startNode, setStartNode] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [selectedRelationshipTypes, setSelectedRelationshipTypes] = useState<string[]>([]);
  const [maxDepth, setMaxDepth] = useState('3');
  const [queryName, setQueryName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Query type icons
  const getQueryTypeIcon = (type: GraphQueryType) => {
    switch (type) {
      case GraphQueryType.CYPHER:
        return <Code className="h-4 w-4" />;
      case GraphQueryType.TRAVERSAL:
        return <GitBranch className="h-4 w-4" />;
      case GraphQueryType.NEIGHBORS:
        return <Network className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (queryType) {
      case GraphQueryType.CYPHER:
        if (!query.trim()) {
          newErrors.query = 'Cypher query is required';
        }
        try {
          JSON.parse(parameters);
        } catch {
          newErrors.parameters = 'Invalid JSON format';
        }
        break;
      case GraphQueryType.TRAVERSAL:
        if (!startNode.trim()) {
          newErrors.startNode = 'Start node is required for traversal';
        }
        const depth = parseInt(maxDepth);
        if (isNaN(depth) || depth < 1 || depth > 10) {
          newErrors.maxDepth = 'Max depth must be between 1 and 10';
        }
        break;
      case GraphQueryType.NEIGHBORS:
        if (!nodeId.trim()) {
          newErrors.nodeId = 'Node ID is required for neighbors query';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Execute query
  const handleExecute = () => {
    if (!validateForm()) {
      return;
    }

    const graphQuery: GraphQuery = {
      queryType,
      ...(queryType === GraphQueryType.CYPHER && {
        query: query.trim(),
        parameters: JSON.parse(parameters)
      }),
      ...(queryType === GraphQueryType.TRAVERSAL && {
        startNode: startNode.trim(),
        relationshipTypes: selectedRelationshipTypes.length > 0 ? selectedRelationshipTypes : undefined,
        maxDepth: parseInt(maxDepth)
      }),
      ...(queryType === GraphQueryType.NEIGHBORS && {
        nodeId: nodeId.trim(),
        relationshipTypes: selectedRelationshipTypes.length > 0 ? selectedRelationshipTypes : undefined
      })
    };

    onExecute(graphQuery);
  };

  // Clear form
  const handleClear = () => {
    setQuery('');
    setParameters('{}');
    setStartNode('');
    setNodeId('');
    setSelectedRelationshipTypes([]);
    setMaxDepth('3');
    setErrors({});
  };

  // Save query
  const handleSaveQuery = () => {
    if (!queryName.trim()) {
      setErrors({ queryName: 'Query name is required' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    const graphQuery: GraphQuery = {
      queryType,
      ...(queryType === GraphQueryType.CYPHER && {
        query: query.trim(),
        parameters: JSON.parse(parameters)
      }),
      ...(queryType === GraphQueryType.TRAVERSAL && {
        startNode: startNode.trim(),
        relationshipTypes: selectedRelationshipTypes.length > 0 ? selectedRelationshipTypes : undefined,
        maxDepth: parseInt(maxDepth)
      }),
      ...(queryType === GraphQueryType.NEIGHBORS && {
        nodeId: nodeId.trim(),
        relationshipTypes: selectedRelationshipTypes.length > 0 ? selectedRelationshipTypes : undefined
      })
    };

    if (onSaveQuery) {
      onSaveQuery(graphQuery, queryName.trim());
      setShowSaveDialog(false);
      setQueryName('');
    }
  };

  // Load saved query
  const handleLoadQuery = (savedQuery: GraphQuery) => {
    setQueryType(savedQuery.queryType);
    setQuery(savedQuery.query || '');
    setParameters(savedQuery.parameters ? JSON.stringify(savedQuery.parameters, null, 2) : '{}');
    setStartNode(savedQuery.startNode || '');
    setNodeId(savedQuery.nodeId || '');
    setSelectedRelationshipTypes(savedQuery.relationshipTypes || []);
    setMaxDepth(savedQuery.maxDepth?.toString() || '3');
    setErrors({});

    if (onLoadQuery) {
      onLoadQuery(savedQuery);
    }
  };

  // Handle relationship type selection
  const handleRelationshipTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedRelationshipTypes(prev => [...prev, type]);
    } else {
      setSelectedRelationshipTypes(prev => prev.filter(t => t !== type));
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Query Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Query Builder</CardTitle>
          <CardDescription>
            Build and execute graph queries using different query types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Query Type</Label>
            <Select value={queryType} onValueChange={(value) => setQueryType(value as GraphQueryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GraphQueryType.CYPHER}>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Cypher Query
                  </div>
                </SelectItem>
                <SelectItem value={GraphQueryType.TRAVERSAL}>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Graph Traversal
                  </div>
                </SelectItem>
                <SelectItem value={GraphQueryType.NEIGHBORS}>
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Node Neighbors
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Query Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getQueryTypeIcon(queryType)}
            {queryType.replace('_', ' ')} Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {queryType === GraphQueryType.CYPHER && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cypher-query">Cypher Query</Label>
                <Textarea
                  id="cypher-query"
                  placeholder="MATCH (n:Spec) WHERE n.name CONTAINS 'user' RETURN n LIMIT 10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                {errors.query && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.query}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cypher-parameters">Parameters (JSON)</Label>
                <Textarea
                  id="cypher-parameters"
                  placeholder='{"limit": 10, "name": "user"}'
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  className="min-h-[80px] font-mono text-sm"
                />
                {errors.parameters && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.parameters}
                  </div>
                )}
              </div>
            </>
          )}

          {queryType === GraphQueryType.TRAVERSAL && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-node">Start Node ID</Label>
                <Input
                  id="start-node"
                  placeholder="Enter the starting node ID..."
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                />
                {errors.startNode && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.startNode}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-depth">Max Depth</Label>
                <Input
                  id="max-depth"
                  type="number"
                  min="1"
                  max="10"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(e.target.value)}
                />
                {errors.maxDepth && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.maxDepth}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Relationship Types (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                  {relationshipTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rel-${type}`}
                        checked={selectedRelationshipTypes.includes(type)}
                        onCheckedChange={(checked) => handleRelationshipTypeChange(type, checked as boolean)}
                      />
                      <Label
                        htmlFor={`rel-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {queryType === GraphQueryType.NEIGHBORS && (
            <>
              <div className="space-y-2">
                <Label htmlFor="node-id">Node ID</Label>
                <Input
                  id="node-id"
                  placeholder="Enter the node ID to get neighbors for..."
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                />
                {errors.nodeId && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nodeId}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Relationship Types (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                  {relationshipTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rel-neighbor-${type}`}
                        checked={selectedRelationshipTypes.includes(type)}
                        onCheckedChange={(checked) => handleRelationshipTypeChange(type, checked as boolean)}
                      />
                      <Label
                        htmlFor={`rel-neighbor-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleExecute} className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Execute Query
        </Button>
        <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <Trash className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Save Query Dialog */}
      {showSaveDialog && (
        <Card>
          <CardHeader>
            <CardTitle>Save Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query-name">Query Name</Label>
              <Input
                id="query-name"
                placeholder="Enter a name for this query..."
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
              />
              {errors.queryName && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.queryName}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveQuery}>
                <Save className="h-4 w-4 mr-2" />
                Save Query
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Queries */}
      {savedQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {savedQueries.map((savedQuery, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getQueryTypeIcon(savedQuery.queryType)}
                      <span className="text-sm font-medium">
                        {savedQuery.queryType.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {savedQuery.queryType === GraphQueryType.CYPHER && 'Cypher'}
                        {savedQuery.queryType === GraphQueryType.TRAVERSAL && 'Traversal'}
                        {savedQuery.queryType === GraphQueryType.NEIGHBORS && 'Neighbors'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadQuery(savedQuery)}
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GraphQueryBuilder;