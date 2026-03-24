'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer, ChevronDown, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import type { MainSection } from '@/lib/poten-paper/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentToolbarProps {
  sections: MainSection[];
  onExportPdf: () => void;
  onPrint: () => void;
  isExporting?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function DocumentToolbar({ sections, onExportPdf, onPrint, isExporting, sidebarOpen, onToggleSidebar }: DocumentToolbarProps) {
  const scrollToSection = (sectionNumber: string) => {
    const el = document.querySelector(`[data-section-number="${sectionNumber}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 rounded-t-xl">
      <div className="flex items-center gap-1">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-xs gap-1 text-gray-600 h-8 px-2"
            title={sidebarOpen ? '패널 닫기' : '패널 열기'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
        )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-gray-600">
            섹션 이동
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {sections.map((section) => (
            <DropdownMenuItem
              key={section.key}
              onClick={() => scrollToSection(section.number)}
              className="text-xs"
            >
              <span className="font-semibold mr-2" style={{ color: BRAND_COLOR }}>{section.number}</span>
              {section.titleKo}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="text-xs gap-1.5 h-8 rounded-lg"
        >
          <Printer className="w-3.5 h-3.5" />
          인쇄
        </Button>
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
