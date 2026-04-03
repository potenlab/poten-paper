'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PRDDocument } from '@/lib/prd/types';
import { CoverPage } from './CoverPage';
import {
  ContentBlockRenderer,
  flattenDocumentToBlocks,
  assignBlocksToPages,
  type ContentBlock,
} from './SectionRenderer';
import { DocumentToolbar } from './DocumentToolbar';
import './document-viewer.css';

interface DocumentViewerProps {
  document: PRDDocument;
  onExportPdf: (el: HTMLDivElement) => void;
  isExporting?: boolean;
}

export function DocumentViewer({ document: doc, onExportPdf, isExporting }: DocumentViewerProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<ContentBlock[][] | null>(null);

  const blocks = useMemo(
    () => flattenDocumentToBlocks(doc),
    [doc],
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

  useEffect(() => {
    const container = measureRef.current;
    if (!container || blocks.length === 0) return;

    setPages(null);

    let debounceTimer: ReturnType<typeof setTimeout>;

    const observer = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measure, 150);
    });

    observer.observe(container);

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

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <DocumentToolbar
        document={doc}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
      />

      {/* Hidden measurement container */}
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
          <CoverPage cover={doc.cover} />

          {pages
            ? pages.map((pageBlocks, pageIndex) => (
                <div key={pageIndex} className="a4-page">
                  {pageBlocks.map((block) => (
                    <ContentBlockRenderer key={block.key} block={block} />
                  ))}
                </div>
              ))
            : <div className="a4-page">
                {blocks.map((block) => (
                  <ContentBlockRenderer key={block.key} block={block} />
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
