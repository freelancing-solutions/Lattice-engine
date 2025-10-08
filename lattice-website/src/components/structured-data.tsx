import Script from "next/script";

interface StructuredDataProps {
  type: "organization" | "software" | "website" | "article" | "breadcrumb";
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = "https://www.project-lattice.site";
    
    switch (type) {
      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lattice Engine",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "description": "AI-powered development platform with intelligent code mutation and living specifications",
          "foundingDate": "2024",
          "sameAs": [
            "https://twitter.com/lattice_engine",
            "https://github.com/lattice-engine",
            "https://linkedin.com/company/lattice-engine"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@project-lattice.site"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
          }
        };

      case "software":
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Lattice Engine",
          "description": "AI-powered development platform with intelligent code mutation, living specifications, and real-time collaboration",
          "url": baseUrl,
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": ["Windows", "macOS", "Linux"],
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Lattice Engine",
            "url": baseUrl
          },
          "softwareVersion": "1.0.0",
          "releaseNotes": "Initial release with AI-powered code mutation and living specifications",
          "screenshot": `${baseUrl}/screenshot.png`,
          "downloadUrl": "https://marketplace.visualstudio.com/items?itemName=lattice-engine.vscode-extension",
          "installUrl": "https://marketplace.visualstudio.com/items?itemName=lattice-engine.vscode-extension",
          "softwareRequirements": "Visual Studio Code",
          "memoryRequirements": "512MB",
          "storageRequirements": "100MB",
          "processorRequirements": "x64"
        };

      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Lattice Engine",
          "url": baseUrl,
          "description": "AI-powered development platform with intelligent code mutation and living specifications",
          "publisher": {
            "@type": "Organization",
            "name": "Lattice Engine"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "Lattice Engine",
            "applicationCategory": "DeveloperApplication"
          }
        };

      case "article":
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data?.title || "Lattice Engine Documentation",
          "description": data?.description || "Learn how to use Lattice Engine's AI-powered development tools",
          "author": {
            "@type": "Organization",
            "name": "Lattice Engine Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Lattice Engine",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
            }
          },
          "datePublished": data?.publishedTime || new Date().toISOString(),
          "dateModified": data?.modifiedTime || new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data?.url ? `${baseUrl}${data.url}` : baseUrl
          },
          "image": data?.image ? `${baseUrl}${data.image}` : `${baseUrl}/og-image.png`,
          "articleSection": data?.section || "Documentation",
          "keywords": data?.keywords?.join(", ") || "AI development, code mutation, living specifications"
        };

      case "breadcrumb":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data?.breadcrumbs?.map((crumb: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": `${baseUrl}${crumb.url}`
          })) || []
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

// Pre-configured structured data components
export function OrganizationStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Lattice Engine",
    "url": "https://www.project-lattice.site",
    "logo": "https://www.project-lattice.site/logo.svg",
    "description": "AI-powered development platform for intelligent code generation, automated testing, and seamless deployment.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@project-lattice.site",
      "url": "https://www.project-lattice.site/contact"
    },
    "sameAs": [
      "https://twitter.com/lattice_engine",
      "https://github.com/lattice-engine",
      "https://linkedin.com/company/lattice-engine"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  );
}

export function SoftwareStructuredData() {
  return <StructuredData type="software" />;
}

export function WebsiteStructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Lattice Engine",
    "url": "https://www.project-lattice.site",
    "description": "AI-powered development platform for intelligent code generation, automated testing, and seamless deployment.",
    "publisher": {
      "@type": "Organization",
      "name": "Lattice Engine"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.project-lattice.site/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  );
}

export function ArticleStructuredData(props: {
  title?: string;
  description?: string;
  publishedTime?: string;
  modifiedTime?: string;
  url?: string;
  image?: string;
  section?: string;
  keywords?: string[];
}) {
  return <StructuredData type="article" data={props} />;
}

export function BreadcrumbStructuredData(props: {
  breadcrumbs: Array<{ name: string; url: string }>;
}) {
  return <StructuredData type="breadcrumb" data={props} />;
}