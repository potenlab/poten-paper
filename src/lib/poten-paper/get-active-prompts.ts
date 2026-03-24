import { createClient } from '@/lib/supabase/server';
import {
  RESEARCH_SYSTEM_PROMPT,
  GENERATION_SYSTEM_PROMPT,
  SECTION_REGENERATE_PROMPT,
} from './prompts';

type PromptSlug = 'research' | 'generation' | 'regeneration';

const FALLBACK_PROMPTS: Record<PromptSlug, string> = {
  research: RESEARCH_SYSTEM_PROMPT,
  generation: GENERATION_SYSTEM_PROMPT,
  regeneration: SECTION_REGENERATE_PROMPT,
};

/**
 * Fetches active prompts from the database.
 * Falls back to hardcoded constants if the DB table is empty or unavailable.
 */
export async function getActivePrompts(): Promise<Record<PromptSlug, string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('poten_paper_prompts')
      .select('slug, content')
      .eq('is_active', true);

    if (error || !data || data.length === 0) {
      return { ...FALLBACK_PROMPTS };
    }

    const prompts = { ...FALLBACK_PROMPTS };
    for (const row of data) {
      if (row.slug in prompts && row.content && row.content.trim()) {
        prompts[row.slug as PromptSlug] = row.content;
      }
    }
    return prompts;
  } catch {
    return { ...FALLBACK_PROMPTS };
  }
}
