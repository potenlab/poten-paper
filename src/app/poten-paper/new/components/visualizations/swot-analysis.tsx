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

const crossCells = [
  { key: 'so' as const, label: 'SO 공격 전략', sub: '강점 × 기회', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800', dot: 'bg-sky-500' },
  { key: 'st' as const, label: 'ST 방어 전략', sub: '강점 × 위협', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  { key: 'wo' as const, label: 'WO 개선 전략', sub: '약점 × 기회', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  { key: 'wt' as const, label: 'WT 생존 전략', sub: '약점 × 위협', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', dot: 'bg-rose-500' },
];

export function SwotAnalysis({ title, data }: SwotAnalysisProps) {
  const cross = data.crossStrategies;

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

      {cross && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between mb-2">
            <h5 className="text-sm font-semibold text-gray-600">TOWS 교차 전략</h5>
            <span className="text-[11px] text-gray-400">SWOT 를 곱해 만드는 실행 전략</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {crossCells.map((c) => {
              const items = cross[c.key] ?? [];
              if (items.length === 0) return null;
              return (
                <div key={c.key} className={`${c.bg} ${c.border} border rounded-xl p-4`}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h6 className={`font-bold text-sm ${c.text}`}>{c.label}</h6>
                    <span className="text-[11px] text-gray-500">{c.sub}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className={`${c.dot} w-1.5 h-1.5 rounded-full mt-1.5 shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
