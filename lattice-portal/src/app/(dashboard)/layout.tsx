'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, getCurrentUser } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      getCurrentUser();
    }
  }, [isAuthenticated, router, getCurrentUser]);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}