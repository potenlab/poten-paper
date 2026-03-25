'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { DiagnosisResult } from '@/lib/poten-checker/types';
import { DiagnosisResultView } from '../../components/diagnosis-result-view';

interface ResultClientProps {
  resultId: string;
}

export function ResultClient({ resultId }: ResultClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resultId && user) {
      loadResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId, user]);

  const loadResult = async () => {
    if (!resultId || !user) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await getSupabase()
        .from('poten_diagnoses')
        .select('result')
        .eq('id', resultId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (data?.result) {
        setResult(data.result as unknown as DiagnosisResult);
      } else {
        setError('결과를 찾을 수 없습니다.');
      }
    } catch {
      setError('결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted">로딩 중...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 text-center">
        <p className="text-muted mb-6">{error}</p>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          홈으로 돌아가기
        </Button>
      </section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <DiagnosisResultView result={result}>
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="h-12 px-6 rounded-xl gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              홈으로
            </Button>
            <Button
              onClick={() => router.push('/poten-checker/new')}
              className="h-12 px-6 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              새 분석
            </Button>
          </div>
        </DiagnosisResultView>
      </section>
    </motion.div>
  );
}
