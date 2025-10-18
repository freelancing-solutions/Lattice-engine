import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SpecSyncActivityLog } from '@/types';
import {
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  Square,
  XCircle
} from 'lucide-react';

interface SpecSyncActivityLogProps {
  logs: SpecSyncActivityLog[];
  maxVisible?: number;
  onClearLogs: () => void;
}

export function SpecSyncActivityLog({
  logs,
  maxVisible = 10,
  onClearLogs
}: SpecSyncActivityLogProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleLogs = expanded ? logs : logs.slice(0, maxVisible);

  const getActionIcon = (action: SpecSyncActivityLog['action']) => {
    switch (action) {
      case 'start':
        return <Play className="h-3 w-3" />;
      case 'stop':
        return <Square className="h-3 w-3" />;
      case 'status_check':
        return <RefreshCw className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActionBadgeClass = (action: SpecSyncActivityLog['action']) => {
    switch (action) {
      case 'start':
        return 'bg-blue-100 text-blue-800';
      case 'stop':
        return 'bg-orange-100 text-orange-800';
      case 'status_check':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: SpecSyncActivityLog['action']) => {
    switch (action) {
      case 'start':
        return 'Start';
      case 'stop':
        return 'Stop';
      case 'status_check':
        return 'Status Check';
      default:
        return action;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Recent daemon activity and actions
            </CardDescription>
          </div>
          <Badge variant="outline">{logs.length} entries</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {visibleLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getActionBadgeClass(log.action)}>
                      {getActionIcon(log.action)}
                      <span className="ml-1">{getActionLabel(log.action)}</span>
                    </Badge>
                    <span
                      className="text-sm text-muted-foreground cursor-help"
                      title={new Date(log.timestamp).toLocaleString()}
                    >
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle
                        className="h-4 w-4 text-green-600"
                        title="Success"
                      />
                    ) : (
                      <XCircle
                        className="h-4 w-4 text-red-600"
                        title={log.error || 'Unknown error'}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {logs.length > maxVisible && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Show Less' : `Show All (${logs.length})`}
                </Button>
              </div>
            )}
            {logs.length > 0 && (
              <div className="flex justify-center pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearLogs}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All Logs
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function for relative time (can be moved to a utils file if needed)
function getRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}