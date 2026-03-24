'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import type { BusinessPlanSection, BusinessPlanDocument, ResearchData } from '@/lib/poten-paper/types';
import { useSectionRegeneration } from '@/lib/poten-paper/use-section-regeneration';
import { useImageGeneration } from '@/lib/poten-paper/use-image-generation';
import { SectionCard } from '../new/components/section-card';
import { PaperResultLayout } from '../new/components/result/paper-result-layout';

interface PaperViewClientProps {
  planId: string;
}

export function PaperViewClient({ planId }: PaperViewClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState<string | null>(null);
  const [formatVersion, setFormatVersion] = useState<1 | 2>(1);
  const [isOwner, setIsOwner] = useState(false);

  // v1 state
  const [sections, setSections] = useState<BusinessPlanSection[]>([]);
  // v2 state
  const [document, setDocument] = useState<BusinessPlanDocument | null>(null);

  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [originalInput, setOriginalInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { regeneratingSection, regenerateV2, regenerateV1, undoV2, undoHistory } = useSectionRegeneration({
    document,
    setDocument,
    researchData,
    originalInput,
    sections,
    setSections,
    resultId: planId,
    userId: user?.id,
  });

  const { generateImages } = useImageGeneration({ setDocument, planId });

  useEffect(() => {
    loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  // Generate images for owner's pending imagePrompts
  useEffect(() => {
    if (document && !loading && isOwner) {
      generateImages(document);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isOwner]);

  const loadResult = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('business_plans')
        .select('title, industry, sections, research_data, input_data, user_id, is_public')
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        // Check access: owner or public
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const owner = !!currentUser && data.user_id === currentUser.id;
        if (!owner && !data.is_public) {
          setError('비공개 사업계획서입니다.');
          return;
        }

        setTitle(data.title);
        setIndustry(data.industry);
        setResearchData((data.research_data as any) || null);
        setOriginalInput((data.input_data as any)?.originalInput || '');
        setIsOwner(owner);

        // Detect format version
        const sectionsData = data.sections as any;
        const inputData = data.input_data as any;

        if (sectionsData?.format_version === 2 || inputData?.format_version === 2) {
          setFormatVersion(2);
          setDocument(sectionsData as BusinessPlanDocument);
        } else {
          setFormatVersion(1);
          setSections(sectionsData || []);
        }
      } else {
        setError('사업계획서를 찾을 수 없습니다.');
      }
    } catch {
      setError('사업계획서를 찾을 수 없거나 접근 권한이 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 text-center">
        <p className="text-muted mb-6">{error}</p>
        <Button
          onClick={() => router.push('/mypage?tab=poten-paper')}
          variant="outline"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          대시보드로 돌아가기
        </Button>
      </section>
    );
  }

  // v2 format: render PaperResultLayout
  if (formatVersion === 2 && document && researchData) {
    return (
      <PaperResultLayout
        document={document}
        researchData={researchData}
        originalInput={originalInput}
        onModify={regenerateV2}
        onUndo={undoV2}
        undoHistory={undoHistory}
        isRegenerating={regeneratingSection}
        onSave={() => {}}
        onStartOver={() => router.push('/poten-paper/new')}
        isSaving={false}
        isSaved={true}
        readOnly={!isOwner}
      />
    );
  }

  // v1 format: legacy section cards
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <section className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Back button */}
        {isOwner && (
          <button
            onClick={() => router.push('/mypage?tab=poten-paper')}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge
              className="rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR, borderColor: 'transparent' }}
            >
              사업계획서
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted">
            {industry && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {industry}
              </span>
            )}
          </div>
        </div>

        {/* Section Cards */}
        <div className="space-y-4 mb-8">
          {sections.map((section, i) => (
            <SectionCard
              key={section.key}
              section={section}
              index={i}
              onRegenerate={isOwner ? regenerateV1 : () => {}}
              isRegenerating={regeneratingSection === section.key}
            />
          ))}
        </div>

        {/* Bottom actions - owner only */}
        {isOwner && (
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/mypage?tab=poten-paper')}
              variant="outline"
              className="h-12 px-6 rounded-xl gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              대시보드
            </Button>
          </div>
        )}
      </section>
    </motion.div>
  );
}
