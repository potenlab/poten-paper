'use client';

import { useState, useCallback, useRef, useEffect, type TouchEvent } from 'react';
import type { BusinessPlanDocument, ResearchData } from '@/lib/poten-paper/types';
import { DocumentViewer } from './document-viewer';
import { InsightPanel } from './insight-panel';
import { exportToPdf } from '@/lib/poten-paper/pdf-export';
import { GripVertical } from 'lucide-react';

interface PaperResultLayoutProps {
  document: BusinessPlanDocument;
  researchData: ResearchData;
  originalInput: string;
  onModify: (subSubSectionId: string, instruction: string) => void;
  onUndo?: (subSubSectionId: string) => void;
  undoHistory?: Map<string, unknown>;
  isRegenerating: string | null;
  onSave: () => void;
  onStartOver: () => void;
  isSaving: boolean;
  isSaved: boolean;
  readOnly?: boolean;
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 380;

export function PaperResultLayout({
  document: doc,
  researchData,
  originalInput,
  onModify,
  onUndo,
  undoHistory,
  isRegenerating,
  onSave,
  onStartOver,
  isSaving,
  isSaved,
  readOnly,
}: PaperResultLayoutProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleExportPdf = useCallback(async (element: HTMLDivElement) => {
    setIsExporting(true);
    try {
      const name = doc.cover.businessName || '사업계획서';
      const filename = `${name}_사업계획서.pdf`;
      await exportToPdf(element, filename, name);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [doc.cover.businessName]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: sidebarWidth };
    setIsDragging(true);
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = e.clientX - dragRef.current.startX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragRef.current.startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Mobile swipe-to-close
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
    // Swipe left with enough distance and more horizontal than vertical
    if (deltaX < -80 && deltaY < 100) {
      setSidebarOpen(false);
    }
    touchStartRef.current = null;
  }, []);

  const insightPanelProps = {
    originalInput,
    researchData,
    document: doc,
    onModify,
    onUndo,
    undoHistory,
    hoveredSectionId,
    isRegenerating,
    onSave,
    onStartOver,
    isSaving,
    isSaved,
  };

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Left Panel - Insight (desktop: inline, mobile: slide-over) */}
      {!readOnly && sidebarOpen && (
        <>
          {/* Desktop sidebar */}
          <div
            className="hidden lg:flex border-r border-border overflow-hidden flex-col flex-shrink-0"
            style={{ width: sidebarWidth, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH }}
          >
            <InsightPanel {...insightPanelProps} />
          </div>
          {/* Desktop drag handle */}
          <div
            className="hidden lg:flex items-center justify-center w-2 cursor-col-resize hover:bg-primary/10 active:bg-primary/20 transition-colors group flex-shrink-0"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {/* Mobile: backdrop + slide-over */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="lg:hidden fixed inset-y-0 left-0 right-12 z-50 max-w-[400px] bg-background rounded-r-2xl border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left duration-200"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <InsightPanel {...insightPanelProps} />
          </div>
        </>
      )}

      {/* Right Panel - Document Viewer (always visible) */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        <DocumentViewer
          document={doc}
          onExportPdf={handleExportPdf}
          isExporting={isExporting}
          hoveredSectionId={hoveredSectionId}
          onSectionHover={!readOnly ? setHoveredSectionId : undefined}
          sidebarOpen={!readOnly ? sidebarOpen : undefined}
          onToggleSidebar={!readOnly ? () => setSidebarOpen(!sidebarOpen) : undefined}
        />
      </div>
    </div>
  );
}
