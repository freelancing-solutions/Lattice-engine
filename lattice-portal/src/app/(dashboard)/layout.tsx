'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageLoading } from '@/components/loading-states';
import { PerformanceMonitor } from '@/components/performance-monitor';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <PageLoading message="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main 
            className={`flex-1 overflow-auto p-6 transition-all duration-300 ${
              sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
        <PerformanceMonitor />
      </div>
    </ErrorBoundary>
  );
}