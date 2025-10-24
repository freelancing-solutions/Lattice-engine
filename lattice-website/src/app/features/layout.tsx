import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ecosystem Components - Project Lattice',
  description: 'Explore the unified ecosystem of Project Lattice - six core components working together for spec-driven agentic development.',
  keywords: ['Project Lattice', 'ecosystem', 'spec-driven development', 'AI agents', 'unified orchestration', 'Mutation Engine', 'Portal', 'BugSage', 'VSCode Extension', 'CLI Tools', 'MCP Servers'],
  openGraph: {
    title: 'Ecosystem Components - Project Lattice',
    description: 'Explore the unified ecosystem of Project Lattice - six core components working together for spec-driven agentic development.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecosystem Components - Project Lattice',
    description: 'Explore the unified ecosystem of Project Lattice - six core components working together for spec-driven agentic development.',
  },
}


export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}