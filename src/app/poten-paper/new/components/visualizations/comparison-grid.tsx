'use client';

import type { ComparisonGridData } from '@/lib/poten-paper/types';

interface ComparisonGridProps {
  title: string;
  data: ComparisonGridData;
}

const dotMap = {
  yes: { icon: '✓', bg: 'bg-blue-500 text-white' },
  no: { icon: '—', bg: 'bg-gray-200 text-gray-400' },
  partial: { icon: '△', bg: 'bg-amber-400 text-white' },
};

export function ComparisonGrid({ title, data }: ComparisonGridProps) {
  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 bg-[#1B2A4A] text-white rounded-tl-lg font-medium">
                기능
              </th>
              {data.competitors.map((name, i) => (
                <th
                  key={i}
                  className={`px-3 py-2 bg-[#1B2A4A] text-white text-center font-medium ${
                    i === data.competitors.length - 1 ? 'rounded-tr-lg' : ''
                  }`}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                <td className="px-3 py-2 text-gray-700 font-medium border-b border-[#E2E8F0]">
                  {item.feature}
                </td>
                {item.values.map((v, j) => {
                  const dot = dotMap[v];
                  return (
                    <td key={j} className="px-3 py-2 text-center border-b border-[#E2E8F0]">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${dot.bg}`}
                      >
                        {dot.icon}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
