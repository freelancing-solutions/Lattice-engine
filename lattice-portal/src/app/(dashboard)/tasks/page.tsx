'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Clock, PlayCircle, MessageSquare, CheckCircle, XCircle, ListTodo, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTaskStore } from '@/stores/task-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';
import { Task, TaskStatus } from '@/types';
import Link from 'next/link';

export default function TasksPage() {
  const {
    tasks,
    setTasks,
    filters,
    setFilters,
    isLoading,
    error,
    setLoading,
    setError,
    pendingCount,
    runningCount,
  } = useTaskStore();
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getTasks({
        ...filters,
        requesterId: user.id,
      });

      if (response.success && response.data) {
        setTasks(response.data.items);
      } else {
        setError(response.error?.message || 'Failed to load tasks');
      }
    } catch (error: any) {
      setError(error.error?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Note: Backend doesn't support search parameter yet, this is client-side only
    setFilters({ ...filters, operation: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      status: status === 'all' ? undefined : status as TaskStatus,
    });
  };

  const handleClarifyTask = async (taskId: string) => {
    try {
      const response = await apiClient.clarifyTask({
        taskId,
        note: 'Requesting clarification from dashboard',
        fromUserId: user?.id
      });

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Clarification Requested',
          message: 'Task clarification has been requested',
        });
        loadTasks();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Request Failed',
        message: error.error?.message || 'Failed to request clarification',
      });
    }
  };

  const handleCompleteTask = async (taskId: string, success: boolean = true) => {
    try {
      const response = await apiClient.completeTask({
        taskId,
        success,
        result: success ? { completed_by: 'dashboard' } : undefined,
        notes: success ? 'Completed via dashboard' : 'Failed via dashboard'
      });

      if (response.success) {
        addNotification({
          type: 'success',
          title: success ? 'Task Completed' : 'Task Failed',
          message: `Task has been ${success ? 'completed' : 'marked as failed'}`,
        });
        loadTasks();
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: error.error?.message || 'Failed to update task',
      });
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case TaskStatus.RUNNING:
        return <PlayCircle className="h-4 w-4" />;
      case TaskStatus.CLARIFICATION_REQUESTED:
        return <MessageSquare className="h-4 w-4" />;
      case TaskStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case TaskStatus.FAILED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return 'bg-yellow-500';
      case TaskStatus.RUNNING:
        return 'bg-blue-500';
      case TaskStatus.CLARIFICATION_REQUESTED:
        return 'bg-orange-500';
      case TaskStatus.COMPLETED:
        return 'bg-green-500';
      case TaskStatus.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const truncateInputData = (inputData: Record<string, any>, maxLength: number = 100) => {
    try {
      const jsonStr = JSON.stringify(inputData);
      return jsonStr.length > maxLength ? jsonStr.substring(0, maxLength) + '...' : jsonStr;
    } catch {
      return 'Invalid JSON data';
    }
  };

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      task.operation.toLowerCase().includes(searchLower) ||
      truncateInputData(task.inputData).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track task requests
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mt-1">
              {pendingCount} pending • {runningCount} running
            </p>
          )}
        </div>
        <Link href="/dashboard/tasks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={TaskStatus.RUNNING}>Running</SelectItem>
                <SelectItem value={TaskStatus.CLARIFICATION_REQUESTED}>Clarification Requested</SelectItem>
                <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={TaskStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadTasks} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ListTodo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filters.status
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first task'
                }
              </p>
              <Link href="/dashboard/tasks/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.taskId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                        {getStatusText(task.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{task.operation}</CardTitle>
                    <CardDescription className="mt-1">
                      {truncateInputData(task.inputData, 100)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/tasks/${task.taskId}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {(task.status === TaskStatus.RUNNING || task.status === TaskStatus.CLARIFICATION_REQUESTED) && (
                        <DropdownMenuItem onClick={() => handleClarifyTask(task.taskId)}>
                          Request Clarification
                        </DropdownMenuItem>
                      )}
                      {task.status === TaskStatus.RUNNING && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleCompleteTask(task.taskId, true)}>
                            Complete Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCompleteTask(task.taskId, false)} className="text-destructive">
                            Mark as Failed
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Agent Type */}
                  {task.targetAgentType && (
                    <Badge variant="outline" className="text-xs">
                      {task.targetAgentType}
                    </Badge>
                  )}

                  {/* Clarification Notes */}
                  {task.clarificationNotes.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {task.clarificationNotes.length} clarification notes
                    </Badge>
                  )}

                  {/* Task Info */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      Updated: {new Date(task.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard/tasks/${task.taskId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                    {task.status === TaskStatus.RUNNING && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCompleteTask(task.taskId, true)}
                      >
                        Complete
                      </Button>
                    )}
                    {(task.status === TaskStatus.RUNNING || task.status === TaskStatus.CLARIFICATION_REQUESTED) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleClarifyTask(task.taskId)}
                      >
                        Clarify
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}