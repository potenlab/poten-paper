'use client';

import { Button } from '@/components/ui/button';
import { Download, ChevronDown } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/prd/constants';
import type { PRDDocument } from '@/lib/prd/types';
import { useState, useRef, useEffect } from 'react';

interface DocumentToolbarProps {
  document: PRDDocument;
  onExportPdf: () => void;
  isExporting?: boolean;
}

export function DocumentToolbar({ document: doc, onExportPdf, isExporting }: DocumentToolbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToElement = (selector: string) => {
    const el = window.document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowDropdown(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 rounded-t-xl">
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1 text-gray-600"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          섹션 이동
          <ChevronDown className="w-3 h-3" />
        </Button>
        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[200px]">
            <button
              onClick={() => scrollToElement('[data-section-id="part1"]')}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
            >
              <span className="font-semibold mr-2" style={{ color: BRAND_COLOR }}>Part 1</span>
              프로젝트 공통 정의
            </button>
            {doc.features.map((feature, i) => (
              <button
                key={feature.id}
                onClick={() => scrollToElement(`[data-feature-id="${feature.id}"]`)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                <span className="font-semibold mr-2" style={{ color: BRAND_COLOR }}>{i + 1}</span>
                {feature.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onExportPdf}
          disabled={isExporting}
          className="text-xs gap-1.5 h-8 rounded-lg text-white"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? 'PDF 생성 중...' : 'PDF 다운로드'}
        </Button>
      </div>
    </div>
  );
}
