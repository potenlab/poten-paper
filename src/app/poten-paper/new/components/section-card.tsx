'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import type { BusinessPlanSection } from '@/lib/poten-paper/types';
import { SafeMarkdown } from '@/lib/poten-paper/safe-markdown';

interface SectionCardProps {
  section: BusinessPlanSection;
  index: number;
  onRegenerate: (sectionKey: string, additionalContext?: string) => void;
  isRegenerating: boolean;
}

export function SectionCard({ section, index, onRegenerate, isRegenerating }: SectionCardProps) {
  const [showRegenForm, setShowRegenForm] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleRegenerate = () => {
    onRegenerate(section.key, additionalContext || undefined);
    setShowRegenForm(false);
    setAdditionalContext('');
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            {index + 1}
          </div>
          <h3 className="font-semibold text-[16px] text-foreground">
            {section.titleKo}
          </h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {/* Markdown content */}
          <SafeMarkdown
            content={section.content}
            variant="card"
            className="prose prose-sm dark:prose-invert max-w-none mb-4 text-[14px] leading-relaxed"
          />

          {/* Visual Guide */}
          {section.visualGuide && (
            <div
              className="rounded-xl border p-4 mb-4"
              style={{ backgroundColor: `${BRAND_COLOR}05`, borderColor: `${BRAND_COLOR}20` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4" style={{ color: BRAND_COLOR }} />
                <span className="text-sm font-semibold" style={{ color: BRAND_COLOR }}>
                  시각자료 가이드
                </span>
              </div>
              <p className="text-sm text-foreground mb-1">
                <span className="font-medium">차트 유형:</span> {section.visualGuide.chartType}
              </p>
              <p className="text-sm text-muted mb-2">{section.visualGuide.description}</p>
              {section.visualGuide.dataPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {section.visualGuide.dataPoints.map((point, i) => {
                    const text = typeof point === 'string'
                      ? point
                      : typeof point === 'object' && point !== null
                        ? Object.values(point as Record<string, unknown>).filter(Boolean).join(' ')
                        : String(point);
                    return (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${BRAND_COLOR}10`, color: BRAND_COLOR }}
                      >
                        {text}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Regenerate */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRegenForm(!showRegenForm)}
              disabled={isRegenerating}
              className="rounded-lg text-sm gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? '재생성 중...' : '재생성'}
            </Button>
          </div>

          {showRegenForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="이 섹션에 대한 추가 요청이나 수정사항을 적어주세요."
                rows={3}
                className="rounded-xl resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleRegenerate}
                  className="rounded-lg text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  재생성하기
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowRegenForm(false); setAdditionalContext(''); }}
                  className="rounded-lg"
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

