'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Send, TrendingUp, Users, Target, ScrollText, Undo2 } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import type { ResearchData, BusinessPlanDocument } from '@/lib/poten-paper/types';

interface InsightPanelProps {
  originalInput: string;
  researchData: ResearchData;
  document: BusinessPlanDocument;
  onModify: (subSubSectionId: string, instruction: string) => void;
  onUndo?: (subSubSectionId: string) => void;
  undoHistory?: Map<string, unknown>;
  hoveredSectionId?: string | null;
  isRegenerating: string | null;
  onSave: () => void;
  onStartOver: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function InsightPanel({
  originalInput,
  researchData,
  document: doc,
  onModify,
  onUndo,
  undoHistory,
  hoveredSectionId,
  isRegenerating,
  onSave,
  onStartOver,
  isSaving,
  isSaved,
}: InsightPanelProps) {
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [instruction, setInstruction] = useState('');

  // Auto-select section when user hovers over it in the document
  useEffect(() => {
    if (hoveredSectionId) setSelectedSection(hoveredSectionId);
  }, [hoveredSectionId]);

  const handleSubmitModification = () => {
    if (!selectedSection || !instruction.trim()) return;
    onModify(selectedSection, instruction.trim());
    setInstruction('');
  };

  // Build flat list of sub-sub-sections for the dropdown
  const allSubSubSections = doc.sections.flatMap((s) =>
    s.subSections.flatMap((sub) =>
      sub.subSubSections.map((ss) => ({
        id: ss.id,
        label: `${ss.id} ${ss.titleKo}`,
        sectionTitle: s.titleKo,
      }))
    )
  );

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-sm text-foreground mb-1">분석 인사이트</h3>
        <p className="text-xs text-muted">리서치 데이터 요약 및 수정 도구</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Original Input */}
        <div>
          <button
            onClick={() => setShowInput(!showInput)}
            className="flex items-center justify-between w-full text-xs font-semibold text-foreground mb-2"
          >
            <span>입력 내용</span>
            {showInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showInput && (
            <div className="text-xs text-muted bg-muted/30 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {originalInput}
            </div>
          )}
        </div>

        {/* Research Summary Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground">리서치 요약</h4>

          {/* TAM/SAM/SOM */}
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5" style={{ color: BRAND_COLOR }} />
              <span className="text-xs font-semibold">시장규모</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted">TAM</span>
                <span className="font-medium text-foreground">{researchData.marketSize.tam.slice(0, 40)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">SAM</span>
                <span className="font-medium text-foreground">{researchData.marketSize.sam.slice(0, 40)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">SOM</span>
                <span className="font-medium text-foreground">{researchData.marketSize.som.slice(0, 40)}</span>
              </div>
            </div>
          </div>

          {/* Top Trends */}
          {researchData.trends.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: BRAND_COLOR }} />
                <span className="text-xs font-semibold">주요 트렌드</span>
              </div>
              <div className="space-y-1.5">
                {researchData.trends.slice(0, 3).map((trend, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium text-foreground">{trend.title}</span>
                    <p className="text-muted line-clamp-2">{trend.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitors */}
          {researchData.competitors.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5" style={{ color: BRAND_COLOR }} />
                <span className="text-xs font-semibold">경쟁사</span>
              </div>
              <div className="space-y-1.5">
                {researchData.competitors.slice(0, 3).map((comp, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium text-foreground">{comp.name}</span>
                    <p className="text-muted">강점: {comp.strengths.slice(0, 50)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modification Input (pinned at bottom) */}
      <div className="border-t border-border p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">섹션 수정</h4>
        <div className="flex items-center gap-2">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="flex-1 text-xs rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">수정할 섹션 선택...</option>
            {allSubSubSections.map((ss) => (
              <option key={ss.id} value={ss.id}>
                {ss.label}
              </option>
            ))}
          </select>
          {onUndo && selectedSection && undoHistory?.has(selectedSection) && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => onUndo(selectedSection)}
              className="w-8 h-8 rounded-lg shrink-0"
              title="되돌리기"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="수정 지시사항을 입력하세요..."
            rows={2}
            className="text-xs resize-none rounded-lg pr-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmitModification();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSubmitModification}
            disabled={!selectedSection || !instruction.trim() || !!isRegenerating}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-md text-white"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
        {isRegenerating && (
          <p className="text-xs animate-pulse" style={{ color: BRAND_COLOR }}>
            {isRegenerating} 섹션 재생성 중...
          </p>
        )}

        {/* Save / Start Over */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartOver}
            className="flex-1 text-xs rounded-lg h-8"
          >
            처음부터
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || isSaved}
            className="flex-1 text-xs rounded-lg h-8 text-white"
            style={{ backgroundColor: isSaved ? '#22c55e' : BRAND_COLOR }}
          >
            {isSaving ? '저장 중...' : isSaved ? '저장 완료' : '저장하기'}
          </Button>
        </div>

        {isSaved && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/mypage?tab=poten-paper')}
            className="w-full text-xs rounded-lg h-8 mt-2 gap-1.5"
          >
            <ScrollText className="w-3.5 h-3.5" />
            내 사업계획서 보기
          </Button>
        )}
      </div>
    </div>
  );
}
