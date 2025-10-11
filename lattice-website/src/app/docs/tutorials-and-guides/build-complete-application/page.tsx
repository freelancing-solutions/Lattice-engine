"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Rocket,
  Users,
  GitBranch,
  Shield,
  Clock,
  PlayCircle,
  Download,
  Star,
  CheckCircle,
  ArrowRight,
  Code,
  Terminal,
  Zap,
  Globe,
  BarChart3,
  Settings,
  Lightbulb,
  Award,
  Target,
  Database,
  Server,
  Cloud,
  Wrench,
  Eye,
  RefreshCw,
  AlertCircle,
  Info,
  Check,
  Copy,
  ExternalLink,
  Folder,
  FileText,
  Package,
  Layers,
  Network,
  Activity,
  Zap as ZapIcon
} from "lucide-react"
import Link from "next/link"
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
// import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism/tomorrow"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const tutorialSteps = [
  {
    id: "introduction",
    title: "Introduction & Setup",
    duration: "15 min",
    icon: BookOpen,
    description: "Learn what we'll build and set up your development environment",
    topics: ["Project overview", "Prerequisites", "Environment setup", "Tool installation"]
  },
  {
    id: "architecture",
    title: "Application Architecture",
    duration: "20 min",
    icon: Layers,
    description: "Design the application architecture and understand Lattice Engine concepts",
    topics: ["Architecture design", "Component planning", "Data flow", "Lattice integration points"]
  },
  {
    id: "backend",
    title: "Build the Backend",
    duration: "45 min",
    icon: Server,
    description: "Create a robust backend API with database integration",
    topics: ["API design", "Database setup", "Authentication", "Business logic", "Error handling"]
  },
  {
    id: "frontend",
    title: "Create the Frontend",
    duration: "40 min",
    icon: Globe,
    description: "Build a modern React frontend with real-time features",
    topics: ["React setup", "Component architecture", "State management", "API integration", "Real-time updates"]
  },
  {
    id: "lattice-integration",
    title: "Integrate Lattice Engine",
    duration: "35 min",
    icon: ZapIcon,
    description: "Add Lattice Engine for intelligent code mutations and workflow automation",
    topics: ["Lattice setup", "Mutation configuration", "Workflow automation", "Code generation", "Review processes"]
  },
  {
    id: "testing",
    title: "Testing & Quality Assurance",
    duration: "25 min",
    icon: CheckCircle,
    description: "Implement comprehensive testing and quality checks",
    topics: ["Unit tests", "Integration tests", "E2E testing", "Code quality", "Performance testing"]
  },
  {
    id: "deployment",
    title: "Deploy to Production",
    duration: "30 min",
    icon: Cloud,
    description: "Deploy your application to production with CI/CD pipeline",
    topics: ["Production setup", "CI/CD configuration", "Monitoring", "Scaling", "Security hardening"]
  },
  {
    id: "optimization",
    title: "Optimize & Scale",
    duration: "20 min",
    icon: BarChart3,
    description: "Optimize performance and prepare for scale",
    topics: ["Performance optimization", "Caching strategies", "Database optimization", "Scaling techniques"]
  }
]

const codeExamples = {
  projectStructure: `project-root/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── lattice/
│   ├── config/
│   ├── workflows/
│   └── mutations/
├── docker-compose.yml
├── .github/workflows/
└── README.md`,

  backendSetup: `// backend/src/config/database.js
import { Sequelize } from 'sequelize';
import { config } from './config.js';

export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: 'postgres',
    logging: config.env === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// backend/src/models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
}, {
  timestamps: true,
  tableName: 'users'
});`,

  latticeConfig: `// lattice/config/lattice.config.js
export const latticeConfig = {
  engine: {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  mutations: {
    enabled: true,
    autoReview: true,
    riskAssessment: {
      enabled: true,
      thresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8
      }
    },
    categories: [
      'refactoring',
      'optimization',
      'security',
      'documentation',
      'testing'
    ]
  },
  workflows: {
    enabled: true,
    parallelExecution: true,
    timeout: {
      default: 300000, // 5 minutes
      maximum: 1800000 // 30 minutes
    }
  },
  security: {
    requireApproval: true,
    approvalChain: ['senior-developer', 'tech-lead'],
    auditLogging: true
  }
};`,

  frontendComponent: `// frontend/src/components/TaskManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskService } from '../services/TaskService';
import { useWebSocket } from '../hooks/useWebSocket';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  
  // Real-time updates via WebSocket
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    loadTasks();
    
    // Subscribe to task updates
    const unsubscribeFromUpdates = subscribe('task-updates', (data) => {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === data.taskId ? { ...task, ...data.updates } : task
        )
      );
    });

    return () => {
      unsubscribeFromUpdates();
    };
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await TaskService.getAllTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await TaskService.createTask({
        title: newTask,
        completed: false
      });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await TaskService.updateTask(taskId, {
        completed: !task.completed
      });
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Task Manager</h2>
        
        <form onSubmit={addTask} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>

        <AnimatePresence>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className={task.completed ? 'flex-1 line-through text-gray-500' : 'flex-1 text-gray-800'}>
                    {task.title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskManager;`,

  latticeWorkflow: `// lattice/workflows/code-review.workflow.js
import { WorkflowBuilder, ApprovalStage, RiskAssessment } from '@lattice-engine/core';

export const createCodeReviewWorkflow = () => {
  return new WorkflowBuilder('code-review-workflow')
    .start('code-submission')
    .then('automated-analysis', {
      handler: async (context) => {
        const analysis = await performAutomatedAnalysis(context.code);
        return {
          riskScore: analysis.riskScore,
          issues: analysis.issues,
          recommendations: analysis.recommendations
        };
      },
      timeout: '10m'
    })
    .branch('risk-assessment', {
      condition: (context) => context.analysis.riskScore < 0.7,
      truePath: 'human-review',
      falsePath: 'senior-review-required'
    })
    .stage('human-review', {
      type: ApprovalStage,
      approvers: ['senior-developer'],
      timeout: '24h',
      escalation: 'tech-lead'
    })
    .stage('senior-review-required', {
      type: ApprovalStage,
      approvers: ['tech-lead', 'architect'],
      timeout: '48h',
      escalation: 'cto'
    })
    .then('deployment-prep', {
      handler: async (context) => {
        await prepareDeployment(context);
        return { deploymentReady: true };
      }
    })
    .end('deployment-complete')
    .build();
};

async function performAutomatedAnalysis(code) {
  // Implement automated code analysis
  const riskAssessment = new RiskAssessment();
  return await riskAssessment.analyze(code);
}

async function prepareDeployment(context) {
  // Prepare application for deployment
  console.log('Preparing deployment...', context);
}`,

  deploymentConfig: `# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/appdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      - REACT_APP_API_URL=http://backend:3000
      - REACT_APP_WS_URL=ws://backend:3000
    depends_on:
      - backend

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  lattice:
    build: ./lattice
    ports:
      - "8080:8080"
    environment:
      - LATTICE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/latticedb
    depends_on:
      - db

volumes:
  postgres_data:`
}

export default function BuildCompleteApplicationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Rocket className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Build A Complete Application
                </h1>
              </div>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Learn how to build a full-stack application from scratch using Lattice Engine, 
                complete with backend API, modern frontend, real-time features, and intelligent automation.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge variant="outline" className="border-primary text-primary">
                  <Clock className="h-4 w-4 mr-1" />
                  4 Hours
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Intermediate
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  <Code className="h-4 w-4 mr-1" />
                  Full-Stack
                </Badge>
                <Badge variant="outline" className="border-primary text-primary">
                  <Zap className="h-4 w-4 mr-1" />
                  Real-time
                </Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Tutorial Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      {tutorialSteps.map((step, index) => (
                        <motion.a
                          key={step.id}
                          href={`#${step.id}`}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <step.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{step.title}</div>
                            <div className="text-xs text-muted-foreground">{step.duration}</div>
                          </div>
                        </motion.a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Quick Resources */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a href="#prerequisites" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Prerequisites
                      </a>
                      <a href="#source-code" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Code className="h-4 w-4 mr-2" />
                        Source Code
                      </a>
                      <a href="#deployment" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Cloud className="h-4 w-4 mr-2" />
                        Deployment Guide
                      </a>
                      <a href="#troubleshooting" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Troubleshooting
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Introduction Section */}
              <motion.section
                id="introduction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <Card className="border-border">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                        <BookOpen className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">What You'll Build</CardTitle>
                        <CardDescription>A complete task management application with real-time collaboration</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        In this comprehensive tutorial, you'll build a modern, full-stack task management application 
                        that demonstrates the full power of Lattice Engine. You'll create a React frontend with real-time 
                        updates, a Node.js backend API with database integration, and leverage Lattice Engine for 
                        intelligent code mutations and workflow automation.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Frontend Features</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Modern React with TypeScript</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Real-time task updates</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Responsive design with Tailwind CSS</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Drag-and-drop task management</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />User authentication</li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Backend Features</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />RESTful API with Express</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />PostgreSQL database</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />JWT authentication</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />WebSocket real-time communication</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />API rate limiting</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Lattice Engine Integration</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center"><Zap className="h-4 w-4 text-primary mr-2" />Intelligent code mutations</li>
                        <li className="flex items-center"><Zap className="h-4 w-4 text-primary mr-2" />Automated code review workflows</li>
                        <li className="flex items-center"><Zap className="h-4 w-4 text-primary mr-2" />Performance optimization suggestions</li>
                        <li className="flex items-center"><Zap className="h-4 w-4 text-primary mr-2" />Security vulnerability detection</li>
                        <li className="flex items-center"><Zap className="h-4 w-4 text-primary mr-2" />Documentation generation</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Prerequisites */}
              <motion.section
                id="prerequisites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-16"
              >
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-xl">Prerequisites</CardTitle>
                    <CardDescription>What you need to know before starting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Technical Requirements</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Node.js 18+ installed</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />PostgreSQL 12+</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Redis 6+</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Docker & Docker Compose</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Git for version control</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Knowledge Requirements</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />JavaScript/TypeScript fundamentals</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />React basics</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />REST API concepts</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Database basics</li>
                          <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Command line familiarity</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Step-by-Step Tutorial */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-16"
              >
                {tutorialSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    id={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="border-border">
                      <CardHeader>
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                            <step.icon className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{step.title}</CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                          </div>
                          <Badge variant="outline" className="ml-auto border-primary text-primary">
                            <Clock className="h-4 w-4 mr-1" />
                            {step.duration}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">What You'll Learn</h4>
                            <ul className="space-y-2">
                              {step.topics.map((topic, topicIndex) => (
                                <motion.li
                                  key={topicIndex}
                                  className="flex items-center text-sm text-muted-foreground"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: topicIndex * 0.05 }}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  {topic}
                                </motion.li>
                              ))}
                            </ul>
                          </div>

                          {/* Code Examples for specific steps */}
                          {step.id === "architecture" && (
                            <div className="bg-muted rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-foreground">Project Structure</h5>
                                <Button size="sm" variant="ghost" className="text-xs">
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                <code>{codeExamples.projectStructure}</code>
                              </pre>
                            </div>
                          )}

                          {step.id === "backend" && (
                            <div className="space-y-4">
                              <div className="bg-muted rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-foreground">Database Configuration</h5>
                                  <Button size="sm" variant="ghost" className="text-xs">
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                  <code>{codeExamples.backendSetup}</code>
                                </pre>
                              </div>
                            </div>
                          )}

                          {step.id === "frontend" && (
                            <div className="bg-muted rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-foreground">React Task Manager Component</h5>
                                <Button size="sm" variant="ghost" className="text-xs">
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                <code>{codeExamples.frontendComponent}</code>
                              </pre>
                            </div>
                          )}

                          {step.id === "lattice-integration" && (
                            <div className="space-y-4">
                              <div className="bg-muted rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-foreground">Lattice Configuration</h5>
                                  <Button size="sm" variant="ghost" className="text-xs">
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                  <code>{codeExamples.latticeConfig}</code>
                                </pre>
                              </div>
                              <div className="bg-muted rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-foreground">Code Review Workflow</h5>
                                  <Button size="sm" variant="ghost" className="text-xs">
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                  <code>{codeExamples.latticeWorkflow}</code>
                                </pre>
                              </div>
                            </div>
                          )}

                          {step.id === "deployment" && (
                            <div className="bg-muted rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-foreground">Docker Compose Configuration</h5>
                                <Button size="sm" variant="ghost" className="text-xs">
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                <code>{codeExamples.deploymentConfig}</code>
                              </pre>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            {index > 0 && (
                              <Button variant="outline" size="sm">
                                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                                Previous
                              </Button>
                            )}
                            {index < tutorialSteps.length - 1 && (
                              <Button className="ml-auto" size="sm">
                                Next Step
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.section>

              {/* Summary and Next Steps */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-16"
              >
                <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                        <Award className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Congratulations!</CardTitle>
                        <CardDescription>You've built a complete application with Lattice Engine</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-muted-foreground leading-relaxed">
                        You've successfully built a modern, full-stack application that demonstrates the power of 
                        Lattice Engine. Your application includes a robust backend API, a responsive React frontend, 
                        real-time features, and intelligent automation through Lattice Engine.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">What You've Achieved</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Full-stack application architecture</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Database design and integration</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Real-time communication</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Lattice Engine integration</li>
                            <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Production deployment</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Next Steps</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center"><ArrowRight className="h-4 w-4 text-primary mr-2" />Add more advanced features</li>
                            <li className="flex items-center"><ArrowRight className="h-4 w-4 text-primary mr-2" />Implement user roles and permissions</li>
                            <li className="flex items-center"><ArrowRight className="h-4 w-4 text-primary mr-2" />Add file upload capabilities</li>
                            <li className="flex items-center"><ArrowRight className="h-4 w-4 text-primary mr-2" />Implement advanced search</li>
                            <li className="flex items-center"><ArrowRight className="h-4 w-4 text-primary mr-2" />Add mobile responsiveness</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Download className="h-4 w-4 mr-2" />
                          Download Source Code
                        </Button>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Live Demo
                        </Button>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Read Advanced Guide
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}