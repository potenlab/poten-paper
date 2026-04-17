'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { SwotData } from '@/lib/poten-paper/types';
import { SwotAnalysis } from '@/app/poten-paper/new/components/visualizations/swot-analysis';

type Step = 'input' | 'generating' | 'result';

const EXAMPLES = [
  '대학가 주변 건강한 밀프렙 도시락 구독 서비스',
  'AI 기반 자녀 독서 습관 추천 앱 (초등 저학년 타겟)',
  '프리랜서 디자이너를 위한 계약서·세무 자동화 SaaS',
];

export default function SwotNewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('input');
  const [ideaText, setIdeaText] = useState('');
  const [summary, setSummary] = useState('');
  const [data, setData] = useState<SwotData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const trimmed = ideaText.trim();
    if (!trimmed) return;

    if (!user) {
      router.push('/login?next=/swot/new');
      return;
    }

    setStep('generating');
    setError(null);

    try {
      const response = await fetch('/api/swot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaText: trimmed }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.details || errData.error || `HTTP ${response.status}`;
        throw new Error(`생성 실패: ${msg}`);
      }

      const res = await response.json();
      setSummary(res.summary);
      setData(res.data);
      setStep('result');
    } catch (err: any) {
      console.error('SWOT error:', err);
      setError(err.message || '생성 중 오류가 발생했습니다.');
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('input');
    setSummary('');
    setData(null);
    setError(null);
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'input' && (
        <motion.div
          key="input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <section className="max-w-[720px] mx-auto px-4 sm:px-8 pt-12 pb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0079FF]/10 text-[#0079FF] text-[13px] font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              SWOT 분석
            </span>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              강점·약점·기회·위협 한눈에
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              사업 아이디어의 내부 강약점과 외부 기회·위협을 AI 가 자동으로 분석합니다.
            </p>
          </section>

          <section className="max-w-[720px] mx-auto px-4 sm:px-8 pb-24">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-background p-6">
              <label className="block text-sm font-semibold text-foreground mb-3">
                사업 아이디어를 알려주세요
              </label>
              <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="예: 대학가 주변 건강한 밀프렙 도시락 구독 서비스..."
                rows={6}
                maxLength={2000}
                className="w-full rounded-xl border border-border bg-background p-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#0079FF] focus:ring-1 focus:ring-[#0079FF]/30 resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[12px] text-muted-foreground">{ideaText.length} / 2,000</span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!ideaText.trim() || authLoading}
                className="w-full mt-5 h-[54px] rounded-xl bg-[#0079FF] text-white text-[15px] font-semibold hover:bg-[#0066DD] transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,121,255,0.3)]"
              >
                <Sparkles className="w-4 h-4" /> SWOT 분석하기
              </button>
            </div>

            <div className="mt-6">
              <p className="text-[12px] text-muted-foreground mb-3 tracking-wider uppercase">Examples</p>
              <div className="space-y-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdeaText(ex)}
                    className="w-full text-left rounded-xl border border-border bg-background/50 px-4 py-3 text-[13px] text-muted-foreground hover:border-[#0079FF]/40 hover:bg-[#0079FF]/5 hover:text-foreground transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {step === 'generating' && (
        <motion.div
          key="generating"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0079FF]/10 mb-6">
              <Loader2 className="w-8 h-8 text-[#0079FF] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">SWOT 분석 중...</h2>
            <p className="text-[14px] text-muted-foreground">
              내·외부 요인을 AI 가 정리하고 있어요. 약 5초 걸립니다.
            </p>
          </section>
        </motion.div>
      )}

      {step === 'result' && data && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-[1156px] mx-auto px-4 sm:px-8 py-10">
            <section className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0079FF]/10 text-[#0079FF] text-[12px] font-semibold mb-3">
                <Sparkles className="w-3 h-3" />
                SWOT 분석 결과
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {summary}
              </h1>
            </section>

            <SwotAnalysis title="SWOT Analysis" data={data} />

            <section className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="h-[48px] px-6 rounded-xl bg-background border border-border text-foreground text-[14px] font-semibold hover:bg-muted/50 transition-all inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> 다른 아이디어로 생성
              </button>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
