'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/client';

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  updated_at: string;
}

export function useUserCredits(userId: string | undefined) {
  return useQuery({
    queryKey: ['credits', 'balance', userId ?? ''],
    queryFn: async (): Promise<UserCredits> => {
      const { data, error } = await (getSupabase() as any)
        .from('user_credits')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return {
          id: '',
          user_id: userId!,
          balance: 0,
          lifetime_earned: 0,
          updated_at: new Date().toISOString(),
        };
      }
      return data as UserCredits;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}
