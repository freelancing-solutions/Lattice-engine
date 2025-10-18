'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, PlayCircle, MessageSquare, CheckCircle, XCircle, User, Calendar, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTaskStore } from '@/stores/task-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';
import { Task, TaskStatus } from '@/types';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const {
    selectedTask,
    setSelectedTask,
    updateTask,
  } = useTaskStore();

  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [clarificationNote, setClarificationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    try {
      const response = await apiClient.getTask(taskId);
      if (response.success && response.data) {
        setSelectedTask(response.data);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to load task',
        duration: 5000,
      });
    }
  };

  const handleClarify = async () => {
    if (!clarificationNote.trim()) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Clarification note is required',
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.clarifyTask({
        taskId,
        note: clarificationNote,
        fromUserId: user?.id
      });

      if (response.success && response.data) {
        updateTask(taskId, response.data);
        setSelectedTask(response.data);
        addNotification({
          type: 'success',
          title: 'Clarification Sent',
          message: 'Your clarification request has been sent',
          duration: 5000,
        });
        setClarificationNote('');
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to send clarification',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (success: boolean = true) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.completeTask({
        taskId,
        success,
        result: success ? { completed_by: user?.id, completed_at: new Date().toISOString() } : undefined,
        notes: success ? 'Task completed via dashboard' : 'Task failed via dashboard'
      });

      if (response.success && response.data) {
        updateTask(taskId, response.data);
        setSelectedTask(response.data);
        addNotification({
          type: 'success',
          title: success ? 'Task Completed' : 'Task Failed',
          message: `Task has been ${success ? 'completed' : 'marked as failed'}`,
          duration: 5000,
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.error?.message || 'Failed to update task',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
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

  if (!selectedTask) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Task not found</h3>
              <p className="text-muted-foreground mb-4">
                The task you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => router.push('/dashboard/tasks')}>
                Back to Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedTask.operation}</h1>
            <p className="text-muted-foreground">
              Task details and management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(selectedTask.status === TaskStatus.RUNNING || selectedTask.status === TaskStatus.CLARIFICATION_REQUESTED) && (
            <Button onClick={handleClarify} disabled={isSubmitting}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Request Clarification'}
            </Button>
          )}
          {selectedTask.status === TaskStatus.RUNNING && (
            <>
              <Button onClick={() => handleComplete(true)} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Completing...' : 'Complete'}
              </Button>
              <Button variant="destructive" onClick={() => handleComplete(false)} disabled={isSubmitting}>
                <XCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Failing...' : 'Fail'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          {getStatusIcon(selectedTask.status)}
          <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedTask.status)}`} />
          {getStatusText(selectedTask.status)}
        </Badge>
        {selectedTask.targetAgentType && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            {selectedTask.targetAgentType}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="input">Input Data</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Task Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Operation</h4>
                      <p className="text-muted-foreground">{selectedTask.operation}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Status</h4>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getStatusIcon(selectedTask.status)}
                        {getStatusText(selectedTask.status)}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Requester</h4>
                      <p className="text-muted-foreground">{selectedTask.requesterId}</p>
                    </div>
                    {selectedTask.assignedAgentId && (
                      <div>
                        <h4 className="font-semibold mb-2">Assigned Agent</h4>
                        <p className="text-muted-foreground">{selectedTask.assignedAgentId}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedTask.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Updated:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedTask.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clarification Form */}
              {(selectedTask.status === TaskStatus.RUNNING || selectedTask.status === TaskStatus.CLARIFICATION_REQUESTED) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Request Clarification</CardTitle>
                    <CardDescription>
                      Ask for more information or clarification about this task
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={clarificationNote}
                      onChange={(e) => setClarificationNote(e.target.value)}
                      placeholder="Enter your clarification request..."
                      className="min-h-[100px]"
                    />
                    <Button onClick={handleClarify} disabled={isSubmitting || !clarificationNote.trim()}>
                      {isSubmitting ? 'Sending...' : 'Send Clarification'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="input" className="space-y-6">
              {/* Input Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Input Data</CardTitle>
                  <CardDescription>
                    The data provided when this task was requested
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedTask.inputData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="result" className="space-y-6">
              {/* Result */}
              <Card>
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>
                    The result of this task execution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTask.result ? (
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(selectedTask.result, null, 2)}
                      </pre>
                    </div>
                  ) : selectedTask.error ? (
                    <div className="bg-destructive/10 p-4 rounded-lg">
                      <p className="text-destructive">{selectedTask.error}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No result available yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {/* History Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Task History</CardTitle>
                  <CardDescription>
                    Timeline of events and status changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Created Event */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Task Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedTask.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Clarification Notes */}
                    {selectedTask.clarificationNotes.map((note, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Clarification Note</p>
                          <p className="text-sm text-muted-foreground mb-1">{note.note}</p>
                          <p className="text-xs text-muted-foreground">
                            From: {note.fromUserId || 'Unknown'} • {new Date(note.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Status Changes */}
                    {selectedTask.status === TaskStatus.RUNNING && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <PlayCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Task Started</p>
                          <p className="text-sm text-muted-foreground">
                            Task execution began
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTask.status === TaskStatus.COMPLETED && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Task Completed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedTask.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTask.status === TaskStatus.FAILED && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <XCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Task Failed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedTask.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Status</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getStatusIcon(selectedTask.status)}
                    {getStatusText(selectedTask.status)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Target Agent</span>
                  <span className="text-sm font-medium">
                    {selectedTask.targetAgentType || 'Any'}
                  </span>
                </div>

                {selectedTask.assignedAgentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assigned Agent</span>
                    <span className="text-sm font-medium">
                      {selectedTask.assignedAgentId}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Updated:</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedTask.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(selectedTask.status === TaskStatus.RUNNING || selectedTask.status === TaskStatus.CLARIFICATION_REQUESTED) && (
                <Button onClick={handleClarify} className="w-full" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request Clarification
                </Button>
              )}

              {selectedTask.status === TaskStatus.RUNNING && (
                <>
                  <Button onClick={() => handleComplete(true)} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Task
                  </Button>
                  <Button onClick={() => handleComplete(false)} className="w-full" variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark as Failed
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Clarification Notes Summary */}
          {selectedTask.clarificationNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Clarification Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {selectedTask.clarificationNotes.length}
                  </div>
                  <p className="text-sm text-muted-foreground">notes exchanged</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}