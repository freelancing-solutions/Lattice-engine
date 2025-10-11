import Script from 'next/script'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

interface StructuredDataProps {
  type: 'organization' | 'software' | 'website' | 'article' | 'breadcrumb'
  data?: any
}

export function StructuredData({ type, data = {} }: StructuredDataProps) {
  let schema = {}

  switch (type) {
    case 'organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Lattice Engine',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Advanced AI infrastructure platform for modern applications',
        foundingDate: '2024',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-555-0123',
          contactType: 'customer service',
          email: `support@project-lattice.site`,
          url: `${baseUrl}/contact`,
        },
        sameAs: [
          'https://twitter.com/LatticeEngine',
          'https://github.com/lattice-engine',
          'https://linkedin.com/company/lattice-engine',
        ],
        ...data,
      }
      break

    case 'software':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Lattice Engine',
        applicationCategory: 'AI Infrastructure Platform',
        operatingSystem: 'Cross-platform',
        description: 'Advanced AI infrastructure solutions for modern applications',
        url: baseUrl,
        downloadUrl: `${baseUrl}/download`,
        installUrl: `${baseUrl}/install`,
        screenshot: `${baseUrl}/screenshot.png`,
        softwareVersion: '1.0.0',
        datePublished: '2024-01-01',
        author: {
          '@type': 'Organization',
          name: 'Lattice Engine Team',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        ...data,
      }
      break

    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Lattice Engine',
        url: baseUrl,
        description: 'Advanced AI infrastructure platform for modern applications',
        publisher: {
          '@type': 'Organization',
          name: 'Lattice Engine',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      }
      break

    case 'article':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title || 'Lattice Engine Article',
        description: data.description || 'Article from Lattice Engine',
        author: {
          '@type': 'Organization',
          name: 'Lattice Engine Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Lattice Engine',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        },
        datePublished: data.publishedTime || new Date().toISOString(),
        dateModified: data.modifiedTime || new Date().toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url || baseUrl,
        },
        image: data.image || `${baseUrl}/og-image.png`,
        ...data,
      }
      break

    case 'breadcrumb':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items || [],
      }
      break

    default:
      return null
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Pre-built components for common structured data
export function OrganizationStructuredData() {
  return <StructuredData type="organization" />
}

export function WebsiteStructuredData() {
  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Lattice Engine',
          url: baseUrl,
          description: 'Advanced AI infrastructure platform for modern applications',
          publisher: {
            '@type': 'Organization',
            name: 'Lattice Engine',
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }),
      }}
    />
  )
}

export function SoftwareStructuredData() {
  return <StructuredData type="software" />
}

export function ArticleStructuredData(props: {
  title: string
  description: string
  url: string
  publishedTime?: string
  modifiedTime?: string
  image?: string
}) {
  return <StructuredData type="article" data={props} />
}

export function BreadcrumbStructuredData(props: { items: any[] }) {
  return <StructuredData type="breadcrumb" data={props} />
}