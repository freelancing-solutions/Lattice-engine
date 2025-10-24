import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SpecSyncStatus } from '@/types';
import {
  CheckCircle,
  Copy,
  FolderOpen,
  Info,
  Settings,
  XCircle
} from 'lucide-react';

interface SpecSyncConfigCardProps {
  status: SpecSyncStatus | null;
}

export function SpecSyncConfigCard({ status }: SpecSyncConfigCardProps) {
  const handleCopyDirectory = () => {
    if (status?.dir) {
      navigator.clipboard.writeText(status.dir);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration
        </CardTitle>
        <CardDescription>
          Spec sync daemon configuration settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sync Directory</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                    {status.dir}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyDirectory}
                    title="Copy directory path"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Daemon Enabled</Label>
                <div className="flex items-center gap-2 p-2">
                  {status.enabled ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Yes - daemon can be started</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">No - daemon disabled in config</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Status</Label>
                <div className="flex items-center gap-2 p-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {status.running ? 'Running and monitoring files' : 'Stopped'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">File Watching</Label>
                <div className="flex items-center gap-2 p-2">
                  {status.running ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Configuration Notes</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      <strong>Directory Path:</strong> The sync directory is where the daemon watches for specification file changes
                    </li>
                    <li>
                      <strong>Engine Config:</strong> Configuration changes must be made in the engine configuration file
                    </li>
                    <li>
                      <strong>Permissions:</strong> Ensure the daemon has read/write permissions to the sync directory
                    </li>
                    <li>
                      <strong>Auto-restart:</strong> The daemon will need to be manually restarted after configuration changes
                    </li>
                  </ul>
                  <p className="text-sm text-blue-700 mt-2">
                    These settings cannot be modified from the UI. Edit the engine configuration file to make changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configuration not loaded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}