'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface AdminPlanListItem {
  id: string;
  user_id: string;
  title: string;
  industry: string | null;
  business_stage: string | null;
  input_type: string;
  status: string;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
}

export interface PotenPaperAdminStats {
  total: number;
  completedCount: number;
  inProgressCount: number;
  todayCount: number;
}

const queryKeys = {
  all: ['admin', 'poten-paper'] as const,
  stats: () => [...queryKeys.all, 'stats'] as const,
  list: (search?: string) => [...queryKeys.all, 'list', search] as const,
};

async function fetchStats(): Promise<PotenPaperAdminStats> {
  const { count: total } = await supabase
    .from('business_plans')
    .select('*', { count: 'exact', head: true });

  const { count: completedCount } = await supabase
    .from('business_plans')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayCount } = await supabase
    .from('business_plans')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  return {
    total: total ?? 0,
    completedCount: completedCount ?? 0,
    inProgressCount: (total ?? 0) - (completedCount ?? 0),
    todayCount: todayCount ?? 0,
  };
}

async function fetchList(search?: string): Promise<AdminPlanListItem[]> {
  let query = supabase
    .from('business_plans')
    .select('id, user_id, title, industry, business_stage, input_type, status, created_at')
    .order('created_at', { ascending: false });

  if (search?.trim()) {
    const sanitized = search.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    query = query.or(`title.ilike."%${sanitized}%"`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const userIds = [...new Set((data || []).map((d) => d.user_id))];
  let profileMap: Record<string, { email: string | null; name: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    if (profiles) {
      for (const p of profiles) {
        profileMap[p.id] = { email: p.email, name: p.full_name };
      }
    }
  }

  return (data || []).map((item) => ({
    ...item,
    user_email: profileMap[item.user_id]?.email ?? null,
    user_name: profileMap[item.user_id]?.name ?? null,
  }));
}

export function usePotenPaperAdminStats() {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: fetchStats,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function usePotenPaperAdminList(search?: string) {
  return useQuery({
    queryKey: queryKeys.list(search),
    queryFn: () => fetchList(search),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useDeleteBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}
