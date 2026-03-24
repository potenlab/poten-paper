export type PaperStep = 'input-method' | 'input' | 'processing' | 'result';

export type InputMethod = 'upload' | 'form';

// ── v1 (legacy) flat section types ──────────────────────────────────

export type SectionKey =
  | 'problem'
  | 'market'
  | 'solution'
  | 'businessModel'
  | 'execution'
  | 'team';

export interface VisualGuide {
  chartType: string;
  description: string;
  dataPoints: (string | Record<string, unknown>)[];
}

export interface BusinessPlanSection {
  key: SectionKey;
  titleKo: string;
  content: string;
  visualGuide: VisualGuide | null;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

// ── v2 hierarchical 청창사 types ────────────────────────────────────

export type MainSectionKey = 'problemRecognition' | 'solution' | 'growthStrategy' | 'team';

export interface ChartData {
  type: 'bar' | 'horizontalBar' | 'pie' | 'donut' | 'line' | 'funnel' | 'table' | 'timeline';
  title: string;
  data: Record<string, string | number>[];
  xKey?: string;
  yKeys?: string[];
  colors?: string[];
  columns?: string[];
  rows?: Record<string, string | number>[];
}

export interface SubSubSection {
  id: string;
  titleKo: string;
  content: string;
  chart?: ChartData | null;
  imagePrompt?: string | null;
  imageUrl?: string | null;
}

export interface SubSection {
  id: string;
  titleKo: string;
  subSubSections: SubSubSection[];
}

export interface MainSection {
  key: MainSectionKey;
  number: string;
  titleKo: string;
  subSections: SubSection[];
}

export interface CoverPage {
  businessName: string;
  subtitle: string;
  date: string;
}

export interface BusinessPlanDocument {
  cover: CoverPage;
  sections: MainSection[];
  format_version: 2;
}

// ── Shared types ────────────────────────────────────────────────────

export interface ResearchData {
  marketSize: {
    tam: string;
    sam: string;
    som: string;
  };
  marketSizeNumeric?: {
    tam: number;
    sam: number;
    som: number;
  };
  marketTrend?: Record<string, string | number>[];
  painPoints?: Record<string, string | number>[];
  trends: Array<{
    title: string;
    description: string;
  }>;
  competitors: Array<{
    name: string;
    strengths: string;
    weaknesses: string;
  }>;
  sources: string[];
}

export interface IdeaFormData {
  businessName: string;
  industry: string;
  businessStage: string;
  targetCustomer: string;
  problemStatement: string;
  solutionDescription: string;
  differentiator: string;
  revenueModel?: string;
  teamDescription?: string;
  additionalNotes?: string;
}

export interface GenerateRequest {
  inputType: InputMethod;
  documentText?: string;
  formData?: IdeaFormData;
  ideaText?: string;
  title?: string;
  industry?: string;
}

// v1 response (legacy)
export interface GenerateResponseV1 {
  sections: BusinessPlanSection[];
  researchData: ResearchData;
  title: string;
}

// v2 response
export interface GenerateResponse {
  document: BusinessPlanDocument;
  researchData: ResearchData;
  title: string;
}

export interface RegenerateSectionRequest {
  subSubSectionId: string;
  additionalContext?: string;
  originalInput: string;
  researchData: ResearchData;
  document: BusinessPlanDocument;
}

export interface RegenerateSectionResponse {
  subSubSection: SubSubSection;
}

export interface SectionDefinition {
  key: SectionKey;
  titleKo: string;
  descriptionKo: string;
  icon: string;
}

export interface MainSectionDefinition {
  key: MainSectionKey;
  number: string;
  titleKo: string;
  subSections: {
    id: string;
    titleKo: string;
    subSubSections: {
      id: string;
      titleKo: string;
      suggestedChart?: ChartData['type'];
    }[];
  }[];
}
