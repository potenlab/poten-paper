'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SavedPlan {
  id: string;
  title: string;
  industry: string | null;
  status: string;
  created_at: string;
}

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
        <Link href="/poten-paper/new">
          <Button size="sm" className="gap-1.5" style={{ backgroundColor: '#0EA5E9' }}>
            <Plus className="w-4 h-4" />
            새로 만들기
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">아직 작성한 사업계획서가 없습니다.</p>
          <Link href="/poten-paper/new">
            <Button style={{ backgroundColor: '#0EA5E9' }} className="text-white">
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
