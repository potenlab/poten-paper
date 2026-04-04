---
name: potenlab에서 이식할 페이지 목록
description: potenlab에서 만든 페이지들 중 poten-paper로 이식/참고할 파일 경로
type: reference
---

## PotenKit 랜딩 페이지 (원본 복사 완료!)
원본이 이미 poten-paper 레포에 복사되어 있음. 바로 읽고 Next.js로 변환하면 됨:
- **메인 랜딩**: src/app/potenkit-landing-source.tsx (원본: potenlab PotenKitLandingPage.tsx)
- **사업기획 랜딩**: src/app/potenkit-business-source.tsx (원본: potenlab PotenKitBusinessPage.tsx)
- **레이아웃**: src/app/potenkit-layout-source.tsx (원본: potenlab PotenKitLayout.tsx)
- 변환 필요: React+Vite → Next.js ('use client' 추가, useRouter 교체, import 경로)
- 배포 확인: https://potenlab.dev/potenkit (메인), https://potenlab.dev/potenkit/business (사업기획)

## 서비스 상세 페이지 (ConsultingV2 표준 구조)
모든 페이지가 동일 패턴: Hero(중앙정렬+뱃지) → Process(이미지카드) → Reviews(3컬럼) → Pricing → Resources → CTA

| 서비스 | 파일 | 컬러 | URL |
|---|---|---|---|
| 컨설팅 | ConsultingV2Page.tsx | #D8FF84 다크톤 | /consulting |
| MVP | MVPDevPage.tsx | #0079FF | /mvp |
| UXUI | UXUIDesignPage.tsx | #0079FF | /uxui-design |
| 플랫폼 | PlatformDevPage.tsx | #8B5CF6 | /platform |
| SaaS | SaaSDevPage.tsx | #8B5CF6 | /saas |
| R&D | RnDDevPage.tsx | #E11D48 | /rnd |
| AX | AXPage.tsx | #10B981 | /ax |

## PRD 생성 흐름 (구현 완료)
- PrdNewPage.tsx에 정보입력 모달 내장
- 흐름: 입력 → 생성 클릭 → userId 없으면 모달 → 등록 → 자동 생성
- 모달 코드가 PrdNewPage.tsx 안에 있음 (showRegisterModal state)

## 메인 서비스 페이지
- MainHybridPage.tsx: 아이콘바 + 3단계 카테고리 카드 + Why섹션 + 리뷰 + FAQ
- 브랜드 컬러: #D8FF84 (다크 위 포인트) + #0079FF (CTA)
