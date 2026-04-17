'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import type { CheckerStep, DiagnosisResult } from '@/lib/poten-checker/types';
import { extractTextFromFile } from '@/lib/poten-checker/utils';
import { StepInput } from './components/step-input';
import { StepAnalyzing } from './components/step-analyzing';
import { StepResult } from './components/step-result';
import { InsufficientCreditsModal } from '@/components/insufficient-credits-modal';
import { CREDIT_COSTS } from '@/lib/credits/constants';

export default function PotenCheckerNewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<CheckerStep>('input');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditModal, setCreditModal] = useState<{ balance: number; required: number } | null>(null);

  const saveDiagnosis = async (diagnosisResult: DiagnosisResult) => {
    try {
      await getSupabase().from('poten_diagnoses').insert({
        user_id: user?.id ?? '',
        user_email: user?.email || '',
        user_name: '',
        user_phone: '',
        file_name: diagnosisResult.fileName,
        overall_score: Math.round(diagnosisResult.overallScore),
        mode: 'standard',
        result: diagnosisResult as any,
      });
    } catch (err) {
      console.warn('Failed to save diagnosis (non-blocking):', err);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    // Auth check - redirect to login if not authenticated
    if (!user) {
      router.push('/login?next=/poten-checker/new');
      return;
    }

    setStep('analyzing');
    setError(null);

    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        throw new Error('파일에서 텍스트를 추출할 수 없습니다.');
      }

      const response = await fetch('/api/poten-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: text }),
      });

      if (response.status === 402) {
        const errData = await response.json().catch(() => ({}));
        setCreditModal({
          balance: errData.balance ?? 0,
          required: errData.required ?? CREDIT_COSTS.poten_checker,
        });
        setStep('input');
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed');
      }

      const data = await response.json();
      const diagnosisResult: DiagnosisResult = {
        ...data.result,
        fileName: file.name,
        analyzedAt: new Date().toISOString(),
      };
      setResult(diagnosisResult);
      setStep('result');

      // Non-blocking save
      saveDiagnosis(diagnosisResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('input');
    setFile(null);
    setResult(null);
    setError(null);
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
          <StepInput
            error={error}
            file={file}
            onFileSelect={(f) => {
              setFile(f);
              setError(null);
            }}
            onFileRemove={() => setFile(null)}
            onAnalyze={handleAnalyze}
          />
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
          <StepAnalyzing />
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
          <StepResult
            result={result}
            onReset={handleReset}
          />
        </motion.div>
      )}
    </AnimatePresence>

    <InsufficientCreditsModal
      open={!!creditModal}
      onClose={() => setCreditModal(null)}
      balance={creditModal?.balance ?? 0}
      required={creditModal?.required ?? CREDIT_COSTS.poten_checker}
      featureLabel="사업계획서 검증"
    />
    </>
  );
}
