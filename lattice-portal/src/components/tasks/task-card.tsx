import { Task, TaskStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, PlayCircle, MessageSquare, CheckCircle, XCircle, Eye } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onView: () => void;
  onClarify?: () => void;
  onComplete?: () => void;
}

export function TaskCard({ task, onView, onClarify, onComplete }: TaskCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                {getStatusIcon(task.status)}
                <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                {getStatusText(task.status)}
              </Badge>
              {task.targetAgentType && (
                <Badge variant="outline" className="text-xs">
                  {task.targetAgentType}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg truncate">{task.operation}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {truncateInputData(task.inputData, 100)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Clarification Notes Badge */}
          {task.clarificationNotes.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {task.clarificationNotes.length} clarification notes
            </Badge>
          )}

          {/* Assigned Agent */}
          {task.assignedAgentId && (
            <div className="text-xs text-muted-foreground">
              Assigned to: {task.assignedAgentId}
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span>Created:</span>
              <span className="font-medium">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Updated:</span>
              <span className="font-medium">
                {new Date(task.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onView} className="flex-1">
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            {(task.status === TaskStatus.RUNNING || task.status === TaskStatus.CLARIFICATION_REQUESTED) && onClarify && (
              <Button size="sm" onClick={onClarify} className="flex-1">
                <MessageSquare className="mr-1 h-3 w-3" />
                Clarify
              </Button>
            )}
            {task.status === TaskStatus.RUNNING && onComplete && (
              <Button size="sm" onClick={onComplete} className="flex-1">
                <CheckCircle className="mr-1 h-3 w-3" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}