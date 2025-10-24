'use client';

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Basic spinner component
export function LoadingSpinner({ 
  size = 'default', 
  className = '' 
}: { 
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Full page loading component
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Card loading skeleton
export function CardLoading({ 
  showHeader = true, 
  lines = 3 
}: { 
  showHeader?: boolean;
  lines?: number;
}) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

// Table loading skeleton
export function TableLoading({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// List loading skeleton
export function ListLoading({ 
  items = 5,
  showAvatar = false 
}: { 
  items?: number;
  showAvatar?: boolean;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Chart loading skeleton
export function ChartLoading({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  loading = false, 
  ...props 
}: React.ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </Button>
  );
}

// Inline loading component
export function InlineLoading({ 
  text = 'Loading...',
  size = 'sm'
}: { 
  text?: string;
  size?: 'sm' | 'default';
}) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

// Error state with retry
export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data.',
  onRetry,
  showRetry = true
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center">
      <div className="p-3 bg-red-100 rounded-full">
        <RefreshCw className="h-6 w-6 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {showRetry && onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title = 'No data found',
  message = 'There are no items to display.',
  action,
  icon: Icon
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center">
      {Icon && (
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {action}
    </div>
  );
}

// Suspense fallback component
export function SuspenseFallback({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Progressive loading component for large datasets
export function ProgressiveLoading({ 
  progress,
  total,
  message = 'Loading data...'
}: {
  progress: number;
  total: number;
  message?: string;
}) {
  const percentage = Math.round((progress / total) * 100);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <LoadingSpinner size="lg" />
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">{message}</p>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {progress} of {total} items loaded ({percentage}%)
        </p>
      </div>
    </div>
  );
}

// Skeleton wrapper for conditional loading
export function SkeletonWrapper({ 
  loading, 
  children, 
  skeleton 
}: {
  loading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
}) {
  return loading ? <>{skeleton}</> : <>{children}</>;
}