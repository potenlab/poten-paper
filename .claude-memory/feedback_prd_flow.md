---
name: PRD 생성 흐름 원칙
description: PRD 도구의 UX 흐름 — 입력 먼저, 생성 시 정보입력
type: feedback
---

PRD 생성 흐름: 입력 화면 먼저 → "생성" 클릭 시 정보입력 모달 → 생성 → 마이페이지에서 저장/확인.

**Why:** 정보입력을 먼저 시키면 이탈률이 높음. 유저가 이미 시간을 투자한 후 정보를 요청하면 전환율이 훨씬 높아짐.

**How to apply:** userId 없이도 입력 화면 진입 가능하게. 생성 API 호출 직전에 userId 체크 → 없으면 모달. potenlab에서 이 패턴으로 구현됨 (PrdNewPage.tsx 참고).
