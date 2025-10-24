import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  title: "Project Lattice Blog - Spec-Driven Development Insights",
  description: "Stay updated with the latest insights on spec-driven agentic development, unified orchestration, and AI coding agent best practices from the Project Lattice team.",
  keywords: [
    "Project Lattice blog",
    "spec-driven development",
    "agentic development",
    "AI coding agents",
    "unified orchestration",
    "development insights",
    "ecosystem tutorials",
    "success stories"
  ],
  openGraph: {
    title: "Project Lattice Blog - Spec-Driven Development Insights",
    description: "Stay updated with the latest insights on spec-driven agentic development, unified orchestration, and AI coding agent best practices.",
    type: "website",
    url: `${baseUrl}/blog`,
    images: [
      {
        url: `${baseUrl}/og-blog.png`,
        width: 1200,
        height: 630,
        alt: "Project Lattice Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Lattice Blog - Spec-Driven Development Insights",
    description: "Stay updated with the latest insights on spec-driven agentic development and unified orchestration.",
    images: [`${baseUrl}/twitter-blog.png`],
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}