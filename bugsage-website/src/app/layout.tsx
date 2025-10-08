import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BugSage - AI-Powered Debugging for Project Lattice",
  description: "Fix production errors autonomously. AI-powered debugging that detects, diagnoses, and deploys fixes—automatically. Integrated with Project Lattice and Sentry for end-to-end error resolution.",
  keywords: ["BugSage", "AI debugging", "Project Lattice", "autonomous debugging", "error resolution", "Sentry", "VSCode", "spec-driven development"],
  authors: [{ name: "BugSage Team" }],
  openGraph: {
    title: "BugSage - AI-Powered Debugging",
    description: "Fix production errors autonomously with AI-powered debugging integrated with Project Lattice",
    url: "https://bugsage.site",
    siteName: "BugSage",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BugSage - AI-Powered Debugging",
    description: "Fix production errors autonomously with AI-powered debugging integrated with Project Lattice",
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
