'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Connection,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import { GraphNode, GraphEdge, GraphLayout, NodeType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize, Download } from 'lucide-react';

// Define node types for ReactFlow
const nodeTypes = {
  customNode: CustomNode,
};

interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: GraphLayout;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  className?: string;
}

// Custom node component
function CustomNode({ data, selected }: { data: any; selected: boolean }) {
  const { node } = data;

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case NodeType.SPEC:
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case NodeType.MODULE:
        return 'bg-green-100 border-green-300 text-green-800';
      case NodeType.CONTROLLER:
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case NodeType.MODEL:
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case NodeType.ROUTE_API:
        return 'bg-red-100 border-red-300 text-red-800';
      case NodeType.TASK:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case NodeType.TEST:
        return 'bg-pink-100 border-pink-300 text-pink-800';
      case NodeType.AGENT:
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case NodeType.GOAL:
        return 'bg-teal-100 border-teal-300 text-teal-800';
      case NodeType.CONSTRAINT:
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case NodeType.DOCUMENTATION:
        return 'bg-cyan-100 border-cyan-300 text-cyan-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'DRAFT':
        return 'bg-yellow-500';
      case 'DEPRECATED':
        return 'bg-red-500';
      case 'PENDING':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`min-w-[200px] max-w-[300px] ${selected ? 'ring-2 ring-primary' : ''} ${getNodeColor(node.type)}`}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm truncate">{node.name}</h4>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
          </div>

          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {node.type}
            </Badge>
            {node.description && (
              <Badge variant="outline" className="text-xs">
                {node.description.length > 20 ? `${node.description.substring(0, 20)}...` : node.description}
              </Badge>
            )}
          </div>

          {node.content && (
            <div className="text-xs text-muted-foreground truncate">
              {node.content.length > 50 ? `${node.content.substring(0, 50)}...` : node.content}
            </div>
          )}

          {node.specSource && (
            <div className="text-xs text-muted-foreground">
              Source: {node.specSource}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Layout calculation functions
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  layout: GraphLayout
): { nodes: Node[]; edges: Edge[] } => {
  switch (layout) {
    case GraphLayout.DAGRE:
      return layoutWithDagre(nodes, edges);
    case GraphLayout.FORCE:
      return layoutWithForce(nodes, edges);
    case GraphLayout.HIERARCHICAL:
      return layoutWithHierarchical(nodes, edges);
    case GraphLayout.CIRCULAR:
      return layoutWithCircular(nodes, edges);
    default:
      return { nodes, edges };
  }
};

// Dagre layout
const layoutWithDagre = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top' as const,
      sourcePosition: 'bottom' as const,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 50,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Force-directed layout (simplified)
const layoutWithForce = (nodes: Node[], edges: Edge[]) => {
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  const layoutedNodes = nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 100,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 100,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Hierarchical layout
const layoutWithHierarchical = (nodes: Node[], edges: Edge[]) => {
  const levels: { [key: string]: number } = {};
  const visited = new Set<string>();

  // Simple BFS to determine levels
  const calculateLevels = (nodeId: string, level: number) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    levels[nodeId] = level;

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    outgoingEdges.forEach(edge => {
      calculateLevels(edge.target, level + 1);
    });
  };

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(node =>
    !edges.some(edge => edge.target === node.id)
  );

  if (rootNodes.length === 0 && nodes.length > 0) {
    calculateLevels(nodes[0].id, 0);
  } else {
    rootNodes.forEach(node => calculateLevels(node.id, 0));
  }

  // Assign positions based on levels
  const nodesByLevel: { [key: number]: Node[] } = {};
  nodes.forEach(node => {
    const level = levels[node.id] || 0;
    if (!nodesByLevel[level]) nodesByLevel[level] = [];
    nodesByLevel[level].push(node);
  });

  const layoutedNodes = nodes.map((node) => {
    const level = levels[node.id] || 0;
    const levelNodes = nodesByLevel[level];
    const indexInLevel = levelNodes.indexOf(node);
    const levelWidth = 800;
    const nodeWidth = levelWidth / levelNodes.length;

    return {
      ...node,
      position: {
        x: indexInLevel * nodeWidth + nodeWidth / 2 - 125,
        y: level * 150 + 50,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Circular layout
const layoutWithCircular = (nodes: Node[], edges: Edge[]) => {
  const centerX = 400;
  const centerY = 300;
  const radius = Math.min(250, 300 - nodes.length * 2);

  const layoutedNodes = nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Main GraphViewer component
export function GraphViewer({
  nodes,
  edges,
  layout,
  selectedNodeId,
  onNodeSelect,
  onNodeDoubleClick,
  onEdgeClick,
  className = ''
}: GraphViewerProps) {
  // Convert graph nodes to ReactFlow nodes
  const initialNodes: Node[] = useMemo(() =>
    nodes.map((node) => ({
      id: node.id,
      type: 'customNode',
      position: node.position,
      data: { node },
      selected: node.id === selectedNodeId,
    }))
  , [nodes, selectedNodeId]);

  // Convert graph edges to ReactFlow edges
  const initialEdges: Edge[] = useMemo(() =>
    edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: edge.animated || false,
      style: edge.style || {},
      label: edge.label,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.style?.stroke || '#b1b1b7',
      },
    }))
  , [edges]);

  // Apply layout
  const layoutedElements = useMemo(() =>
    getLayoutedElements(initialNodes, initialEdges, layout),
  [initialNodes, initialEdges, layout]);

  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(layoutedElements.nodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(layoutedElements.edges);

  // Update nodes when layout changes
  useEffect(() => {
    setReactFlowNodes(layoutedElements.nodes);
    setReactFlowEdges(layoutedElements.edges);
  }, [layoutedElements, setReactFlowNodes, setReactFlowEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeSelect(node.id);
  }, [onNodeSelect]);

  // Handle node double click
  const onNodeDoubleClickHandler = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeDoubleClick) {
      const graphNode = nodes.find(n => n.id === node.id);
      if (graphNode) {
        onNodeDoubleClick(graphNode);
      }
    }
  }, [onNodeDoubleClick, nodes]);

  // Handle edge click
  const onEdgeClickHandler = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (onEdgeClick) {
      const graphEdge = edges.find(e => e.id === edge.id);
      if (graphEdge) {
        onEdgeClick(graphEdge);
      }
    }
  }, [onEdgeClick, edges]);

  // Handle new connections
  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      const newEdge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setReactFlowEdges((eds) => addEdge(newEdge, eds));
    }
  }, [setReactFlowEdges]);

  // Export graph as image
  const handleExport = useCallback(() => {
    // This would need a library like html2canvas
    console.log('Export graph functionality to be implemented');
  }, []);

  // Fit view to all nodes
  const handleFitView = useCallback(() => {
    // This would be handled by ReactFlow's fitView utility
    console.log('Fit view functionality to be implemented');
  }, []);

  return (
    <div className={`h-full ${className}`}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClickHandler}
          onEdgeClick={onEdgeClickHandler}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const nodeData = node.data as { node: GraphNode };
              switch (nodeData.node.type) {
                case NodeType.SPEC: return '#3b82f6';
                case NodeType.MODULE: return '#10b981';
                case NodeType.CONTROLLER: return '#8b5cf6';
                default: return '#6b7280';
              }
            }}
          />

          <Panel position="top-right">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleFitView}>
                <Maximize className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default GraphViewer;