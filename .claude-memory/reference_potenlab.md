---
name: potenlab 원본 레포 참조
description: 도구 이식 시 참조할 potenlab 레포 경로 정보
type: reference
---

potenlab 레포: C:\Users\tirrilee\potenlab (React + Vite + TypeScript)

**이식 대상 원본 파일:**
- PRD: src/lib/prd/, src/components/prd-new/, api/prd-generate.ts, api/prd-modify.ts
- 견적기: src/features/estimator/, api/estimator-synthesis.ts
- UI Builder: src/lib/ui-builder/, api/ui-builder-generate.ts, api/ui-builder-modify.ts
- 포텐체커: src/pages/PotenChecker*, api/poten-check.ts

**PRD 이식 완료 상태 (2026-04-03):**
- lib 8개 + 컴포넌트 13개 + API 2개 + 페이지 3개 복사됨
- import 경로 변환, Supabase 클라이언트 교체, 'use client' 추가 완료
- prd_documents 테이블 생성 + RLS 완료
