"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Code,
  ArrowRight,
  Settings,
  BarChart3,
  TrendingUp,
  Shield,
  RefreshCw,
  Pause,
  Play,
  Info,
  ExternalLink,
  Activity,
  Gauge
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

const rateLimitTiers = [
  {
    tier: "Free",
    requests: "1,000",
    window: "per hour",
    burst: "100",
    price: "Free",
    features: [
      "Basic rate limiting",
      "Standard headers",
      "Community support",
      "Basic analytics"
    ],
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20"
  },
  {
    tier: "Pro",
    requests: "10,000",
    window: "per hour",
    burst: "500",
    price: "$29/month",
    features: [
      "Advanced rate limiting",
      "Priority headers",
      "Email support",
      "Detailed analytics",
      "Custom headers",
      "Burst handling"
    ],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    popular: true
  },
  {
    tier: "Enterprise",
    requests: "100,000+",
    window: "per hour",
    burst: "2,000",
    price: "Custom",
    features: [
      "Custom rate limits",
      "Dedicated infrastructure",
      "24/7 support",
      "Advanced analytics",
      "Custom headers",
      "Burst handling",
      "SLA guarantees",
      "Custom policies"
    ],
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  }
]

const rateLimitHeaders = [
  {
    header: "X-RateLimit-Limit",
    description: "The maximum number of requests allowed in the current window",
    example: "X-RateLimit-Limit: 1000",
    type: "Integer"
  },
  {
    header: "X-RateLimit-Remaining",
    description: "The number of requests remaining in the current window",
    example: "X-RateLimit-Remaining: 850",
    type: "Integer"
  },
  {
    header: "X-RateLimit-Reset",
    description: "The time when the current rate limit window resets (Unix timestamp)",
    example: "X-RateLimit-Reset: 1640995200",
    type: "Unix Timestamp"
  },
  {
    header: "X-RateLimit-Reset-After",
    description: "The number of seconds until the current rate limit window resets",
    example: "X-RateLimit-Reset-After: 3600",
    type: "Seconds"
  },
  {
    header: "Retry-After",
    description: "The number of seconds to wait before making another request (sent with 429 responses)",
    example: "Retry-After: 60",
    type: "Seconds"
  }
]

const implementationExamples = [
  {
    language: "JavaScript",
    code: `// Basic rate limiting implementation
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    this.requests.set(key, this.requests.get(key)?.filter(time => time > windowStart) || []);
    
    const keyRequests = this.requests.get(key);
    
    if (keyRequests.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }
    
    keyRequests.push(now);
    return true; // Request allowed
  }
  
  getRemaining(key) {
    const keyRequests = this.requests.get(key) || [];
    return Math.max(0, this.maxRequests - keyRequests.length);
  }
}

// Usage
const limiter = new RateLimiter(100, 3600000); // 100 requests per hour

if (limiter.isAllowed('user123')) {
  // Process request
} else {
  // Return 429 Too Many Requests
  console.log('Rate limit exceeded');
}`,
    description: "Basic rate limiting implementation in JavaScript"
  },
  {
    language: "Python",
    code: `import time
from collections import defaultdict, deque
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_requests=100, window_seconds=3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)
    
    def is_allowed(self, key):
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean old requests
        while (self.requests[key] and 
               self.requests[key][0] <= window_start):
            self.requests[key].popleft()
        
        if len(self.requests[key]) >= self.max_requests:
            return False
        
        self.requests[key].append(now)
        return True
    
    def get_remaining(self, key):
        return max(0, self.max_requests - len(self.requests[key]))
    
    def get_reset_time(self, key):
        if not self.requests[key]:
            return time.time() + self.window_seconds
        
        oldest_request = self.requests[key][0]
        reset_time = oldest_request + self.window_seconds
        return reset_time

# Usage example
limiter = RateLimiter(max_requests=100, window_seconds=3600)

if limiter.is_allowed('user123'):
    # Process request
    print(f"Remaining requests: {limiter.get_remaining('user123')}")
else:
    # Return rate limit error
    reset_time = limiter.get_reset_time('user123')
    retry_after = int(reset_time - time.time())
    print(f"Rate limit exceeded. Retry after {retry_after} seconds")`,
    description: "Rate limiting implementation in Python with sliding window"
  },
  {
    language: "Node.js (Express)",
    code: `const express = require('express');
const app = express();

// Simple rate limiting middleware
function rateLimit(maxRequests, windowMinutes) {
  const requests = new Map();
  const windowMs = windowMinutes * 60 * 1000;
  
  return (req, res, next) => {
    const key = req.ip; // Or use req.user.id for authenticated users
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    const keyRequests = requests.get(key) || [];
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      // Rate limit exceeded
      const oldestRequest = validRequests[0];
      const resetTime = oldestRequest + windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return res.status(429).json({
        error: 'Too many requests',
        retry_after: retryAfter,
        message: \`Rate limit exceeded. Try again in \${retryAfter} seconds.\`
      });
    }
    
    // Add current request
    validRequests.push(now);
    requests.set(key, validRequests);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - validRequests.length);
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
    
    next();
  };
}

// Apply rate limiting to all routes
app.use(rateLimit(100, 60)); // 100 requests per hour

// Or apply to specific routes
app.get('/api/data', rateLimit(50, 60), (req, res) => {
  res.json({ message: 'This endpoint is rate limited' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
    description: "Express.js middleware for rate limiting with headers"
  }
];

const burstHandling = [
  {
    title: "Token Bucket Algorithm",
    description: "Allows bursts while maintaining average rate limit",
    icon: Zap,
    color: "text-blue-500",
    details: [
      "Tokens are added at a fixed rate to a bucket",
      "Each request consumes a token",
      "Bucket has a maximum capacity (burst size)",
      "Allows short bursts when tokens are available"
    ]
  },
  {
    title: "Leaky Bucket Algorithm",
    description: "Smooths out request rate with consistent output",
    icon: Clock,
    color: "text-green-500",
    details: [
      "Requests are queued in a bucket",
      "Requests are processed at a fixed rate",
      "Bucket has a maximum capacity",
      "Provides consistent, predictable rate"
    ]
  },
  {
    title: "Sliding Window",
    description: "Flexible window that slides with time",
    icon: TrendingUp,
    color: "text-purple-500",
    details: [
      "Tracks exact request timestamps",
      "Window slides continuously with time",
      "More accurate than fixed windows",
      "Better handles traffic spikes"
    ]
  }
]

const monitoringStrategies = [
  {
    title: "Rate Limit Metrics",
    description: "Monitor key metrics to understand rate limit behavior",
    icon: BarChart3,
    color: "text-blue-500",
    metrics: [
      "Request rate per key/user",
      "Rate limit hit percentage",
      "Average response time",
      "Error rate (429 responses)",
      "Peak traffic periods"
    ]
  },
  {
    title: "Alerting",
    description: "Set up alerts for rate limit issues",
    icon: AlertTriangle,
    color: "text-orange-500",
    alerts: [
      "High rate limit hit rate (>10%)",
      "Unusual traffic patterns",
      "System approaching capacity",
      "Rate limit bypass attempts",
      "Configuration changes"
    ]
  },
  {
    title: "Analytics",
    description: "Analyze usage patterns and optimize limits",
    icon: Activity,
    color: "text-green-500",
    analytics: [
      "User behavior patterns",
      "API endpoint usage",
      "Geographic distribution",
      "Device/client analysis",
      "Performance correlation"
    ]
  }
]

export default function RateLimitingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-b border-orange-500/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="h-8 w-8 text-orange-50" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Rate Limiting
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Understand our rate limiting policies, implementation strategies, and best practices for managing API usage and preventing abuse.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="secondary" className="text-sm py-2 px-4">API Limits</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-orange-500 text-orange-500">Burst Handling</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-orange-500 text-orange-500">Headers</Badge>
                <Badge variant="outline" className="text-sm py-2 px-4 border-orange-500 text-orange-500">Monitoring</Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Rate Limit Tiers */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Rate Limit Tiers</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {rateLimitTiers.map((tier, index) => (
                    <motion.div
                      key={tier.tier}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className={`border-2 ${tier.borderColor} h-full relative`}>
                        {tier.popular && (
                          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
                            Most Popular
                          </Badge>
                        )}
                        <CardHeader className="text-center pb-4">
                          <div className={`w-12 h-12 ${tier.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                            <Zap className={`h-6 w-6 ${tier.color}`} />
                          </div>
                          <CardTitle className="text-xl text-foreground">{tier.tier}</CardTitle>
                          <div className="text-2xl font-bold text-foreground mt-2">{tier.price}</div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-foreground">{tier.requests}</div>
                            <div className="text-sm text-muted-foreground">{tier.window}</div>
                            <div className="text-sm text-muted-foreground mt-1">Burst: {tier.burst}</div>
                          </div>
                          <ul className="space-y-2">
                            {tier.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Rate Limit Headers */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Rate Limit Headers</h2>
                <p className="text-muted-foreground mb-8">
                  Our API includes comprehensive rate limit headers in all responses to help you manage your request rate effectively.
                </p>
                
                <div className="space-y-4">
                  {rateLimitHeaders.map((header, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-mono text-foreground">{header.header}</CardTitle>
                          <Badge variant="secondary">{header.type}</Badge>
                        </div>
                        <CardDescription>{header.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg border border-border">
                          <code className="text-sm font-mono text-foreground">{header.example}</code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Implementation Examples */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Implementation Examples</h2>
                
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="express">Express.js</TabsTrigger>
                  </TabsList>

                  {implementationExamples.map((example, index) => (
                    <TabsContent key={example.language} value={example.language.toLowerCase()} className="space-y-6">
                      <Card className="border-border">
                        <CardHeader>
                          <CardTitle className="text-lg text-foreground">{example.language} Implementation</CardTitle>
                          <CardDescription>{example.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-4 rounded-lg border border-border">
                            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">{example.code}</pre>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.section>

              {/* Burst Handling */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Burst Handling Algorithms</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {burstHandling.map((algorithm, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 ${algorithm.color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center`}>
                            <algorithm.icon className={`h-6 w-6 ${algorithm.color}`} />
                          </div>
                          <CardTitle className="text-lg text-foreground">{algorithm.title}</CardTitle>
                        </div>
                        <CardDescription>{algorithm.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {algorithm.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Monitoring and Analytics */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Monitoring & Analytics</h2>
                <div className="space-y-6">
                  {monitoringStrategies.map((strategy, index) => (
                    <Card key={index} className="border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-12 h-12 ${strategy.color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center`}>
                            <strategy.icon className={`h-6 w-6 ${strategy.color}`} />
                          </div>
                          <CardTitle className="text-lg text-foreground">{strategy.title}</CardTitle>
                        </div>
                        <CardDescription>{strategy.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(strategy).filter(([key]) => key !== 'title' && key !== 'description' && key !== 'icon' && key !== 'color').map(([category, items]) => (
                            <div key={category}>
                              <h4 className="font-semibold text-foreground mb-3 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                              <ul className="space-y-2">
                                {(items as string[]).map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Best Practices */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-foreground mb-8">Best Practices</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Client-Side Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Always check rate limit headers in responses</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Implement exponential backoff for retries</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Cache responses when appropriate</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Implement request queuing for burst scenarios</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Monitor your usage patterns proactively</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Server-Side Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Use appropriate algorithms for your use case</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Include comprehensive rate limit headers</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Implement proper error handling for 429 responses</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Monitor and adjust limits based on usage</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">Provide clear documentation and examples</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Links */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Link href="/docs/api-documentation" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        API Overview
                      </Link>
                      <Link href="/docs/api-documentation/authentication" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Shield className="h-4 w-4 mr-2" />
                        Authentication
                      </Link>
                      <Link href="/docs/api-documentation/endpoints" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        API Endpoints
                      </Link>
                      <Link href="/docs/api-documentation/webhooks" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Settings className="h-4 w-4 mr-2" />
                        Webhooks
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Limit Calculator */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Rate Limit Calculator</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Requests per hour</label>
                        <div className="text-2xl font-bold text-foreground">1,000</div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Requests per minute</label>
                        <div className="text-lg text-foreground">~16.7</div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Requests per second</label>
                        <div className="text-lg text-foreground">~0.28</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Help */}
                <Card className="border-border">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Experiencing rate limiting issues? Check our troubleshooting guide or contact support.
                    </p>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-500/90 text-white">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}