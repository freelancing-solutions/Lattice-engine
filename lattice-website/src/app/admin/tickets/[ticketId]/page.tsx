"use client"

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { addTicketMessageSchema, updateTicketStatusSchema, type AddTicketMessageInput, type UpdateTicketStatusInput } from '@/lib/validations/ticket'
import {
  getTicketStatusColor,
  getPriorityColor,
  getCategoryIcon,
  formatTicketDate,
  getStatusLabel,
  getPriorityLabel,
  getCategoryLabel
} from '@/lib/ticket-utils'
import {
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ArrowLeft,
  ArrowRight,
  User,
  Shield,
  Mail,
  Settings,
  RefreshCw,
  CheckSquare,
  XSquare,
  RotateCcw
} from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

interface TicketMessage {
  id: string
  content: string
  isStaffReply: boolean
  authorName: string
  authorEmail: string
  createdAt: string
}

interface SupportTicket {
  id: string
  ticketNumber: string
  category: string
  priority: string
  status: string
  subject: string
  description: string
  userEmail: string
  userName?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
  messages: TicketMessage[]
}

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.ticketId as string

  // Fetch ticket data
  const { data: ticketData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-ticket', ticketId],
    queryFn: async () => {
      const response = await axios.get(`/api/support/tickets/${ticketId}`)
      return response.data.ticket as SupportTicket
    },
    enabled: !!ticketId
  })

  // Form for ticket updates
  const updateForm = useForm<UpdateTicketStatusInput>({
    resolver: zodResolver(updateTicketStatusSchema),
    defaultValues: {
      status: '',
      priority: ''
    }
  })

  // Form for adding messages
  const messageForm = useForm<AddTicketMessageInput>({
    resolver: zodResolver(addTicketMessageSchema),
    defaultValues: {
      content: '',
      isStaffReply: true,
      authorName: 'Support Team',
      authorEmail: 'support@lattice.dev'
    }
  })

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async (data: UpdateTicketStatusInput) => {
      const response = await axios.patch(`/api/support/tickets/${ticketId}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Ticket updated successfully!')
      refetch()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to update ticket'
      toast.error(errorMessage)
    }
  })

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (data: AddTicketMessageInput) => {
      const response = await axios.post(`/api/support/tickets/${ticketId}/messages`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Message added successfully!')
      messageForm.reset()
      refetch()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to add message'
      toast.error(errorMessage)
    }
  })

  // Quick action mutations
  const resolveTicketMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(`/api/support/tickets/${ticketId}`, { status: 'resolved' })
      return response.data
    },
    onSuccess: () => {
      toast.success('Ticket marked as resolved!')
      refetch()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to resolve ticket'
      toast.error(errorMessage)
    }
  })

  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(`/api/support/tickets/${ticketId}`, { status: 'closed' })
      return response.data
    },
    onSuccess: () => {
      toast.success('Ticket closed!')
      refetch()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to close ticket'
      toast.error(errorMessage)
    }
  })

  const reopenTicketMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(`/api/support/tickets/${ticketId}`, { status: 'open' })
      return response.data
    },
    onSuccess: () => {
      toast.success('Ticket reopened!')
      refetch()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to reopen ticket'
      toast.error(errorMessage)
    }
  })

  const handleUpdateTicket = (data: UpdateTicketStatusInput) => {
    updateTicketMutation.mutate(data)
  }

  const handleAddMessage = (data: AddTicketMessageInput) => {
    addMessageMutation.mutate(data)
  }

  const handleResolveTicket = () => {
    resolveTicketMutation.mutate()
  }

  const handleCloseTicket = () => {
    closeTicketMutation.mutate()
  }

  const handleReopenTicket = () => {
    reopenTicketMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-12 w-64 mb-2" />
                <Skeleton className="h-6 w-96" />
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
                <h1 className="text-3xl font-bold">Ticket Not Found</h1>
                <p className="text-muted-foreground text-lg">
                  We couldn't find the requested ticket. Please check the ticket ID and try again.
                </p>
                <div className="space-y-3">
                  <Button asChild>
                    <a href="/admin/tickets">Back to Tickets</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const ticket = ticketData
  const CategoryIcon = getCategoryIcon(ticket.category)
  const statusColors = getTicketStatusColor(ticket.status)
  const priorityColors = getPriorityColor(ticket.priority)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <Button variant="ghost" asChild>
                  <a href="/admin/tickets">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tickets
                  </a>
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Ticket #{ticket.ticketNumber}
                  </h1>
                  <p className="text-muted-foreground">
                    Created {formatTicketDate(ticket.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                  <Badge className={`${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} border`}>
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            {ticket.status !== 'closed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium">Quick Actions:</span>
                      {ticket.status !== 'resolved' && (
                        <Button
                          size="sm"
                          onClick={handleResolveTicket}
                          disabled={resolveTicketMutation.isPending}
                        >
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Mark as Resolved
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCloseTicket}
                        disabled={closeTicketMutation.isPending}
                      >
                        <XSquare className="h-4 w-4 mr-2" />
                        Close Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Ticket Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CategoryIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                            <CardDescription>
                              {getCategoryLabel(ticket.category)} • Priority: {getPriorityLabel(ticket.priority)}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <div className="prose prose-sm max-w-none">
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {ticket.description}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{ticket.userName || 'Not provided'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{ticket.userEmail}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Timeline</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{formatTicketDate(ticket.createdAt)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Updated:</span>
                                <span>{formatTicketDate(ticket.updatedAt)}</span>
                              </div>
                              {ticket.resolvedAt && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Resolved:</span>
                                  <span>{formatTicketDate(ticket.resolvedAt)}</span>
                                </div>
                              )}
                              {ticket.closedAt && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Closed:</span>
                                  <span>{formatTicketDate(ticket.closedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Message Thread */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Conversation ({ticket.messages.length} messages)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ticket.messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className={`flex ${message.isStaffReply ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`max-w-[80%] ${message.isStaffReply ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-lg p-4 ${
                                message.isStaffReply
                                  ? 'bg-muted border border-border'
                                  : 'bg-primary text-primary-foreground'
                              }`}>
                                <div className="flex items-center space-x-2 mb-2">
                                  {message.isStaffReply ? (
                                    <>
                                      <Shield className="h-4 w-4" />
                                      <span className="text-sm font-medium">
                                        {message.authorName}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <User className="h-4 w-4" />
                                      <span className="text-sm font-medium">
                                        {message.authorName}
                                      </span>
                                    </>
                                  )}
                                  <span className="text-xs opacity-75">
                                    {formatTicketDate(message.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {message.authorEmail}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Admin Reply */}
                {ticket.status !== 'closed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Staff Reply</CardTitle>
                        <CardDescription>
                          Add a response to this ticket as a support team member.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...messageForm}>
                          <form onSubmit={messageForm.handleSubmit(handleAddMessage)} className="space-y-4">
                            <FormField
                              control={messageForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Message</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Type your response here..."
                                      className="min-h-[120px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={addMessageMutation.isPending}
                            >
                              {addMessageMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Reply
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Reopen Ticket (if closed) */}
                {ticket.status === 'closed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Ticket Closed</h3>
                          <p className="text-muted-foreground mb-4">
                            This ticket has been closed. You can reopen it if needed.
                          </p>
                          <Button onClick={handleReopenTicket} disabled={reopenTicketMutation.isPending}>
                            {reopenTicketMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Reopening...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reopen Ticket
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Ticket Management */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Manage Ticket</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(handleUpdateTicket)} className="space-y-4">
                          <FormField
                            control={updateForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={ticket.status}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="waiting_response">Waiting Response</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={updateForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={ticket.priority}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={updateTicketMutation.isPending}
                          >
                            {updateTicketMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Updating...
                              </>
                            ) : (
                              'Update Ticket'
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Ticket Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Ticket Number</p>
                          <p className="font-mono text-sm">{ticket.ticketNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Category</p>
                          <p className="text-sm">{getCategoryLabel(ticket.category)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Status</p>
                          <Badge className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Priority</p>
                          <Badge className={`${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} border`}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Message Count</p>
                          <p className="text-sm">{ticket.messages.length} messages</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}