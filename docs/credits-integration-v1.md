# 크레딧 시스템 통합 스펙 v1

**작성일**: 2026-04-17
**대상**: the-potential 팀 + poten-paper 팀
**목적**: poten-paper (사업계획서·포텐체커·아이디어 검증) 에서 the-potential 의 크레딧 시스템을 소비하기 위한 합의 문서

---

## 배경

현재 the-potential 레포 (`src/features/credits/`) 에 크레딧 시스템이 구축돼 있음:
- 4개 테이블: `credit_missions`, `user_credits`, `credit_rewards`, `credit_transactions`
- RPC 1개: `earn_mission_credit()` (미션 적립용)
- 리워드 2종: `poten_checker_1` (5c), `poten_paper_1` (100c), `basic_1month` (500c)

poten-paper 는 이 테이블을 **공유 Supabase 에서 직접 읽을 수 있지만** (`user_credits.balance` 조회는 이미 동작), **차감하는 코드는 아직 없음**. Phase 1 크레딧 과금 구현을 위해 해결해야 할 이슈들을 정리.

---

## 발견된 이슈 4가지

### 1. 🔴 보안 (심각)

현재 `useRedeemReward` 훅이 **클라이언트에서 직접** `user_credits.balance` 를 수정함. RLS 정책이 `user_id = auth.uid()` 만 체크하고 변경량은 검증하지 않아서, 악의적 유저가 DevTools 열고 `balance += 1000` 업데이트를 호출하면 통과됨.

**현재 취약 코드**: `the-potential/src/features/credits/api/queries.ts:177-199`

### 2. 🟡 "사용권" 플로우 불명확

유저가 the-potential 에서 `poten_paper_1` 리워드 100c 주고 교환하면 `credit_transactions` 에 `type='reward'` 로 기록됨. 그런데:
- 포텐페이퍼 앱은 이 "사용권 1개 있음" 을 어떻게 확인?
- 사용권을 쓴 뒤에는 어디에 "소비 완료" 로 표시?
- 현재는 기록만 남고 **실제 사용 추적 부재**

### 3. 🟡 유료 충전 경로 없음

현재 크레딧 획득은 **미션 수행** (하루 최대 90c) 만 존재. 돈으로 크레딧 사는 플로우 없음. 포텐페이퍼 1회(100c) 써보려면 **최소 이틀 매일 미션 수행** 필요 → 실사용자에게 너무 장벽 높음.

### 4. 🟡 아이디어 검증 리워드 누락

`credit_rewards` 에 `poten_checker_1`, `poten_paper_1` 만 있고 **아이디어 검증용 리워드 없음**.

---

## 제안 정리

### 핵심 결정 4가지

1. **"즉석 차감 모델" 채택** — 선구매 사용권 추적 방식 폐기. 포텐페이퍼 사용 시점에 balance 바로 차감. 단순, 직관적.
2. **`consume_credits` RPC 신설** — SECURITY DEFINER + `auth.uid()` 기반 + `FOR UPDATE` 잠금으로 안전한 차감 + credit_transactions 원자적 기록.
3. **`refund_credits` RPC 신설** — 생성 실패 시 자동 환불.
4. **`idea_validator_1` 리워드 추가** — 10c (포텐체커 5c 보다 약간 무겁게)

### 유료 충전 플로우는 별도 Phase 로 미룸

이 스펙에서는 범위 밖. 합의되면 v2 에서 다룸.

---

## SQL 변경 제안

다음을 `the-potential/src/features/credits/migration.sql` 에 **추가** (기존 내용 건드리지 않음):

```sql
-- ============================================================
-- v1 Integration: 포텐페이퍼/체커/아이디어 소비 지원
-- ============================================================

-- 1) 아이디어 검증 리워드 추가
INSERT INTO public.credit_rewards
  (slug, title, description, credits_cost, reward_type, reward_value, sort_order)
VALUES
  (
    'idea_validator_1',
    '아이디어 검증 1회',
    '아이디어 검증을 1회 사용할 수 있어요',
    10,
    'poten_paper',
    '{"uses": 1, "feature": "idea_validator"}',
    3
  )
ON CONFLICT (slug) DO NOTHING;


-- 2) 즉석 차감 RPC
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_amount      integer,
  p_feature     text,
  p_description text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_balance integer;
BEGIN
  -- 인증 확인
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthenticated');
  END IF;

  -- 금액 검증 (음수 방지)
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_amount');
  END IF;

  -- 잔액 조회 (동시성 보호)
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, balance, lifetime_earned)
    VALUES (v_user_id, 0, 0);
    v_balance := 0;
  END IF;

  -- 잔액 부족
  IF v_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success',  false,
      'error',    'insufficient_credits',
      'balance',  v_balance,
      'required', p_amount
    );
  END IF;

  -- 차감 + 이력 기록 (원자적)
  UPDATE user_credits
  SET balance    = balance - p_amount,
      updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (
    v_user_id,
    -p_amount,
    'reward',
    COALESCE(p_description, p_feature || ' 사용')
  );

  RETURN jsonb_build_object(
    'success',        true,
    'balance_after',  v_balance - p_amount,
    'consumed',       p_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_credits TO authenticated, service_role;


-- 3) 환불 RPC (생성 실패 시)
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_amount      integer,
  p_feature     text,
  p_description text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_balance integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthenticated');
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_amount');
  END IF;

  UPDATE user_credits
  SET balance    = balance + p_amount,
      updated_at = now()
  WHERE user_id = v_user_id
  RETURNING balance INTO v_balance;

  IF NOT FOUND THEN
    -- 유저 row 가 없었다면 환불도 생성
    INSERT INTO user_credits (user_id, balance, lifetime_earned)
    VALUES (v_user_id, p_amount, 0)
    RETURNING balance INTO v_balance;
  END IF;

  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (
    v_user_id,
    p_amount,
    'refund',
    COALESCE(p_description, p_feature || ' 환불')
  );

  RETURN jsonb_build_object(
    'success',        true,
    'balance_after',  v_balance,
    'refunded',       p_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.refund_credits TO authenticated, service_role;
```

---

## poten-paper 연동 코드 예시

RPC 가 배포되면 이 레포에서 다음과 같이 사용:

```ts
// src/app/api/poten-paper/generate/route.ts (발췌)
import { createClient } from '@/lib/supabase/server';

const COST = 100; // 포텐페이퍼 단가

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  // 1. 크레딧 차감 (선불)
  const { data: consumed, error: cErr } = await (supabase as any).rpc('consume_credits', {
    p_amount: COST,
    p_feature: 'poten_paper',
    p_description: '사업계획서 생성',
  });

  if (cErr) {
    return NextResponse.json({ error: 'credit_check_failed' }, { status: 500 });
  }
  if (!consumed?.success) {
    if (consumed?.error === 'insufficient_credits') {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          balance: consumed.balance,
          required: consumed.required,
        },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: consumed?.error ?? 'unknown' }, { status: 500 });
  }

  // 2. 생성 시도
  try {
    const result = await generateBusinessPlan(/* ... */);
    return NextResponse.json({ result });
  } catch (err) {
    // 3. 실패 시 환불
    await (supabase as any).rpc('refund_credits', {
      p_amount: COST,
      p_feature: 'poten_paper',
      p_description: '사업계획서 생성 실패 환불',
    });
    throw err;
  }
}
```

## 기능별 단가 (합의용)

| 기능 | 크레딧 | 근거 |
|---|---|---|
| 포텐페이퍼 (사업계획서 생성) | **100c** | 기존 `poten_paper_1` reward 와 일치 · 2회 LLM 호출 |
| 포텐체커 (사업계획서 검증) | **5c** | 기존 `poten_checker_1` reward 와 일치 · 1회 LLM |
| 아이디어 검증 | **10c** | 신규 제안 · 1회 LLM · 포텐체커보다 입력 부담 약간 큼 |

→ 미션으로 최대치 적립 시 하루 90c 획득 가능. 포텐페이퍼 1회도 빠듯 → 유료 충전 필요성 증명.

---

## 잔액 부족 UX (poten-paper 측)

```
[잔액 50c · 포텐페이퍼 100c 필요]
┌─────────────────────────────────────────┐
│  💳 크레딧이 부족해요                    │
│  사업계획서 생성은 100c 가 필요해요       │
│  현재 잔액: 50c · 부족: 50c              │
│                                         │
│  [더포텐셜에서 미션 수행 ↗]              │
│  [충전하기 · 준비중]                     │
└─────────────────────────────────────────┘
```

유료 충전 나오기 전까지는 **더포텐셜 미션 페이지** 로 유도.

---

## 체크리스트

### the-potential 팀
- [ ] 이 스펙 리뷰 & 피드백
- [ ] `migration.sql` 에 위 3개 섹션 추가 (reward + 2 RPC)
- [ ] Supabase 대시보드에서 새 migration 실행
- [ ] `useRedeemReward` 클라이언트 직접 update 로직을 `consume_credits` RPC 호출로 리팩터 (보안 개선)
- [ ] 유료 크레딧 충전 플로우 설계 시작 (v2)

### poten-paper 팀 (이 레포)
- [ ] RPC 배포 확인
- [ ] `/api/poten-paper/generate` 에 consume + refund 로직 추가
- [ ] `/api/poten-check/*` 에 consume + refund 추가 (5c)
- [ ] `/api/idea-validator/generate` 에 consume + refund 추가 (10c)
- [ ] 402 응답 시 클라이언트에서 "크레딧 부족" 모달 표시
- [ ] 마이페이지 "베타 · 무제한 무료" 카드를 실제 잔액 카드로 교체
- [ ] 헤더 `CreditBadge` 실시간 갱신 유지

### 공동
- [ ] 베타 종료 시점 합의 (언제부터 크레딧 과금 활성화?)
- [ ] 아이디어 검증 단가 10c 최종 확정 (or 변경)

---

## 오픈 질문

1. **베타 기간 처리**: 과금 ON 전환 시점을 환경변수 플래그로 할지, 코드 커밋으로 할지?
2. **관리자 무제한**: admin 계정은 consume_credits 우회? 따로 처리?
3. **미션 보상 단가 재검토**: 하루 최대 90c 는 포텐페이퍼 1회도 안 됨 — 보상 상향 or 유료 충전 빠른 도입?
4. **멤버십 플랜과의 관계**: Basic/Premium 멤버십 유저는 크레딧 무제한? 아니면 매월 크레딧 자동 지급?

---

## 버전 히스토리

- **v1 (2026-04-17)**: 최초 작성. 즉석 차감 모델 제안.
