'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMCPStore } from '@/stores/mcp-store';
import { useUIStore } from '@/stores/ui-store';
import { apiClient } from '@/lib/api';
import {
  MCPServer,
  MCPStatus,
  MCPStatusResponse,
  MCPHealthCheck,
  MCPSyncResponse
} from '@/types';
import {
  ArrowLeft,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sync,
  Activity,
  Settings,
  Play,
  Clock,
  Globe,
  Shield,
  Loader2,
  RefreshCw,
  Edit
} from 'lucide-react';

// Helper functions
const getStatusIcon = (status: MCPStatus) => {
  switch (status) {
    case MCPStatus.CONNECTED:
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case MCPStatus.DISCONNECTED:
      return <XCircle className="h-5 w-5 text-gray-600" />;
    case MCPStatus.ERROR:
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case MCPStatus.SYNCING:
      return <Sync className="h-5 w-5 text-blue-600" />;
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

export default function MCPServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.serverId as string;

  const [server, setServer] = useState<MCPServer | null>(null);
  const [serverStatus, setServerStatus] = useState<MCPStatusResponse | null>(null);
  const [healthCheck, setHealthCheck] = useState<MCPHealthCheck | null>(null);
  const [syncHistory, setSyncHistory] = useState<MCPSyncResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { addNotification } = useUIStore();

  // Load server details
  const loadServerDetails = async () => {
    try {
      const [serverResponse, statusResponse, healthResponse] = await Promise.all([
        apiClient.getMCPServer(serverId),
        apiClient.getMCPServerStatus(serverId),
        apiClient.getMCPHealthCheck(serverId)
      ]);

      if (serverResponse.success && serverResponse.data) {
        setServer(serverResponse.data);
      }

      if (statusResponse.success && statusResponse.data) {
        setServerStatus(statusResponse.data);
      }

      if (healthResponse.success && healthResponse.data) {
        setHealthCheck(healthResponse.data);
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to load server details';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh server status
  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiClient.getMCPServerStatus(serverId);
      if (response.success && response.data) {
        setServerStatus(response.data);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: error.error?.message || 'Failed to refresh server status',
        duration: 5000
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle sync action
  const handleSync = async (syncType: 'full' | 'incremental' = 'full') => {
    try {
      const response = await apiClient.syncMCPServer({
        serverId,
        syncType,
        options: {}
      });

      if (response.success && response.data) {
        addNotification({
          type: 'success',
          title: 'Sync Started',
          message: `${syncType.charAt(0).toUpperCase() + syncType.slice(1)} sync has been initiated`,
          duration: 3000
        });

        // Refresh server details
        await loadServerDetails();
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

  // Load data on component mount
  useEffect(() => {
    if (serverId) {
      loadServerDetails();
    }
  }, [serverId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/mcp">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Servers
            </Button>
          </Link>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Server not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/mcp">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Servers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {server.name}
              {getStatusIcon(server.status)}
            </h1>
            <p className="text-muted-foreground">
              {server.description || 'Model Context Protocol Server'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Link href={`/dashboard/mcp/${serverId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {server.status === MCPStatus.CONNECTED && (
            <Button onClick={() => handleSync('full')}>
              <Play className="h-4 w-4 mr-2" />
              Sync Server
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="health">Health Check</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Server Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(server.status)}>
                          {server.status}
                        </Badge>
                        {serverStatus?.responseTime && (
                          <span className="text-sm text-muted-foreground">
                            ({serverStatus.responseTime}ms)
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Endpoint</label>
                      <div className="font-mono text-sm mt-1">
                        {server.endpoint}:{server.port}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Server ID</label>
                      <div className="font-mono text-sm mt-1">
                        {server.id}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registered</label>
                      <div className="text-sm mt-1">
                        {new Date(server.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {server.lastHealthCheck && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Health Check</label>
                        <div className="text-sm mt-1">
                          {new Date(server.lastHealthCheck).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {server.lastSync && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Sync</label>
                        <div className="text-sm mt-1">
                          {new Date(server.lastSync).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {serverStatus?.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Error:</strong> {serverStatus.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuration Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {server.config.timeout && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Timeout</label>
                        <div className="text-sm mt-1">{server.config.timeout}ms</div>
                      </div>
                    )}
                    {server.config.retryInterval && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Retry Interval</label>
                        <div className="text-sm mt-1">{server.config.retryInterval}ms</div>
                      </div>
                    )}
                    {server.config.maxRetries && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Max Retries</label>
                        <div className="text-sm mt-1">{server.config.maxRetries}</div>
                      </div>
                    )}
                  </div>

                  {server.config.auth && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Authentication</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <Badge variant="outline">
                            {server.config.auth.type.toUpperCase()}
                          </Badge>
                        </div>
                        {server.config.auth.type === 'bearer' && server.config.auth.token && (
                          <div className="text-sm text-muted-foreground">
                            Token configured: {server.config.auth.token.substring(0, 8)}...
                          </div>
                        )}
                        {server.config.auth.type === 'basic' && server.config.auth.username && (
                          <div className="text-sm text-muted-foreground">
                            Username: {server.config.auth.username}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {server.config.headers && Object.keys(server.config.headers).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Custom Headers</label>
                      <div className="mt-2 space-y-1">
                        {Object.entries(server.config.headers).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Health Check Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthCheck ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Health Status</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={healthCheck.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {healthCheck.status}
                            </Badge>
                            {healthCheck.responseTime && (
                              <span className="text-sm text-muted-foreground">
                                ({healthCheck.responseTime}ms)
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Last Check</label>
                          <div className="text-sm mt-1">
                            {new Date(healthCheck.lastCheck).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {healthCheck.error && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Health Check Error:</strong> {healthCheck.error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {healthCheck.details && Object.keys(healthCheck.details).length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Additional Details</label>
                          <div className="mt-2 space-y-1">
                            {Object.entries(healthCheck.details).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No health check data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleSync('full')}
                disabled={server.status !== MCPStatus.CONNECTED}
              >
                <Sync className="h-4 w-4 mr-2" />
                Full Sync
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSync('incremental')}
                disabled={server.status !== MCPStatus.CONNECTED}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Incremental Sync
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={refreshStatus}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4 mr-2" />
                )}
                Check Status
              </Button>
            </CardContent>
          </Card>

          {/* Connection Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Endpoint</div>
                <div className="font-mono">{server.endpoint}:{server.port}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Protocol</div>
                <div>HTTP/HTTPS</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Updated</div>
                <div>{new Date(server.updatedAt).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}