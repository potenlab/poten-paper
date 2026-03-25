'use client';

import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import type { MainSection, SubSection, SubSubSection } from '@/lib/poten-paper/types';
import { SafeMarkdown } from '@/lib/poten-paper/safe-markdown';
import { ChartRenderer } from '../charts/chart-renderer';
import { VisualizationRenderer } from '../visualizations/visualization-renderer';

// ── Content block types ──────────────────────────────────────────────

export type ContentBlock =
  | { type: 'section-header'; key: string; section: MainSection }
  | { type: 'subsection-header'; key: string; subSection: SubSection }
  | { type: 'subsubsection'; key: string; subSubSection: SubSubSection };

export function flattenSectionsToBlocks(sections: MainSection[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  for (const section of sections) {
    blocks.push({ type: 'section-header', key: `sh-${section.number}`, section });

    for (const subSection of section.subSections) {
      blocks.push({ type: 'subsection-header', key: `ssh-${subSection.id}`, subSection });

      for (const subSubSection of subSection.subSubSections) {
        blocks.push({ type: 'subsubsection', key: `sss-${subSubSection.id}`, subSubSection });
      }
    }
  }

  return blocks;
}

// ── Pagination ───────────────────────────────────────────────────────

const A4_CONTENT_HEIGHT = 971; // 1123px - 76px top - 76px bottom

export function assignBlocksToPages(
  blocks: ContentBlock[],
  heights: number[],
): ContentBlock[][] {
  const pages: ContentBlock[][] = [];
  let currentPage: ContentBlock[] = [];
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const height = heights[i];

    // Section headers always start a new page
    const forceNewPage = block.type === 'section-header' && currentPage.length > 0;

    if (forceNewPage || (currentHeight + height > A4_CONTENT_HEIGHT && currentPage.length > 0)) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(block);
    currentHeight += height;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // Move orphaned headers (alone at bottom of page) to next page
  for (let p = 0; p < pages.length - 1; p++) {
    const page = pages[p];
    const last = page[page.length - 1];
    if (last.type === 'section-header' || last.type === 'subsection-header') {
      page.pop();
      pages[p + 1].unshift(last);
    }
  }

  return pages.filter((p) => p.length > 0);
}

// ── Block renderer ───────────────────────────────────────────────────

interface ContentBlockRendererProps {
  block: ContentBlock;
  showDataAttributes?: boolean;
  hoveredSectionId?: string | null;
  onSectionHover?: (id: string | null) => void;
}

export function ContentBlockRenderer({
  block,
  showDataAttributes = true,
  hoveredSectionId,
  onSectionHover,
}: ContentBlockRendererProps) {
  switch (block.type) {
    case 'section-header':
      return (
        <div
          className="flex items-center gap-3 mb-6 pb-3 border-b-2"
          style={{ borderColor: BRAND_COLOR, color: '#1a1a1a' }}
          {...(showDataAttributes ? { 'data-section-number': block.section.number } : {})}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            {block.section.number}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{block.section.titleKo}</h2>
        </div>
      );

    case 'subsection-header':
      return (
        <div className="mb-3" style={{ color: '#1a1a1a' }}>
          <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
            >
              {block.subSection.id}
            </span>
            {block.subSection.titleKo}
          </h3>
        </div>
      );

    case 'subsubsection': {
      const sss = block.subSubSection;
      const isHovered = hoveredSectionId === sss.id;
      return (
        <div
          className="mb-5 ml-1 rounded-md transition-colors duration-150"
          style={{
            color: '#1a1a1a',
            backgroundColor: isHovered ? 'rgba(234, 179, 8, 0.08)' : 'transparent',
            outline: isHovered ? '1.5px solid rgba(234, 179, 8, 0.35)' : 'none',
            cursor: onSectionHover ? 'pointer' : undefined,
            padding: onSectionHover ? '4px 6px' : undefined,
            margin: onSectionHover ? '0 -6px 20px -6px' : undefined,
          }}
          data-subsub-id={sss.id}
          onMouseEnter={onSectionHover ? () => onSectionHover(sss.id) : undefined}
          onMouseLeave={onSectionHover ? () => onSectionHover(null) : undefined}
        >
          <h4 className="text-[13px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400">{sss.id}</span>
            {sss.titleKo}
          </h4>

          <SafeMarkdown
            content={sss.content}
            variant="pdf"
            className="prose prose-sm max-w-none text-[12px] leading-relaxed"
          />

          {sss.chart && (
            <div className="mt-3 mb-2">
              <ChartRenderer chart={sss.chart} />
            </div>
          )}

          {sss.visualization && (
            <div className="mt-3 mb-2">
              <VisualizationRenderer visualization={sss.visualization} />
            </div>
          )}

          {sss.imageUrl && (
            <div className="mt-3 mb-2">
              <img
                src={sss.imageUrl}
                alt={sss.titleKo}
                className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
              />
            </div>
          )}

          {sss.imagePrompt && !sss.imageUrl && (
            <div className="mt-3 mb-2 w-full max-w-md mx-auto h-40 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <span className="text-xs text-gray-400 animate-pulse">이미지 생성 중...</span>
            </div>
          )}
        </div>
      );
    }
  }
}
