'use client';

import { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Key, Settings, Cpu, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme, notifications, clearNotifications } = useUIStore();
  
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

  const [orchestratorSettings, setOrchestratorSettings] = useState({
    // Confidence thresholds
    autoApprovalThreshold: 0.85,
    semanticSimilarityThreshold: 0.75,
    lowConfidenceThreshold: 0.7,
    
    // Timeout settings
    agentTimeoutSeconds: 300,
    approvalTimeoutSeconds: 300,
    mutationTimeoutSeconds: 300,
    
    // Agent configuration
    maxConcurrentAgents: 10,
    retryAttempts: 3,
    
    // Priority settings
    enableAutoPriority: true,
    criticalChangeThreshold: true,
    
    // Breaking change detection
    enableBreakingChangeDetection: true,
    requireApprovalForBreakingChanges: true,
    
    // Performance settings
    enableAgentCaching: true,
    maxGraphTraversalDepth: 10,
    embeddingCacheTtl: 3600,
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

  const handleOrchestratorSettingsUpdate = () => {
    // TODO: Implement orchestrator settings update API call
    console.log('Updating orchestrator settings:', orchestratorSettings);
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
          <TabsTrigger value="orchestrator" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Orchestrator
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

        <TabsContent value="orchestrator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Agent Configuration
              </CardTitle>
              <CardDescription>
                Configure AI agent behavior and performance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Auto-Approval Confidence Threshold</Label>
                  <div className="px-3">
                    <Slider
                      value={[orchestratorSettings.autoApprovalThreshold]}
                      onValueChange={(value) =>
                        setOrchestratorSettings(prev => ({ ...prev, autoApprovalThreshold: value[0] }))
                      }
                      max={1}
                      min={0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0% (Never auto-approve)</span>
                    <span className="font-medium">{Math.round(orchestratorSettings.autoApprovalThreshold * 100)}%</span>
                    <span>100% (Always auto-approve)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mutations with confidence above this threshold will be auto-approved
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Low Confidence Threshold</Label>
                  <div className="px-3">
                    <Slider
                      value={[orchestratorSettings.lowConfidenceThreshold]}
                      onValueChange={(value) =>
                        setOrchestratorSettings(prev => ({ ...prev, lowConfidenceThreshold: value[0] }))
                      }
                      max={1}
                      min={0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium">{Math.round(orchestratorSettings.lowConfidenceThreshold * 100)}%</span>
                    <span>100%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mutations below this threshold will be marked as high priority for review
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAgents">Max Concurrent Agents</Label>
                    <Input
                      id="maxAgents"
                      type="number"
                      min="1"
                      max="50"
                      value={orchestratorSettings.maxConcurrentAgents}
                      onChange={(e) =>
                        setOrchestratorSettings(prev => ({ ...prev, maxConcurrentAgents: parseInt(e.target.value) || 10 }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum number of agents that can run simultaneously
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retryAttempts">Retry Attempts</Label>
                    <Input
                      id="retryAttempts"
                      type="number"
                      min="0"
                      max="10"
                      value={orchestratorSettings.retryAttempts}
                      onChange={(e) =>
                        setOrchestratorSettings(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) || 3 }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of retry attempts for failed agent operations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeout Settings
              </CardTitle>
              <CardDescription>
                Configure timeout values for various operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agentTimeout">Agent Timeout (seconds)</Label>
                  <Input
                    id="agentTimeout"
                    type="number"
                    min="30"
                    max="1800"
                    value={orchestratorSettings.agentTimeoutSeconds}
                    onChange={(e) =>
                      setOrchestratorSettings(prev => ({ ...prev, agentTimeoutSeconds: parseInt(e.target.value) || 300 }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum time for agent task execution
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvalTimeout">Approval Timeout (seconds)</Label>
                  <Input
                    id="approvalTimeout"
                    type="number"
                    min="60"
                    max="3600"
                    value={orchestratorSettings.approvalTimeoutSeconds}
                    onChange={(e) =>
                      setOrchestratorSettings(prev => ({ ...prev, approvalTimeoutSeconds: parseInt(e.target.value) || 300 }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum time to wait for user approval
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mutationTimeout">Mutation Timeout (seconds)</Label>
                  <Input
                    id="mutationTimeout"
                    type="number"
                    min="30"
                    max="1800"
                    value={orchestratorSettings.mutationTimeoutSeconds}
                    onChange={(e) =>
                      setOrchestratorSettings(prev => ({ ...prev, mutationTimeoutSeconds: parseInt(e.target.value) || 300 }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum time for mutation execution
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Approval Rules
              </CardTitle>
              <CardDescription>
                Configure automatic approval and priority rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Auto-Priority Assignment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign priority based on mutation characteristics
                  </p>
                </div>
                <Switch
                  checked={orchestratorSettings.enableAutoPriority}
                  onCheckedChange={(checked) =>
                    setOrchestratorSettings(prev => ({ ...prev, enableAutoPriority: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Breaking Change Detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect potentially breaking changes
                  </p>
                </div>
                <Switch
                  checked={orchestratorSettings.enableBreakingChangeDetection}
                  onCheckedChange={(checked) =>
                    setOrchestratorSettings(prev => ({ ...prev, enableBreakingChangeDetection: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval for Breaking Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Always require manual approval for breaking changes
                  </p>
                </div>
                <Switch
                  checked={orchestratorSettings.requireApprovalForBreakingChanges}
                  onCheckedChange={(checked) =>
                    setOrchestratorSettings(prev => ({ ...prev, requireApprovalForBreakingChanges: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Change Threshold</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark changes as critical based on impact analysis
                  </p>
                </div>
                <Switch
                  checked={orchestratorSettings.criticalChangeThreshold}
                  onCheckedChange={(checked) =>
                    setOrchestratorSettings(prev => ({ ...prev, criticalChangeThreshold: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>
                Configure performance and caching settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Agent Caching</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache agent results to improve performance
                  </p>
                </div>
                <Switch
                  checked={orchestratorSettings.enableAgentCaching}
                  onCheckedChange={(checked) =>
                    setOrchestratorSettings(prev => ({ ...prev, enableAgentCaching: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="traversalDepth">Max Graph Traversal Depth</Label>
                  <Input
                    id="traversalDepth"
                    type="number"
                    min="1"
                    max="50"
                    value={orchestratorSettings.maxGraphTraversalDepth}
                    onChange={(e) =>
                      setOrchestratorSettings(prev => ({ ...prev, maxGraphTraversalDepth: parseInt(e.target.value) || 10 }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum depth for dependency graph traversal
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cacheTtl">Embedding Cache TTL (seconds)</Label>
                  <Input
                    id="cacheTtl"
                    type="number"
                    min="300"
                    max="86400"
                    value={orchestratorSettings.embeddingCacheTtl}
                    onChange={(e) =>
                      setOrchestratorSettings(prev => ({ ...prev, embeddingCacheTtl: parseInt(e.target.value) || 3600 }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Time-to-live for cached embeddings
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleOrchestratorSettingsUpdate}>
                  Save Orchestrator Settings
                </Button>
              </div>
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