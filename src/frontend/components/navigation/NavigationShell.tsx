// src/frontend/components/navigation/NavigationShell.tsx
'use client';

import { ReactNode } from 'react';
import { useMenu } from '@/frontend/hooks/useMenu';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Spinner } from '@/frontend/components/ui/Spinner';

export function NavigationShell({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMenu();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  const { tree = [], quickLinks = [], preferences } = data ?? {};
  const navMode = preferences?.navMode ?? 'sidebar';

  if (navMode === 'topbar') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Topbar tree={tree} preferences={preferences!} />
        <main className="flex-1 p-6 mt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar tree={tree} quickLinks={quickLinks} preferences={preferences!} />
      <main
        className="flex-1 overflow-auto p-6 transition-all duration-300"
        style={{
          marginLeft: preferences?.sidebarCollapsed ? 64 : (preferences?.sidebarWidth ?? 260),
        }}
      >
        {children}
      </main>
    </div>
  );
}