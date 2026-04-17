/**
 * 크레딧 과금 상수.
 *
 * - BILLING_ENABLED: false 인 동안은 consume/refund 모두 no-op (베타 기간).
 *   true 로 전환하는 순간 실제 차감/환불 시작.
 * - CREDIT_COSTS: 기능별 단가. docs/credits-integration-v1.md 합의 기준.
 */

export const BILLING_ENABLED = process.env.NEXT_PUBLIC_BILLING_ENABLED === 'true';

export const CREDIT_COSTS = {
  poten_paper: 100,
  poten_checker: 5,
  idea_validator: 10,
} as const;

export type Feature = keyof typeof CREDIT_COSTS;
