import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

export const metadata: Metadata = {
  title: "Blog - BugSage AI-Powered Debugging",
  description: "Insights, tutorials, and best practices for autonomous debugging and spec-driven development with BugSage.",
  openGraph: {
    title: "Blog - BugSage AI-Powered Debugging",
    description: "Insights, tutorials, and best practices for autonomous debugging and spec-driven development with BugSage.",
    type: "website",
  },
};

const blogPosts = [
  {
    id: 1,
    title: "Introduction to Autonomous Debugging",
    excerpt: "Learn how BugSage transforms the debugging process with AI-powered error analysis and automatic fix generation.",
    author: "Sarah Chen",
    date: "2024-10-15",
    readTime: "5 min read",
    category: "Getting Started",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    id: 2,
    title: "Project Lattice Integration Deep Dive",
    excerpt: "Explore the seamless integration between BugSage and Project Lattice's autonomous development ecosystem.",
    author: "Marcus Johnson",
    date: "2024-10-12",
    readTime: "8 min read",
    category: "Integration",
    gradient: "from-green-500 to-teal-600",
  },
  {
    id: 3,
    title: "Best Practices for Error-Driven Development",
    excerpt: "Discover how to leverage production errors as spec evolution opportunities in your development workflow.",
    author: "Dr. Elena Rodriguez",
    date: "2024-10-08",
    readTime: "6 min read",
    category: "Best Practices",
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: 4,
    title: "Building Safe Autonomous Systems",
    excerpt: "Understanding the safety mechanisms and human oversight patterns that make BugSage reliable for production use.",
    author: "Alex Kim",
    date: "2024-10-05",
    readTime: "10 min read",
    category: "Safety & Reliability",
    gradient: "from-purple-500 to-pink-600",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              BugSage Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Insights, tutorials, and best practices for autonomous debugging and spec-driven development
            </p>
          </motion.div>

          {/* Coming Soon Section */}
          <motion.div
            className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 mb-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Coming Soon
            </Badge>
            <h2 className="text-2xl font-semibold mb-4">
              Our Blog is Under Development
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're working hard to bring you valuable content about autonomous debugging,
              AI-powered development tools, and the future of spec-driven software engineering.
            </p>
            <Button variant="outline" disabled>
              Subscribe for Updates
            </Button>
          </motion.div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  {/* Featured Image */}
                  <div className={`h-48 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-6xl font-bold opacity-20">
                        {post.title.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-black">
                        {post.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <Button variant="outline" disabled className="w-full">
                      Read More
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Signup Section */}
          <motion.div
            className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get notified when we publish new articles about autonomous debugging,
              AI development tools, and spec-driven software engineering.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border bg-background"
                disabled
              />
              <Button disabled>
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              We'll notify you when our blog launches. No spam, unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}