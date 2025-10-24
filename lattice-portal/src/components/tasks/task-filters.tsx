import { TaskFilters, TaskStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const handleOperationChange = (value: string) => {
    onFiltersChange({
      ...filters,
      operation: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as TaskStatus),
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value || undefined,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.operation || filters.status || filters.dateRange?.start || filters.dateRange?.end;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Operation Filter */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search operations..."
                value={filters.operation || ''}
                onChange={(e) => handleOperationChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Select onValueChange={handleStatusChange} value={filters.status || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
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

          {/* Date Range Filters */}
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="Start date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full lg:w-40"
            />
            <Input
              type="date"
              placeholder="End date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full lg:w-40"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="w-full lg:w-auto">
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}