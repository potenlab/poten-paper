'use client';

import type { StatCard } from '@/lib/poten-paper/types';

interface StatCardsProps {
  title: string;
  data: StatCard[];
}

export function StatCards({ title, data }: StatCardsProps) {
  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl p-4 border ${
              card.highlight
                ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                : 'bg-[#F8FAFC] text-gray-900 border-[#E2E8F0]'
            }`}
          >
            {card.icon && <span className="text-2xl mb-2 block">{card.icon}</span>}
            <p className={`text-xs ${card.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
              {card.label}
            </p>
            <p className="text-xl font-bold mt-1">{card.value}</p>
            {card.subText && (
              <p className={`text-xs mt-1 ${card.highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                {card.subText}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
