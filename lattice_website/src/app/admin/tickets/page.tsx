"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getTicketStatusColor,
  getPriorityColor,
  getCategoryIcon,
  formatTicketDate,
  getStatusLabel,
  getPriorityLabel,
  getCategoryLabel
} from '@/lib/ticket-utils'
import { updateTicketStatusSchema } from '@/lib/validations/ticket'
import {
  Filter,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

interface SupportTicket {
  id: string
  ticketNumber: string
  category: string
  priority: string
  status: string
  subject: string
  userEmail: string
  userName?: string
  createdAt: string
  updatedAt: string
  _count: {
    messages: number
  }
}

interface TicketsResponse {
  tickets: SupportTicket[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function AdminTicketsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
    page: 1,
    limit: 20
  })
  const [activeTab, setActiveTab] = useState('all')

  // Fetch tickets
  const { data: ticketsData, isLoading, error, refetch } = useQuery<TicketsResponse>({
    queryKey: ['admin-tickets', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
      const response = await axios.get(`/api/support/tickets?${params}`)
      return response.data
    }
  })

  // Quick status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await axios.patch(`/api/support/tickets/${ticketId}`, { status })
      return response.data
    },
    onSuccess: () => {
      toast.success('Ticket status updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to update ticket status'
      toast.error(errorMessage)
    }
  })

  // Calculate statistics
  const stats = useQuery({
    queryKey: ['admin-ticket-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/support/tickets?limit=1000')
      const tickets = response.data.tickets
      return {
        total: tickets.length,
        open: tickets.filter((t: SupportTicket) => t.status === 'open').length,
        inProgress: tickets.filter((t: SupportTicket) => t.status === 'in_progress').length,
        waitingResponse: tickets.filter((t: SupportTicket) => t.status === 'waiting_response').length,
        resolved: tickets.filter((t: SupportTicket) => t.status === 'resolved').length,
        closed: tickets.filter((t: SupportTicket) => t.status === 'closed').length,
        urgent: tickets.filter((t: SupportTicket) => t.priority === 'urgent').length,
        high: tickets.filter((t: SupportTicket) => t.priority === 'high').length,
        today: tickets.filter((t: SupportTicket) => {
          const today = new Date().toDateString()
          return new Date(t.createdAt).toDateString() === today
        }).length
      }
    }
  })

  // Handle tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      setFilters(prev => ({ ...prev, status: '' }))
    } else {
      setFilters(prev => ({ ...prev, status: activeTab }))
    }
    setFilters(prev => ({ ...prev, page: 1 }))
  }, [activeTab])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.search])

  const handleQuickStatusUpdate = (ticketId: string, newStatus: string) => {
    updateStatusMutation.mutate({ ticketId, status: newStatus })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      search: '',
      page: 1,
      limit: 20
    })
    setActiveTab('all')
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 1 && v !== 20).length

  if (error) {
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
                <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
                <h1 className="text-3xl font-bold">Error Loading Tickets</h1>
                <p className="text-muted-foreground text-lg">
                  There was an error loading the support tickets. Please try again.
                </p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </motion.div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
              <p className="text-muted-foreground">
                Manage and respond to customer support requests
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          {stats.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.data.total}</p>
                      <p className="text-xs text-muted-foreground">Total Tickets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.data.open + stats.data.inProgress + stats.data.waitingResponse}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.data.resolved}</p>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{stats.data.today}</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search tickets..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    {activeFiltersCount > 0 && (
                      <Button variant="outline" onClick={clearFilters}>
                        <Filter className="h-4 w-4 mr-2" />
                        Clear ({activeFiltersCount})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="waiting_response">Waiting Response</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : ticketsData?.tickets?.length === 0 ? (
                      <div className="p-12 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                        <p className="text-muted-foreground">
                          {activeFiltersCount > 0
                            ? "No tickets match your current filters. Try adjusting your search criteria."
                            : "No support tickets have been created yet."
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ticket</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Messages</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ticketsData?.tickets?.map((ticket, index) => {
                              const CategoryIcon = getCategoryIcon(ticket.category)
                              const statusColors = getTicketStatusColor(ticket.status)
                              const priorityColors = getPriorityColor(ticket.priority)

                              return (
                                <TableRow key={ticket.id}>
                                  <TableCell>
                                    <div className="font-mono text-sm">{ticket.ticketNumber}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium truncate max-w-[200px]" title={ticket.subject}>
                                        {ticket.subject}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {ticket.userEmail}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{getCategoryLabel(ticket.category)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} border`}>
                                      {getPriorityLabel(ticket.priority)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={ticket.status}
                                      onValueChange={(value) => handleQuickStatusUpdate(ticket.id, value)}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <Badge className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                                          {getStatusLabel(ticket.status)}
                                        </Badge>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="waiting_response">Waiting Response</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{ticket._count.messages}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm text-muted-foreground">
                                      {formatTicketDate(ticket.createdAt)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button asChild size="sm" variant="outline">
                                      <a href={`/admin/tickets/${ticket.id}`}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </a>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pagination */}
                {ticketsData?.pagination && ticketsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {((ticketsData.pagination.page - 1) * ticketsData.pagination.limit) + 1} to{' '}
                      {Math.min(ticketsData.pagination.page * ticketsData.pagination.limit, ticketsData.pagination.total)} of{' '}
                      {ticketsData.pagination.total} tickets
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(ticketsData.pagination.page - 1)}
                        disabled={!ticketsData.pagination.hasPrev}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {ticketsData.pagination.page} of {ticketsData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(ticketsData.pagination.page + 1)}
                        disabled={!ticketsData.pagination.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}