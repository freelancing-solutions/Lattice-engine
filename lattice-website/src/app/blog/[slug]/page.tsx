"use client"

import { Metadata } from "next"
import { useParams } from "next/navigation"
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
  Link2
} from "lucide-react"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Blog post data - in a real app, this would come from a CMS or database
const blogPosts = {
  "the-future-of-agentic-coding": {
    title: "The Future of Agentic Coding: How AI is Transforming Software Development",
    excerpt: "Discover how AI-powered agentic systems are revolutionizing the way we write, test, and deploy code. Learn about the latest advances in automated code generation and what it means for developers.",
    content: `
# The Future of Agentic Coding: How AI is Transforming Software Development

In the rapidly evolving landscape of software development, artificial intelligence has emerged as a transformative force, reshaping how we approach coding, testing, and deployment. The concept of "agentic coding" – where AI systems act as autonomous agents that can understand, write, and modify code – represents a paradigm shift that's redefining the developer experience.

## What is Agentic Coding?

Agentic coding refers to AI systems that can independently perform complex coding tasks, from understanding requirements to implementing solutions and even optimizing existing code. Unlike traditional code completion tools, agentic systems can:

- Understand high-level requirements and translate them into functional code
- Make architectural decisions based on best practices
- Refactor and optimize existing codebases
- Write comprehensive tests and documentation
- Collaborate with human developers in a meaningful way

## The Current State of AI-Powered Development

Today's AI coding assistants have made significant strides:

1. **Code Generation**: Tools like GitHub Copilot and ChatGPT can generate code snippets based on natural language descriptions
2. **Bug Detection**: AI systems can identify potential bugs and suggest fixes
3. **Code Review**: Automated tools can review code for style, security, and performance issues
4. **Documentation**: AI can generate and maintain technical documentation

However, these tools still operate primarily as assistants rather than autonomous agents.

## The Promise of True Agency

The next generation of agentic coding systems aims to provide:

### Autonomous Problem Solving
- Understanding complex business requirements
- Designing appropriate architectures
- Implementing complete features from scratch
- Making decisions about trade-offs and optimizations

### Continuous Learning and Adaptation
- Learning from codebases and coding patterns
- Adapting to team-specific conventions
- Staying updated with latest best practices
- Incorporating feedback from code reviews

### Collaborative Intelligence
- Working alongside human developers
- Handling routine and repetitive tasks
- Allowing developers to focus on creative problem-solving
- Providing suggestions and alternatives

## Challenges and Considerations

While the promise is exciting, several challenges remain:

### Technical Challenges
- Ensuring code quality and reliability
- Handling complex business logic
- Maintaining security and privacy
- Scaling to large enterprise applications

### Ethical Considerations
- Code ownership and attribution
- Job displacement concerns
- Bias in AI-generated code
- Transparency and explainability

### Integration Challenges
- Compatibility with existing workflows
- Learning curve for development teams
- Cost and resource requirements
- Regulatory and compliance issues

## The Road Ahead

The future of agentic coding will likely see:

1. **Hybrid Approaches**: Combining human creativity with AI efficiency
2. **Specialized Agents**: AI agents specialized for specific domains or technologies
3. **Improved Collaboration**: Better tools for human-AI pair programming
4. **Enhanced Trust**: More reliable and predictable AI behavior
5. **Ethical Frameworks**: Clear guidelines for responsible AI usage

## Preparing for the Future

To prepare for the agentic coding revolution:

1. **Focus on High-Level Thinking**: Develop skills in architecture, system design, and problem-solving
2. **Learn AI Collaboration**: Understand how to effectively work with AI tools
3. **Embrace Continuous Learning**: Stay updated with AI developments and best practices
4. **Develop Soft Skills**: Communication, creativity, and critical thinking become more valuable
5. **Understand Limitations**: Know when to rely on AI and when human intervention is crucial

## Conclusion

Agentic coding represents not just a technological advancement but a fundamental shift in how we approach software development. While challenges remain, the potential benefits in terms of productivity, code quality, and innovation are substantial.

The key to success will be finding the right balance between AI automation and human creativity, creating a symbiotic relationship that enhances rather than replaces human developers.

As we move forward, the developers who thrive will be those who embrace AI as a collaborative partner, focusing on the uniquely human aspects of software development while leveraging AI for routine and complex tasks alike.

The future of coding is here, and it's collaborative, intelligent, and full of possibilities.
    `,
    author: "Lattice Team",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Features",
    tags: ["AI", "Agentic Coding", "Future of Development", "Machine Learning"],
    relatedPosts: [
      "AI-Powered Code Mutations Explained",
      "Getting Started with Lattice Engine",
      "Building Scalable Specifications"
    ]
  },
  "getting-started-with-lattice-engine": {
    title: "Getting Started with Lattice Engine",
    excerpt: "A comprehensive guide to setting up your first project with Lattice Engine and understanding the core concepts of agentic coding.",
    content: `
# Getting Started with Lattice Engine

Welcome to Lattice Engine, the revolutionary platform that brings agentic coding to your development workflow. This comprehensive guide will walk you through everything you need to know to get started with your first project.

## What is Lattice Engine?

Lattice Engine is an AI-powered development platform that enables agentic coding – where AI agents can understand requirements, write code, and even refactor existing codebases. It combines the power of large language models with sophisticated code analysis and generation capabilities.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or higher installed
- A code editor (we recommend VS Code with our extension)
- Basic understanding of JavaScript/TypeScript
- A Lattice Engine account (sign up at [lattice.ai](https://lattice.ai))

## Installation

### 1. Install the CLI

\`\`\`bash
npm install -g @lattice/cli
\`\`\`

### 2. Initialize Your Project

\`\`\`bash
mkdir my-lattice-project
cd my-lattice-project
lattice init
\`\`\`

### 3. Install the VS Code Extension

Search for "Lattice Engine" in the VS Code marketplace and install the official extension.

## Your First Project

Let's create a simple web application to understand how Lattice Engine works.

### Step 1: Create a Specification

Lattice Engine works with specifications that describe what you want to build. Create a file called \`spec.md\`:

\`\`\`markdown
# Todo App Specification

## Overview
A simple todo application with the following features:
- Add new todos
- Mark todos as complete
- Delete todos
- Filter by status (all, active, completed)

## Technical Requirements
- Use React with TypeScript
- Use Tailwind CSS for styling
- Store data in localStorage
- Include proper TypeScript types
- Add unit tests

## UI Requirements
- Clean, modern interface
- Responsive design
- Smooth animations
- Accessibility features
\`\`\`

### Step 2: Generate the Application

Run the lattice generate command:

\`\`\`bash
lattice generate spec.md
\`\`\`

Lattice Engine will analyze your specification and generate a complete React application with all the requested features.

### Step 3: Review and Refine

The generated code will include:

- Component structure
- TypeScript types
- Styling with Tailwind
- Local storage integration
- Unit tests
- Documentation

Review the generated code and make any adjustments needed.

## Core Concepts

### Specifications

Specifications are the heart of Lattice Engine. They describe what you want to build in natural language, and the AI translates them into functional code.

### Agents

Lattice Engine uses specialized AI agents for different tasks:

- **Code Generation Agent**: Creates new code based on specifications
- **Refactoring Agent**: Improves existing code
- **Testing Agent**: Writes and maintains tests
- **Documentation Agent**: Generates and updates documentation

### Mutations

Mutations are changes to your codebase. Lattice Engine can:

- Add new features
- Fix bugs
- Refactor code
- Update dependencies
- Improve performance

## Best Practices

### Writing Effective Specifications

1. **Be Specific**: Clearly describe what you want
2. **Include Constraints**: Mention technical requirements
3. **Provide Context**: Explain the purpose and users
4. **Iterate**: Start simple and add complexity gradually

### Working with Generated Code

1. **Review Carefully**: Always review generated code
2. **Test Thoroughly**: Run tests and manual testing
3. **Customize as Needed**: Modify generated code to fit your needs
4. **Provide Feedback**: Help improve the AI with feedback

### Collaboration

1. **Version Control**: Use Git to track changes
2. **Code Reviews**: Review AI-generated code like human code
3. **Documentation**: Keep specifications updated
4. **Team Communication**: Share insights and learnings

## Advanced Features

### Custom Agents

You can create custom agents for specific tasks:

\`\`\`typescript
import { Agent } from '@lattice/sdk'

const customAgent = new Agent({
  name: 'Database Schema Agent',
  expertise: ['database design', 'SQL', 'migration'],
  instructions: 'Focus on creating efficient and scalable database schemas'
})
\`\`\`

### Integration with CI/CD

Lattice Engine integrates with popular CI/CD platforms:

\`\`\`yaml
# .github/workflows/lattice.yml
name: Lattice CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lattice Tests
        run: lattice test
      - name: Lattice Code Review
        run: lattice review
\`\`\`

### Monitoring and Analytics

Track your AI-assisted development:

\`\`\`bash
lattice analytics
lattice metrics
\`\`\`

## Troubleshooting

### Common Issues

1. **Generation Fails**: Check your specification for clarity
2. **Code Quality**: Review and refine generated code
3. **Performance**: Monitor and optimize as needed
4. **Integration**: Ensure proper setup with your tools

### Getting Help

- Check our [documentation](https://docs.lattice.ai)
- Join our [Discord community](https://discord.gg/lattice)
- Review [example projects](https://github.com/lattice-ai/examples)

## Next Steps

Now that you've got the basics, explore:

- Advanced specification techniques
- Custom agent development
- Integration with your existing workflow
- Team collaboration features
- Enterprise deployment options

## Conclusion

Lattice Engine represents a new paradigm in software development, where AI agents work alongside developers to create better software faster. By mastering the concepts and practices outlined in this guide, you'll be well-equipped to leverage the power of agentic coding in your projects.

Remember that Lattice Engine is a tool that enhances rather than replaces human developers. The most successful implementations combine AI efficiency with human creativity and judgment.

Happy coding with Lattice Engine!
    `,
    author: "Sarah Chen",
    date: "2024-01-12",
    readTime: "5 min read",
    category: "Tutorials",
    tags: ["Tutorial", "Getting Started", "Setup", "Basics"],
    relatedPosts: [
      "AI-Powered Code Mutations Explained",
      "Building Scalable Specifications",
      "VSCode Extension Deep Dive"
    ]
  }
}

// Generate metadata for the blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPosts[params.slug as keyof typeof blogPosts]

  if (!post) {
    return {
      title: "Post Not Found - Lattice Engine",
      description: "The requested blog post could not be found."
    }
  }

  return {
    title: `${post.title} - Lattice Engine`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: `/blog/${params.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`/blog/${params.slug}.jpg`],
    },
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = blogPosts[slug as keyof typeof blogPosts]

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
                <Link href="/blog">
                  <Button className="bg-purple-600 hover:bg-purple-700">
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
        <section className="py-16 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Link href="/blog" className="inline-flex items-center text-purple-200 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>

              <Badge className="mb-6 bg-purple-600">{post.category}</Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap justify-center items-center gap-6 text-purple-200">
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
                  <Badge key={index} variant="secondary" className="bg-purple-700 text-purple-100">
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
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-purple-600" />
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
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-purple-600 prose-pre:bg-gray-900 prose-pre:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                />

                <Separator className="my-12" />

                {/* Share Section */}
                <div className="bg-purple-50 rounded-lg p-8 mb-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Share this article</h3>
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Posts</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {post.relatedPosts.map((relatedTitle, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <h4 className="font-semibold text-gray-900 mb-2">{relatedTitle}</h4>
                            <p className="text-sm text-gray-600 mb-4">
                              Discover more about {relatedTitle.toLowerCase()} and how it can help your development workflow.
                            </p>
                            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}