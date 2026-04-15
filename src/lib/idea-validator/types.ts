/**
 * 아이디어 검증 (Idea Validator) 타입 정의.
 * 포텐체커와 구분: 러프한 아이디어 텍스트 → 빠른 스크리닝 점수
 * (포텐체커는 완성된 사업계획서 파일 업로드 → 심층 분석)
 */

export type ValidatorStep = 'input' | 'analyzing' | 'result';

export interface IdeaScores {
  market: number;          // 시장성 0~10
  revenue: number;         // 수익성 0~10
  feasibility: number;     // 실현가능성 0~10
  differentiation: number; // 차별성 0~10
  timing: number;          // 타이밍 0~10
}

export interface IdeaValidationResult {
  summary: string;              // 한 줄 요약 (30자 이내)
  scores: IdeaScores;
  overall_score: number;        // 0~100
  blue_team: string;            // 긍정 코칭 피드백
  red_team: string;             // 날카로운 반박
  improvement_tips: string[];   // 개선 제안 3~5개
  analyzed_at: string;
}

export interface ScoreDimension {
  key: keyof IdeaScores;
  labelKo: string;
  icon: string; // lucide icon name
  color: string; // tailwind color
}

export const DIMENSIONS: ScoreDimension[] = [
  { key: 'market',          labelKo: '시장성',     icon: 'trending-up',  color: '#0079FF' },
  { key: 'revenue',         labelKo: '수익성',     icon: 'dollar-sign',  color: '#10B981' },
  { key: 'feasibility',     labelKo: '실현가능성', icon: 'check-circle', color: '#8B5CF6' },
  { key: 'differentiation', labelKo: '차별성',     icon: 'star',         color: '#F59E0B' },
  { key: 'timing',          labelKo: '타이밍',     icon: 'clock',        color: '#EC4899' },
];

export function isValidationResult(data: unknown): data is IdeaValidationResult {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.summary !== 'string') return false;
  if (typeof d.overall_score !== 'number') return false;
  if (!d.scores || typeof d.scores !== 'object') return false;
  if (typeof d.blue_team !== 'string' || typeof d.red_team !== 'string') return false;
  if (!Array.isArray(d.improvement_tips)) return false;
  return true;
}
