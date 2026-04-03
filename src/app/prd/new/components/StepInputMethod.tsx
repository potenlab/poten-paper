'use client';

import { motion } from 'framer-motion';
import { Upload, Lightbulb, ArrowRight } from 'lucide-react';
import type { InputMethod } from '@/lib/prd/types';
import { BRAND_COLOR } from '@/lib/prd/constants';

interface StepInputMethodProps {
  onSelect: (method: InputMethod) => void;
}

const OPTIONS = [
  {
    method: 'upload' as InputMethod,
    icon: Upload,
    title: '문서 업로드',
    description: 'PDF, DOCX 파일을 업로드하면 AI가 분석하여 PRD로 변환합니다.',
    badge: 'PDF, DOCX 지원',
  },
  {
    method: 'form' as InputMethod,
    icon: Lightbulb,
    title: '아이디어 입력',
    description: '프로젝트 아이디어를 자유롭게 입력하면 AI가 상세 PRD를 작성합니다.',
    badge: '자유 텍스트 입력',
  },
];

export function StepInputMethod({ onSelect }: StepInputMethodProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          어떻게 시작하시겠어요?
        </h2>
        <p className="text-muted-foreground">
          기존 기획서가 있다면 업로드, 아이디어만 있다면 텍스트 입력을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.method}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            onClick={() => onSelect(opt.method)}
            className="group bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-all text-left cursor-pointer"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
              style={{ backgroundColor: `${BRAND_COLOR}15` }}
            >
              <opt.icon className="w-7 h-7" style={{ color: BRAND_COLOR }} />
            </div>
            <span
              className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4"
              style={{ backgroundColor: `${BRAND_COLOR}10`, color: BRAND_COLOR }}
            >
              {opt.badge}
            </span>
            <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
              {opt.title}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: BRAND_COLOR }} />
            </h3>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              {opt.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
