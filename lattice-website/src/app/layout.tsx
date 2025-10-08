import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/structured-data";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lattice Engine - AI-Powered Development Platform",
    template: "%s | Lattice Engine"
  },
  description: "Transform your development workflow with Lattice Engine's AI-powered mutation system. Seamlessly integrate living specifications, real-time collaboration, and intelligent code evolution into your projects.",
  keywords: [
    "Lattice Engine",
    "AI development",
    "code mutation",
    "living specifications", 
    "VSCode extension",
    "MCP servers",
    "real-time collaboration",
    "intelligent coding",
    "development platform",
    "code evolution",
    "software engineering",
    "developer tools"
  ],
  authors: [{ name: "Lattice Engine Team", url: "https://www.project-lattice.site" }],
  creator: "Lattice Engine",
  publisher: "Lattice Engine",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.project-lattice.site",
    siteName: "Lattice Engine",
    title: "Lattice Engine - AI-Powered Development Platform",
    description: "Transform your development workflow with AI-powered mutation system, living specifications, and real-time collaboration.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lattice Engine - AI-Powered Development Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice Engine - AI-Powered Development Platform",
    description: "Transform your development workflow with AI-powered mutation system, living specifications, and real-time collaboration.",
    images: ["/twitter-image.png"],
    creator: "@lattice_engine",
    site: "@lattice_engine",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#f48120" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://www.project-lattice.site",
  },
  category: "technology",
  classification: "Software Development Tools",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.project-lattice.site"),
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
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
        <OrganizationStructuredData />
        <WebsiteStructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
