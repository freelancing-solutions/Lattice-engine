'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  RefreshCwIcon, 
  DownloadIcon,
  FilterIcon,
  GitBranchIcon,
  FolderIcon,
  UsersIcon
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'project' | 'mutation' | 'user' | 'organization';
  x: number;
  y: number;
  radius: number;
  color: string;
  data: any;
  connections: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'dependency' | 'mutation' | 'collaboration' | 'approval';
  weight: number;
  color: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphVisualizationProps {
  data?: GraphData;
  width?: number;
  height?: number;
  interactive?: boolean;
  showLabels?: boolean;
  filterType?: string;
}

const NODE_COLORS = {
  project: '#3b82f6',
  mutation: '#10b981',
  user: '#f59e0b',
  organization: '#8b5cf6'
};

const EDGE_COLORS = {
  dependency: '#6b7280',
  mutation: '#10b981',
  collaboration: '#f59e0b',
  approval: '#ef4444'
};

export function GraphVisualization({
  data,
  width = 800,
  height = 600,
  interactive = true,
  showLabels = true,
  filterType = 'all'
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generate sample data if none provided
  useEffect(() => {
    if (data) {
      setGraphData(data);
    } else {
      generateSampleData();
    }
  }, [data]);

  const generateSampleData = useCallback(() => {
    const nodes: GraphNode[] = [
      // Projects
      {
        id: 'proj-1',
        label: 'Frontend Redesign',
        type: 'project',
        x: 200,
        y: 150,
        radius: 25,
        color: NODE_COLORS.project,
        data: { status: 'active', mutations: 12 },
        connections: 3
      },
      {
        id: 'proj-2',
        label: 'API Gateway',
        type: 'project',
        x: 400,
        y: 200,
        radius: 30,
        color: NODE_COLORS.project,
        data: { status: 'active', mutations: 18 },
        connections: 5
      },
      {
        id: 'proj-3',
        label: 'Database Migration',
        type: 'project',
        x: 300,
        y: 350,
        radius: 20,
        color: NODE_COLORS.project,
        data: { status: 'completed', mutations: 8 },
        connections: 2
      },
      // Mutations
      {
        id: 'mut-1',
        label: 'Add Dark Mode',
        type: 'mutation',
        x: 150,
        y: 100,
        radius: 15,
        color: NODE_COLORS.mutation,
        data: { status: 'approved', risk: 'low' },
        connections: 2
      },
      {
        id: 'mut-2',
        label: 'Update Auth Flow',
        type: 'mutation',
        x: 450,
        y: 150,
        radius: 18,
        color: NODE_COLORS.mutation,
        data: { status: 'pending', risk: 'medium' },
        connections: 3
      },
      {
        id: 'mut-3',
        label: 'Optimize Queries',
        type: 'mutation',
        x: 350,
        y: 300,
        radius: 16,
        color: NODE_COLORS.mutation,
        data: { status: 'approved', risk: 'high' },
        connections: 2
      },
      // Users
      {
        id: 'user-1',
        label: 'Alice Johnson',
        type: 'user',
        x: 100,
        y: 250,
        radius: 12,
        color: NODE_COLORS.user,
        data: { role: 'developer', contributions: 24 },
        connections: 4
      },
      {
        id: 'user-2',
        label: 'Bob Smith',
        type: 'user',
        x: 500,
        y: 300,
        radius: 14,
        color: NODE_COLORS.user,
        data: { role: 'architect', contributions: 31 },
        connections: 5
      },
      // Organization
      {
        id: 'org-1',
        label: 'Engineering Team',
        type: 'organization',
        x: 300,
        y: 100,
        radius: 35,
        color: NODE_COLORS.organization,
        data: { members: 12, projects: 8 },
        connections: 6
      }
    ];

    const edges: GraphEdge[] = [
      { source: 'proj-1', target: 'mut-1', type: 'mutation', weight: 1, color: EDGE_COLORS.mutation },
      { source: 'proj-2', target: 'mut-2', type: 'mutation', weight: 1, color: EDGE_COLORS.mutation },
      { source: 'proj-3', target: 'mut-3', type: 'mutation', weight: 1, color: EDGE_COLORS.mutation },
      { source: 'proj-1', target: 'proj-2', type: 'dependency', weight: 2, color: EDGE_COLORS.dependency },
      { source: 'proj-2', target: 'proj-3', type: 'dependency', weight: 1, color: EDGE_COLORS.dependency },
      { source: 'user-1', target: 'proj-1', type: 'collaboration', weight: 3, color: EDGE_COLORS.collaboration },
      { source: 'user-2', target: 'proj-2', type: 'collaboration', weight: 4, color: EDGE_COLORS.collaboration },
      { source: 'user-1', target: 'mut-1', type: 'approval', weight: 1, color: EDGE_COLORS.approval },
      { source: 'user-2', target: 'mut-2', type: 'approval', weight: 1, color: EDGE_COLORS.approval },
      { source: 'org-1', target: 'proj-1', type: 'collaboration', weight: 1, color: EDGE_COLORS.collaboration },
      { source: 'org-1', target: 'proj-2', type: 'collaboration', weight: 1, color: EDGE_COLORS.collaboration }
    ];

    setGraphData({ nodes, edges });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  const getFilteredData = () => {
    if (filterType === 'all') return graphData;
    
    const filteredNodes = graphData.nodes.filter(node => 
      filterType === 'all' || node.type === filterType
    );
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    
    return { nodes: filteredNodes, edges: filteredEdges };
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={() => {}}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="mutation">Mutations</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="organization">Organizations</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Graph Canvas */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="relative overflow-hidden border rounded-lg">
              <svg
                ref={svgRef}
                width={width}
                height={height}
                className="cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Edges */}
                  {filteredData.edges.map((edge, index) => {
                    const sourceNode = filteredData.nodes.find(n => n.id === edge.source);
                    const targetNode = filteredData.nodes.find(n => n.id === edge.target);
                    
                    if (!sourceNode || !targetNode) return null;
                    
                    return (
                      <line
                        key={`edge-${index}`}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={edge.color}
                        strokeWidth={edge.weight}
                        strokeOpacity={0.6}
                      />
                    );
                  })}
                  
                  {/* Nodes */}
                  {filteredData.nodes.map((node) => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius}
                        fill={node.color}
                        stroke={selectedNode?.id === node.id ? '#000' : 'transparent'}
                        strokeWidth={2}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleNodeClick(node)}
                      />
                      {showLabels && (
                        <text
                          x={node.x}
                          y={node.y + node.radius + 15}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#374151"
                          className="pointer-events-none"
                        >
                          {node.label}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Node Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedNode ? 'Node Details' : 'Graph Legend'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {selectedNode.type === 'project' && <FolderIcon className="h-4 w-4" />}
                  {selectedNode.type === 'mutation' && <GitBranchIcon className="h-4 w-4" />}
                  {selectedNode.type === 'user' && <UsersIcon className="h-4 w-4" />}
                  {selectedNode.type === 'organization' && <UsersIcon className="h-4 w-4" />}
                  <span className="font-medium">{selectedNode.label}</span>
                </div>
                
                <Badge variant="secondary">
                  {selectedNode.type}
                </Badge>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections:</span>
                    <span>{selectedNode.connections}</span>
                  </div>
                  
                  {selectedNode.data && Object.entries(selectedNode.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {Object.entries(NODE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Click on nodes to view details. Drag to pan, use controls to zoom.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GraphVisualization;