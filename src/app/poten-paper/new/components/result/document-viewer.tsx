'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BusinessPlanDocument } from '@/lib/poten-paper/types';
import { CoverPage } from './cover-page';
import {
  ContentBlockRenderer,
  flattenSectionsToBlocks,
  assignBlocksToPages,
  type ContentBlock,
} from './section-renderer';
import { DocumentToolbar } from './document-toolbar';

interface DocumentViewerProps {
  document: BusinessPlanDocument;
  onExportPdf: (el: HTMLDivElement) => void;
  isExporting?: boolean;
  hoveredSectionId?: string | null;
  onSectionHover?: (id: string | null) => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function DocumentViewer({ document: doc, onExportPdf, isExporting, hoveredSectionId, onSectionHover, sidebarOpen, onToggleSidebar }: DocumentViewerProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<ContentBlock[][] | null>(null);

  const blocks = useMemo(
    () => flattenSectionsToBlocks(doc.sections),
    [doc.sections],
  );

  const measure = useCallback(() => {
    const container = measureRef.current;
    if (!container || blocks.length === 0) return;

    const children = Array.from(container.children) as HTMLElement[];
    if (children.length !== blocks.length) return;

    const heights = children.map((child) => {
      const style = getComputedStyle(child);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      return child.offsetHeight + marginTop + marginBottom;
    });

    setPages(assignBlocksToPages(blocks, heights));
  }, [blocks]);

  // Use ResizeObserver to measure block heights once children have stabilized
  useEffect(() => {
    const container = measureRef.current;
    if (!container || blocks.length === 0) return;

    setPages(null); // Reset while re-measuring

    let debounceTimer: ReturnType<typeof setTimeout>;

    const observer = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measure, 150);
    });

    observer.observe(container);

    // Also observe each child so chart resizes are detected
    const children = Array.from(container.children);
    for (const child of children) {
      observer.observe(child);
    }

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [blocks, measure]);

  const handleExportPdf = () => {
    if (documentRef.current) {
      onExportPdf(documentRef.current);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <DocumentToolbar
        sections={doc.sections}
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        isExporting={isExporting}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
      />

      {/* Hidden measurement container — same content width as A4 page (794 - 76*2) */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '642px',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {blocks.map((block) => (
          <ContentBlockRenderer key={block.key} block={block} showDataAttributes={false} />
        ))}
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8" id="document-scroll-area">
        <div ref={documentRef} id="paper-document" className="mx-auto document-pages">
          {/* Cover Page */}
          <CoverPage cover={doc.cover} />

          {/* Content Pages */}
          {pages
            ? pages.map((pageBlocks, pageIndex) => (
                <div key={pageIndex} className="a4-page">
                  {pageBlocks.map((block) => (
                    <ContentBlockRenderer
                      key={block.key}
                      block={block}
                      hoveredSectionId={hoveredSectionId}
                      onSectionHover={onSectionHover}
                    />
                  ))}
                </div>
              ))
            : /* Show as single continuous page while measuring */
              <div className="a4-page">
                {blocks.map((block) => (
                  <ContentBlockRenderer
                    key={block.key}
                    block={block}
                    hoveredSectionId={hoveredSectionId}
                    onSectionHover={onSectionHover}
                  />
                ))}
              </div>
          }
        </div>
      </div>

      {/* Document Styles */}
      <style jsx global>{`
        .document-pages {
          width: 794px;
          max-width: 100%;
          margin: 0 auto;
        }

        .document-pages .a4-page {
          width: 794px;
          min-height: 1123px;
          padding: 76px 76px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
          border-radius: 4px;
          color-scheme: light;
        }

        @media (max-width: 1023px) {
          .document-pages,
          .document-pages .a4-page {
            width: 100%;
          }
          .document-pages .a4-page {
            min-height: auto;
            padding: 24px;
            box-shadow: none;
            border-radius: 0;
            margin-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }
        }

        @media print {
          .document-pages .a4-page {
            box-shadow: none;
            margin-bottom: 0;
            page-break-after: always;
            border-radius: 0;
          }

          #document-scroll-area {
            overflow: visible !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
