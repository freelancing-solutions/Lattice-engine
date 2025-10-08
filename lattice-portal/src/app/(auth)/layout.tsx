'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, getCurrentUser } = useAuthStore();
  const { setTheme } = useUIStore();

  useEffect(() => {
    // Initialize theme
    setTheme('system');
    
    // Check if user is already authenticated
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      // Try to get current user if tokens exist
      getCurrentUser();
    }
  }, [isAuthenticated, getCurrentUser, setTheme]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}