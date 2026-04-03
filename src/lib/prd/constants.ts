export const BRAND_COLOR = '#0EA5E9';
export const BRAND_COLOR_DARK = '#0284C7';

export const PROJECT_TYPE_OPTIONS = [
  { value: 'web', label: '웹 애플리케이션' },
  { value: 'mobile', label: '모바일 앱' },
  { value: 'desktop', label: '데스크탑 앱' },
  { value: 'api', label: 'API / 백엔드 서비스' },
  { value: 'saas', label: 'SaaS 플랫폼' },
  { value: 'ecommerce', label: '이커머스' },
  { value: 'ai', label: 'AI / ML 서비스' },
  { value: 'iot', label: 'IoT 시스템' },
  { value: 'other', label: '기타' },
];

export const GLOBAL_RULE_SECTIONS = [
  { key: 'definitionOfDone', titleKo: '완료 기준 (Definition of Done)', titleEn: 'Definition of Done' },
  { key: 'techSpecs', titleKo: '기술 스택', titleEn: 'Tech Specs' },
  { key: 'userFlow', titleKo: '사용자 흐름 / 라우팅', titleEn: 'User Flow / Routes' },
];

export const FEATURE_SECTION_KEYS = [
  { key: 'purpose', titleKo: '기능 목적', icon: 'Target' },
  { key: 'userDefinition', titleKo: '사용자 정의', icon: 'Users' },
  { key: 'layoutStructure', titleKo: '레이아웃 구조', icon: 'Layout' },
  { key: 'displayData', titleKo: '표시 데이터 정의', icon: 'Table' },
  { key: 'uiElements', titleKo: 'UI 요소', icon: 'MousePointer' },
  { key: 'stateMachine', titleKo: '상태 머신', icon: 'Activity' },
  { key: 'actionDefinitions', titleKo: '액션 정의', icon: 'Zap' },
  { key: 'operationalPolicy', titleKo: '운영 정책', icon: 'Shield' },
];
