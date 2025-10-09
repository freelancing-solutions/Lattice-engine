import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.project-lattice.site';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Lattice Portal – Code Mutation Platform",
    template: "%s | Lattice Portal",
  },
  description:
    "Modern code mutation and approval system for teams. Secure workflows, real-time approvals, and AI-assisted development.",
  applicationName: "Lattice Portal",
  keywords: [
    "Lattice",
    "Lattice Portal",
    "Code Mutation",
    "AI development",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "Developer Platform",
  ],
  authors: [{ name: "Lattice Team" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxVideoPreview: -1,
      maxImagePreview: "large",
      maxSnippet: -1,
    },
  },
  openGraph: {
    title: "Lattice Portal",
    description:
      "AI-powered code mutation and approval platform for modern software teams",
    url: baseUrl,
    siteName: "Lattice Portal",
    type: "website",
    images: [
      {
        url: "/logo.svg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice Portal",
    description:
      "AI-powered code mutation and approval platform for modern software teams",
    images: ["/logo.svg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured data for the portal */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Lattice Portal',
              url: baseUrl,
              logo: `${baseUrl}/logo.svg`,
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Lattice Portal',
              url: baseUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${baseUrl}/dashboard?query={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
