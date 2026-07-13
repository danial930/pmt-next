// src/app/(dashboard)/layout.tsx
import { ReactNode } from 'react';
import { NavigationShell } from '@/frontend/components/navigation/NavigationShell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <NavigationShell>{children}</NavigationShell>;
}