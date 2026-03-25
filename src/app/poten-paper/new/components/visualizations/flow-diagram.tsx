'use client';

import type { FlowStep } from '@/lib/poten-paper/types';

interface FlowDiagramProps {
  title: string;
  data: FlowStep[];
}

const variantStyles = {
  default: 'bg-[#F8FAFC] border-[#E2E8F0] text-gray-800',
  accent: 'bg-[#3B82F6] border-[#3B82F6] text-white',
  dark: 'bg-[#1B2A4A] border-[#1B2A4A] text-white',
};

export function FlowDiagram({ title, data }: FlowDiagramProps) {
  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="flex items-center gap-0 flex-wrap justify-center">
        {data.map((step, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`border rounded-xl px-4 py-3 text-center min-w-[100px] ${
                variantStyles[step.variant || 'default']
              }`}
            >
              <p className="font-bold text-sm">{step.label}</p>
              {step.description && (
                <p className="text-xs mt-1 opacity-80">{step.description}</p>
              )}
            </div>
            {i < data.length - 1 && (
              <span className="text-gray-400 text-xl mx-1">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
