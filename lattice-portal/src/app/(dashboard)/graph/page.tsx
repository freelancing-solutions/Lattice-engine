'use client';

import { useEffect, useState } from 'react';
import { Network, Search, ZoomIn, ZoomOut, Maximize, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import { GraphQueryType, GraphLayout } from '@/types';

export default function GraphPage() {
  const {
    nodes,
    edges,
    selectedNodeId,
    filters,
    layout,
    isLoading,
    error,
    stats,
    setGraph,
    setSelectedNodeId,
    setFilters,
    setLayout,
    setLoading,
    setError,
    setStats,
  } = useGraphStore();

  const { addNotification } = useUIStore();
  const [queryType, setQueryType] = useState<GraphQueryType>(GraphQueryType.TRAVERSAL);
  const [activeTab, setActiveTab] = useState('query');

  useEffect(() => {
    loadGraph();
    loadStats();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.queryGraph({
        queryType: GraphQueryType.TRAVERSAL,
        maxDepth: 3,
      });

      if (response.success && response.data) {
        setGraph(response.data.nodes, response.data.edges);
        addNotification({
          type: 'success',
          title: 'Graph Loaded',
          message: `Loaded ${response.data.nodes.length} nodes and ${response.data.edges.length} edges`,
          duration: 3000,
        });
      } else {
        setError(response.error?.message || 'Failed to load graph');
      }
    } catch (error: any) {
      setError(error.error?.message || 'Failed to load graph');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.getGraphStats();

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load graph stats:', error);
    }
  };

  const handleLayoutChange = (newLayout: GraphLayout) => {
    setLayout(newLayout);
    addNotification({
      type: 'info',
      title: 'Layout Changed',
      message: `Graph layout changed to ${newLayout}`,
      duration: 2000,
    });
  };

  const handleFitView = () => {
    // This will be handled by the GraphViewer component
    addNotification({
      type: 'info',
      title: 'Fit View',
      message: 'Graph fitted to view',
      duration: 1500,
    });
  };

  const handleExport = () => {
    // Export graph data as JSON
    const graphData = {
      nodes,
      edges,
      layout,
      filters,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(graphData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graph-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Graph Exported',
      message: 'Graph data exported successfully',
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Visualization</h1>
          <p className="text-muted-foreground">
            Explore and analyze the specification graph
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
          {/* Graph Viewer */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Graph Explorer</CardTitle>
              <CardDescription>
                Interactive graph visualization with nodes and edges
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading graph...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-destructive mb-4">Error loading graph</p>
                    <Button onClick={loadGraph} variant="outline">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  {/* Placeholder for GraphViewer component */}
                  <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <Network className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Graph Viewer</h3>
                      <p className="text-muted-foreground">
                        Interactive graph visualization component will be rendered here
                      </p>
                      <div className="text-sm text-muted-foreground mt-2">
                        Nodes: {nodes.length} • Edges: {edges.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select value={layout} onValueChange={(value: GraphLayout) => handleLayoutChange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GraphLayout.DAGRE}>Dagre</SelectItem>
                      <SelectItem value={GraphLayout.FORCE}>Force</SelectItem>
                      <SelectItem value={GraphLayout.HIERARCHICAL}>Hierarchical</SelectItem>
                      <SelectItem value={GraphLayout.CIRCULAR}>Circular</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={handleFitView}>
                    <Maximize className="h-4 w-4 mr-2" />
                    Fit View
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  {nodes.length} nodes • {edges.length} edges
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Placeholder for SemanticSearchPanel */}
          <Card>
            <CardHeader>
              <CardTitle>Semantic Search</CardTitle>
              <CardDescription>
                Search for similar nodes using semantic analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Semantic Search Panel</h3>
                  <p className="text-muted-foreground">
                    Semantic search component will be rendered here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {/* Placeholder for GraphStats */}
          <Card>
            <CardHeader>
              <CardTitle>Graph Statistics</CardTitle>
              <CardDescription>
                Overview of graph database and semantic index status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <Network className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Statistics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Graph statistics component will be rendered here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}