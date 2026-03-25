'use client';

import type { BmCanvasData } from '@/lib/poten-paper/types';

interface BmCanvasProps {
  title: string;
  data: BmCanvasData;
}

const blocks = [
  { key: 'keyPartners' as const, label: '핵심 파트너', col: 'col-span-2 row-span-2', emoji: '🤝' },
  { key: 'keyActivities' as const, label: '핵심 활동', col: 'col-span-2', emoji: '⚙️' },
  { key: 'valuePropositions' as const, label: '가치 제안', col: 'col-span-2 row-span-2', emoji: '💎' },
  { key: 'customerRelationships' as const, label: '고객 관계', col: 'col-span-2', emoji: '❤️' },
  { key: 'customerSegments' as const, label: '고객 세그먼트', col: 'col-span-2 row-span-2', emoji: '👥' },
  { key: 'keyResources' as const, label: '핵심 자원', col: 'col-span-2', emoji: '🏗️' },
  { key: 'channels' as const, label: '채널', col: 'col-span-2', emoji: '📢' },
  { key: 'costStructure' as const, label: '비용 구조', col: 'col-span-5', emoji: '💰' },
  { key: 'revenueStreams' as const, label: '수익원', col: 'col-span-5', emoji: '💵' },
];

export function BmCanvas({ title, data }: BmCanvasProps) {
  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="grid grid-cols-10 gap-1.5 text-xs">
        {blocks.map((block) => (
          <div
            key={block.key}
            className={`${block.col} bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3`}
          >
            <p className="font-bold text-gray-700 mb-1.5">
              {block.emoji} {block.label}
            </p>
            <ul className="space-y-1">
              {data[block.key].map((item, i) => (
                <li key={i} className="text-gray-600 leading-tight">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
