import { SpecFilters, SpecStatus, NodeType, Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SpecFiltersProps {
  filters: SpecFilters;
  onFiltersChange: (filters: SpecFilters) => void;
  projects: Project[];
}

export function SpecFilters({ filters, onFiltersChange, projects }: SpecFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as SpecStatus),
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as NodeType),
    });
  };

  const handleProjectChange = (value: string) => {
    onFiltersChange({
      ...filters,
      projectId: value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.status || filters.type || filters.projectId;

  const formatNodeType = (type: NodeType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search specifications..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Project Filter */}
          <div className="w-full lg:w-64">
            <Select onValueChange={handleProjectChange} value={filters.projectId || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Select onValueChange={handleStatusChange} value={filters.status || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={SpecStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={SpecStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={SpecStatus.DEPRECATED}>Deprecated</SelectItem>
                <SelectItem value={SpecStatus.PENDING}>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-48">
            <Select onValueChange={handleTypeChange} value={filters.type || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(NodeType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatNodeType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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