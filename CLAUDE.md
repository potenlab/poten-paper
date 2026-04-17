# 포텐페이퍼 (poten-paper)

## 프로젝트 개요
AI 사업계획서 자동 생성 서비스. 예비/초기 창업자가 예비창업패키지 등 정부지원사업 신청용 사업계획서를 AI로 빠르게 완성하는 것이 목표.

## 기술 스택
- **프레임워크**: Next.js 16 + React 19 + TypeScript
- **스타일링**: Tailwind CSS 4
- **DB/인증**: Supabase (the-potential 프로젝트와 공유)
- **AI**: OpenRouter API (Gemini 2.5 Flash) - 리서치 → 생성 2단계 호출
- **시각화**: HTML/CSS + Recharts (bar, pie, line, horizontal-bar). 이미지 생성은 중단 (아래 참고)
- **배포**: Vercel + 커스텀 도메인 `https://paper.potenlab.dev` (기존 `poten-paper.vercel.app` 병행 유지)

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

## 시각화 현황

**이미지 생성**: 실질 중단. LLM 프롬프트에서 `imagePrompt` 필드 요청 제거 → `imageRequests.length === 0` 으로 이미지 API 호출 스킵. 데드 코드(`use-image-generation.ts`, `/api/poten-paper/generate-images`, `types.ts` 의 `imagePrompt` 필드)는 나중에 쓸 수도 있어 남겨둠.

**완료**:
- ✅ Recharts 차트 (bar, pie, line, horizontal-bar) — 통계·매출·성장 추이 등

**미구현 (TODO)**:
- 포지셔닝맵, SWOT, TAM/SAM/SOM 카드, BM캔버스, 조직도, 플로우 다이어그램, 경쟁사 비교표, 간트차트
- 참고 사례: https://dionnam.github.io/yecangpe/ (HangulJobs 사업계획서)

## 환경변수
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENROUTER_API_KEY
SITE_URL
```

## 브랜드 포지셔닝 (2026-04-17 확정)

포텐페이퍼를 **사업기획 도구 우산 브랜드** 로 리포지셔닝.

| 담당 | 브랜드 | 도구 |
|---|---|---|
| **사업기획** | 포텐페이퍼 (이 레포) | 사업계획서 생성·검증, 아이디어 검증 |
| **IT 기획** | 플래닝박스 (potenlab) | PRD, 견적, UI Builder, 아이디어 구체화 |

**PotenKit 브랜드는 폐기**. 이전에 쓰던 "PotenKit = IT기획 우산" 개념은 플래닝박스로 흡수됨.

### 라우팅 구조 (현재)
```
src/app/
  ├── page.tsx              ← `/poten-paper` 로 리다이렉트 (루트 = 포텐페이퍼)
  ├── poten-paper/          ← 사업계획서 생성 (메인)
  ├── poten-checker/        ← 사업계획서 검증
  ├── idea-validator/       ← 아이디어 검증 (B1)
  ├── potenkit/             ← 리다이렉트 (하위 전부 `/poten-paper` 로) — 제거 예정
  ├── prd/                  ← 레거시 (플래닝박스로 이관 대상, 당분간 유지)
  ├── login/                ← 구글/카카오 OAuth
  ├── admin/                ← 통계·검색·삭제
  └── api/
      ├── poten-paper/
      ├── poten-checker/
      ├── idea-validator/
      └── prd/              ← 레거시
```

### PRD 관련 레거시
PRD 생성기는 과거 "PotenKit 통합" 맥락으로 potenlab → 여기로 이식됐지만, 브랜드 재편 후 IT 기획 = 플래닝박스로 이동. 당분간 `/prd/*` 는 여기에 살아있음 (동작함). 플래닝박스로 이관 후 제거.

## 참고
- Supabase 클라이언트는 모듈 레벨 싱글톤이 아닌 `getSupabase()` lazy 초기화 사용 (빌드 시 SSR prerender 에러 방지)
- PDF 파일은 .gitignore로 제외됨
- 한국어로 대화
- 최종 빌드 확인: 2026-04-03 통과

## 공유 테이블 (potenlab ↔ poten-paper)
아래 테이블은 **두 레포에서 동시에 직접 쿼리**됨. 스키마 변경 시 양쪽 레포의 타입/쿼리 모두 동기화 필요.

| 테이블 | 소유 레포 | 조회하는 쪽 | 용도 |
|---|---|---|---|
| `business_plans` | poten-paper | poten-paper + potenlab PlanningBoxMyPage | 사업계획서 (포텐페이퍼 본체) |
| `poten_diagnoses` | poten-paper | poten-paper + potenlab PlanningBoxMyPage | 포텐체커 = 사업계획서 검증 결과 |
| `idea_validations` | poten-paper | poten-paper + potenlab PlanningBoxMyPage | 아이디어 검증 결과 (B1, 2026-04-15 신설) |
| `pb_idea_structures` | potenlab | potenlab only | 아이디어 구체화 (IT Track 로컬 도구) |
| `client_prds` | potenlab | potenlab only | PRD 생성기 결과 |
| `ui_builder_projects` | potenlab | potenlab only | UI Builder 프로젝트 |
| `pb_settings` | potenlab | potenlab only | 어드민 프롬프트/설정 |

### 네이밍 혼재 주의
prefix 가 통일 안 됨 (`pb_`, `poten_`, prefix 없음 이 섞임). 역사적 이유:
1. `poten_diagnoses`, `poten_inquiries` 는 **포텐체커가 독립 제품일 때** 생성 → `poten_` prefix
2. `business_plans` 은 **poten-paper 가 통합 플랫폼이 되기 전** 생성 → prefix 없음
3. `pb_idea_structures`, `pb_settings` 는 **PlanningBox 합류 이후** 생성 → `pb_` prefix
4. `idea_validations` (신규) 는 주변 `business_plans` / `poten_diagnoses` 패턴과 맞춰 prefix 없음

### "아이디어" 계열 구분 (자주 헷갈림)
- **아이디어 구체화** (`pb_idea_structures`, IT Track): 러프 텍스트 → 메뉴/타겟/기술 힌트 JSON 뼈대
- **아이디어 검증** (`idea_validations`, B1): 러프 텍스트 → 투자자 시각 5개 점수 + Blue/Red Team
- 둘 다 입력은 "러프 아이디어 텍스트" 로 비슷하지만 **용도·출력·테이블이 완전히 별개**

---

## 🆕 TODO · 아이디어 검증 (Idea Validator) 신규 기능 — 2026-04-15 추가

### 배경 & 통합 맥락
이 레포(poten-paper)는 PlanningBox(planning-box.potenlab.dev) 서브도메인의 **Biz Track 백엔드 3형제** 를 담당 중:

| Biz Track | poten-paper 경로 | 상태 |
|---|---|---|
| B1 **아이디어 검증** | `/idea-validator/*` | **🆕 신규 구현 필요 (이 섹션)** |
| B2 사업계획서 생성 | `/poten-paper/*` | ✅ 기존 |
| B3 사업계획서 검증 | `/poten-checker/*` | ✅ 기존 |

PlanningBox(potenlab 레포, `planning-box.potenlab.dev`)가 Vercel 리버스 프록시로 이 세 경로를 자기 도메인으로 노출 중. 즉 이 레포에서 `/idea-validator/new` 페이지를 만들면 자동으로 `https://planning-box.potenlab.dev/idea-validator/new` 에서도 접근됨 (추가 설정 불필요 — planning-box 쪽 `vercel.json` 에 rewrite 이미 선반영됨).

### 무엇을 만드나
**아이디어 검증 도구** — 유저가 **러프한 아이디어**(문장 몇 개)를 입력하면 AI가 투자자 시각으로 빠르게 스크리닝하고 점수 + 피드백을 제공.

포텐체커(사업계획서 검증)와 구분되는 점:
- **포텐체커** = 이미 작성한 사업계획서(파일) 업로드 → 6지표 심층 분석 (무거움)
- **아이디어 검증** = 자유 텍스트 아이디어 → 스크리닝 점수 (가벼움, 빠름)

### 스펙
**페이지** (Next.js App Router)
- `src/app/idea-validator/new/page.tsx` — 입력 화면 (textarea + 제출 버튼)
- `src/app/idea-validator/[id]/page.tsx` — 결과 상세 (점수, 피드백)
- (선택) `src/app/idea-validator/my/page.tsx` — 유저의 검증 히스토리

**API**
- `src/app/api/idea-validator/generate/route.ts`
- 입력: `{ ideaText: string }`
- 처리: Gemini 2.5 Flash via OpenRouter, **1회 호출**
- 출력: JSON (아래 스키마)

**Supabase 테이블** (새로 생성)
```sql
create table public.idea_validations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_text text not null,
  scores jsonb not null,          -- { market: 8, revenue: 6, feasibility: 7, ... }
  overall_score integer,           -- 0~100
  blue_team text,                  -- 긍정적 코칭 피드백
  red_team text,                   -- 날카로운 반박
  summary text,                    -- 한 줄 요약
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.idea_validations enable row level security;
create policy "users read own validations" on public.idea_validations for select using (auth.uid() = user_id);
create policy "users insert own validations" on public.idea_validations for insert with check (auth.uid() = user_id);
create policy "users delete own validations" on public.idea_validations for delete using (auth.uid() = user_id);
```

**출력 JSON 스키마**
```ts
interface IdeaValidation {
  summary: string;               // 한 줄 요약 (30자 이내)
  scores: {
    market: number;              // 시장성 0~10
    revenue: number;             // 수익성 0~10
    feasibility: number;         // 실현가능성 0~10
    differentiation: number;     // 차별성 0~10
    timing: number;              // 타이밍 0~10
  };
  overall_score: number;         // 전체 점수 0~100
  blue_team: string;             // 긍정 코칭 (강점 + 발전 방향)
  red_team: string;              // 날카로운 반박 (리스크 + 약점)
  improvement_tips: string[];    // 개선 제안 3~5개
}
```

**시스템 프롬프트 방향**
- "당신은 시드 단계 초기 창업 심사위원입니다. 러프한 아이디어를 **30초 안에** 투자자 시각으로 평가하세요."
- Blue Team: 따뜻한 격려, 강점 부각, 다음 스텝 제안
- Red Team: 날카로운 반박, 시장 리스크, 실패 패턴 경고
- 한국어 출력, 출력은 **JSON 객체 하나**만 (포텐체커와 동일 패턴)

### UX 가이드라인 (기존 포텐체커와 맞추기)
- 입력 화면: 중앙 정렬 카드, textarea 큼, 예시 프롬프트 3~4개 칩
- 결과 화면: 점수 원형 차트(recharts) + 지표별 바 + Blue/Red 2단 카드 + 개선 제안 리스트
- Loading: "심사 중..." 애니메이션, 약 5초
- Supabase Auth 필수 — 비로그인 시 `/login?next=/idea-validator/new`

### PlanningBox 통합 (완료 후 연락)
구현 완료되면 potenlab 레포의 다음 2곳에서 `comingSoon: true` → `false` 바꿔주면 활성화됨:
- `potenlab/src/components/PlanningBoxSection.tsx` → bizTools 배열의 B1 항목
- `potenlab/src/pages/PlanningBoxMyPage.tsx` → 아이디어 검증 탭이 `ValComingSoon` → 실제 `ValList` 컴포넌트로 교체

마이페이지 리스트 쿼리 예시
```ts
supabase.from('idea_validations')
  .select('id, summary, overall_score, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

### 비용 예상
- Gemini 2.5 Flash 1회 호출 (input ~800 tokens, output ~1500 tokens)
- 약 **8원/건** (포텐페이퍼·포텐체커 대비 1/10 수준)
- 무료 티어로 풀어도 월 운영비 미미

### 우선순위
poten-paper 레포 자체 TODO 중 우선순위는 유저가 판단. PlanningBox 쪽은 껍데기 선반영 상태라 언제 완성돼도 바로 연결 가능.
