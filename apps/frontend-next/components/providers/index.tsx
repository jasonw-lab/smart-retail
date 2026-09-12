'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';
import { DevAutoReload } from '@/components/dev-auto-reload';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
        {process.env.NODE_ENV === 'development' && <DevAutoReload />}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryProvider>
  );
}
