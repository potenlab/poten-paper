'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { BmCanvasData } from '@/lib/poten-paper/types';
import { BmCanvas } from '@/app/poten-paper/new/components/visualizations/bm-canvas';

type Step = 'input' | 'generating' | 'result';

const EXAMPLES = [
  '대학생이 자기 전공·관심사와 맞는 기업을 구독형으로 추천받는 채용 매칭 서비스',
  '1인 창업가 대상 법인 설립부터 세무·노무까지 월정액 올인원 백오피스',
  '반려동물 건강 데이터를 기기로 수집해서 수의사 원격 상담으로 연결하는 헬스케어 플랫폼',
];

export default function BmCanvasNewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('input');
  const [ideaText, setIdeaText] = useState('');
  const [summary, setSummary] = useState('');
  const [canvas, setCanvas] = useState<BmCanvasData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const trimmed = ideaText.trim();
    if (!trimmed) return;

    if (!user) {
      router.push('/login?next=/bm-canvas/new');
      return;
    }

    setStep('generating');
    setError(null);

    try {
      const response = await fetch('/api/bm-canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaText: trimmed }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error || errData.details || `HTTP ${response.status}`;
        throw new Error(`생성 실패: ${msg}`);
      }

      const data = await response.json();
      setSummary(data.summary);
      setCanvas(data.canvas);
      setStep('result');
    } catch (err: any) {
      console.error('BM canvas error:', err);
      setError(err.message || '생성 중 오류가 발생했습니다.');
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('input');
    setSummary('');
    setCanvas(null);
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
              BM 캔버스
            </span>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              아이디어를 한 장의 비즈니스 모델로
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              사업 아이디어를 입력하면 AI 가 Osterwalder 9블록 비즈니스 모델 캔버스를
              작성합니다. 핵심 파트너부터 수익원까지 한눈에.
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
                placeholder="예: 대학생 전용 구독형 채용 매칭 서비스..."
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
                <Sparkles className="w-4 h-4" /> BM 캔버스 생성
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
            <h2 className="text-xl font-bold text-foreground mb-2">BM 캔버스 생성 중...</h2>
            <p className="text-[14px] text-muted-foreground">
              9블록을 AI 가 작성하고 있어요. 약 7초 걸립니다.
            </p>
          </section>
        </motion.div>
      )}

      {step === 'result' && canvas && (
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
                BM 캔버스 결과
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {summary}
              </h1>
            </section>

            <BmCanvas title="Business Model Canvas" data={canvas} />

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
