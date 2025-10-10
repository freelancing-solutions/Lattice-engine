# 🐛 BugSage Marketing Website

A modern marketing website for BugSage - AI-powered debugging platform integrated with Project Lattice. Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Axios** - Promise-based HTTP client

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation Node.js and TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Features

- **🏠 Complete Marketing Site** - Homepage with hero, features, testimonials, and CTAs
- **📚 Comprehensive Pages** - Features, pricing, docs, how-it-works, lattice-integration, beta-signup
- **📝 Content Pages** - Blog, about, contact, support pages
- **⚖️ Legal Pages** - Privacy policy, terms of service, security, compliance
- **👥 Team Pages** - Careers and partners information
- **🎨 Interactive Demos** - Demo section with video preview and testimonials carousel
- **📱 Responsive Design** - Mobile-first design with smooth animations
- **🔒 SEO Optimized** - Meta tags, Open Graph, and search engine friendly
- **📊 Form Validation** - React Hook Form + Zod validation
- **🌈 Beautiful UI** - shadcn/ui components with Framer Motion animations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the BugSage website running.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── features/        # Features page
│   ├── pricing/         # Pricing page
│   ├── docs/           # Documentation hub
│   ├── how-it-works/   # How it works page
│   ├── lattice-integration/ # Lattice integration page
│   ├── beta-signup/    # Beta signup page
│   ├── blog/           # Blog page
│   ├── about/          # About page
│   ├── contact/        # Contact page
│   ├── support/        # Support page
│   ├── privacy/        # Privacy policy
│   ├── terms/          # Terms of service
│   ├── security/       # Security page
│   ├── compliance/     # Compliance page
│   ├── careers/        # Careers page
│   └── partners/       # Partners page
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   ├── navigation.tsx  # Navigation component
│   ├── footer.tsx      # Footer component
│   ├── hero-section.tsx # Hero section
│   ├── problem-solution.tsx # Problem/solution section
│   ├── features-grid.tsx # Features grid
│   ├── cta-section.tsx # CTA section
│   ├── testimonials-carousel.tsx # Testimonials carousel
│   ├── demo-section.tsx # Demo section
│   └── lattice-spotlight.tsx # Lattice integration spotlight
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Axios + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🛠️ Development

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Environment Variables
Copy `.env.example` to `.env.local` and configure your environment variables.

## 🚀 Deployment

This BugSage website is optimized for deployment on Vercel:

1. **Push to GitHub** - The site will automatically deploy on Vercel
2. **Configure Environment Variables** - Set up any required environment variables
3. **Custom Domain** - Configure your custom domain in Vercel settings

## 📄 License

This project is proprietary and owned by BugSage. All rights reserved.

---

Built with ❤️ for the BugSage team. 🐛
