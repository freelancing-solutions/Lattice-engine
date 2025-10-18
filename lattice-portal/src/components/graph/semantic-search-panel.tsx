'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { SemanticSearchRequest, NodeType, SpecStatus } from '@/types';
import {
  Search,
  Filter,
  X,
  Loader2,
  Eye,
  TrendingUp
} from 'lucide-react';

interface SemanticSearchPanelProps {
  className?: string;
}

export function SemanticSearchPanel({ className = '' }: SemanticSearchPanelProps) {
  // Search form state
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState([10]);
  const [similarityThreshold, setSimilarityThreshold] = useState([0.7]);
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<NodeType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SpecStatus[]>([]);

  // Store state
  const {
    searchResults,
    isSearching,
    searchError,
    setSearchResults,
    setSearching,
    setSearchError
  } = useGraphStore();

  const { addNotification } = useUIStore();

  // Node type options
  const nodeTypeOptions = Object.values(NodeType);

  // Status options
  const statusOptions = Object.values(SpecStatus);

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) {
      addNotification({
        type: 'error',
        title: 'Search Error',
        message: 'Please enter a search query',
        duration: 3000
      });
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const searchRequest: SemanticSearchRequest = {
        query: query.trim(),
        limit: limit[0],
        similarityThreshold: similarityThreshold[0],
        filters: {
          nodeTypes: selectedNodeTypes.length > 0 ? selectedNodeTypes : undefined,
          status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        }
      };

      const response = await apiClient.semanticSearch(searchRequest);

      if (response.success && response.data) {
        setSearchResults(response.data.nodes);
        addNotification({
          type: 'success',
          title: 'Search Complete',
          message: `Found ${response.data.nodes.length} results`,
          duration: 3000
        });
      } else {
        setSearchError(response.error?.message || 'Search failed');
        addNotification({
          type: 'error',
          title: 'Search Failed',
          message: response.error?.message || 'Failed to perform search',
          duration: 5000
        });
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to perform search';
      setSearchError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Search Error',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setSearching(false);
    }
  };

  // Handle clear form
  const handleClear = () => {
    setQuery('');
    setLimit([10]);
    setSimilarityThreshold([0.7]);
    setSelectedNodeTypes([]);
    setSelectedStatuses([]);
    setSearchResults([]);
    setSearchError(null);
  };

  // Handle node type selection
  const handleNodeTypeChange = (nodeType: NodeType, checked: boolean) => {
    if (checked) {
      setSelectedNodeTypes(prev => [...prev, nodeType]);
    } else {
      setSelectedNodeTypes(prev => prev.filter(type => type !== nodeType));
    }
  };

  // Handle status selection
  const handleStatusChange = (status: SpecStatus, checked: boolean) => {
    if (checked) {
      setSelectedStatuses(prev => [...prev, status]);
    } else {
      setSelectedStatuses(prev => prev.filter(s => s !== status));
    }
  };

  // Handle view in graph
  const handleViewInGraph = (nodeId: string) => {
    // This would integrate with the graph viewer to highlight/show the node
    addNotification({
      type: 'info',
      title: 'Node Selected',
      message: 'Node highlighted in graph view',
      duration: 2000
    });
  };

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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Semantic Search
          </CardTitle>
          <CardDescription>
            Search for similar nodes using semantic analysis and vector similarity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Query Input */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <Input
              id="search-query"
              placeholder="Enter your search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Similarity Threshold */}
          <div className="space-y-2">
            <Label>Similarity Threshold: {similarityThreshold[0].toFixed(2)}</Label>
            <Slider
              value={similarityThreshold}
              onValueChange={setSimilarityThreshold}
              min={0.5}
              max={1.0}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Less strict</span>
              <span>More strict</span>
            </div>
          </div>

          {/* Result Limit */}
          <div className="space-y-2">
            <Label htmlFor="result-limit">Result Limit: {limit[0]}</Label>
            <Slider
              id="result-limit"
              value={limit}
              onValueChange={setLimit}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filters</Label>
            </div>

            {/* Node Types */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Node Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {nodeTypeOptions.map((nodeType) => (
                  <div key={nodeType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`node-type-${nodeType}`}
                      checked={selectedNodeTypes.includes(nodeType)}
                      onCheckedChange={(checked) => handleNodeTypeChange(nodeType, checked as boolean)}
                    />
                    <Label
                      htmlFor={`node-type-${nodeType}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {nodeType.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="flex-1"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Error Display */}
          {searchError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{searchError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Search Results
              <Badge variant="secondary">{searchResults.length}</Badge>
            </CardTitle>
            <CardDescription>
              Nodes matching your search query, ranked by similarity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {searchResults.map((node, index) => (
                  <Card key={node.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{node.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {node.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                          <Badge className={getNodeTypeColor(node.type)}>
                            {node.type}
                          </Badge>
                        </div>
                      </div>

                      {node.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {node.content}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {node.data?.similarityScore && (
                            <Badge variant="outline">
                              {(node.data.similarityScore * 100).toFixed(1)}% match
                            </Badge>
                          )}
                          {node.specSource && (
                            <span className="text-xs text-muted-foreground">
                              Source: {node.specSource}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInGraph(node.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View in Graph
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SemanticSearchPanel;