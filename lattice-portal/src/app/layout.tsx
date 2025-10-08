import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lattice Engine - Code Mutation Platform",
  description: "Modern code mutation and approval system with AI-powered workflows. Built with Next.js, TypeScript, and Tailwind CSS.",
  keywords: ["Lattice", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Code Mutation", "AI development", "React"],
  authors: [{ name: "Lattice Team" }],
  openGraph: {
    title: "Lattice Engine",
    description: "AI-powered code mutation and approval platform",
    url: "https://lattice.dev",
    siteName: "Lattice",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lattice Engine",
    description: "AI-powered code mutation and approval platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
