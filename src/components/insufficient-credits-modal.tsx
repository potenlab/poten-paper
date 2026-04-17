'use client';

import { CreditCard, ExternalLink, X } from 'lucide-react';

interface InsufficientCreditsModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  required: number;
  featureLabel: string; // "사업계획서 생성" 등
}

const PURCHASE_URL = process.env.NEXT_PUBLIC_PURCHASE_URL || 'https://thepotential.kr/credits';

export function InsufficientCreditsModal({
  open,
  onClose,
  balance,
  required,
  featureLabel,
}: InsufficientCreditsModalProps) {
  if (!open) return null;

  const short = Math.max(0, required - balance);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-7">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-amber-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">크레딧이 부족해요</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {featureLabel}은 <strong className="text-gray-900">{required}c</strong> 가 필요해요.
          </p>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">현재 잔액</span>
              <span className="font-semibold text-gray-900">{balance}c</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">필요 크레딧</span>
              <span className="font-semibold text-gray-900">{required}c</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-600 font-semibold">부족</span>
              <span className="font-bold text-amber-600">{short}c</span>
            </div>
          </div>

          <a
            href={PURCHASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#14A697] to-[#0079FF] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            더포텐셜에서 크레딧 받기
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 mt-2 rounded-xl bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
