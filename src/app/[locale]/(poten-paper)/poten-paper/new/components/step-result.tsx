'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, LayoutDashboard, Calendar, Briefcase } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import { SectionCard } from './section-card';
import type { BusinessPlanSection, ResearchData } from '@/lib/poten-paper/types';

interface StepResultProps {
  title: string;
  industry?: string;
  sections: BusinessPlanSection[];
  researchData: ResearchData;
  onRegenerate: (sectionKey: string, additionalContext?: string) => void;
  regeneratingSection: string | null;
  onStartOver: () => void;
  onSave: () => void;
  onGoDashboard: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function StepResult({
  title,
  industry,
  sections,
  onRegenerate,
  regeneratingSection,
  onStartOver,
  onSave,
  onGoDashboard,
  isSaving,
  isSaved,
}: StepResultProps) {
  return (
    <section className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
          >
            사업계획서 생성 완료
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          {industry && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {industry}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>

      {/* Section Cards */}
      <div className="space-y-4 mb-8">
        {sections.map((section, i) => (
          <SectionCard
            key={section.key}
            section={section}
            index={i}
            onRegenerate={onRegenerate}
            isRegenerating={regeneratingSection === section.key}
          />
        ))}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-20 md:bottom-4 bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onStartOver}
            className="rounded-xl gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">처음부터 다시</span>
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onGoDashboard}
              className="rounded-xl gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">대시보드</span>
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving || isSaved}
              className="rounded-xl text-white gap-2"
              style={{ backgroundColor: isSaved ? '#22c55e' : BRAND_COLOR }}
            >
              {isSaving ? '저장 중...' : isSaved ? '저장 완료' : '저장하기'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
