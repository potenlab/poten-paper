'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Send, Layers, Users, Code, CheckCircle2 } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/prd/constants';
import type { AnalysisData, PRDDocument } from '@/lib/prd/types';
import { ImageUpload } from '../ImageUpload';

interface InsightPanelProps {
  originalInput: string;
  analysisData: AnalysisData;
  document: PRDDocument;
  onModify: (message: string, images?: string[]) => void;
  isModifying: boolean;
  lastModifySummary: string | null;
  onSave?: () => void;
  onStartOver?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function InsightPanel({
  originalInput,
  analysisData,
  document: doc,
  onModify,
  isModifying,
  lastModifySummary,
}: InsightPanelProps) {
  const [showInput, setShowInput] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [modifyImages, setModifyImages] = useState<string[]>([]);

  const handleSubmitModification = () => {
    if (!instruction.trim() || isModifying) return;
    onModify(instruction.trim(), modifyImages.length > 0 ? modifyImages : undefined);
    setInstruction('');
    setModifyImages([]);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-sm text-foreground mb-1">분석 인사이트</h3>
        <p className="text-xs text-muted-foreground">프로젝트 분석 요약 및 수정 도구</p>
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
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {originalInput}
            </div>
          )}
        </div>

        {/* Analysis Summary Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground">분석 요약</h4>

          {/* Identified Features */}
          {analysisData.identifiedFeatures?.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5" style={{ color: BRAND_COLOR }} />
                <span className="text-xs font-semibold">식별된 기능 ({analysisData.identifiedFeatures.length}개)</span>
              </div>
              <div className="space-y-1">
                {analysisData.identifiedFeatures.map((feature, i) => (
                  <div key={i} className="text-xs flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: feature.priority === 'high' ? '#ef444420' : feature.priority === 'medium' ? '#f59e0b20' : '#6b728020',
                        color: feature.priority === 'high' ? '#ef4444' : feature.priority === 'medium' ? '#f59e0b' : '#6b7280',
                      }}
                    >
                      {feature.priority}
                    </span>
                    <span className="font-medium text-foreground">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          {analysisData.suggestedTechStack && (
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Code className="w-3.5 h-3.5" style={{ color: BRAND_COLOR }} />
                <span className="text-xs font-semibold">기술 스택</span>
              </div>
              <div className="space-y-1 text-xs">
                {analysisData.suggestedTechStack.frontend && <div><span className="text-muted-foreground">Frontend:</span> <span className="font-medium text-foreground">{analysisData.suggestedTechStack.frontend}</span></div>}
                {analysisData.suggestedTechStack.backend && <div><span className="text-muted-foreground">Backend:</span> <span className="font-medium text-foreground">{analysisData.suggestedTechStack.backend}</span></div>}
                {analysisData.suggestedTechStack.database && <div><span className="text-muted-foreground">DB:</span> <span className="font-medium text-foreground">{analysisData.suggestedTechStack.database}</span></div>}
              </div>
            </div>
          )}

          {/* User Types */}
          {analysisData.userTypes?.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5" style={{ color: BRAND_COLOR }} />
                <span className="text-xs font-semibold">사용자 유형</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysisData.userTypes.map((type, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modification Input (pinned at bottom) */}
      <div className="border-t border-border p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">문서 수정</h4>

        {/* Last modification summary */}
        {lastModifySummary && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">{lastModifySummary}</p>
          </div>
        )}

        <div className="relative">
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="수정 요청을 자유롭게 입력하세요..."
            rows={3}
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
            disabled={!instruction.trim() || isModifying}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-md text-white"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
        <ImageUpload images={modifyImages} onChange={setModifyImages} compact />
        <p className="text-[10px] text-muted-foreground">
          예: '알림 기능 추가해줘', '이 기능 빼줘', '라우트 구조 변경해줘'
        </p>
        {isModifying && (
          <p className="text-xs animate-pulse" style={{ color: BRAND_COLOR }}>
            문서 수정 중...
          </p>
        )}
      </div>
    </div>
  );
}
