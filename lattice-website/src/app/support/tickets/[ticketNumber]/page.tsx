"use client"

import { useParams } from 'next/navigation'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { addTicketMessageSchema, type AddTicketMessageInput } from '@/lib/validations/ticket'
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
  User,
  Shield,
  Mail
} from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function TicketTrackingPage() {
  const params = useParams()
  const ticketNumber = params.ticketNumber as string

  // Fetch ticket data
  const { data: ticketData, isLoading, error, refetch } = useQuery({
    queryKey: ['ticket', ticketNumber],
    queryFn: async () => {
      const response = await axios.get(`/api/support/tickets/${ticketNumber}`)
      return response.data.ticket as SupportTicket
    },
    enabled: !!ticketNumber
  })

  // Form for adding new messages
  const form = useForm<AddTicketMessageInput>({
    resolver: zodResolver(addTicketMessageSchema),
    defaultValues: {
      content: '',
      isStaffReply: false,
      authorName: '',
      authorEmail: ''
    }
  })

  // Mutation for adding messages
  const addMessageMutation = useMutation({
    mutationFn: async (data: AddTicketMessageInput) => {
      const response = await axios.post(`/api/support/tickets/${ticketNumber}/messages`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Message added successfully!')
      form.reset()
      refetch()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to add message. Please try again.'
      toast.error(errorMessage)
    }
  })

  const handleAddMessage = (data: AddTicketMessageInput) => {
    addMessageMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-12 w-64 mb-2" />
                <Skeleton className="h-6 w-96" />
              </div>
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-32 w-full" />
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
                  We couldn't find a ticket with number <span className="font-mono font-semibold">#{ticketNumber}</span>.
                  Please check the ticket number and try again.
                </p>
                <div className="space-y-3">
                  <Button asChild>
                    <a href="/support">Back to Support</a>
                  </Button>
                  <Button variant="outline" asChild className="block w-full">
                    <a href="/support">Create a New Ticket</a>
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
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Button variant="ghost" asChild className="mb-4">
                <a href="/support">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Support
                </a>
              </Button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

            {/* Ticket Details */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Subject and Category */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
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
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{ticket.userName || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{ticket.userEmail}</span>
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
                  transition={{ delay: 0.2 }}
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
                            transition={{ delay: 0.3 + index * 0.1 }}
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
                                        {message.authorName} (Support Team)
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
                              {!message.isStaffReply && (
                                <p className="text-xs text-muted-foreground mt-1 text-right">
                                  {message.authorEmail}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Add Reply (only if ticket is not closed) */}
                {ticket.status !== 'closed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Reply</CardTitle>
                        <CardDescription>
                          You can add a reply to this ticket. We'll respond as soon as possible.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleAddMessage)} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="authorName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="John Doe"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="authorEmail"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="your@email.com"
                                        type="email"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Message</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Type your message here..."
                                      className="min-h-[100px]"
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

                {/* Closed Ticket Message */}
                {ticket.status === 'closed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Ticket Closed</h3>
                          <p className="text-muted-foreground mb-4">
                            This ticket has been closed. If you need further assistance, please create a new ticket.
                          </p>
                          <Button asChild>
                            <a href="/support">Create New Ticket</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Current Status</p>
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created:</span>
                            <span>{formatTicketDate(ticket.createdAt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span>{formatTicketDate(ticket.updatedAt)}</span>
                          </div>
                          {ticket.resolvedAt && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Resolved:</span>
                              <span>{formatTicketDate(ticket.resolvedAt)}</span>
                            </div>
                          )}
                          {ticket.closedAt && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Closed:</span>
                              <span>{formatTicketDate(ticket.closedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Help */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          If you have questions about this ticket or need immediate assistance:
                        </p>
                        <Button variant="outline" className="w-full" asChild>
<a href="mailto:support@project-lattice.site">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Support
                          </a>
                        </Button>
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