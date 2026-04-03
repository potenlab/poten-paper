'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND_COLOR } from '@/lib/prd/constants';
import type { PRDDocument, AnalysisData } from '@/lib/prd/types';
import { PrdResultLayout } from '../new/components/result/PrdResultLayout';

interface PrdViewClientProps {
  prdId: string;
}

export function PrdViewClient({ prdId }: PrdViewClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  const [document, setDocument] = useState<PRDDocument | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [originalInput, setOriginalInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModifying, setIsModifying] = useState(false);
  const [lastModifySummary, setLastModifySummary] = useState<string | null>(null);

  useEffect(() => {
    loadPrd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prdId]);

  const loadPrd = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await getSupabase()
        .from('prd_documents')
        .select('title, document, analysis_data, input_data, user_id, is_public')
        .eq('id', prdId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        const { data: { user: currentUser } } = await getSupabase().auth.getUser();
        const owner = !!currentUser && data.user_id === currentUser.id;
        if (!owner && !data.is_public) {
          setError('비공개 PRD입니다.');
          return;
        }

        setTitle(data.title);
        setDocument(data.document as any);
        setAnalysisData((data.analysis_data as any) || null);
        setOriginalInput((data.input_data as any)?.originalInput || '');
        setIsOwner(owner);
      } else {
        setError('PRD를 찾을 수 없습니다.');
      }
    } catch {
      setError('PRD를 찾을 수 없거나 접근 권한이 없습니다.');
    } finally {
      setLoading(false);
    }
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

      // Save updated document to DB
      if (isOwner) {
        await getSupabase()
          .from('prd_documents')
          .update({
            document: data.document as any,
            analysis_data: data.analysisData as any,
          })
          .eq('id', prdId);
      }

      toast.success('문서가 수정되었습니다.');
    } catch (err: any) {
      console.error('Modify error:', err);
      toast.error(err.message || '수정에 실패했습니다.');
    } finally {
      setIsModifying(false);
    }
  }, [document, analysisData, originalInput, isModifying, isOwner, prdId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 text-center">
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button
          onClick={() => router.push('/prd/my')}
          variant="outline"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          내 PRD 목록
        </Button>
      </section>
    );
  }

  if (document && analysisData) {
    return (
      <PrdResultLayout
        document={document}
        analysisData={analysisData}
        originalInput={originalInput}
        onModify={handleModify}
        isModifying={isModifying}
        lastModifySummary={lastModifySummary}
        onSave={() => {}}
        onStartOver={() => router.push('/prd/new')}
        isSaving={false}
        isSaved={true}
        readOnly={!isOwner}
      />
    );
  }

  return null;
}
