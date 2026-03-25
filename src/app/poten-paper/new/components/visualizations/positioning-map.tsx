'use client';

import type { PositioningMapData } from '@/lib/poten-paper/types';

interface PositioningMapProps {
  title: string;
  data: PositioningMapData;
}

export function PositioningMap({ title, data }: PositioningMapProps) {
  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="relative w-full aspect-square max-w-[400px] mx-auto border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] overflow-hidden">
        {/* Y axis */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-[#CBD5E1]" style={{ left: '50%' }} />
        {/* X axis */}
        <div className="absolute left-0 right-0 h-px bg-[#CBD5E1]" style={{ top: '50%' }} />

        {/* Axis labels */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium">
          {data.yAxisLabel} ↑
        </span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium">
          ↓
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
          {data.xAxisLabel} →
        </span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
          ←
        </span>

        {/* Dots */}
        {data.dots.map((dot, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${dot.x}%`, top: `${100 - dot.y}%` }}
          >
            <div
              className={`rounded-full flex items-center justify-center text-xs font-bold ${
                dot.isOurs
                  ? 'w-10 h-10 bg-[#3B82F6] text-white shadow-lg shadow-blue-200'
                  : 'w-7 h-7 bg-gray-300 text-gray-700'
              }`}
            />
            <span
              className={`text-[10px] mt-1 whitespace-nowrap font-medium ${
                dot.isOurs ? 'text-[#3B82F6]' : 'text-gray-500'
              }`}
            >
              {dot.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
