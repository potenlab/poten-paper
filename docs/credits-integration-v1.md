# 크레딧 시스템 통합 스펙 v1

**작성일**: 2026-04-17
**대상**: the-potential 팀 + poten-paper 팀
**목적**: poten-paper 에서 the-potential 크레딧을 **소진(consume)** 하기 위한 합의 문서

---

## 역할 분담 (범위 명확화)

| 영역 | 담당 |
|---|---|
| 크레딧 **적립** (미션·구매·프로모션 등) | **the-potential** |
| 크레딧 **조회** (balance 표시) | 양쪽 공용 |
| 크레딧 **소진** (포텐페이퍼·체커·아이디어 검증 사용 시 차감) | **poten-paper** |
| 적립 단가·방법·프로모션 정책 | **the-potential 재량** (이 문서 범위 밖) |

**이 문서는 오직 소진(consume) 쪽에만 집중**. 유저가 크레딧을 어떻게 얻는지 (미션·결제·프로모션) 는 the-potential 내부 문제로, 여기서 다루지 않음.

---

## 현재 the-potential 크레딧 스키마 (참고)

- 4개 테이블: `credit_missions`, `user_credits`, `credit_rewards`, `credit_transactions`
- RPC: `earn_mission_credit()` (적립용, the-potential 소유)
- 기존 리워드: `poten_checker_1` (5c), `poten_paper_1` (100c), `basic_1month` (500c)

poten-paper 는 `user_credits.balance` 조회는 이미 동작 중. **차감 로직만 추가하면 됨**.

---

## 이 스펙에서 필요한 것 2가지

### 1. 🔴 서버 측 "소진" 경로 (보안)

현재 the-potential 쪽의 `useRedeemReward` 는 **클라이언트에서 직접** `user_credits.balance` 를 수정함 ([queries.ts:177-199](../../the-potential/src/features/credits/api/queries.ts#L177)). RLS 가 `user_id = auth.uid()` 만 체크하고 변경량은 검증 안 해서 이론적으로 DevTools 에서 balance 자기증식 가능.

**참고**: 이건 적립 경로의 이슈이고 the-potential 팀이 판단할 문제. 하지만 **poten-paper 쪽 차감은 처음부터 안전하게** SECURITY DEFINER RPC 로 깔아야 함.

### 2. 🟡 아이디어 검증 단가 미정

`credit_rewards` 에 `idea_validator` 리워드 없음 → 추가 필요 (단가 제안 10c).

---

## 제안

1. **"즉석 차감 모델" 채택** — 선구매 사용권 추적 방식 채택 안 함. poten-paper 사용 시점에 `user_credits.balance -= N` 바로 차감. 단순, 직관적.
2. **`consume_credits` RPC 신설** — SECURITY DEFINER + `auth.uid()` 기반 + `FOR UPDATE` 잠금. credit_transactions 원자적 기록.
3. **`refund_credits` RPC 신설** — poten-paper 측에서 생성 실패 시 자동 환불.
4. **`idea_validator_1` 리워드 추가** — 10c (포텐체커 5c 보다 약간 무겁게)

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

---

## 잔액 부족 UX (poten-paper 측)

```
[잔액 50c · 포텐페이퍼 100c 필요]
┌─────────────────────────────────────────┐
│  💳 크레딧이 부족해요                    │
│  사업계획서 생성은 100c 가 필요해요       │
│  현재 잔액: 50c · 부족: 50c              │
│                                         │
│  [더포텐셜에서 크레딧 받기 ↗]            │
└─────────────────────────────────────────┘
```

**더포텐셜로 리다이렉트** (미션 / 결제 / 프로모션 등 적립 방식은 더포텐셜 재량).

---

## 체크리스트

### the-potential 팀
- [ ] 이 스펙 리뷰 & 피드백
- [ ] `migration.sql` 에 위 3개 섹션 추가 (idea_validator_1 reward + consume_credits + refund_credits RPC)
- [ ] Supabase 대시보드에서 새 migration 실행
- [ ] (선택) `useRedeemReward` 보안 개선 — 기존 리워드 교환 경로도 `consume_credits` RPC 로 전환 고려

### poten-paper 팀 (이 레포)
- [ ] RPC 배포 확인
- [ ] `/api/poten-paper/generate` 에 consume + refund 로직 추가 (100c)
- [ ] `/api/poten-check/*` 에 consume + refund 추가 (5c)
- [ ] `/api/idea-validator/generate` 에 consume + refund 추가 (10c)
- [ ] 402 `insufficient_credits` 응답 시 클라이언트에서 "크레딧 부족 → 더포텐셜로" 모달
- [ ] 마이페이지 "베타 · 무제한 무료" 카드를 실제 잔액 카드로 교체
- [ ] 헤더 `CreditBadge` 실시간 갱신 유지

### 공동 합의 필요
- [ ] 베타 종료 시점 (언제부터 과금 활성화?)
- [ ] 아이디어 검증 단가 10c 최종 확정
- [ ] 더포텐셜 "크레딧 획득 페이지" URL 확정 (잔액 부족 모달의 리다이렉트 대상)

---

## 오픈 질문

1. **베타 기간 처리**: 과금 ON 전환 시점을 환경변수 플래그로 할지, 코드 커밋으로 할지?
2. **관리자 무제한**: admin 계정은 consume_credits 우회? 따로 처리?
3. **멤버십 플랜과의 관계**: Basic/Premium 멤버십 유저는 크레딧 차감 면제? 아니면 매월 크레딧 자동 지급? (the-potential 정책 — 합의 필요)

---

## 버전 히스토리

- **v1 (2026-04-17)**: 최초 작성. 즉석 차감 모델 + poten-paper 는 소진(consume)만 담당하는 방향으로 스코프 명확화.
