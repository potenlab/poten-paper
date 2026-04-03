import { BRAND_COLOR } from '@/lib/prd/constants';
import { SafeMarkdown } from '@/lib/prd/safe-markdown';
import type {
  PRDDocument,
  GlobalRules,
  DataDictionaryEntry,
  FeatureSpec,
  DisplayDataRow,
  ActionDefinitionRow,
} from '@/lib/prd/types';

// ── Content block types ──────────────────────────────────────────────

export type ContentBlock =
  | { type: 'part-header'; key: string; title: string }
  | { type: 'global-section'; key: string; sectionKey: string; title: string; globalRules: GlobalRules }
  | { type: 'feature-header'; key: string; feature: FeatureSpec; index: number }
  | { type: 'feature-section'; key: string; feature: FeatureSpec; sectionKey: string; title: string }
  | { type: 'feature-preview'; key: string; feature: FeatureSpec };

export function flattenDocumentToBlocks(doc: PRDDocument): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  const globalRules = doc.globalRules || ({} as GlobalRules);

  // Part 1: Global Rules
  blocks.push({ type: 'part-header', key: 'part1', title: 'Part 1. 프로젝트 공통 정의' });
  blocks.push({ type: 'global-section', key: 'gs-dod', sectionKey: 'definitionOfDone', title: '완료 기준 (Definition of Done)', globalRules });
  blocks.push({ type: 'global-section', key: 'gs-tech', sectionKey: 'techSpecs', title: '기술 스택', globalRules });
  blocks.push({ type: 'global-section', key: 'gs-flow', sectionKey: 'userFlow', title: '사용자 흐름 / 라우팅', globalRules });

  // Data Dictionary (if present)
  if (globalRules.dataDictionary && globalRules.dataDictionary.length > 0) {
    blocks.push({ type: 'global-section', key: 'gs-datadict', sectionKey: 'dataDictionary', title: '공통 분류 기준 (데이터 사전)', globalRules });
  }

  // Render any other extra globalRules sections dynamically
  const knownGlobalKeys = new Set(['definitionOfDone', 'techSpecs', 'userFlow', 'dataDictionary']);
  for (const key of Object.keys(globalRules)) {
    if (!knownGlobalKeys.has(key)) {
      blocks.push({ type: 'global-section', key: `gs-${key}`, sectionKey: key, title: key, globalRules });
    }
  }

  // Part 2: Feature Specs
  const features = doc.features || [];
  blocks.push({ type: 'part-header', key: 'part2', title: 'Part 2. 기능별 상세 명세' });

  const sectionDefs = [
    { key: 'purpose', title: '기능 목적' },
    { key: 'userDefinition', title: '사용자 정의' },
    { key: 'layoutStructure', title: '레이아웃 구조' },
    { key: 'displayData', title: '표시 데이터 정의' },
    { key: 'uiElements', title: 'UI 요소' },
    { key: 'stateMachine', title: '상태 머신' },
    { key: 'actionDefinitions', title: '액션 정의' },
    { key: 'operationalPolicy', title: '운영 정책' },
  ];

  for (let i = 0; i < features.length; i++) {
    const feature = features[i]!;
    blocks.push({ type: 'feature-header', key: `fh-${feature.id}`, feature, index: i });
    if (feature.uiPreviewHtml) {
      blocks.push({ type: 'feature-preview', key: `fp-${feature.id}`, feature });
    }
    for (const def of sectionDefs) {
      blocks.push({
        type: 'feature-section',
        key: `fs-${feature.id}-${def.key}`,
        feature,
        sectionKey: def.key,
        title: def.title,
      });
    }
  }

  return blocks;
}

// ── Pagination ───────────────────────────────────────────────────────

const A4_CONTENT_HEIGHT = 971;

export function assignBlocksToPages(
  blocks: ContentBlock[],
  heights: number[],
): ContentBlock[][] {
  const pages: ContentBlock[][] = [];
  let currentPage: ContentBlock[] = [];
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    const height = heights[i]!;

    // Feature previews (iframes) always start a new page since their height is unpredictable
    const forceNewPage =
      (block.type === 'part-header' || block.type === 'feature-header' || block.type === 'feature-preview')
      && currentPage.length > 0;

    if (forceNewPage || (currentHeight + height > A4_CONTENT_HEIGHT && currentPage.length > 0)) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(block);
    // For feature-preview, fill the page so next block starts a fresh page
    currentHeight += block.type === 'feature-preview' ? A4_CONTENT_HEIGHT : height;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // Move orphaned headers to next page
  for (let p = 0; p < pages.length - 1; p++) {
    const page = pages[p]!;
    const last = page[page.length - 1];
    if (last && (last.type === 'part-header' || last.type === 'feature-header')) {
      page.pop();
      pages[p + 1]!.unshift(last);
    }
  }

  return pages.filter((p) => p.length > 0);
}

// ── Block renderer ───────────────────────────────────────────────────

interface ContentBlockRendererProps {
  block: ContentBlock;
  showDataAttributes?: boolean;
}

export function ContentBlockRenderer({
  block,
  showDataAttributes = true,
}: ContentBlockRendererProps) {
  switch (block.type) {
    case 'part-header':
      return (
        <div
          className="flex items-center gap-3 mb-6 pb-3 border-b-2"
          style={{ borderColor: BRAND_COLOR, color: '#1a1a1a' }}
          {...(showDataAttributes ? { 'data-section-id': block.key } : {})}
        >
          <h2 className="text-xl font-bold text-gray-900">{block.title}</h2>
        </div>
      );

    case 'global-section':
      return <GlobalSectionBlock sectionKey={block.sectionKey} title={block.title} globalRules={block.globalRules} />;

    case 'feature-header':
      return (
        <div
          className="flex items-center gap-3 mb-6 pb-3 border-b-2 mt-4"
          style={{ borderColor: BRAND_COLOR, color: '#1a1a1a' }}
          {...(showDataAttributes ? { 'data-feature-id': block.feature.id } : {})}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            {block.index + 1}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{block.feature.name}</h2>
        </div>
      );

    case 'feature-preview':
      return <FeaturePreviewRenderer feature={block.feature} />;

    case 'feature-section':
      return <FeatureSectionBlock feature={block.feature} sectionKey={block.sectionKey} title={block.title} />;
  }
}

// ── Feature Preview Renderer ─────────────────────────────────────────

function FeaturePreviewRenderer({ feature }: { feature: FeatureSpec }) {
  if (!feature.uiPreviewHtml) return null;

  // Inject CSS to make the UI preview fill full width and render larger
  const injectStyle = `<style>
html{zoom:1.4;-moz-transform:scale(1.4);-moz-transform-origin:0 0;}
body,main,#root,#app,.container,.wrapper{width:100%!important;max-width:100%!important;margin:0 auto!important;padding-left:16px!important;padding-right:16px!important;box-sizing:border-box!important;}
form,section,article,.card{width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
input,select,textarea,button{max-width:100%!important;box-sizing:border-box!important;}
</style>`;
  const enhancedHtml = feature.uiPreviewHtml.replace(
    /(<head[^>]*>)/i,
    `$1${injectStyle}`,
  ) || `${injectStyle}${feature.uiPreviewHtml}`;

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    try {
      const doc = iframe.contentDocument;
      if (doc?.body) {
        const height = Math.min(Math.round(doc.body.scrollHeight * 1.4) + 16, 1200);
        iframe.style.height = `${height}px`;
      }
    } catch {
      // cross-origin fallback
    }
  };

  return (
    <div className="mb-5">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-t-xl">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          UI Preview
        </span>
        <span className="text-[12px] text-gray-300">{feature.name}</span>
      </div>
      {/* Content */}
      <div className="border-2 border-t-0 border-gray-200 rounded-b-xl overflow-hidden bg-white shadow-lg">
        <iframe
          srcDoc={enhancedHtml}
          sandbox="allow-same-origin"
          className="w-full border-0"
          style={{ width: '100%', height: 600 }}
          onLoad={handleIframeLoad}
          title={`${feature.name} UI Preview`}
        />
      </div>
    </div>
  );
}

// ── Global Section Renderer ──────────────────────────────────────────

function GlobalSectionBlock({ sectionKey, title, globalRules }: { sectionKey: string; title: string; globalRules: GlobalRules }) {
  return (
    <div className="mb-5 ml-1" style={{ color: '#1a1a1a' }}>
      <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}>
          Part 1
        </span>
        {title}
      </h3>

      {sectionKey === 'definitionOfDone' && globalRules.definitionOfDone?.items && (
        <ul className="space-y-1 text-[12px] text-gray-700">
          {globalRules.definitionOfDone.items.map((item, i) => (
            <li key={i} className="ml-4 list-disc">{item}</li>
          ))}
        </ul>
      )}

      {sectionKey === 'techSpecs' && globalRules.techSpecs && (
        <div className="space-y-2 text-[12px] text-gray-700">
          {globalRules.techSpecs.frontend && <div><span className="font-semibold">Frontend:</span> {globalRules.techSpecs.frontend}</div>}
          {globalRules.techSpecs.backendAndDb && <div><span className="font-semibold">Backend & DB:</span> {globalRules.techSpecs.backendAndDb}</div>}
          {globalRules.techSpecs.externalIntegrations && <div><span className="font-semibold">External Integrations:</span> {globalRules.techSpecs.externalIntegrations}</div>}
          {globalRules.techSpecs.dataInitialization && <div><span className="font-semibold">Data Initialization:</span> {globalRules.techSpecs.dataInitialization}</div>}
        </div>
      )}

      {sectionKey === 'userFlow' && globalRules.userFlow?.routes && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Route</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Description</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Access</th>
              </tr>
            </thead>
            <tbody>
              {globalRules.userFlow.routes.map((route, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 px-2 font-mono text-gray-600">{route.route}</td>
                  <td className="py-1.5 px-2 text-gray-600">{route.description}</td>
                  <td className="py-1.5 px-2">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}>
                      {route.accessLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sectionKey === 'dataDictionary' && globalRules.dataDictionary && (
        <DataDictionaryRenderer entries={globalRules.dataDictionary} />
      )}

      {/* Dynamic sections (unknown keys) */}
      {!['definitionOfDone', 'techSpecs', 'userFlow', 'dataDictionary'].includes(sectionKey) && (
        <DynamicGlobalSectionRenderer data={(globalRules as any)[sectionKey]} />
      )}
    </div>
  );
}

// ── Data Dictionary Renderer ─────────────────────────────────────────

function DataDictionaryRenderer({ entries }: { entries: DataDictionaryEntry[] }) {
  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3">
          <h5 className="text-[12px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}>
              분류 {i + 1}
            </span>
            {entry.name}
          </h5>
          <div className="space-y-2">
            {entry.categories.map((cat, j) => (
              <div key={j}>
                <span className="text-[11px] font-semibold text-gray-700">{cat.label}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {cat.items.map((item, k) => (
                    <span
                      key={k}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Dynamic Global Section Renderer (masterData, etc.) ───────────────

function DynamicGlobalSectionRenderer({ data }: { data: any }) {
  if (!data) return null;

  // String value
  if (typeof data === 'string') {
    return <p className="text-[12px] text-gray-700 whitespace-pre-wrap">{data}</p>;
  }

  // Array of strings or objects
  if (Array.isArray(data)) {
    return (
      <ul className="space-y-1 text-[12px] text-gray-700">
        {data.map((item, i) => (
          <li key={i} className="ml-4 list-disc">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }

  // Object with sub-keys (e.g. masterData: { jobTypes: [...], foodCategories: [...] })
  if (typeof data === 'object') {
    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <h5 className="text-[12px] font-semibold text-gray-700 mb-1.5">{key}</h5>
            {Array.isArray(value) ? (
              <div className="flex flex-wrap gap-1.5">
                {(value as any[]).map((item, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {typeof item === 'string' ? item : (item.name || item.label || JSON.stringify(item))}
                  </span>
                ))}
              </div>
            ) : typeof value === 'string' ? (
              <p className="text-[12px] text-gray-700">{value}</p>
            ) : (
              <pre className="text-[11px] text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ── Feature Section Renderer ─────────────────────────────────────────

function FeatureSectionBlock({ feature, sectionKey, title }: { feature: FeatureSpec; sectionKey: string; title: string }) {
  const section = (feature as any)[sectionKey];
  if (!section) return null;

  return (
    <div className="mb-5 ml-1" style={{ color: '#1a1a1a' }} data-subsection={`${feature.id}:${sectionKey}`}>
      <h4 className="text-[13px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <span className="text-[11px] text-gray-400">{sectionKey}</span>
        {title}
      </h4>

      {sectionKey === 'purpose' && <PurposeRenderer data={section} />}
      {sectionKey === 'userDefinition' && <UserDefinitionRenderer data={section} />}
      {sectionKey === 'layoutStructure' && <LayoutStructureRenderer data={section} />}
      {sectionKey === 'displayData' && <DisplayDataRenderer data={section} />}
      {sectionKey === 'uiElements' && <UIElementsRenderer data={section} />}
      {sectionKey === 'stateMachine' && <StateMachineRenderer data={section} />}
      {sectionKey === 'actionDefinitions' && <ActionDefinitionsRenderer data={section} />}
      {sectionKey === 'operationalPolicy' && (
        <SafeMarkdown content={section.content} variant="pdf" className="prose prose-sm max-w-none text-[12px] leading-relaxed" />
      )}
    </div>
  );
}

function PurposeRenderer({ data }: { data: FeatureSpec['purpose'] }) {
  if (!data) return null;
  return (
    <div className="space-y-2 text-[12px] text-gray-700">
      {data.problem && <div><span className="font-semibold">Problem:</span> {data.problem}</div>}
      {data.kpiMetrics && <div><span className="font-semibold">KPI/Metrics:</span> {data.kpiMetrics}</div>}
      {data.scopeIn?.length > 0 && (
        <div>
          <span className="font-semibold">Scope In:</span>
          <ul className="ml-4 list-disc">{data.scopeIn.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {data.scopeOut?.length > 0 && (
        <div>
          <span className="font-semibold">Scope Out:</span>
          <ul className="ml-4 list-disc">{data.scopeOut.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function UserDefinitionRenderer({ data }: { data: FeatureSpec['userDefinition'] }) {
  if (!data) return null;
  return (
    <div className="space-y-2 text-[12px] text-gray-700">
      {data.userTypes && <div><span className="font-semibold">User Types:</span> {data.userTypes}</div>}
      {data.authCheckTiming && <div><span className="font-semibold">Auth Check Timing:</span> {data.authCheckTiming}</div>}
      {data.accessDenialBehavior && <div><span className="font-semibold">Access Denial:</span> {data.accessDenialBehavior}</div>}
    </div>
  );
}

function LayoutStructureRenderer({ data }: { data: FeatureSpec['layoutStructure'] }) {
  if (!data?.areas?.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Area</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Description</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Components</th>
          </tr>
        </thead>
        <tbody>
          {data.areas.map((area, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5 px-2 font-semibold text-gray-600">{area.area}</td>
              <td className="py-1.5 px-2 text-gray-600">{area.description}</td>
              <td className="py-1.5 px-2 text-gray-600">{area.components}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DisplayDataRenderer({ data }: { data: { rows: DisplayDataRow[] } }) {
  if (!data?.rows?.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Data Field</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Type</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Source</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Format</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Empty State</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Note</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5 px-2 font-semibold text-gray-600">{row.dataField}</td>
              <td className="py-1.5 px-2 text-gray-600 font-mono">{row.dataType}</td>
              <td className="py-1.5 px-2 text-gray-600">{row.source}</td>
              <td className="py-1.5 px-2 text-gray-600">{row.displayFormat}</td>
              <td className="py-1.5 px-2 text-gray-600">{row.emptyState}</td>
              <td className="py-1.5 px-2 text-gray-600">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UIElementsRenderer({ data }: { data: FeatureSpec['uiElements'] }) {
  if (!data?.elements?.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Element</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Type</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Behavior</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Condition</th>
          </tr>
        </thead>
        <tbody>
          {data.elements.map((el, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5 px-2 font-semibold text-gray-600">{el.element}</td>
              <td className="py-1.5 px-2 text-gray-600 font-mono">{el.type}</td>
              <td className="py-1.5 px-2 text-gray-600">{el.behavior}</td>
              <td className="py-1.5 px-2 text-gray-600">{el.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StateMachineRenderer({ data }: { data: FeatureSpec['stateMachine'] }) {
  if (!data) return null;
  return (
    <div className="space-y-2 text-[12px] text-gray-700">
      {data.initialState && <div className="p-2 bg-gray-50 rounded"><span className="font-semibold">Initial:</span> {data.initialState}</div>}
      {data.normalState && <div className="p-2 bg-green-50 rounded"><span className="font-semibold">Normal:</span> {data.normalState}</div>}
      {data.emptyState && <div className="p-2 bg-yellow-50 rounded"><span className="font-semibold">Empty:</span> {data.emptyState}</div>}
      {data.errorState && <div className="p-2 bg-red-50 rounded"><span className="font-semibold">Error:</span> {data.errorState}</div>}
    </div>
  );
}

function ActionDefinitionsRenderer({ data }: { data: { rows: ActionDefinitionRow[] } }) {
  if (!data?.rows?.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Action</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Trigger</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Process</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Result</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1.5 px-2 font-semibold text-gray-600">{row.action}</td>
              <td className="py-1.5 px-2 text-gray-600">{row.trigger}</td>
              <td className="py-1.5 px-2 text-gray-600">{row.process}</td>
              <td className="py-1.5 px-2 text-gray-600">{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
