import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApprovalFilters, ApprovalStatus } from '@/types';

interface ApprovalFiltersProps {
  filters: ApprovalFilters;
  onFiltersChange: (filters: ApprovalFilters) => void;
}

export function ApprovalFilters({ filters, onFiltersChange }: ApprovalFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value as ApprovalStatus,
    });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'all' ? undefined : value,
    });
  };

  const handleAssignedToChange = (value: string) => {
    onFiltersChange({
      ...filters,
      assignedTo: value || undefined,
    });
  };

  const handleMutationTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      mutationType: value || undefined,
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value || undefined,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(filters.status || filters.priority || filters.assignedTo ||
    filters.mutationType || filters.dateRange?.start || filters.dateRange?.end);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={ApprovalStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={ApprovalStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={ApprovalStatus.REJECTED}>Rejected</SelectItem>
                <SelectItem value={ApprovalStatus.EXPIRED}>Expired</SelectItem>
                <SelectItem value={ApprovalStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={filters.priority || 'all'}
              onValueChange={handlePriorityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To</label>
            <Input
              placeholder="User ID or email"
              value={filters.assignedTo || ''}
              onChange={(e) => handleAssignedToChange(e.target.value)}
            />
          </div>

          {/* Mutation Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mutation Type</label>
            <Input
              placeholder="e.g., create, update, delete"
              value={filters.mutationType || ''}
              onChange={(e) => handleMutationTypeChange(e.target.value)}
            />
          </div>

          {/* Date Range Start */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
            />
          </div>

          {/* Date Range End */}
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.status && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Status: {filters.status}
                </div>
              )}
              {filters.priority && (
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                  Priority: {filters.priority}
                </div>
              )}
              {filters.assignedTo && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Assigned: {filters.assignedTo}
                </div>
              )}
              {filters.mutationType && (
                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  Type: {filters.mutationType}
                </div>
              )}
              {filters.dateRange?.start && (
                <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                  From: {filters.dateRange.start}
                </div>
              )}
              {filters.dateRange?.end && (
                <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                  To: {filters.dateRange.end}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}