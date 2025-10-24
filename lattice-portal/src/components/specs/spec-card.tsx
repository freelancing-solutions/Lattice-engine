import { Spec, SpecStatus, NodeType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SpecCardProps {
  spec: Spec;
  onView: () => void;
  onEdit?: () => void;
  onApprove?: () => void;
  onDelete?: () => void;
}

export function SpecCard({ spec, onView, onEdit, onApprove, onDelete }: SpecCardProps) {
  const getStatusColor = (status: SpecStatus) => {
    switch (status) {
      case SpecStatus.ACTIVE:
        return 'bg-green-500';
      case SpecStatus.DRAFT:
        return 'bg-yellow-500';
      case SpecStatus.DEPRECATED:
        return 'bg-gray-500';
      case SpecStatus.PENDING:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: NodeType) => {
    switch (type) {
      case NodeType.SPEC:
        return 'bg-blue-500';
      case NodeType.MODULE:
        return 'bg-purple-500';
      case NodeType.CONTROLLER:
        return 'bg-green-500';
      case NodeType.MODEL:
        return 'bg-orange-500';
      case NodeType.ROUTE_API:
        return 'bg-red-500';
      case NodeType.TASK:
        return 'bg-indigo-500';
      case NodeType.TEST:
        return 'bg-pink-500';
      case NodeType.AGENT:
        return 'bg-cyan-500';
      case NodeType.GOAL:
        return 'bg-emerald-500';
      case NodeType.CONSTRAINT:
        return 'bg-amber-500';
      case NodeType.DOCUMENTATION:
        return 'bg-slate-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatNodeType = (type: NodeType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return 'No description provided';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${getTypeColor(spec.type)}`} />
                {formatNodeType(spec.type)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(spec.status)}`} />
                {spec.status}
              </Badge>
            </div>
            <CardTitle className="text-lg truncate">{spec.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {truncateText(spec.description, 100)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Metadata Badge */}
          {Object.keys(spec.metadata).length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {Object.keys(spec.metadata).length} metadata fields
              </Badge>
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span>Created:</span>
              <span className="font-medium">
                {new Date(spec.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Updated:</span>
              <span className="font-medium">
                {new Date(spec.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onView} className="flex-1">
              View
            </Button>
            {spec.status === SpecStatus.DRAFT && onEdit && (
              <Button size="sm" onClick={onEdit} className="flex-1">
                Edit
              </Button>
            )}
            {spec.status === SpecStatus.PENDING && onApprove && (
              <Button size="sm" onClick={onApprove} className="flex-1">
                Approve
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}