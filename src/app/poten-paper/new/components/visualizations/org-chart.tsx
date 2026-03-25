'use client';

import type { OrgChartMember } from '@/lib/poten-paper/types';

interface OrgChartProps {
  title: string;
  data: OrgChartMember[];
}

export function OrgChart({ title, data }: OrgChartProps) {
  const ceo = data.find((m) => m.isCeo);
  const members = data.filter((m) => !m.isCeo);

  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="flex flex-col items-center gap-0">
        {ceo && (
          <>
            <div className="bg-[#1B2A4A] text-white rounded-xl px-6 py-3 text-center">
              <p className="font-bold">{ceo.name}</p>
              <p className="text-xs text-gray-300">{ceo.role}</p>
            </div>
            {members.length > 0 && (
              <div className="w-px h-6 bg-[#CBD5E1]" />
            )}
          </>
        )}
        {members.length > 0 && (
          <>
            <div className="h-px bg-[#CBD5E1]" style={{ width: `${Math.min(members.length * 140, 560)}px` }} />
            <div className="flex gap-4 mt-0">
              {members.map((m, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-[#CBD5E1]" />
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-3 text-center min-w-[120px]">
                    <p className="font-bold text-sm text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
