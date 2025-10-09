import { format, formatDistanceToNow } from 'date-fns';
import { Bug, Lightbulb, Plug, CreditCard, HelpCircle } from 'lucide-react';

/**
 * Generate a unique ticket number
 * Format: TICK-XXXXXX where X is alphanumeric
 */
export function generateTicketNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TICK-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get color classes for ticket status badges
 */
export function getTicketStatusColor(status: string) {
  const statusColors = {
    open: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    in_progress: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    waiting_response: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200'
    },
    resolved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    closed: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200'
    }
  };

  return statusColors[status as keyof typeof statusColors] || statusColors.open;
}

/**
 * Get color classes for priority badges
 */
export function getPriorityColor(priority: string) {
  const priorityColors = {
    low: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200'
    },
    medium: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    high: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200'
    },
    urgent: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    }
  };

  return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
}

/**
 * Format dates for ticket display
 */
export function formatTicketDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);

  // If less than 24 hours, show relative time
  if (diffInHours < 24) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  // If older than 24 hours, show absolute date
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Get appropriate Lucide icon component for each category
 */
export function getCategoryIcon(category: string) {
  const categoryIcons = {
    bug: Bug,
    feature: Lightbulb,
    integration: Plug,
    billing: CreditCard,
    other: HelpCircle
  };

  return categoryIcons[category as keyof typeof categoryIcons] || HelpCircle;
}

/**
 * Get human readable label for status
 */
export function getStatusLabel(status: string): string {
  const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress',
    waiting_response: 'Waiting Response',
    resolved: 'Resolved',
    closed: 'Closed'
  };

  return statusLabels[status as keyof typeof statusLabels] || status;
}

/**
 * Get human readable label for priority
 */
export function getPriorityLabel(priority: string): string {
  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };

  return priorityLabels[priority as keyof typeof priorityLabels] || priority;
}

/**
 * Get human readable label for category
 */
export function getCategoryLabel(category: string): string {
  const categoryLabels = {
    bug: 'Bug Report',
    feature: 'Feature Request',
    integration: 'Integration Issue',
    billing: 'Billing Question',
    other: 'Other'
  };

  return categoryLabels[category as keyof typeof categoryLabels] || category;
}