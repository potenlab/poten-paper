'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { extractTextFromFile } from '@/lib/prd/extract-text';
import { BRAND_COLOR } from '@/lib/prd/constants';
import type {
  PrdStep,
  InputMethod,
  PRDDocument,
  AnalysisData,
  GenerateRequest,
} from '@/lib/prd/types';

const DRAFT_STORAGE_KEY = 'prd-draft';

import { ProgressIndicator } from './components/ProgressIndicator';
import { StepInputMethod } from './components/StepInputMethod';
import { StepUpload } from './components/StepUpload';
import { StepForm } from './components/StepForm';
import { StepProcessing } from './components/StepProcessing';
import { PrdResultLayout } from './components/result/PrdResultLayout';

export default function PrdNewPage() {
  return (
    <Suspense>
      <PrdNewContent />
    </Suspense>
  );
}

function PrdNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const openLogin = () => {
    router.push('/login?next=/prd/new');
  };

  const prefillIdea = searchParams.get('idea') || '';
  const [step, setStep] = useState<PrdStep>(prefillIdea ? 'input' : 'input-method');
  const [inputMethod, setInputMethod] = useState<InputMethod | null>(prefillIdea ? 'form' : null);
  const [processingPhase, setProcessingPhase] = useState<'analysis' | 'generating'>('analysis');

  // Result data
  const [resultTitle, setResultTitle] = useState('');
  const [document, setDocument] = useState<PRDDocument | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [originalInput, setOriginalInput] = useState('');

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [lastModifySummary, setLastModifySummary] = useState<string | null>(null);

  // Warn before leaving during processing or with unsaved result
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (step === 'processing' || (step === 'result' && !isSaved)) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [step, isSaved]);

  // Save draft to sessionStorage
  useEffect(() => {
    if (step === 'result' && document && analysisData && !isSaved) {
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
          resultTitle, document, analysisData, originalInput, inputMethod,
        }));
      } catch { /* quota exceeded */ }
    }
  }, [step, document, analysisData, isSaved, resultTitle, originalInput, inputMethod]);

  // Restore draft on mount
  useEffect(() => {
    if (step !== 'input-method' || document) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.document && draft.analysisData) {
        setResultTitle(draft.resultTitle || '');
        setDocument(draft.document);
        setAnalysisData(draft.analysisData);
        setOriginalInput(draft.originalInput || '');
        setInputMethod(draft.inputMethod || 'form');
        setStep('result');
        toast.info('이전에 생성한 PRD를 복원했습니다.');
      }
    } catch { /* corrupted */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear draft after save
  useEffect(() => {
    if (isSaved) {
      try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
    }
  }, [isSaved]);

  // Auto-save after login
  useEffect(() => {
    if (pendingSave && user && document) {
      setPendingSave(false);
      handleSave();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSave, user]);

  const handleSelectMethod = (method: InputMethod) => {
    setInputMethod(method);
    setStep('input');
  };

  const handleBackToMethod = () => {
    setInputMethod(null);
    setStep('input-method');
  };

  const callGenerateAPI = async (requestBody: GenerateRequest) => {
    setStep('processing');
    setProcessingPhase('analysis');
    setError(null);

    try {
      const phaseTimer = setTimeout(() => setProcessingPhase('generating'), 15000);

      const response = await fetch('/api/prd/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      clearTimeout(phaseTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'PRD 생성에 실패했습니다.');
      }

      const data = await response.json();

      // Auto-save to DB and redirect
      if (user) {
        setProcessingPhase('generating');
        try {
          const { data: { session } } = await getSupabase().auth.refreshSession();
          const uid = session?.user?.id || user.id;

          const { data: inserted, error: insertError } = await getSupabase().from('prd_documents').insert({
            user_id: uid,
            title: data.title,
            input_type: inputMethod || 'form',
            input_data: { originalInput, format_version: 1 } as any,
            document: data.document as any,
            analysis_data: data.analysisData as any,
            status: 'completed',
          }).select('id').single();

          if (!insertError && inserted?.id) {
            setIsSaved(true);
            try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
            toast.success('PRD가 저장되었습니다.');
            router.push(`/prd/${inserted.id}`);
            return;
          }
        } catch {
          // Fall through to show result in-page
        }
      }

      // Fallback: show result in-page
      setResultTitle(data.title);
      setDocument(data.document);
      setAnalysisData(data.analysisData);
      setStep('result');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'PRD 생성에 실패했습니다. 다시 시도해주세요.');
      setStep('input');
      toast.error(err.message || '생성에 실패했습니다.');
    }
  };

  const handleUploadSubmit = async (file: File, title?: string) => {
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        toast.error('파일에서 텍스트를 추출할 수 없습니다.');
        return;
      }

      setOriginalInput(text.slice(0, 20000));
      if (title) setResultTitle(title);

      await callGenerateAPI({
        inputType: 'upload',
        documentText: text,
        title,
      });
    } catch (err: any) {
      toast.error('파일 처리 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleFormSubmit = async (ideaText: string) => {
    setOriginalInput(ideaText);
    await callGenerateAPI({
      inputType: 'form',
      ideaText,
    });
  };

  const handleModify = useCallback(async (message: string, images?: string[]) => {
    if (!document || !analysisData || isModifying) return;
    setIsModifying(true);
    setLastModifySummary(null);

    try {
      const response = await fetch('/api/prd/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          analysisData,
          originalInput,
          message,
          images,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '수정에 실패했습니다.');
      }

      const data = await response.json();
      setDocument(data.document);
      setAnalysisData(data.analysisData);
      setLastModifySummary(data.summary);
      setIsSaved(false);
      toast.success('문서가 수정되었습니다.');
    } catch (err: any) {
      console.error('Modify error:', err);
      toast.error(err.message || '수정에 실패했습니다.');
    } finally {
      setIsModifying(false);
    }
  }, [document, analysisData, originalInput, isModifying]);

  const handleSave = async () => {
    if (!user) {
      setPendingSave(true);
      openLogin();
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await getSupabase().auth.refreshSession();
      const uid = session?.user?.id || user.id;

      const { data: inserted, error: insertError } = await getSupabase().from('prd_documents').insert({
        user_id: uid,
        title: resultTitle || document?.cover.projectName || 'PRD',
        input_type: inputMethod || 'form',
        input_data: { originalInput, format_version: 1 } as any,
        document: document as any,
        analysis_data: analysisData as any,
        status: 'completed',
      }).select('id').single();

      if (insertError) throw insertError;
      setIsSaved(true);
      toast.success('PRD가 저장되었습니다.');
      try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
      if (inserted?.id) {
        router.push(`/prd/${inserted.id}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOver = () => {
    setStep('input-method');
    setInputMethod(null);
    setDocument(null);
    setAnalysisData(null);
    setResultTitle('');
    setOriginalInput('');
    setError(null);
    setIsSaved(false);
    setPendingSave(false);
    setLastModifySummary(null);
    try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
  };

  // Result step: full-viewport layout
  if (step === 'result' && document && analysisData) {
    return (
      <PrdResultLayout
        document={document}
        analysisData={analysisData}
        originalInput={originalInput}
        onModify={handleModify}
        isModifying={isModifying}
        lastModifySummary={lastModifySummary}
        onSave={handleSave}
        onStartOver={handleStartOver}
        isSaving={isSaving}
        isSaved={isSaved}
      />
    );
  }

  return (
    <div className="min-h-[60vh]">
      {/* Progress Indicator */}
      {step !== 'processing' && (
        <div className="max-w-[720px] mx-auto px-4 sm:px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-[13px] font-semibold"
              style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
            >
              PRD 생성기
            </span>
          </div>
          <ProgressIndicator currentStep={step} />
        </div>
      )}

      {/* Error Banner */}
      {error && step === 'input' && (
        <div className="max-w-[720px] mx-auto px-4 sm:px-8 mt-4">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 'input-method' && (
          <motion.div
            key="input-method"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="pt-8 pb-24"
          >
            <StepInputMethod onSelect={handleSelectMethod} />
          </motion.div>
        )}

        {step === 'input' && inputMethod === 'upload' && (
          <motion.div
            key="input-upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="pt-8 pb-24"
          >
            <StepUpload onSubmit={handleUploadSubmit} onBack={handleBackToMethod} />
          </motion.div>
        )}

        {step === 'input' && inputMethod === 'form' && (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="pt-8 pb-24"
          >
            <StepForm onSubmit={handleFormSubmit} onBack={handleBackToMethod} initialValue={prefillIdea} />
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <StepProcessing phase={processingPhase} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
