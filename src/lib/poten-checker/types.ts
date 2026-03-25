export type CheckerStep = 'input' | 'analyzing' | 'result';

export interface DiagnosisDimension {
  key: string;
  labelKo: string;
  labelEn: string;
  score: number;
  feedbackKo: string;
  feedbackEn: string;
  blueFeedbackKo: string;
  blueFeedbackEn: string;
  redFeedbackKo: string;
  redFeedbackEn: string;
}

export interface DiagnosisResult {
  overallScore: number;
  overallSummaryKo: string;
  overallSummaryEn: string;
  dimensions: DiagnosisDimension[];
  criticalWarnings?: string[];
  fileName: string;
  analyzedAt: string;
}

export function isDiagnosisResult(data: unknown): data is DiagnosisResult {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.overallScore === 'number' &&
    typeof d.overallSummaryKo === 'string' &&
    Array.isArray(d.dimensions) &&
    d.dimensions.length > 0 &&
    typeof d.dimensions[0].key === 'string' &&
    typeof d.dimensions[0].score === 'number'
  );
}

export interface RadarDataPoint {
  dimension: string;
  score: number;
  fullMark: number;
}

export const DIAGNOSIS_DIMENSIONS = [
  { key: 'market', labelKo: '시장성', labelEn: 'Market' },
  { key: 'edge', labelKo: '차별성', labelEn: 'Edge' },
  { key: 'feasibility', labelKo: '실현 가능성', labelEn: 'Feasibility' },
  { key: 'bm', labelKo: '수익 모델', labelEn: 'Business Model' },
  { key: 'storytelling', labelKo: '스토리텔링', labelEn: 'Storytelling' },
  { key: 'readability', labelKo: '전달력', labelEn: 'Readability' },
] as const;
