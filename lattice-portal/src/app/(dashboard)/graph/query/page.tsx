'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { GraphQuery, GraphQueryType } from '@/types';
import {
  Code,
  GitBranch,
  Network,
  Clock,
  Database,
  Play,
  Save,
  Trash,
  History
} from 'lucide-react';

// Import our new components
import { GraphQueryBuilder } from '@/components/graph/graph-query-builder';
import { GraphViewer } from '@/components/graph/graph-viewer';

interface QueryHistory {
  id: string;
  name: string;
  query: GraphQuery;
  timestamp: string;
  executionTime: number;
  resultCount: number;
}

export default function GraphQueryPage() {
  // Graph store state
  const {
    nodes,
    edges,
    isLoading,
    error,
    setGraph,
    setLoading,
    setError
  } = useGraphStore();

  const { addNotification } = useUIStore();

  // Component state
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [currentResults, setCurrentResults] = useState<{
    query: GraphQuery;
    nodes: any[];
    edges: any[];
    executionTime: number;
  } | null>(null);

  // Execute query handler
  const handleExecuteQuery = async (query: GraphQuery) => {
    setLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      const response = await apiClient.queryGraph(query);
      const executionTime = Date.now() - startTime;

      if (response.success && response.data) {
        setGraph(response.data.nodes, response.data.edges);
        setCurrentResults({
          query,
          nodes: response.data.nodes,
          edges: response.data.edges,
          executionTime
        });

        // Add to history
        const historyItem: QueryHistory = {
          id: Date.now().toString(),
          name: `${query.queryType} Query`,
          query,
          timestamp: new Date().toISOString(),
          executionTime,
          resultCount: response.data.nodes.length + response.data.edges.length
        };
        setQueryHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10

        addNotification({
          type: 'success',
          title: 'Query Executed',
          message: `Found ${response.data.nodes.length} nodes and ${response.data.edges.length} edges in ${executionTime}ms`,
          duration: 3000
        });
      } else {
        setError(response.error?.message || 'Query execution failed');
        addNotification({
          type: 'error',
          title: 'Query Failed',
          message: response.error?.message || 'Failed to execute query',
          duration: 5000
        });
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to execute query';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Query Error',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Rerun query from history
  const handleRerunQuery = (historyItem: QueryHistory) => {
    handleExecuteQuery(historyItem.query);
  };

  // Clear history
  const handleClearHistory = () => {
    setQueryHistory([]);
    addNotification({
      type: 'info',
      title: 'History Cleared',
      message: 'Query history has been cleared',
      duration: 3000
    });
  };

  // Get query type icon
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

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Graph Queries</h1>
        <p className="text-muted-foreground">
          Write custom Cypher queries, perform traversals, and explore graph relationships
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-destructive">{error}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Results Info */}
      {currentResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Query Results</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {currentResults.nodes.length} nodes
                </Badge>
                <Badge variant="outline">
                  {currentResults.edges.length} edges
                </Badge>
                <Badge variant="secondary">
                  {currentResults.executionTime}ms
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              {currentResults.query.queryType.replace('_', ' ')} query executed successfully
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Query Builder and History */}
        <div className="lg:col-span-1 space-y-6">
          {/* Query Builder */}
          <GraphQueryBuilder
            onExecute={handleExecuteQuery}
            savedQueries={queryHistory.map(h => h.query)}
            className="w-full"
          />

          {/* Query History */}
          {queryHistory.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Query History
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {queryHistory.map((item) => (
                      <div key={item.id} className="p-3 border rounded hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getQueryTypeIcon(item.query.queryType)}
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {item.resultCount}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.executionTime}ms
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(item.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRerunQuery(item)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Run
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Results Visualization */}
        <div className="lg:col-span-2">
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Graph Visualization
              </CardTitle>
              <CardDescription>
                {currentResults
                  ? `Results from ${currentResults.query.queryType.replace('_', ' ')} query`
                  : 'Execute a query to see results here'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Executing query...</p>
                  </div>
                </div>
              ) : nodes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Database className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">No Results</h3>
                      <p className="text-muted-foreground">
                        Execute a query to see graph visualization results
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <GraphViewer
                  nodes={nodes}
                  edges={edges}
                  layout={'DAGRE'}
                  selectedNodeId={null}
                  onNodeSelect={() => {}}
                  className="h-full"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Query Statistics */}
      {queryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Query Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{queryHistory.length}</div>
                <div className="text-sm text-muted-foreground">Total Queries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {queryHistory.length > 0
                    ? Math.round(queryHistory.reduce((acc, item) => acc + item.executionTime, 0) / queryHistory.length)
                    : 0}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Execution Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {queryHistory.length > 0
                    ? Math.max(...queryHistory.map(item => item.resultCount))
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Max Results</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {queryHistory.filter(item => item.query.queryType === GraphQueryType.CYPHER).length}
                </div>
                <div className="text-sm text-muted-foreground">Cypher Queries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}