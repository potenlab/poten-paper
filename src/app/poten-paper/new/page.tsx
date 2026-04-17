'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { extractTextFromFile } from '@/lib/extract-text';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import type {
  PaperStep,
  InputMethod,
  BusinessPlanDocument,
  ResearchData,
  GenerateRequest,
} from '@/lib/poten-paper/types';
import { useSectionRegeneration } from '@/lib/poten-paper/use-section-regeneration';
import { useImageGeneration } from '@/lib/poten-paper/use-image-generation';

const DRAFT_STORAGE_KEY = 'poten-paper-draft';

import { ProgressIndicator } from './components/progress-indicator';
import { StepInputMethod } from './components/step-input-method';
import { StepUpload } from './components/step-upload';
import { StepForm } from './components/step-form';
import { StepProcessing } from './components/step-processing';
import { PaperResultLayout } from './components/result/paper-result-layout';

export default function PotenPaperNewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const openLogin = () => {
    router.push('/login?next=/poten-paper/new');
  };

  const [step, setStep] = useState<PaperStep>('input-method');
  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null);
  const [processingPhase, setProcessingPhase] = useState<'research' | 'generating'>('research');
  const [initialIdea, setInitialIdea] = useState<string>('');

  // Read ?idea=... from query string (e.g. from idea-validator CTA or landing hero) and jump straight to form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ideaFromQuery = params.get('idea');
    if (ideaFromQuery) {
      setInitialIdea(ideaFromQuery);
      setInputMethod('form');
      setStep('input');
    }
  }, []);

  // Result data (v2)
  const [resultTitle, setResultTitle] = useState('');
  const [resultIndustry, setResultIndustry] = useState('');
  const [document, setDocument] = useState<BusinessPlanDocument | null>(null);
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [originalInput, setOriginalInput] = useState('');

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  const { regeneratingSection, regenerateV2, undoV2, undoHistory } = useSectionRegeneration({
    document,
    setDocument,
    researchData,
    originalInput,
  });

  const { generateImages } = useImageGeneration({ setDocument });

  // Feature access (standalone - no gate)
  const canUse = true;
  const recordUsage = async () => {};

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

  // Save draft to sessionStorage when result is ready (backup in case user navigates away)
  useEffect(() => {
    if (step === 'result' && document && researchData && !isSaved) {
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
          resultTitle,
          resultIndustry,
          document,
          researchData,
          originalInput,
          inputMethod,
        }));
      } catch { /* quota exceeded — ignore */ }
    }
  }, [step, document, researchData, isSaved, resultTitle, resultIndustry, originalInput, inputMethod]);

  // Restore draft from sessionStorage on mount
  useEffect(() => {
    if (step !== 'input-method' || document) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.document && draft.researchData) {
        setResultTitle(draft.resultTitle || '');
        setResultIndustry(draft.resultIndustry || '');
        setDocument(draft.document);
        setResearchData(draft.researchData);
        setOriginalInput(draft.originalInput || '');
        setInputMethod(draft.inputMethod || 'form');
        setStep('result');
        toast.info('이전에 생성한 사업계획서를 복원했습니다.');
      }
    } catch { /* corrupted data — ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear draft after successful save
  useEffect(() => {
    if (isSaved) {
      try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
    }
  }, [isSaved]);

  // Auto-save after login when pendingSave is true
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
    if (!canUse) return;

    setStep('processing');
    setProcessingPhase('research');
    setError(null);

    try {
      const phaseTimer = setTimeout(() => setProcessingPhase('generating'), 15000);

      const response = await fetch('/api/poten-paper/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      clearTimeout(phaseTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '사업계획서 생성에 실패했습니다.');
      }

      const data = await response.json();
      const result = data.result;

      // Record feature usage
      await recordUsage();

      // Auto-save to DB and redirect immediately
      if (user) {
        setProcessingPhase('generating');
        try {
          const { data: { session } } = await getSupabase().auth.refreshSession();
          const uid = session?.user?.id || user.id;

          const { data: inserted, error: insertError } = await getSupabase().from('business_plans').insert({
            user_id: uid,
            title: result.title,
            industry: resultIndustry || null,
            business_stage: null,
            input_type: inputMethod || 'form',
            input_data: { originalInput, format_version: 2 } as any,
            sections: result.document as any,
            research_data: result.researchData as any,
            status: 'completed',
          }).select('id').single();

          if (!insertError && inserted?.id) {
            setIsSaved(true);
            try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
            toast.success('사업계획서가 저장되었습니다.');
            router.push(`/poten-paper/${inserted.id}`);
            return;
          }
        } catch {
          // Fall through to show result in-page
        }
      }

      // Fallback: show result in-page if save failed or user not logged in
      setResultTitle(result.title);
      setDocument(result.document);
      setResearchData(result.researchData);
      setStep('result');

      // Fire async image generation (non-blocking)
      generateImages(result.document);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || '사업계획서 생성에 실패했습니다. 다시 시도해주세요.');
      setStep('input');
      toast.error(err.message || '생성에 실패했습니다.');
    }
  };

  const handleUploadSubmit = async (file: File, title?: string, industry?: string) => {
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        toast.error('파일에서 텍스트를 추출할 수 없습니다.');
        return;
      }

      setOriginalInput(text.slice(0, 20000));
      if (title) setResultTitle(title);
      if (industry) setResultIndustry(industry);

      await callGenerateAPI({
        inputType: 'upload',
        documentText: text,
        title,
        industry,
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

  const handleSave = async () => {
    if (!user) {
      setPendingSave(true);
      openLogin();
      return;
    }

    setIsSaving(true);
    try {
      // Refresh session in case token expired during generation
      const { data: { session } } = await getSupabase().auth.refreshSession();
      const uid = session?.user?.id || user.id;

      const { data: inserted, error: insertError } = await getSupabase().from('business_plans').insert({
        user_id: uid,
        title: resultTitle,
        industry: resultIndustry || null,
        business_stage: null,
        input_type: inputMethod || 'form',
        input_data: { originalInput, format_version: 2 } as any,
        sections: document as any,
        research_data: researchData as any,
        status: 'completed',
      }).select('id').single();

      if (insertError) throw insertError;
      setIsSaved(true);
      toast.success('사업계획서가 저장되었습니다.');
      try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
      if (inserted?.id) {
        router.push(`/poten-paper/${inserted.id}`);
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
    setResearchData(null);
    setResultTitle('');
    setResultIndustry('');
    setOriginalInput('');
    setError(null);
    setIsSaved(false);
    setPendingSave(false);
    try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
  };

  // Result step: full-viewport layout, no wrapper padding
  if (step === 'result' && document && researchData) {
    return (
      <PaperResultLayout
        document={document}
        researchData={researchData}
        originalInput={originalInput}
        onModify={regenerateV2}
        onUndo={undoV2}
        undoHistory={undoHistory}
        isRegenerating={regeneratingSection}
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
              포텐페이퍼
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
            <StepForm
              onSubmit={handleFormSubmit}
              onBack={handleBackToMethod}
              initialIdea={initialIdea}
            />
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
