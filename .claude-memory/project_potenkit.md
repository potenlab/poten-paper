---
name: PotenKit 통합 프로젝트
description: PRD/견적/UI빌더/포텐페이퍼/포텐체커를 PotenKit으로 통합하는 프로젝트 컨텍스트
type: project
---

## PotenKit 통합 프로젝트

PotenKit = PRD 생성 + 견적기 + UI Builder + 포텐페이퍼(사업계획서) + 포텐체커를 하나로 묶은 IT 기획 도구 플랫폼.

**Why:** 포텐랩의 무료 도구들을 하나의 브랜드/플랫폼으로 통합하여 유입 → 전환 파이프라인 구축.

**How to apply:**
- 이 레포(poten-paper)가 최종 레포. Next.js 16 기반.
- potenlab 레포(C:\Users\tirrilee\potenlab)에는 원본 도구 코드 + 임시 `/potenkit` 프로토타입이 있음
- 6단계 플로우: PRD → 견적 → 기능명세(준비중) → AI 와이어프레임 → 화면설계서(준비중) → 개발&구축
- 브랜드: "아이디어에서 실행까지, 궁극의 IT 기획 키트"
- Supabase Auth 통합 (더포텐셜/포텐랩/포텐킷 공유)

## 현재 이식/구현 상태 (2026-04-04)
- ✅ 메인 랜딩 `/` — PotenKit IT기획 랜딩 (potenlab PotenKitLandingPage.tsx 이식, 한/영 다국어)
- ✅ 사업기획 랜딩 `/business` — 포텐페이퍼/포텐체커 소개 (potenlab PotenKitBusinessPage.tsx 이식)
- ✅ 포텐페이퍼 `/poten-paper` — AI 사업계획서 생성 (PSST 프레임워크)
- ✅ 포텐체커 `/poten-checker` — AI 사업계획서 검증
- ✅ PRD 생성기 `/prd` — potenlab에서 이식 완료
- ❌ 견적기 `/estimator` — 미시작 (potenlab에 원본 있음)
- ❌ UI Builder `/ui-builder` — 미시작 (potenlab에 원본 있음)
- ❌ 기능명세서 — 준비중
- ❌ 화면설계서 — 준비중

## 네비게이션 구조
- 메인 랜딩 헤더: IT 기획(active) ↔ 사업 기획(/business) 상호 링크
- 사업기획 CTA → /poten-paper/new 연결
- IT기획 CTA → /prd/new 연결

## potenlab 서비스 상세 페이지 컬러 시스템 (참고용)
- 🟢 초록 #10B981: 검증 (컨설팅, AX)
- 🔵 파랑 #0079FF: 런칭 (MVP, UXUI, 홈페이지) — 브랜드 프라이머리
- 🟣 보라 #8B5CF6: 고도화 (플랫폼, SaaS)
- 🔴 레드 #E11D48: R&D
- 🟡 연두 #D8FF84: 다크 배경 포인트 컬러 (컨설팅 다크 히어로에 사용)
