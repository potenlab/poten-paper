'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { getQueryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase/client';

interface ProvidersProps {
  children: React.ReactNode;
}

function AuthQuerySync() {
  const queryClient = getQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        queryClient.invalidateQueries();
      }
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthQuerySync />
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
