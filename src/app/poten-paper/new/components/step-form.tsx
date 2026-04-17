'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';

interface StepFormProps {
  onSubmit: (ideaText: string) => void;
  onBack: () => void;
  initialIdea?: string;
}

export function StepForm({ onSubmit, onBack, initialIdea = '' }: StepFormProps) {
  const [ideaText, setIdeaText] = useState(initialIdea);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!ideaText.trim()) {
      setError('사업 아이디어를 입력해주세요.');
      return;
    }
    if (ideaText.trim().length < 20) {
      setError('더 구체적으로 설명해주세요. (최소 20자)');
      return;
    }
    onSubmit(ideaText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        입력 방법 다시 선택
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">사업 아이디어를 알려주세요</h2>
        <p className="text-sm text-muted">
          자유롭게 사업 아이디어를 설명해주세요. AI가 분석하여 사업계획서를 작성합니다.
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={ideaText}
          onChange={(e) => {
            setIdeaText(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={`예: 반려동물 건강 관리 플랫폼을 만들려고 합니다. 반려동물 보호자들이 건강 기록을 관리하고, AI 기반으로 질병 조기 발견을 할 수 있는 서비스입니다. 타겟은 20-40대 반려동물 보호자이고, 월 구독 모델로 수익을 낼 계획입니다...`}
          rows={8}
          className={`rounded-2xl resize-none text-[15px] leading-relaxed p-5 pr-14 ${error ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
        />
        <Button
          onClick={handleSubmit}
          size="icon"
          className="absolute bottom-4 right-4 w-10 h-10 rounded-xl text-white shadow-md"
          style={{ backgroundColor: BRAND_COLOR }}
          disabled={!ideaText.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      <p className="text-xs text-muted mt-3 text-center">
        Cmd + Enter로 바로 제출할 수 있습니다
      </p>

      <Button
        onClick={handleSubmit}
        className="w-full mt-6 h-14 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all text-[16px] font-semibold"
        style={{ backgroundColor: BRAND_COLOR }}
        disabled={!ideaText.trim()}
      >
        사업계획서 생성 시작
      </Button>
    </div>
  );
}
