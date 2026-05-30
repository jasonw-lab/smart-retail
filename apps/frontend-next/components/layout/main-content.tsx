'use client';

import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

interface MainContentProps {
  user?: {
    username: string;
    nickname?: string;
    avatar?: string;
  };
  children: React.ReactNode;
}

export function MainContent({ user, children }: MainContentProps) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div
      className={cn(
        'flex flex-1 flex-col overflow-hidden transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}
    >
      <Header user={user} />
      <main className="flex-1 overflow-auto p-4 space-y-4">{children}</main>
    </div>
  );
}
