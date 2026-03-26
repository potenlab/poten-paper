'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { useActiveSubscription } from '@/hooks/use-subscription';

export type FeatureType = 'poten_paper' | 'poten_checker';

const FEATURE_LIMITS: Record<FeatureType, { memberLimit: number; freeLimit: number; singlePrice: number; label: string }> = {
  poten_paper: { memberLimit: 5, freeLimit: 1, singlePrice: 2_990, label: '포텐페이퍼' },
  poten_checker: { memberLimit: 10, freeLimit: 1, singlePrice: 1_990, label: '포텐체커' },
};

function getBillingCycleStart(startedAt: string): Date {
  const startDay = new Date(startedAt).getDate();
  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), startDay);
  if (cycleStart > now) {
    cycleStart.setMonth(cycleStart.getMonth() - 1);
  }
  return cycleStart;
}

async function fetchUsageCount(userId: string, feature: FeatureType, since: string): Promise<number> {
  const { count, error } = await (getSupabase() as any)
    .from('feature_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', since);

  if (error) throw error;
  return count ?? 0;
}

async function fetchTotalUsageCount(userId: string, feature: FeatureType): Promise<number> {
  const { count, error } = await (getSupabase() as any)
    .from('feature_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature);

  if (error) throw error;
  return count ?? 0;
}

export function useFeatureAccess(feature: FeatureType) {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: subscription, isLoading: subLoading } = useActiveSubscription(userId);

  const isMember = !!subscription;
  const config = FEATURE_LIMITS[feature];

  const cycleStart = subscription
    ? getBillingCycleStart(subscription.started_at).toISOString()
    : null;

  const { data: usageCount = 0, isLoading: usageLoading } = useQuery({
    queryKey: ['feature-usage', userId, feature, cycleStart],
    queryFn: () => fetchUsageCount(userId!, feature, cycleStart!),
    enabled: !!userId && isMember && !!cycleStart,
    staleTime: 30_000,
  });

  const { data: totalUsageCount = 0, isLoading: totalLoading } = useQuery({
    queryKey: ['feature-usage-total', userId, feature],
    queryFn: () => fetchTotalUsageCount(userId!, feature),
    enabled: !!userId && !isMember && !subLoading,
    staleTime: 30_000,
  });

  const limit = config.memberLimit;
  const remaining = Math.max(0, limit - usageCount);

  const freeLimit = config.freeLimit;
  const freeRemaining = Math.max(0, freeLimit - totalUsageCount);
  const isTrial = !isMember && freeRemaining > 0;

  const canUse = isMember ? remaining > 0 : isTrial;
  const loading = subLoading || usageLoading || (!isMember && totalLoading);

  return {
    isMember,
    isTrial,
    usageCount,
    limit,
    remaining,
    freeLimit,
    freeRemaining,
    canUse,
    singlePrice: config.singlePrice,
    label: config.label,
    loading,
  };
}
