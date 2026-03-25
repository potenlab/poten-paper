'use client';

import type { SwotData } from '@/lib/poten-paper/types';

interface SwotAnalysisProps {
  title: string;
  data: SwotData;
}

const quadrants = [
  { key: 'strengths' as const, label: 'Strengths', emoji: '💪', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500' },
  { key: 'weaknesses' as const, label: 'Weaknesses', emoji: '⚠️', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
  { key: 'opportunities' as const, label: 'Opportunities', emoji: '🚀', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', dot: 'bg-green-500' },
  { key: 'threats' as const, label: 'Threats', emoji: '🔥', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
];

export function SwotAnalysis({ title, data }: SwotAnalysisProps) {
  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {quadrants.map((q) => (
          <div key={q.key} className={`${q.bg} ${q.border} border rounded-xl p-4`}>
            <h5 className={`font-bold text-sm ${q.text} mb-2`}>
              {q.emoji} {q.label}
            </h5>
            <ul className="space-y-1.5">
              {data[q.key].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className={`${q.dot} w-1.5 h-1.5 rounded-full mt-1.5 shrink-0`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
