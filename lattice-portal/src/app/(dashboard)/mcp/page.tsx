'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useMCPStore } from '@/stores/mcp-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import {
  MCPServer,
  MCPStatus,
  MCPFilters
} from '@/types';
import {
  Plus,
  Search,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sync,
  MoreHorizontal,
  Loader2,
  Activity,
  Settings,
  Trash2,
  Play
} from 'lucide-react';

// Helper functions
const getStatusIcon = (status: MCPStatus) => {
  switch (status) {
    case MCPStatus.CONNECTED:
      return <CheckCircle className="h-4 w-4" />;
    case MCPStatus.DISCONNECTED:
      return <XCircle className="h-4 w-4" />;
    case MCPStatus.ERROR:
      return <AlertTriangle className="h-4 w-4" />;
    case MCPStatus.SYNCING:
      return <Sync className="h-4 w-4" />;
    default:
      return null;
  }
};

const getStatusColor = (status: MCPStatus) => {
  switch (status) {
    case MCPStatus.CONNECTED:
      return 'bg-green-100 text-green-800';
    case MCPStatus.DISCONNECTED:
      return 'bg-gray-100 text-gray-800';
    case MCPStatus.ERROR:
      return 'bg-red-100 text-red-800';
    case MCPStatus.SYNCING:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function MCPServersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Store state
  const {
    servers,
    filters,
    isLoading,
    error,
    connectedCount,
    disconnectedCount,
    errorCount,
    setServers,
    setFilters,
    setLoading,
    setError
  } = useMCPStore();

  const { addNotification } = useUIStore();

  // Load MCP servers
  const loadMCPServers = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestFilters: any = {};
      if (selectedStatus !== 'all') {
        requestFilters.status = selectedStatus as MCPStatus;
      }
      if (searchTerm) {
        requestFilters.search = searchTerm;
      }

      const response = await apiClient.getMCPServers(requestFilters);

      if (response.success && response.data) {
        setServers(response.data.items);
      } else {
        setError(response.error?.message || 'Failed to load MCP servers');
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to load MCP servers';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle server actions
  const handleViewDetails = (serverId: string) => {
    window.location.href = `/dashboard/mcp/${serverId}`;
  };

  const handleSyncServer = async (serverId: string) => {
    try {
      const response = await apiClient.syncMCPServer({
        serverId,
        syncType: 'full'
      });

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Sync Started',
          message: 'Server sync has been initiated',
          duration: 3000
        });
        loadMCPServers(); // Reload servers
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: error.error?.message || 'Failed to sync server',
        duration: 5000
      });
    }
  };

  const handleDeleteServer = async (serverId: string, serverName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the MCP server "${serverName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await apiClient.deleteMCPServer(serverId);

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Server Deleted',
          message: `MCP server "${serverName}" has been deleted`,
          duration: 3000
        });
        loadMCPServers(); // Reload servers
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error.error?.message || 'Failed to delete server',
        duration: 5000
      });
    }
  };

  // Filter servers based on search term
  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (server.description && server.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Load data on component mount and when filters change
  useEffect(() => {
    loadMCPServers();
  }, [selectedStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Servers</h1>
          <p className="text-muted-foreground">
            Manage Model Context Protocol servers and connections
          </p>
        </div>
        <Link href="/dashboard/mcp/register">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register Server
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-destructive">{error}</div>
              <Button variant="outline" size="sm" onClick={loadMCPServers}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by name, endpoint, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={MCPStatus.CONNECTED}>Connected</SelectItem>
                <SelectItem value={MCPStatus.DISCONNECTED}>Disconnected</SelectItem>
                <SelectItem value={MCPStatus.ERROR}>Error</SelectItem>
                <SelectItem value={MCPStatus.SYNCING}>Syncing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Server List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredServers.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12">
            <Server className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No MCP servers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Register your first MCP server to get started'}
            </p>
            {!searchTerm && selectedStatus === 'all' && (
              <Link href="/dashboard/mcp/register">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Server
                </Button>
              </Link>
            )}
          </div>
        ) : (
          // Server cards
          filteredServers.map((server) => (
            <Card key={server.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(server.status)}
                    <Badge className={getStatusColor(server.status)}>
                      {server.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(server.id)}>
                        <Activity className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSyncServer(server.id)}>
                        <Sync className="h-4 w-4 mr-2" />
                        Sync Server
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = `/dashboard/mcp/${server.id}/edit`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteServer(server.id, server.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Server
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg">{server.name}</CardTitle>
                <CardDescription>
                  {server.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Endpoint:</span>
                    <span className="font-mono text-xs">{server.endpoint}:{server.port}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registered:</span>
                    <span>{new Date(server.createdAt).toLocaleDateString()}</span>
                  </div>
                  {server.lastHealthCheck && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Check:</span>
                      <span>{new Date(server.lastHealthCheck).toLocaleDateString()}</span>
                    </div>
                  )}
                  {server.lastSync && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span>{new Date(server.lastSync).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                {server.status === MCPStatus.SYNCING && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sync Status:</span>
                      <span>Syncing...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(server.id)}
                    className="flex-1"
                  >
                    <Activity className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  {server.status === MCPStatus.CONNECTED && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncServer(server.id)}
                    >
                      <Sync className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Server status counts */}
      {(connectedCount > 0 || disconnectedCount > 0 || errorCount > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
                <div className="text-sm text-muted-foreground">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{disconnectedCount}</div>
                <div className="text-sm text-muted-foreground">Disconnected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Error</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}