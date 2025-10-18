'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  FolderOpen,
  GitBranch,
  CheckSquare,
  FileText,
  ListTodo,
  Network,
  Rocket,
  Settings,
  Users,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useApprovalStore } from '@/stores/approval-store';
import { useTaskStore } from '@/stores/task-store';
import { useDeploymentStore } from '@/stores/deployment-store';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'Mutations', href: '/dashboard/mutations', icon: GitBranch },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare, badgeKey: 'pendingCount' },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ListTodo, badgeKey: 'taskCount' },
  { name: 'Graph', href: '/dashboard/graph', icon: Network },
  { name: 'Deployments', href: '/dashboard/deployments', icon: Rocket, badgeKey: 'deploymentCount' },
  { name: 'Specifications', href: '/dashboard/specs', icon: FileText },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, currentOrganization } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { pendingCount } = useApprovalStore();
  const { pendingCount: taskPendingCount, runningCount } = useTaskStore();
  const { pendingCount: deploymentPendingCount, runningCount: deploymentRunningCount } = useDeploymentStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-50',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <img src="/logo.svg" alt="Lattice" className="h-8 w-8" />
                <span className="font-semibold text-lg">Lattice</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const badgeCount = item.badgeKey ?
                (item.badgeKey === 'pendingCount' ? pendingCount :
                 item.badgeKey === 'taskCount' ? taskPendingCount + runningCount :
                 item.badgeKey === 'deploymentCount' ? deploymentPendingCount + deploymentRunningCount : 0) : 0;

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start relative',
                      sidebarCollapsed ? 'px-2' : 'px-3',
                      isActive && 'bg-secondary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3">{item.name}</span>
                        {badgeCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </Badge>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && badgeCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t">
          {!sidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentOrganization?.name || 'Personal'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}