import { BRAND_COLOR, FEATURE_SECTION_KEYS } from '@/lib/prd/constants';

interface StepProcessingProps {
  phase: 'analysis' | 'generating';
}

export function StepProcessing({ phase }: StepProcessingProps) {
  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{ backgroundColor: `${BRAND_COLOR}15` }}
        >
          <div
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${BRAND_COLOR} ${BRAND_COLOR} ${BRAND_COLOR} transparent` }}
          />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {phase === 'analysis' ? '프로젝트 분석 중...' : 'PRD 문서 생성 중...'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {phase === 'analysis'
            ? '기능, 기술 스택, 사용자 유형을 분석하고 있습니다.'
            : 'Client PRD Template에 맞춰 상세 문서를 작성하고 있습니다.'}
        </p>
        <p className="text-sm text-muted-foreground/60 mt-1">약 1-3분 소요</p>
      </div>

      <div className="space-y-4">
        {FEATURE_SECTION_KEYS.map((section) => (
          <div
            key={section.key}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg animate-pulse"
                style={{ backgroundColor: `${BRAND_COLOR}15` }}
              />
              <div>
                <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-3 w-3/5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
