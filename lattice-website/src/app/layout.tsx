import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/structured-data'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.project-lattice.site'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Lattice Engine - Advanced AI Infrastructure Platform',
    template: '%s | Lattice Engine',
  },
  description: 'Lattice Engine provides cutting-edge AI infrastructure solutions for modern applications. Build, deploy, and scale AI-powered systems with ease using our comprehensive platform.',
  keywords: [
    'AI infrastructure',
    'machine learning platform',
    'AI deployment',
    'artificial intelligence',
    'ML operations',
    'AI development',
    'cloud AI',
    'AI services',
    'neural networks',
    'deep learning',
  ],
  authors: [{ name: 'Lattice Engine Team', url: `${baseUrl}/team` }],
  creator: 'Lattice Engine',
  publisher: 'Lattice Engine',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Lattice Engine',
    title: 'Lattice Engine - Advanced AI Infrastructure Platform',
    description: 'Cutting-edge AI infrastructure solutions for modern applications. Build, deploy, and scale AI-powered systems with ease.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Lattice Engine - AI Infrastructure Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lattice Engine - Advanced AI Infrastructure Platform',
    description: 'Cutting-edge AI infrastructure solutions for modern applications. Build, deploy, and scale AI-powered systems with ease.',
    images: [`${baseUrl}/og-image.png`],
    creator: '@LatticeEngine',
    site: '@LatticeEngine',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'AI Infrastructure Platform',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationStructuredData />
        <WebsiteStructuredData />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
