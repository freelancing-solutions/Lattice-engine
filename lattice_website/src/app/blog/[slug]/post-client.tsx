"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  BookOpen,
  Share2,
  Heart,
  MessageCircle,
  Link2,
} from "lucide-react"
import Link from "next/link"

type Post = {
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  relatedPosts: string[]
}

export default function PostClient({
  post,
  slug,
  baseUrl,
}: {
  post: Post | null
  slug: string
  baseUrl: string
}) {
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                <p className="text-gray-600 mb-8">
                  The blog post you're looking for doesn't exist.
                </p>
                <Link href="/blog">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Article Header */}
        <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Link
                href="/blog"
                className="inline-flex items-center text-orange-200 hover:text-white mb-8 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>

              <Badge className="mb-6 bg-primary text-primary-foreground">{post.category}</Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap justify-center items-center gap-6 text-orange-200">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{post.readTime}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {post.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-orange-700 text-orange-100"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="prose prose-lg max-w-none"
              >
                <div className="bg-gray-50 rounded-lg p-8 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.author}</h3>
                        <p className="text-sm text-gray-600">Senior Developer Advocate</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-primary prose-pre:bg-gray-900 prose-pre:text-gray-100"
                  dangerouslySetInnerHTML={{
                    __html: post.content.replace(/\n/g, "<br />"),
                  }}
                />

                <Separator className="my-12" />

                {/* Share Section */}
                <div className="bg-orange-50 rounded-lg p-8 mb-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Share this article
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Discuss</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Link2 className="h-4 w-4" />
                      <span>Copy Link</span>
                    </Button>
                  </div>
                </div>

                {/* Related Posts */}
                {post.relatedPosts.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">
                      Related Posts
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {post.relatedPosts.map((relatedTitle, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {relatedTitle}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                              Discover more about {relatedTitle.toLowerCase()} and how it can help your development workflow.
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-orange-600"
                            >
                              Read More
                              <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Stay Updated with Lattice Engine
              </h2>
              <p className="text-gray-600 mb-8">
                Get the latest tutorials, updates, and insights delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Subscribe</Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}