'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import type { IdeaValidationResult } from '@/lib/idea-validator/types';
import { IdeaResultView } from '../components/idea-result-view';
import { InsufficientCreditsModal } from '@/components/insufficient-credits-modal';
import { CREDIT_COSTS } from '@/lib/credits/constants';

const EXAMPLES = [
  '배달 라이더들이 쉴 곳이 없어서, 24시간 무료 쉼터를 지도로 찾고 예약할 수 있는 앱',
  '개발자가 자기 프로젝트를 포트폴리오로 쉽게 정리할 수 있는 플랫폼. GitHub 연동해서 자동 이력서 생성',
  '동네 단골 가게 사장님이 단골 손님에게 직접 쿠폰을 보내는 소상공인용 CRM',
  '대학생을 위한 시간표·과제·학점 통합 관리 앱. 수강편람 크롤링 + 친구와 겹치는 공강 시간 추천',
];

type Step = 'input' | 'analyzing' | 'result';

export default function IdeaValidatorNewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('input');
  const [ideaText, setIdeaText] = useState('');
  const [result, setResult] = useState<IdeaValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditModal, setCreditModal] = useState<{ balance: number; required: number } | null>(null);

  const handleAnalyze = async () => {
    const trimmed = ideaText.trim();
    if (!trimmed) return;

    if (!user) {
      router.push('/login?next=/idea-validator/new');
      return;
    }

    setStep('analyzing');
    setError(null);

    try {
      const response = await fetch('/api/idea-validator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaText: trimmed }),
      });

      if (response.status === 402) {
        const errData = await response.json().catch(() => ({}));
        setCreditModal({
          balance: errData.balance ?? 0,
          required: errData.required ?? CREDIT_COSTS.idea_validator,
        });
        setStep('input');
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '분석 실패');
      }

      const data = await response.json();
      const validated: IdeaValidationResult = {
        ...data.result,
        analyzed_at: new Date().toISOString(),
      };
      setResult(validated);
      setStep('result');

      // URL 을 결과 상세 경로로 업데이트 (히스토리 + 공유용)
      if (data.id) {
        window.history.replaceState(null, '', `/idea-validator/${data.id}`);
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('input');
    setResult(null);
    setError(null);
    window.history.replaceState(null, '', '/idea-validator/new');
  };

  return (
    <>
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
              아이디어 검증
            </span>
            <h1 className="text-2xl font-bold text-foreground mb-2">30초 안에 투자자 시각으로</h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              러프한 아이디어를 입력하면 AI가 시장성·수익성·실현가능성 등 5가지 지표로 빠르게 스크리닝하고 Blue/Red Team 피드백을 제공합니다.
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
                어떤 아이디어를 검증해볼까요?
              </label>
              <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="예: 배달 라이더들이 쉴 곳이 없어서..."
                rows={6}
                maxLength={2000}
                className="w-full rounded-xl border border-border bg-background p-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#0079FF] focus:ring-1 focus:ring-[#0079FF]/30 resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[12px] text-muted-foreground">{ideaText.length} / 2,000</span>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!ideaText.trim() || authLoading}
                className="w-full mt-5 h-[54px] rounded-xl bg-[#0079FF] text-white text-[15px] font-semibold hover:bg-[#0066DD] transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,121,255,0.3)]"
              >
                <Sparkles className="w-4 h-4" /> 아이디어 검증하기
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

      {step === 'analyzing' && (
        <motion.div
          key="analyzing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0079FF]/10 mb-6">
              <Loader2 className="w-8 h-8 text-[#0079FF] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">심사 중...</h2>
            <p className="text-[14px] text-muted-foreground">
              투자자 시각으로 아이디어를 평가하고 있어요. 약 5초 걸려요.
            </p>
          </section>
        </motion.div>
      )}

      {step === 'result' && result && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <IdeaResultView result={result} ideaText={ideaText} onReset={handleReset} />
        </motion.div>
      )}
    </AnimatePresence>

    <InsufficientCreditsModal
      open={!!creditModal}
      onClose={() => setCreditModal(null)}
      balance={creditModal?.balance ?? 0}
      required={creditModal?.required ?? CREDIT_COSTS.idea_validator}
      featureLabel="아이디어 검증"
    />
    </>
  );
}
