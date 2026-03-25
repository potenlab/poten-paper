'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getSupabase } from '@/lib/supabase/client';
import type {
  BusinessPlanDocument,
  BusinessPlanSection,
  SubSubSection,
  ResearchData,
} from './types';

interface UseSectionRegenerationParams {
  document: BusinessPlanDocument | null;
  setDocument: React.Dispatch<React.SetStateAction<BusinessPlanDocument | null>>;
  researchData: ResearchData | null;
  originalInput: string;
  // v1 format (result page only)
  sections?: BusinessPlanSection[];
  setSections?: React.Dispatch<React.SetStateAction<BusinessPlanSection[]>>;
  // DB persistence (result page only)
  resultId?: string;
  userId?: string;
}

export function useSectionRegeneration({
  document,
  setDocument,
  researchData,
  originalInput,
  sections,
  setSections,
  resultId,
  userId,
}: UseSectionRegenerationParams) {
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  // Map of subSubSectionId → previous SubSubSection snapshot (for undo)
  const [undoHistory, setUndoHistory] = useState<Map<string, SubSubSection>>(new Map());

  const regenerateV2 = async (subSubSectionId: string, additionalContext: string) => {
    if (!researchData || !document) return;
    setRegeneratingSection(subSubSectionId);

    // Save current snapshot for undo
    let previousSnapshot: SubSubSection | undefined;
    for (const section of document.sections) {
      for (const sub of section.subSections) {
        const found = sub.subSubSections.find((ss) => ss.id === subSubSectionId);
        if (found) { previousSnapshot = { ...found }; break; }
      }
      if (previousSnapshot) break;
    }

    try {
      const response = await fetch('/api/poten-paper/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subSubSectionId,
          additionalContext,
          originalInput,
          researchData,
          document,
        }),
      });

      if (!response.ok) throw new Error('섹션 재생성에 실패했습니다.');

      const data = await response.json();
      const updatedSubSub = data.subSubSection;

      const updatedDoc: BusinessPlanDocument = {
        ...document,
        sections: document.sections.map((section) => ({
          ...section,
          subSections: section.subSections.map((sub) => ({
            ...sub,
            subSubSections: sub.subSubSections.map((ss) =>
              ss.id === subSubSectionId ? { ...ss, ...updatedSubSub } : ss
            ),
          })),
        })),
      };

      setDocument(updatedDoc);

      // Store snapshot for undo
      if (previousSnapshot) {
        setUndoHistory((prev) => new Map(prev).set(subSubSectionId, previousSnapshot!));
      }

      if (resultId && userId) {
        await getSupabase()
          .from('business_plans')
          .update({ sections: updatedDoc as any })
          .eq('id', resultId)
          .eq('user_id', userId);
      }

      toast.success('섹션이 재생성되었습니다.');
    } catch (err: any) {
      toast.error(err.message || '재생성에 실패했습니다.');
    } finally {
      setRegeneratingSection(null);
    }
  };

  const undoV2 = useCallback(async (subSubSectionId: string) => {
    if (!document) return;
    const previous = undoHistory.get(subSubSectionId);
    if (!previous) return;

    const restoredDoc: BusinessPlanDocument = {
      ...document,
      sections: document.sections.map((section) => ({
        ...section,
        subSections: section.subSections.map((sub) => ({
          ...sub,
          subSubSections: sub.subSubSections.map((ss) =>
            ss.id === subSubSectionId ? previous : ss
          ),
        })),
      })),
    };

    setDocument(restoredDoc);
    setUndoHistory((prev) => {
      const next = new Map(prev);
      next.delete(subSubSectionId);
      return next;
    });

    if (resultId && userId) {
      await getSupabase()
        .from('business_plans')
        .update({ sections: restoredDoc as any })
        .eq('id', resultId)
        .eq('user_id', userId);
    }

    toast.success('되돌렸습니다.');
  }, [document, undoHistory, resultId, userId]);

  const regenerateV1 = async (sectionKey: string, additionalContext?: string) => {
    if (!researchData || !sections || !setSections) return;
    setRegeneratingSection(sectionKey);

    try {
      const response = await fetch('/api/poten-paper/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey,
          additionalContext,
          originalInput,
          researchData,
          existingSections: sections,
        }),
      });

      if (!response.ok) throw new Error('재생성 실패');

      const data = await response.json();
      const updatedSections = sections.map((s) =>
        s.key === sectionKey ? { ...data.section, status: 'completed' as const } : s
      );
      setSections(updatedSections);

      if (resultId && userId) {
        await getSupabase()
          .from('business_plans')
          .update({ sections: updatedSections as any })
          .eq('id', resultId)
          .eq('user_id', userId);
      }

      toast.success('섹션이 재생성되었습니다.');
    } catch (err: any) {
      toast.error(err.message || '재생성에 실패했습니다.');
    } finally {
      setRegeneratingSection(null);
    }
  };

  return { regeneratingSection, regenerateV2, regenerateV1, undoV2, undoHistory };
}
