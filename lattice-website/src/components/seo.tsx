import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOProps): Metadata {
  const baseUrl = "https://lattice-engine.dev";
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImage = image ? `${baseUrl}${image}` : `${baseUrl}/og-image.png`;
  const twitterImage = image ? `${baseUrl}${image}` : `${baseUrl}/twitter-image.png`;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title: title || "Lattice Engine - AI-Powered Development Platform",
      description: description || "Transform your development workflow with AI-powered mutation system and living specifications.",
      url: fullUrl,
      siteName: "Lattice Engine",
      type,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || "Lattice Engine",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title || "Lattice Engine - AI-Powered Development Platform",
      description: description || "Transform your development workflow with AI-powered mutation system and living specifications.",
      images: [twitterImage],
      creator: "@lattice_engine",
      site: "@lattice_engine",
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  // Add article-specific metadata
  if (type === "article") {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    };
  }

  return metadata;
}

// Common SEO configurations for different page types
export const seoConfigs = {
  home: {
    title: "Home",
    description: "Discover Lattice Engine's AI-powered development platform. Experience living specifications, intelligent code mutation, and seamless collaboration that transforms how you build software.",
    keywords: [
      "AI development platform",
      "intelligent coding",
      "code mutation",
      "living specifications",
      "developer productivity",
      "software engineering",
      "VSCode integration",
      "real-time collaboration"
    ],
    image: "/og-home.png",
    url: "/",
  },
  status: {
    title: "System Status",
    description: "Real-time status of Lattice Engine services, API endpoints, and infrastructure. Monitor system health, uptime, and performance metrics.",
    keywords: [
      "system status",
      "service health",
      "uptime monitoring",
      "API status",
      "infrastructure monitoring",
      "Lattice Engine status",
      "service availability",
      "performance metrics"
    ],
    image: "/og-status.png",
    url: "/status",
  },
  docs: {
    title: "Documentation",
    description: "Comprehensive documentation for Lattice Engine. Learn how to integrate AI-powered development tools, set up living specifications, and maximize your productivity.",
    keywords: [
      "documentation",
      "developer guide",
      "API reference",
      "tutorials",
      "integration guide",
      "Lattice Engine docs",
      "setup instructions",
      "best practices"
    ],
    image: "/og-docs.png",
    url: "/docs",
  },
  features: {
    title: "Features",
    description: "Explore Lattice Engine's powerful features: AI-powered code mutation, living specifications, real-time collaboration, and seamless VSCode integration.",
    keywords: [
      "features",
      "AI code mutation",
      "living specifications",
      "real-time collaboration",
      "VSCode extension",
      "MCP servers",
      "intelligent development",
      "code evolution"
    ],
    image: "/og-features.png",
    url: "/features",
  },
  pricing: {
    title: "Pricing",
    description: "Choose the perfect Lattice Engine plan for your development needs. From individual developers to enterprise teams, find flexible pricing options.",
    keywords: [
      "pricing",
      "plans",
      "subscription",
      "enterprise",
      "developer tools pricing",
      "team collaboration",
      "professional development",
      "enterprise solutions"
    ],
    image: "/og-pricing.png",
    url: "/pricing",
  },
};