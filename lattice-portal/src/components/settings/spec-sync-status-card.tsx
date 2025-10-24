import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SpecSyncStatus } from '@/types';
import {
  Activity,
  CheckCircle,
  FolderOpen,
  Loader2,
  Play,
  RefreshCw,
  Square,
  XCircle
} from 'lucide-react';

interface SpecSyncStatusCardProps {
  status: SpecSyncStatus | null;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
  lastChecked: string | null;
  getRelativeTime: (timestamp: string | null) => string;
}

export function SpecSyncStatusCard({
  status,
  isLoading,
  onStart,
  onStop,
  onRefresh,
  autoRefresh,
  onAutoRefreshChange,
  lastChecked,
  getRelativeTime
}: SpecSyncStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Spec Sync Daemon Status
        </CardTitle>
        <CardDescription>
          Monitor and control the specification synchronization daemon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {status.running ? (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    Running
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    Stopped
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Enabled:</span>
                {status.enabled ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-600 border-gray-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sync Directory:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{status.dir}</code>
            </div>

            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Checked:</span>
              <span className="text-sm text-muted-foreground">{getRelativeTime(lastChecked)}</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {status.running ? (
                <Button onClick={onStop} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Daemon
                </Button>
              ) : (
                <Button onClick={onStart} size="sm" disabled={!status.enabled}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Daemon
                </Button>
              )}
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => onAutoRefreshChange(e.target.checked)}
                  disabled={!status?.running}
                  className="rounded"
                />
                <label className="text-sm">Auto-refresh (5s)</label>
              </div>
            </div>

            {!status.enabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Spec sync is currently disabled. Please enable it in the engine configuration to use this feature.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Status not loaded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}