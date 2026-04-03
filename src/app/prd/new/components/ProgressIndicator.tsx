import { Check } from 'lucide-react';
import type { PrdStep } from '@/lib/prd/types';
import { BRAND_COLOR } from '@/lib/prd/constants';

const STEPS: { key: PrdStep; label: string }[] = [
  { key: 'input-method', label: '입력방법' },
  { key: 'input', label: '정보입력' },
  { key: 'processing', label: 'AI 생성' },
  { key: 'result', label: '결과' },
];

interface ProgressIndicatorProps {
  currentStep: PrdStep;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const isActive = i <= currentIndex;
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-muted'
                }`}
                style={isActive ? { backgroundColor: BRAND_COLOR } : undefined}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  isCurrent ? 'text-foreground' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 rounded-full ${
                  isCompleted ? '' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                style={isCompleted ? { backgroundColor: BRAND_COLOR } : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
