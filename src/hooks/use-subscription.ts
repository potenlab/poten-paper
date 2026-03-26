'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/client';

export type PlanId = 'free' | 'basic' | 'standard';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  amount: number;
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useActiveSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: ['subscriptions', 'active', userId ?? ''],
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await (getSupabase() as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId!)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
