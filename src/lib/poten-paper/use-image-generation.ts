'use client';

import { useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { BusinessPlanDocument } from './types';

interface UseImageGenerationParams {
  setDocument: React.Dispatch<React.SetStateAction<BusinessPlanDocument | null>>;
  planId?: string;
}

export function useImageGeneration({ setDocument, planId }: UseImageGenerationParams) {
  const generatingRef = useRef(false);

  /**
   * Save the updated document back to DB so image results persist.
   */
  const saveDocumentToDb = useCallback(
    async (updatedDoc: BusinessPlanDocument) => {
      if (!planId) return;
      try {
        await supabase
          .from('business_plans')
          .update({ sections: updatedDoc as any })
          .eq('id', planId);
      } catch (err) {
        console.error('Failed to save image results to DB:', err);
      }
    },
    [planId],
  );

  const clearImagePrompts = useCallback(
    (ids: Set<string>) => {
      let clearedDoc: BusinessPlanDocument | null = null;
      setDocument((prev) => {
        if (!prev) return prev;
        clearedDoc = {
          ...prev,
          sections: prev.sections.map((section) => ({
            ...section,
            subSections: section.subSections.map((sub) => ({
              ...sub,
              subSubSections: sub.subSubSections.map((ss) =>
                ids.has(ss.id) ? { ...ss, imagePrompt: null } : ss
              ),
            })),
          })),
        };
        return clearedDoc;
      });
      // Persist cleared prompts to DB
      if (clearedDoc) {
        saveDocumentToDb(clearedDoc);
      }
    },
    [setDocument, saveDocumentToDb],
  );

  const generateImages = useCallback(
    async (doc: BusinessPlanDocument) => {
      // Prevent duplicate concurrent calls
      if (generatingRef.current) return;

      const imageRequests: { subSubSectionId: string; imagePrompt: string }[] = [];
      for (const section of doc.sections) {
        for (const sub of section.subSections) {
          for (const ss of sub.subSubSections) {
            if (ss.imagePrompt && !ss.imageUrl) {
              imageRequests.push({ subSubSectionId: ss.id, imagePrompt: ss.imagePrompt });
            }
          }
        }
      }

      if (imageRequests.length === 0) return;

      generatingRef.current = true;
      const requestedIds = new Set(imageRequests.map((r) => r.subSubSectionId));

      try {
        const response = await fetch('/api/poten-paper/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: imageRequests }),
        });

        if (!response.ok) {
          clearImagePrompts(requestedIds);
          return;
        }

        const data = await response.json();
        const images: { subSubSectionId: string; imageUrl: string | null }[] = data.images || [];

        let updatedDoc: BusinessPlanDocument | null = null;
        setDocument((prev) => {
          if (!prev) return prev;
          updatedDoc = {
            ...prev,
            sections: prev.sections.map((section) => ({
              ...section,
              subSections: section.subSections.map((sub) => ({
                ...sub,
                subSubSections: sub.subSubSections.map((ss) => {
                  if (!requestedIds.has(ss.id)) return ss;
                  const imageResult = images.find((img) => img.subSubSectionId === ss.id);
                  if (imageResult?.imageUrl) {
                    return { ...ss, imageUrl: imageResult.imageUrl };
                  }
                  return { ...ss, imagePrompt: null };
                }),
              })),
            })),
          };
          return updatedDoc;
        });

        // Persist to DB
        if (updatedDoc) {
          await saveDocumentToDb(updatedDoc);
        }
      } catch (err) {
        console.error('Image generation error:', err);
        clearImagePrompts(requestedIds);
      } finally {
        generatingRef.current = false;
      }
    },
    [setDocument, clearImagePrompts, saveDocumentToDb],
  );

  return { generateImages };
}
