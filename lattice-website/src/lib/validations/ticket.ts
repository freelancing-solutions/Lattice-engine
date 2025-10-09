import { z } from 'zod';

// Schema for creating a new ticket
export const createTicketSchema = z.object({
  category: z.enum(['bug', 'feature', 'integration', 'billing', 'other'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject is too long (max 200 characters)'),
  description: z.string()
    .min(20, 'Please provide more details (at least 20 characters)')
    .max(5000, 'Description is too long (max 5000 characters)'),
  userEmail: z.string().email('Please enter a valid email address'),
  userName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long (max 100 characters)')
    .optional()
});

// Schema for updating ticket status
export const updateTicketStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_response', 'resolved', 'closed'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.string().optional()
});

// Schema for adding messages to a ticket
export const addTicketMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long (max 5000 characters)'),
  isStaffReply: z.boolean().default(false),
  authorName: z.string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name is too long (max 100 characters)'),
  authorEmail: z.string().email('Please enter a valid email address')
});

// Schema for filtering/searching tickets
export const ticketQuerySchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_response', 'resolved', 'closed']).optional(),
  category: z.enum(['bug', 'feature', 'integration', 'billing', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

// Export TypeScript types
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AddTicketMessageInput = z.infer<typeof addTicketMessageSchema>;
export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;