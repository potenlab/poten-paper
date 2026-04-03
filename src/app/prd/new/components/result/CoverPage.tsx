import { BRAND_COLOR } from '@/lib/prd/constants';
import type { PrdCoverPage } from '@/lib/prd/types';

interface CoverPageProps {
  cover: PrdCoverPage;
}

export function CoverPage({ cover }: CoverPageProps) {
  if (!cover) return null;
  return (
    <div className="a4-page flex flex-col items-center justify-center text-center" style={{ color: '#1a1a1a' }}>
      {/* Top decorative bar */}
      <div className="w-24 h-1 rounded-full mb-16" style={{ backgroundColor: BRAND_COLOR }} />

      <p className="text-sm tracking-[0.3em] uppercase text-gray-400 mb-6">Product Requirements Document</p>

      <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
        PRD
      </h1>

      <div className="w-16 h-px bg-gray-200 my-6" />

      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        {cover?.projectName || 'PRD'}
      </h2>

      {cover?.subtitle && (
        <p className="text-base text-gray-500 mb-8 max-w-md">
          {cover.subtitle}
        </p>
      )}

      <div className="mt-auto pt-20">
        <p className="text-sm text-gray-400">{cover?.date || ''} | v{cover?.version || '1.0'}</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: BRAND_COLOR }}>
            <span className="text-white text-[10px] font-bold">P</span>
          </div>
          <span className="text-xs text-gray-400">Powered by Potenlab PRD</span>
        </div>
      </div>
    </div>
  );
}
