"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createTicketSchema, type CreateTicketInput } from "@/lib/validations/ticket"
import { 
  MessageCircle, 
  Book, 
  Users, 
  Mail, 
  Send, 
  Search, 
  Clock, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  ExternalLink,
  Code,
  Terminal,
  Zap
} from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const supportCategories = [
  {
    icon: HelpCircle,
    title: "Getting Started",
    description: "New to Lattice? Start here with our beginner guides",
    articles: [
      "Quick Start Guide",
      "Installation Instructions", 
      "First Project Setup",
      "Basic Concepts"
    ]
  },
  {
    icon: Code,
    title: "API & SDK",
    description: "Documentation for our APIs and SDKs",
    articles: [
      "REST API Reference",
      "JavaScript SDK Guide",
      "Python SDK Guide",
      "Authentication"
    ]
  },
  {
    icon: Terminal,
    title: "VSCode Extension",
    description: "Help with our VSCode extension",
    articles: [
      "Installation & Setup",
      "Code Completion",
      "Debugging",
      "Common Issues"
    ]
  },
  {
    icon: Zap,
    title: "MCP Servers",
    description: "Model Context Protocol server documentation",
    articles: [
      "Server Configuration",
      "Real-time Sync",
      "Troubleshooting",
      "Best Practices"
    ]
  }
]

const popularArticles = [
  {
    title: "How to configure authentication",
    category: "API & SDK",
    views: "2.3k",
    helpful: "89%"
  },
  {
    title: "VSCode extension not connecting",
    category: "VSCode Extension", 
    views: "1.8k",
    helpful: "92%"
  },
  {
    title: "Mutation approval workflow",
    category: "Getting Started",
    views: "1.5k",
    helpful: "87%"
  },
  {
    title: "MCP server connection issues",
    category: "MCP Servers",
    views: "1.2k",
    helpful: "85%"
  }
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<string | null>(null)

  // React Hook Form setup with Zod validation
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: "",
      priority: "",
      subject: "",
      description: "",
      userEmail: "",
      userName: ""
    }
  })

  // API mutation for creating ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: CreateTicketInput) => {
      const response = await axios.post('/api/support/tickets', data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(`Ticket #${data.ticketNumber} created successfully! We'll respond within 24 hours.`)
      setSubmittedTicketNumber(data.ticketNumber)
      form.reset()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to create ticket. Please try again.'
      toast.error(errorMessage)
    }
  })

  const handleTicketSubmit = (data: CreateTicketInput) => {
    createTicketMutation.mutate(data)
  }

  const handleCreateAnotherTicket = () => {
    setSubmittedTicketNumber(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Help & Support
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to your questions or get in touch with our support team.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
            <Tabs defaultValue="help" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="help">Help Articles</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="track">Track Ticket</TabsTrigger>
                <TabsTrigger value="contact">Contact Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="help" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {supportCategories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                        <CardHeader>
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <category.icon className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                          </div>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {category.articles.map((article, articleIndex) => (
                              <li key={articleIndex}>
                                <a 
                                  href="#" 
                                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                                >
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  {article}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Popular Articles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Articles</CardTitle>
                    <CardDescription>Most viewed and helpful articles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {popularArticles.map((article, index) => (
                        <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-1">{article.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{article.category}</span>
                              <span>{article.views} views</span>
                              <span>{article.helpful} helpful</span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="community" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Community Forum
                      </CardTitle>
                      <CardDescription>
                        Get help from our community of developers and experts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Join thousands of developers sharing tips, best practices, and solutions.
                      </p>
                      <Button className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Visit Community Forum
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Discord Community
                      </CardTitle>
                      <CardDescription>
                        Real-time chat with the Lattice team and community
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Get instant help, share your work, and connect with other developers.
                      </p>
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Join Discord Server
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Blog & Tutorials
                      </CardTitle>
                      <CardDescription>
                        In-depth guides and latest updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Stay updated with the latest features, tutorials, and best practices.
                      </p>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Read Blog
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="track" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="h-5 w-5 mr-2" />
                      Track Your Ticket
                    </CardTitle>
                    <CardDescription>
                      Enter your ticket number to check the status and view conversation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ticketNumber">Ticket Number</Label>
                        <Input
                          id="ticketNumber"
                          placeholder="e.g., TICK-ABC123"
                          className="font-mono"
                        />
                      </div>
                      <Button className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Track Ticket
                      </Button>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Don't have a ticket number?{' '}
                          <button
                            onClick={() => {
                              const tabsElement = document.querySelector('[data-value="contact"]') as HTMLElement;
                              tabsElement?.click();
                            }}
                            className="text-primary hover:text-primary/80 underline"
                          >
                            Create a new ticket
                          </button>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Contact Support
                    </CardTitle>
                    <CardDescription>
                      Can't find what you're looking for? Submit a support ticket.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submittedTicketNumber ? (
                      // Success state
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                      >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Ticket Created Successfully!</h3>
                        <p className="text-muted-foreground mb-6">
                          Your ticket <span className="font-mono font-semibold">#{submittedTicketNumber}</span> has been created.
                          We'll respond within 24 hours.
                        </p>
                        <div className="space-y-3">
                          <Button
                            onClick={() => window.open(`/support/tickets/${submittedTicketNumber}`, '_blank')}
                            className="w-full"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Track Your Ticket
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCreateAnotherTicket}
                            className="w-full"
                          >
                            Create Another Ticket
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      // Form state
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleTicketSubmit)} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="userEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address *</FormLabel>
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
                            <FormField
                              control={form.control}
                              name="userName"
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
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="bug">Bug Report</SelectItem>
                                      <SelectItem value="feature">Feature Request</SelectItem>
                                      <SelectItem value="integration">Integration Help</SelectItem>
                                      <SelectItem value="billing">Billing Question</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority *</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="flex space-x-4 mt-2"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="low" id="low" />
                                        <Label htmlFor="low">Low</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="medium" id="medium" />
                                        <Label htmlFor="medium">Medium</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="high" id="high" />
                                        <Label htmlFor="high">High</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="urgent" id="urgent" />
                                        <Label htmlFor="urgent">Urgent</Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Brief description of your issue"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please provide detailed information about your issue..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Minimum 20 characters
                                </p>
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={createTicketMutation.isPending}
                          >
                            {createTicketMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Ticket
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                    <Book className="h-4 w-4 mr-2" />
                    Documentation
                  </a>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                    <Terminal className="h-4 w-4 mr-2" />
                    API Reference
                  </a>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                    <Users className="h-4 w-4 mr-2" />
                    Community Forum
                  </a>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Discord Server
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-foreground">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@lattice.dev</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Response Time</p>
                    <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Business Hours</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">All systems operational</span>
                </div>
                <a href="/status" className="text-sm text-primary hover:text-primary/80 mt-2 inline-block">
                  View detailed status →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}