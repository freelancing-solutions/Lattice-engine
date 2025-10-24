'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GraphFilters, NodeType, SpecStatus } from '@/types';
import {
  Filter,
  X,
  Search
} from 'lucide-react';

interface GraphFiltersProps {
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  className?: string;
}

// Relationship types that might exist in the system
const relationshipTypes = [
  'DEPENDS_ON',
  'IMPLEMENTS',
  'CONTAINS',
  'EXTENDS',
  'REFERENCES',
  'CALLS',
  'VALIDATES',
  'TESTS',
  'DOCUMENTS',
  'CONFIGURES'
];

export function GraphFilters({
  filters,
  onFiltersChange,
  className = ''
}: GraphFiltersProps) {
  // Get display name for node type
  const getNodeTypeName = (type: NodeType): string => {
    return type.replace('_', ' ');
  };

  // Get display name for relationship type
  const getRelationshipTypeName = (type: string): string => {
    return type.replace('_', ' ').toLowerCase();
  };

  // Handle search query change
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value.trim() || undefined
    });
  };

  // Handle node type filter change
  const handleNodeTypeChange = (nodeType: NodeType, checked: boolean) => {
    const currentTypes = filters.nodeTypes || [];
    let newTypes: NodeType[];

    if (checked) {
      newTypes = [...currentTypes, nodeType];
    } else {
      newTypes = currentTypes.filter(type => type !== nodeType);
    }

    onFiltersChange({
      ...filters,
      nodeTypes: newTypes.length > 0 ? newTypes : undefined
    });
  };

  // Handle relationship type filter change
  const handleRelationshipTypeChange = (relationshipType: string, checked: boolean) => {
    const currentTypes = filters.edgeTypes || [];
    let newTypes: string[];

    if (checked) {
      newTypes = [...currentTypes, relationshipType];
    } else {
      newTypes = currentTypes.filter(type => type !== relationshipType);
    }

    onFiltersChange({
      ...filters,
      edgeTypes: newTypes.length > 0 ? newTypes : undefined
    });
  };

  // Handle status filter change
  const handleStatusChange = (status: SpecStatus, checked: boolean) => {
    const currentStatuses = filters.status || [];
    let newStatuses: SpecStatus[];

    if (checked) {
      newStatuses = [...currentStatuses, status];
    } else {
      newStatuses = currentStatuses.filter(s => s !== status);
    }

    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  // Calculate active filter count
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.search) count++;
    if (filters.nodeTypes && filters.nodeTypes.length > 0) count++;
    if (filters.edgeTypes && filters.edgeTypes.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Graph Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Filter */}
        <div className="space-y-2">
          <Label htmlFor="graph-search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </Label>
          <Input
            id="graph-search"
            placeholder="Search nodes by name or description..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Node Type Filters */}
        <div className="space-y-3">
          <Label>Node Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.values(NodeType).map((nodeType) => (
              <div key={nodeType} className="flex items-center space-x-2">
                <Checkbox
                  id={`node-type-${nodeType}`}
                  checked={filters.nodeTypes?.includes(nodeType) || false}
                  onCheckedChange={(checked) => handleNodeTypeChange(nodeType, checked as boolean)}
                />
                <Label
                  htmlFor={`node-type-${nodeType}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getNodeTypeName(nodeType)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Type Filters */}
        <div className="space-y-3">
          <Label>Relationship Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {relationshipTypes.map((relationshipType) => (
              <div key={relationshipType} className="flex items-center space-x-2">
                <Checkbox
                  id={`rel-type-${relationshipType}`}
                  checked={filters.edgeTypes?.includes(relationshipType) || false}
                  onCheckedChange={(checked) => handleRelationshipTypeChange(relationshipType, checked as boolean)}
                />
                <Label
                  htmlFor={`rel-type-${relationshipType}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getRelationshipTypeName(relationshipType)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-3">
            {Object.values(SpecStatus).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status?.includes(status) || false}
                  onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                />
                <Label
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2 block">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  Search: "{filters.search}"
                </Badge>
              )}
              {filters.nodeTypes && filters.nodeTypes.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.nodeTypes.length} node type{filters.nodeTypes.length > 1 ? 's' : ''}
                </Badge>
              )}
              {filters.edgeTypes && filters.edgeTypes.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.edgeTypes.length} relationship type{filters.edgeTypes.length > 1 ? 's' : ''}
                </Badge>
              )}
              {filters.status && filters.status.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.status.length} status{filters.status.length > 1 ? 'es' : ''}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GraphFilters;