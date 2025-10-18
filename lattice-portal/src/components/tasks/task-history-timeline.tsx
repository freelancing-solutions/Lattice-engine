import { Task, TaskStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MessageSquare, PlayCircle, CheckCircle, XCircle } from 'lucide-react';

interface TaskHistoryTimelineProps {
  task: Task;
}

export function TaskHistoryTimeline({ task }: TaskHistoryTimelineProps) {
  const events = [
    {
      id: 'created',
      title: 'Task Created',
      description: 'Task was initially created and queued for processing',
      timestamp: task.createdAt,
      icon: Clock,
      iconColor: 'bg-blue-500',
    },
    // Add clarification notes as events
    ...task.clarificationNotes.map((note, index) => ({
      id: `clarification-${index}`,
      title: 'Clarification Note',
      description: note.note,
      timestamp: note.timestamp,
      icon: MessageSquare,
      iconColor: 'bg-orange-500',
      meta: `From: ${note.fromUserId || 'Unknown'}`,
    })),
    // Add status change events
    ...(task.status === TaskStatus.RUNNING || task.status === TaskStatus.CLARIFICATION_REQUESTED || task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED
      ? [{
          id: 'started',
          title: 'Task Started',
          description: 'Task execution began',
          timestamp: task.updatedAt, // We'll use updatedAt as an approximation since we don't have exact start time
          icon: PlayCircle,
          iconColor: 'bg-blue-500',
        }]
      : []),
    ...(task.status === TaskStatus.COMPLETED
      ? [{
          id: 'completed',
          title: 'Task Completed',
          description: task.result ? 'Task completed successfully' : 'Task marked as completed',
          timestamp: task.updatedAt,
          icon: CheckCircle,
          iconColor: 'bg-green-500',
        }]
      : []),
    ...(task.status === TaskStatus.FAILED
      ? [{
          id: 'failed',
          title: 'Task Failed',
          description: task.error || 'Task execution failed',
          timestamp: task.updatedAt,
          icon: XCircle,
          iconColor: 'bg-red-500',
        }]
      : []),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="relative">
          {/* Vertical line */}
          {events.length > 1 && (
            <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-border" />
          )}

          <div className="space-y-6">
            {events.map((event, index) => {
              const Icon = event.icon;

              return (
                <div key={event.id} className="flex items-start gap-4 relative">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full ${event.iconColor} flex items-center justify-center flex-shrink-0 z-10`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      {event.meta && (
                        <span className="text-xs text-muted-foreground">
                          {event.meta}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No History Available</h3>
              <p className="text-muted-foreground">
                This task doesn't have any history events yet.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}