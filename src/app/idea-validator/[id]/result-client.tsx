'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { IdeaValidationResult } from '@/lib/idea-validator/types';
import { IdeaResultView } from '../components/idea-result-view';

interface Props {
  resultId: string;
}

export function ResultClient({ resultId }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<IdeaValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResult = useCallback(async () => {
    if (!resultId || !user) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await (getSupabase() as any)
        .from('idea_validations')
        .select('*')
        .eq('id', resultId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setResult({
          summary: data.summary,
          scores: data.scores,
          overall_score: data.overall_score,
          blue_team: data.blue_team,
          red_team: data.red_team,
          improvement_tips: data.improvement_tips,
          analyzed_at: data.created_at,
        });
      } else {
        setError('결과를 찾을 수 없습니다.');
      }
    } catch {
      setError('결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [resultId, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?next=/idea-validator/${resultId}`);
      return;
    }
    if (resultId && user) {
      loadResult();
    }
  }, [resultId, user, authLoading, loadResult, router]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 text-center">
        <p className="text-muted-foreground mb-6">{error ?? '결과를 찾을 수 없습니다.'}</p>
        <button
          type="button"
          onClick={() => router.push('/idea-validator/new')}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-border bg-background text-foreground hover:bg-muted/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          새 아이디어 검증
        </button>
      </section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <IdeaResultView result={result} onReset={() => router.push('/idea-validator/new')} />
    </motion.div>
  );
}
