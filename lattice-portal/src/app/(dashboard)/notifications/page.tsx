'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BellIcon, 
  SettingsIcon, 
  CheckIcon,
  XIcon,
  FilterIcon,
  MailIcon,
  GitBranchIcon,
  FolderIcon,
  UsersIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckCircleIcon,
  ClockIcon
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'mutation' | 'project' | 'team' | 'system' | 'approval';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    projectId?: string;
    mutationId?: string;
    userId?: string;
    [key: string]: any;
  };
}

interface NotificationPreferences {
  email: {
    mutations: boolean;
    projects: boolean;
    team: boolean;
    system: boolean;
  };
  push: {
    mutations: boolean;
    projects: boolean;
    team: boolean;
    system: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

const NOTIFICATION_ICONS = {
  mutation: GitBranchIcon,
  project: FolderIcon,
  team: UsersIcon,
  system: SettingsIcon,
  approval: CheckCircleIcon
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: { mutations: true, projects: true, team: false, system: true },
    push: { mutations: true, projects: false, team: false, system: false },
    frequency: 'immediate'
  });
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const { notifications: uiNotifications, removeNotification, clearNotifications } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Generate mock notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'mutation',
          title: 'Mutation Approved',
          message: 'Your mutation "Add Dark Mode Toggle" has been approved by Alice Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          read: false,
          priority: 'medium',
          actionUrl: '/dashboard/mutations/mut-123',
          metadata: { mutationId: 'mut-123', userId: 'user-1' }
        },
        {
          id: '2',
          type: 'project',
          title: 'New Project Assignment',
          message: 'You have been assigned to the "Frontend Redesign" project',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: false,
          priority: 'high',
          actionUrl: '/dashboard/projects/proj-456',
          metadata: { projectId: 'proj-456' }
        },
        {
          id: '3',
          type: 'team',
          title: 'Team Member Joined',
          message: 'Eva Martinez has joined your organization',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          read: true,
          priority: 'low',
          metadata: { userId: 'user-5' }
        },
        {
          id: '4',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2-4 AM EST',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          read: true,
          priority: 'urgent'
        },
        {
          id: '5',
          type: 'approval',
          title: 'Review Required',
          message: 'Bob Smith requested your review on mutation "Update Auth Flow"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          read: false,
          priority: 'high',
          actionUrl: '/dashboard/mutations/mut-789',
          metadata: { mutationId: 'mut-789', userId: 'user-2' }
        },
        {
          id: '6',
          type: 'mutation',
          title: 'Mutation Rejected',
          message: 'Your mutation "Optimize Database Queries" was rejected. See feedback for details.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          read: true,
          priority: 'medium',
          actionUrl: '/dashboard/mutations/mut-101',
          metadata: { mutationId: 'mut-101' }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const handlePreferenceChange = (
    category: 'email' | 'push',
    type: keyof NotificationPreferences['email'],
    value: boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your team's activities and system updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {unreadCount} unread
          </Badge>
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckIcon className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="unread">Unread Only</SelectItem>
                    <SelectItem value="mutation">Mutations</SelectItem>
                    <SelectItem value="project">Projects</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="approval">Approvals</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type];
                    
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{notification.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={PRIORITY_COLORS[notification.priority]}>
                                {notification.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {notification.actionUrl && (
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <XIcon className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {filteredNotifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BellIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailIcon className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(preferences.email).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium capitalize">{type}</label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about {type} updates
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(value) => 
                        handlePreferenceChange('email', type as any, value)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Push Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive as push notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(preferences.push).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium capitalize">{type}</label>
                      <p className="text-xs text-muted-foreground">
                        Get push notifications for {type}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(value) => 
                        handlePreferenceChange('push', type as any, value)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Frequency Settings */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Notification Frequency
                </CardTitle>
                <CardDescription>
                  Control how often you receive notification summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={preferences.frequency}
                  onValueChange={(value: any) => 
                    setPreferences(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Summary</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}