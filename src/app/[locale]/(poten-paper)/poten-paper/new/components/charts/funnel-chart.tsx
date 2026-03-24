'use client';

import type { ChartData } from '@/lib/poten-paper/types';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';

interface FunnelChartProps {
  chart: ChartData;
}

const OPACITY_LEVELS = [1, 0.6, 0.35];

export function FunnelChart({ chart }: FunnelChartProps) {
  const items = chart.data.slice(0, 3);

  if (items.length === 0) return null;

  const maxValue = Math.max(
    ...items.map((item) => Number(item.value) || 0)
  );

  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-800">
        {chart.title}
      </h4>
      <div className="flex flex-col items-center gap-2 py-4">
        {items.map((item, index) => {
          const value = Number(item.value) || 0;
          const widthPercent =
            maxValue > 0
              ? Math.max((value / maxValue) * 100, 20)
              : 100 - index * 25;

          return (
            <div
              key={index}
              className="flex items-center justify-center rounded-md px-4 py-3 text-center transition-all"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: BRAND_COLOR,
                opacity: OPACITY_LEVELS[index] ?? 0.35,
                minWidth: 120,
              }}
            >
              <span className="text-xs font-semibold text-white">
                {String(item.name)}
                <span className="ml-2 font-normal">
                  {typeof item.value === 'number'
                    ? item.value.toLocaleString()
                    : item.value}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
