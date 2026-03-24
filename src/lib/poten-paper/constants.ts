import type { SectionDefinition, MainSectionDefinition } from './types';

export const BRAND_COLOR = '#0EA5E9';
export const BRAND_COLOR_DARK = '#0284C7';

export const CHART_COLORS = ['#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export const INDUSTRY_OPTIONS = [
  { value: 'it', label: 'IT/소프트웨어' },
  { value: 'bio', label: '바이오/헬스케어' },
  { value: 'fintech', label: '핀테크' },
  { value: 'education', label: '교육/에듀테크' },
  { value: 'ecommerce', label: '이커머스' },
  { value: 'food', label: '식품/F&B' },
  { value: 'manufacturing', label: '제조업' },
  { value: 'logistics', label: '물류/유통' },
  { value: 'realestate', label: '부동산/프롭테크' },
  { value: 'entertainment', label: '엔터테인먼트/미디어' },
  { value: 'environment', label: '환경/에너지' },
  { value: 'fashion', label: '패션/뷰티' },
  { value: 'travel', label: '여행/관광' },
  { value: 'agriculture', label: '농업/애그테크' },
  { value: 'other', label: '기타' },
];

export const BUSINESS_STAGE_OPTIONS = [
  { value: 'pre-startup', label: '예비창업' },
  { value: 'early', label: '초기창업 (1년 이내)' },
  { value: 'growth', label: '성장기 (1~3년)' },
  { value: 'expansion', label: '확장기 (3년 이상)' },
];

// v1 legacy section definitions
export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    key: 'problem',
    titleKo: '문제 정의 (Problem)',
    descriptionKo: '해결하고자 하는 핵심 문제와 시장/사회적 배경을 정의합니다.',
    icon: 'Target',
  },
  {
    key: 'market',
    titleKo: '시장 분석 (Market)',
    descriptionKo: 'TAM-SAM-SOM 시장 규모, 산업 트렌드, 경쟁사 분석을 포함합니다.',
    icon: 'TrendingUp',
  },
  {
    key: 'solution',
    titleKo: '솔루션 & 차별성 (Solution)',
    descriptionKo: '제품/서비스의 핵심 기능과 경쟁 우위를 설명합니다.',
    icon: 'Lightbulb',
  },
  {
    key: 'businessModel',
    titleKo: '비즈니스 모델 (Business Model)',
    descriptionKo: '수익 구조, 단가, 마진, 매출 전망을 체계적으로 구성합니다.',
    icon: 'DollarSign',
  },
  {
    key: 'execution',
    titleKo: '실행 계획 (Execution)',
    descriptionKo: '개발 로드맵, 마일스톤, KPI, 출시 전략을 포함합니다.',
    icon: 'Layers',
  },
  {
    key: 'team',
    titleKo: '팀 구성 (Team)',
    descriptionKo: '핵심 팀원, 역량, 외부 자문단 등을 소개합니다.',
    icon: 'Users',
  },
];

// v2 hierarchical 청창사 section definitions
export const MAIN_SECTION_DEFINITIONS: MainSectionDefinition[] = [
  {
    key: 'problemRecognition',
    number: '01',
    titleKo: '문제인식',
    subSections: [
      {
        id: '1-1',
        titleKo: '개발동기',
        subSubSections: [
          { id: '1-1-1', titleKo: '외부환경 배경', suggestedChart: 'bar' },
          { id: '1-1-2', titleKo: '시장동향', suggestedChart: 'line' },
          { id: '1-1-3', titleKo: '내부환경 배경' },
        ],
      },
      {
        id: '1-2',
        titleKo: '목적 및 필요성',
        subSubSections: [
          { id: '1-2-1', titleKo: '고객 니즈', suggestedChart: 'pie' },
          { id: '1-2-2', titleKo: 'Pain Point 분석', suggestedChart: 'horizontalBar' },
          { id: '1-2-3', titleKo: '해결방안 개요' },
        ],
      },
    ],
  },
  {
    key: 'solution',
    number: '02',
    titleKo: '해결방안',
    subSections: [
      {
        id: '2-1',
        titleKo: '개발방안',
        subSubSections: [
          { id: '2-1-1', titleKo: '서비스/제품 소개' },
          { id: '2-1-2', titleKo: '추진일정', suggestedChart: 'timeline' },
        ],
      },
      {
        id: '2-2',
        titleKo: '대응방안 (차별성)',
        subSubSections: [
          { id: '2-2-1', titleKo: '사업적 차별점', suggestedChart: 'table' },
          { id: '2-2-2', titleKo: '서비스적 차별점', suggestedChart: 'table' },
        ],
      },
    ],
  },
  {
    key: 'growthStrategy',
    number: '03',
    titleKo: '성장전략',
    subSections: [
      {
        id: '3-1',
        titleKo: '자금조달 및 수익계획',
        subSubSections: [
          { id: '3-1-1', titleKo: '수익모델', suggestedChart: 'bar' },
          { id: '3-1-2', titleKo: '예산계획', suggestedChart: 'table' },
        ],
      },
      {
        id: '3-2',
        titleKo: '시장진입 전략',
        subSubSections: [
          { id: '3-2-1', titleKo: '시장규모 (TAM-SAM-SOM)', suggestedChart: 'funnel' },
          { id: '3-2-2', titleKo: '판매/마케팅 전략', suggestedChart: 'pie' },
        ],
      },
    ],
  },
  {
    key: 'team',
    number: '04',
    titleKo: '팀구성',
    subSections: [
      {
        id: '4-1',
        titleKo: '보유역량',
        subSubSections: [
          { id: '4-1-1', titleKo: '대표자 역량' },
          { id: '4-1-2', titleKo: '직원현황', suggestedChart: 'table' },
          { id: '4-1-3', titleKo: '고용계획', suggestedChart: 'table' },
        ],
      },
    ],
  },
];
