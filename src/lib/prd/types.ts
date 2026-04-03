// ── PRD Document Types ────────────────────────────────────────────────
// Matches the Client PRD Template: Part 1 (GlobalRules) + Part 2 (FeatureSpec × N)

export type PrdStep = 'input-method' | 'input' | 'processing' | 'result';

export type InputMethod = 'upload' | 'form';

// ── Cover Page ───────────────────────────────────────────────────────

export interface PrdCoverPage {
  projectName: string;
  subtitle: string;
  date: string;
  version: string;
}

// ── Part 1: Global Rules ─────────────────────────────────────────────

export interface RouteAccess {
  route: string;
  description: string;
  accessLevel: string;
}

export interface DataDictionaryEntry {
  name: string;
  categories: {
    label: string;
    items: string[];
  }[];
}

export interface GlobalRules {
  definitionOfDone: {
    items: string[];
  };
  techSpecs: {
    frontend: string;
    backendAndDb: string;
    externalIntegrations: string;
    dataInitialization: string;
  };
  userFlow: {
    routes: RouteAccess[];
  };
  dataDictionary?: DataDictionaryEntry[];
}

// ── Part 2: Feature Specs ────────────────────────────────────────────

export interface FeaturePurpose {
  problem: string;
  kpiMetrics: string;
  scopeIn: string[];
  scopeOut: string[];
}

export interface UserDefinition {
  userTypes: string;
  authCheckTiming: string;
  accessDenialBehavior: string;
}

export interface LayoutArea {
  area: string;
  description: string;
  components: string;
}

export interface LayoutStructure {
  areas: LayoutArea[];
}

export interface DisplayDataRow {
  dataField: string;
  dataType: string;
  source: string;
  displayFormat: string;
  emptyState: string;
  note: string;
}

export interface DisplayDataDefinition {
  rows: DisplayDataRow[];
}

export interface UIElement {
  element: string;
  type: string;
  behavior: string;
  condition: string;
}

export interface UIElements {
  elements: UIElement[];
}

export interface StateMachine {
  initialState: string;
  normalState: string;
  emptyState: string;
  errorState: string;
}

export interface ActionDefinitionRow {
  action: string;
  trigger: string;
  process: string;
  result: string;
}

export interface ActionDefinitions {
  rows: ActionDefinitionRow[];
}

export interface FeatureSpec {
  id: string;
  name: string;
  purpose: FeaturePurpose;
  userDefinition: UserDefinition;
  layoutStructure: LayoutStructure;
  displayData: DisplayDataDefinition;
  uiElements: UIElements;
  stateMachine: StateMachine;
  actionDefinitions: ActionDefinitions;
  operationalPolicy: {
    content: string;
  };
  uiPreviewHtml?: string;
}

// ── Full PRD Document ────────────────────────────────────────────────

export interface PRDDocument {
  cover: PrdCoverPage;
  globalRules: GlobalRules;
  features: FeatureSpec[];
}

// ── Analysis Data (Phase 1 output) ───────────────────────────────────

export interface IdentifiedFeature {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalysisData {
  identifiedFeatures: IdentifiedFeature[];
  suggestedTechStack: {
    frontend: string;
    backend: string;
    database: string;
    integrations: string[];
  };
  userTypes: string[];
  estimatedRoutes: RouteAccess[];
  projectSummary: string;
}

// ── API Request/Response Types ───────────────────────────────────────

export interface GenerateRequest {
  inputType: InputMethod;
  documentText?: string;
  ideaText?: string;
  title?: string;
}

export interface GenerateResponse {
  title: string;
  document: PRDDocument;
  analysisData: AnalysisData;
}

export interface RegenerateSectionRequest {
  prdId?: string;
  featureId: string;
  sectionKey: string;
  additionalContext?: string;
  originalInput: string;
  analysisData: AnalysisData;
  document: PRDDocument;
}

export interface RegenerateSectionResponse {
  updatedContent: Record<string, unknown>;
}

// ── Section definitions for UI ───────────────────────────────────────

export interface FeatureSectionDef {
  key: string;
  titleKo: string;
  titleEn: string;
}

export const FEATURE_SECTION_DEFS: FeatureSectionDef[] = [
  { key: 'purpose', titleKo: '기능 목적', titleEn: 'Purpose' },
  { key: 'userDefinition', titleKo: '사용자 정의', titleEn: 'User Definition' },
  { key: 'layoutStructure', titleKo: '레이아웃 구조', titleEn: 'Layout Structure' },
  { key: 'displayData', titleKo: '표시 데이터 정의', titleEn: 'Display Data Definition' },
  { key: 'uiElements', titleKo: 'UI 요소', titleEn: 'UI Elements' },
  { key: 'stateMachine', titleKo: '상태 머신', titleEn: 'State Machine' },
  { key: 'actionDefinitions', titleKo: '액션 정의', titleEn: 'Action Definitions' },
  { key: 'operationalPolicy', titleKo: '운영 정책', titleEn: 'Operational Policy' },
];
