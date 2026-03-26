'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUserCredits } from '@/hooks/use-user-credits';
import { useActiveSubscription } from '@/hooks/use-subscription';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { getSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Trash2,
  Calendar,
  Loader2,
  Coins,
  Crown,
  Zap,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const BRAND_COLOR = '#0EA5E9';
const THE_POTENTIAL_URL = 'https://the-potential.co';

interface SavedPlan {
  id: string;
  title: string;
  industry: string | null;
  status: string;
  created_at: string;
}

// ── 크레딧 & 구독 상태 카드 ──

function StatusCards({ userId }: { userId: string }) {
  const { data: credits } = useUserCredits(userId);
  const { data: subscription, isLoading: subLoading } = useActiveSubscription(userId);
  const { isMember, remaining, limit, freeRemaining, freeLimit } =
    useFeatureAccess('poten_paper');

  const balance = credits?.balance ?? 0;
  const isSub = !!subscription;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* 구독 상태 */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: isSub ? `${BRAND_COLOR}15` : '#f3f4f6' }}
          >
            <Crown
              className="w-4 h-4"
              style={{ color: isSub ? BRAND_COLOR : '#9ca3af' }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">구독</span>
        </div>
        {subLoading ? (
          <div className="h-6 w-20 bg-muted/30 rounded animate-pulse" />
        ) : isSub ? (
          <>
            <p className="text-lg font-bold text-foreground capitalize">
              {subscription!.plan} 플랜
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(subscription!.expires_at)}까지
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-muted-foreground">미구독</p>
            <a
              href={`${THE_POTENTIAL_URL}/membership`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-1 hover:underline"
              style={{ color: BRAND_COLOR }}
            >
              구독하기 <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>

      {/* 크레딧 잔액 */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10">
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">크레딧</span>
        </div>
        <p className="text-lg font-bold text-foreground">
          {balance.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-1">C</span>
        </p>
        <a
          href={`${THE_POTENTIAL_URL}/mypage`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1 hover:underline"
        >
          더포텐셜에서 적립 <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 페이퍼 사용량 */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#8b5cf615' }}
          >
            <Zap className="w-4 h-4 text-violet-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">이용권</span>
        </div>
        {isMember ? (
          <>
            <p className="text-lg font-bold text-foreground">
              {remaining}
              <span className="text-sm font-normal text-muted-foreground">
                /{limit}회 남음
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">이번 결제 주기</p>
            {/* 프로그레스 바 */}
            <div className="mt-2 h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(remaining / limit) * 100}%`,
                  backgroundColor: BRAND_COLOR,
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-foreground">
              {freeRemaining}
              <span className="text-sm font-normal text-muted-foreground">
                /{freeLimit}회 남음
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">무료 체험</p>
            <div className="mt-2 h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(freeRemaining / freeLimit) * 100}%`,
                  backgroundColor: freeRemaining > 0 ? '#22c55e' : '#ef4444',
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──

export default function MyPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?next=/poten-paper/my');
      return;
    }

    async function fetchPlans() {
      const { data, error } = await getSupabase()
        .from('business_plans')
        .select('id, title, industry, status, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (!error && data) setPlans(data);
      setLoading(false);
    }

    fetchPlans();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(id);
    const { error } = await getSupabase()
      .from('business_plans')
      .delete()
      .eq('id', id);

    if (!error) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">내 사업계획서</h1>
      </div>

      {/* 크레딧 & 구독 & 사용량 */}
      {user && <StatusCards userId={user.id} />}

      {plans.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">아직 작성한 사업계획서가 없습니다.</p>
          <Link href="/poten-paper/new">
            <Button style={{ backgroundColor: BRAND_COLOR }} className="text-white">
              첫 사업계획서 만들기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <Link href={`/poten-paper/${plan.id}`} className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{plan.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {plan.industry && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {plan.industry}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(plan.created_at)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    plan.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {plan.status === 'completed' ? '완료' : '생성중'}
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(plan.id)}
                disabled={deleting === plan.id}
                className="text-muted-foreground hover:text-red-500 shrink-0 ml-2"
              >
                {deleting === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
