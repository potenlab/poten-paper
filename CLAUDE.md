# 포텐페이퍼 (poten-paper)

## 프로젝트 개요
AI 사업계획서 자동 생성 서비스. 예비/초기 창업자가 예비창업패키지 등 정부지원사업 신청용 사업계획서를 AI로 빠르게 완성하는 것이 목표.

## 기술 스택
- **프레임워크**: Next.js 16 + React 19 + TypeScript
- **스타일링**: Tailwind CSS 4
- **DB/인증**: Supabase (the-potential 프로젝트와 공유)
- **AI**: OpenRouter API (Gemini 2.5 Flash) - 리서치 → 생성 2단계 호출
- **이미지 생성**: OpenRouter (비용 발생 → HTML 시각화 버전으로 대체 예정)
- **차트**: Recharts (bar, pie, line, funnel 등)
- **배포**: Vercel Hobby (`https://poten-paper.vercel.app`)

## 주요 구조
- `src/app/poten-paper/new/` - 사업계획서 생성 플로우
- `src/app/poten-paper/[id]/` - 생성된 사업계획서 조회
- `src/app/api/poten-paper/` - AI 생성 API (generate, generate-images, regenerate-section)
- `src/lib/poten-paper/` - 타입, 프롬프트, 유틸리티
- `src/lib/supabase/` - Supabase 클라이언트 (lazy 초기화 - getSupabase())

## 사업계획서 구조 (PSST 프레임워크)
가이드북: `[2025] 민썸의 사업계획서 작성 가이드북 Ver 1.0.pdf` (프로젝트 루트)

### Part 01. Problem (문제인식) - Why
- 창업배경 & 필요성 (외부적/내부적 배경, 문제정의)
- 목표시장 & 고객분석 (TAM/SAM/SOM, 고객 특성)
- Problem형 vs Needs형 두 가지 스토리텔링 전략
- 시각화: 통계카드, 막대그래프(설문), 시장규모 카드, 성장 추이

### Part 02. Solution (실현가능성) - What
- 아이디어 구체화 (설계도/GUI/시제품) + 추진일정
- 경쟁사 분석 & 차별점 + 추진성과/데이터
- 예산 집행 계획
- 시각화: 서비스 플로우, 경쟁사 비교표, 간트차트, 예산표

### Part 03. Scale-up (성장전략) - How
- STP분석 → 포지셔닝 + 시장진입전략
- 비즈니스 모델 (수익화)
- 로드맵 + 사회적 가치
- 시각화: 포지셔닝맵, SWOT, BM캔버스, 타임라인 로드맵, 수익모델 카드

### Part 04. Team (팀 구성) - Who
- 대표자/팀 역량
- 네트워킹 (외부 협력기관)
- 시각화: 조직도, 협력기관 표

## HTML 시각화 버전 (진행 예정)
이미지 생성 API 비용을 없애기 위해 HTML/CSS 기반 시각화 버전 개발 예정.
- 참고 사례: https://dionnam.github.io/yecangpe/ (HangulJobs 사업계획서)
- 기존 recharts 차트 유지 + 추가 컴포넌트: 포지셔닝맵, SWOT, TAM/SAM/SOM, BM캔버스, 조직도, 플로우 다이어그램, 비교표 등

## 환경변수
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
SITE_URL
```

## PotenKit 통합 (진행중)
이 레포를 PotenKit(IT 기획 도구 통합 플랫폼)으로 확장 중. potenlab 레포에서 도구를 이식하는 중.

### 이식 대상 (potenlab → 여기)
1. **PRD 생성기** (이식 완료)
   - ✅ lib 복사 완료: `src/lib/prd/` (types, constants, prompts, extract-text, normalize-document, parse-json, pdf-export, safe-markdown)
   - ✅ 컴포넌트 복사 완료: `src/app/prd/new/components/` (ProgressIndicator, StepForm, StepInputMethod, StepUpload, StepProcessing, ImageUpload, result/*)
   - ✅ `'use client'` 추가 완료 (StepForm, StepInputMethod, StepUpload, ImageUpload, PrdResultLayout, InsightPanel, DocumentToolbar, DocumentViewer)
   - ✅ API 라우트 생성 완료: `app/api/prd/generate/route.ts`, `app/api/prd/modify/route.ts`
   - ✅ 페이지 생성 완료: `app/prd/new/page.tsx`, `app/prd/[id]/page.tsx` (+prd-view-client.tsx), `app/prd/my/page.tsx`
   - ✅ Supabase 클라이언트: `getSupabase()` 사용 (prd_documents 테이블은 DB에 별도 생성 필요)
   - ✅ 필요 패키지 모두 설치 확인 (sonner, framer-motion, pdfjs-dist, mammoth 등)
   - ✅ Supabase `prd_documents` 테이블 생성 완료 (RLS 포함)
   - ✅ Supabase 타입 추가 + `as any` 캐스팅 제거 완료
2. **견적기** (미시작)
3. **UI Builder** (미시작)

### PotenKit 구조 계획
```
src/app/
  ├── page.tsx              ← PotenKit 랜딩 (IT기획 홈)
  ├── business/             ← 사업기획 (포텐페이퍼+체커)
  ├── poten-paper/          ← 기존 유지
  ├── poten-checker/        ← 기존 유지
  ├── prd/                  ← potenlab에서 이식
  │   ├── new/              ← PRD 생성
  │   ├── [id]/             ← PRD 결과 보기
  │   └── my/               ← 내 PRD 목록
  ├── estimator/            ← 이식 예정
  ├── ui-builder/           ← 이식 예정
  ├── my/                   ← 통합 마이페이지 (전체 문서)
  └── api/
      ├── poten-paper/      ← 기존
      ├── prd/              ← 이식
      ├── estimator/        ← 이식 예정
      └── ui-builder/       ← 이식 예정
```

### 브랜드
- 서비스명: PotenKit (포텐킷)
- 컨셉: "아이디어에서 실행까지, 궁극의 IT 기획 키트"
- 포텐랩 하위 브랜드, 나중에 독립 도메인/레포로 분리 예정
- 계정: Supabase Auth 통합 (더포텐셜/포텐랩/포텐킷 공유)

## 참고
- Supabase 클라이언트는 모듈 레벨 싱글톤이 아닌 `getSupabase()` lazy 초기화 사용 (빌드 시 SSR prerender 에러 방지)
- PDF 파일은 .gitignore로 제외됨
- 한국어로 대화
- 최종 빌드 확인: 2026-04-03 통과
