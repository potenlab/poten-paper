'use client';

import type { PhaseCard } from '@/lib/poten-paper/types';

interface PhaseCardsProps {
  title: string;
  data: PhaseCard[];
}

const colorMap = {
  green: { border: 'border-l-green-500', bg: 'bg-green-50', badge: 'bg-green-500' },
  blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', badge: 'bg-blue-500' },
  navy: { border: 'border-l-[#1B2A4A]', bg: 'bg-slate-50', badge: 'bg-[#1B2A4A]' },
};

export function PhaseCards({ title, data }: PhaseCardsProps) {
  const defaultColors: PhaseCard['color'][] = ['green', 'blue', 'navy'];

  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="space-y-3">
        {data.map((card, i) => {
          const color = card.color || defaultColors[i % 3] || 'blue';
          const styles = colorMap[color];
          return (
            <div
              key={i}
              className={`${styles.bg} border border-[#E2E8F0] border-l-4 ${styles.border} rounded-xl p-4 flex gap-4`}
            >
              <div>
                <span className={`${styles.badge} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                  {card.phase}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-800">{card.title}</p>
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                {card.items && card.items.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {card.items.map((item, j) => (
                      <li key={j} className="text-xs text-gray-500">• {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
