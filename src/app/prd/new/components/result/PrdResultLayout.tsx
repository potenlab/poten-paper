'use client';

import { useState, useCallback } from 'react';
import { PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import type { PRDDocument, AnalysisData } from '@/lib/prd/types';
import { DocumentViewer } from './DocumentViewer';
import { InsightPanel } from './InsightPanel';
import { exportToPdf } from '@/lib/prd/pdf-export';
import { BRAND_COLOR } from '@/lib/prd/constants';

interface PrdResultLayoutProps {
  document: PRDDocument;
  analysisData: AnalysisData;
  originalInput: string;
  onModify: (message: string, images?: string[]) => void;
  isModifying: boolean;
  lastModifySummary: string | null;
  onSave: () => void;
  onStartOver: () => void;
  isSaving: boolean;
  isSaved: boolean;
  readOnly?: boolean;
}

export function PrdResultLayout({
  document: doc,
  analysisData,
  originalInput,
  onModify,
  isModifying,
  lastModifySummary,
  onSave,
  onStartOver,
  isSaving,
  isSaved,
  readOnly,
}: PrdResultLayoutProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleExportPdf = useCallback(async (element: HTMLDivElement) => {
    setIsExporting(true);
    try {
      const name = doc.cover.projectName || 'PRD';
      const filename = `${name}_PRD.pdf`;
      await exportToPdf(element, filename, name);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [doc.cover.projectName]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* PDF Export Blocking Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: BRAND_COLOR }} />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">PDF 생성 중...</p>
              <p className="text-sm text-gray-500 mt-1">문서를 변환하고 있습니다. 잠시만 기다려주세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      {!readOnly && (
        <div
          className={`
            relative flex flex-col border-r border-border bg-card
            transition-all duration-300 ease-in-out shrink-0
            ${sidebarOpen ? 'w-[360px]' : 'w-0'}
          `}
        >
          {/* Sidebar Content */}
          <div className={`flex flex-col h-full overflow-hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <InsightPanel
              originalInput={originalInput}
              analysisData={analysisData}
              document={doc}
              onModify={onModify}
              isModifying={isModifying}
              lastModifySummary={lastModifySummary}
              onSave={onSave}
              onStartOver={onStartOver}
              isSaving={isSaving}
              isSaved={isSaved}
            />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!readOnly && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-3 z-30 flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-300 shadow-sm"
          style={{ left: sidebarOpen ? '348px' : '8px' }}
          title={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
        >
          {sidebarOpen
            ? <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            : <PanelLeftOpen className="w-4 h-4" style={{ color: BRAND_COLOR }} />
          }
        </button>
      )}

      {/* Right Panel - Document Viewer */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        <DocumentViewer
          document={doc}
          onExportPdf={handleExportPdf}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}
