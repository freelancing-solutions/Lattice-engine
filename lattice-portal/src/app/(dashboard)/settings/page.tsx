'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Globe, Key, Play, Square, RefreshCw, FolderOpen, Activity, CheckCircle, XCircle, Clock, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useSpecSyncStore } from '@/stores/spec-sync-store';
import { apiClient } from '@/lib/api';
import { SpecSyncStatus } from '@/types';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme, notifications, clearNotifications, addNotification } = useUIStore();

  const {
    status,
    activityLogs,
    isLoading,
    error,
    lastChecked,
    setStatus,
    addActivityLog,
    clearActivityLogs,
    setLoading,
    setError,
    clearError,
    setLastChecked
  } = useSpecSyncStore();

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    mutationUpdates: true,
    projectChanges: true,
    teamActivity: false,
    systemAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: true,
    apiAccess: false,
  });

  const handleProfileUpdate = () => {
    // TODO: Implement profile update API call
    console.log('Updating profile:', profileData);
  };

  const handleNotificationSettingsUpdate = () => {
    // TODO: Implement notification settings update API call
    console.log('Updating notification settings:', notificationSettings);
  };

  const handleSecuritySettingsUpdate = () => {
    // TODO: Implement security settings update API call
    console.log('Updating security settings:', securitySettings);
  };

  // Spec Sync Functions
  const loadStatus = async () => {
    setLoading(true);
    clearError();

    try {
      const response = await apiClient.getSpecSyncStatus();

      if (response.success && response.data) {
        setStatus(response.data);
        setLastChecked(new Date().toISOString());
      } else {
        setError(response.error?.message || 'Failed to load spec sync status');
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to load spec sync status';
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

  const handleStart = async () => {
    try {
      const response = await apiClient.startSpecSync();

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Spec Sync Started',
          message: response.data.dir
            ? `Spec sync started for directory: ${response.data.dir}`
            : 'Spec sync daemon has been started',
          duration: 3000
        });

        addActivityLog({
          id: Date.now().toString(),
          action: 'start',
          timestamp: new Date().toISOString(),
          success: true,
          error: null
        });

        // Reload status
        await loadStatus();
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to start spec sync';
      addNotification({
        type: 'error',
        title: 'Start Failed',
        message: errorMessage,
        duration: 5000
      });

      addActivityLog({
        id: Date.now().toString(),
        action: 'start',
        timestamp: new Date().toISOString(),
        success: false,
        error: errorMessage
      });
    }
  };

  const handleStop = async () => {
    try {
      const response = await apiClient.stopSpecSync();

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Spec Sync Stopped',
          message: 'Spec sync daemon has been stopped',
          duration: 3000
        });

        addActivityLog({
          id: Date.now().toString(),
          action: 'stop',
          timestamp: new Date().toISOString(),
          success: true,
          error: null
        });

        // Reload status
        await loadStatus();
      }
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to stop spec sync';
      addNotification({
        type: 'error',
        title: 'Stop Failed',
        message: errorMessage,
        duration: 5000
      });

      addActivityLog({
        id: Date.now().toString(),
        action: 'stop',
        timestamp: new Date().toISOString(),
        success: false,
        error: errorMessage
      });
    }
  };

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh && status?.running) {
      const interval = setInterval(async () => {
        try {
          const response = await apiClient.getSpecSyncStatus();
          if (response.success && response.data) {
            setStatus(response.data);
            setLastChecked(new Date().toISOString());
          }
        } catch (error) {
          // Silently fail auto-refresh to avoid annoying notifications
          console.error('Auto-refresh failed:', error);
        }
      }, 5000); // Poll every 5 seconds

      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, status?.running, setStatus, setLastChecked]);

  // Load initial status
  useEffect(() => {
    loadStatus();
  }, []);

  // Helper function for relative time
  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';

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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="spec-sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Spec Sync
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate}>
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and membership information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground capitalize">{user?.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mutation Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about mutation status changes
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.mutationUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, mutationUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Project Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about project updates
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.projectChanges}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, projectChanges: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Team Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about team member activities
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.teamActivity}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, teamActivity: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important system notifications
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                  }
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={clearNotifications}>
                  Clear All Notifications
                </Button>
                <Button onClick={handleNotificationSettingsUpdate}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Switch
                  checked={securitySettings.sessionTimeout}
                  onCheckedChange={(checked) =>
                    setSecuritySettings(prev => ({ ...prev, sessionTimeout: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow API access for your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.apiAccess}
                  onCheckedChange={(checked) =>
                    setSecuritySettings(prev => ({ ...prev, apiAccess: checked }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSecuritySettingsUpdate}>
                  Update Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Key className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                <p className="text-muted-foreground mb-4">
                  Create API keys to access Lattice Engine from external applications
                </p>
                <Button>Create API Key</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spec-sync" className="space-y-6">
          {/* Spec Sync Status Card */}
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
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Checked:</span>
                    <span className="text-sm text-muted-foreground">{getRelativeTime(lastChecked)}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {status.running ? (
                      <Button onClick={handleStop} variant="destructive" size="sm">
                        <Square className="h-4 w-4 mr-2" />
                        Stop Daemon
                      </Button>
                    ) : (
                      <Button onClick={handleStart} size="sm" disabled={!status.enabled}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Daemon
                      </Button>
                    )}
                    <Button onClick={loadStatus} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>
                    <div className="flex items-center gap-2 ml-auto">
                      <Switch
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                        disabled={!status?.running}
                      />
                      <Label className="text-sm">Auto-refresh (5s)</Label>
                    </div>
                  </div>

                  {!status.enabled && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Spec sync is currently disabled. Please enable it in the engine configuration to use this feature.
                      </AlertDescription>
                    </Alert>
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

          {/* Activity Log */}
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
                <Badge variant="outline">{activityLogs.length} entries</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activity recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {activityLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.action === 'start' && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Badge>
                          )}
                          {log.action === 'stop' && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Square className="h-3 w-3 mr-1" />
                              Stop
                            </Badge>
                          )}
                          {log.action === 'status_check' && (
                            <Badge variant="secondary">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Status Check
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" title={log.error || 'Unknown error'} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {activityLogs.length > 10 && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearActivityLogs()}
                      >
                        Clear All Logs
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration */}
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
                          onClick={() => navigator.clipboard.writeText(status.dir)}
                        >
                          Copy
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

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Configuration changes must be made in the engine configuration file. These settings cannot be modified from the UI.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configuration not loaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color theme
                </p>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your timezone for date and time display
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}