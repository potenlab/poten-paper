import { NextResponse } from 'next/server';
import { BILLING_ENABLED, CREDIT_COSTS, type Feature } from './constants';

// Supabase 클라이언트의 rpc 는 제네릭 thenable 이라 좁게 타이핑하면 깨짐.
// 호출 형태만 필요하므로 any 로 받음.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any;

export type ConsumeResult =
  | { ok: true; consumed: number; balanceAfter: number }
  | { ok: false; response: NextResponse };

/**
 * 크레딧 차감. BILLING_ENABLED=false 면 no-op 으로 통과.
 * RPC 에러·잔액부족은 각각 500·402 응답으로 매핑해 반환.
 */
export async function consumeCredits(
  supabase: SupabaseLike,
  feature: Feature,
  description?: string,
): Promise<ConsumeResult> {
  if (!BILLING_ENABLED) {
    return { ok: true, consumed: 0, balanceAfter: 0 };
  }

  const amount = CREDIT_COSTS[feature];
  const { data, error } = await supabase.rpc('consume_credits', {
    p_amount: amount,
    p_feature: feature,
    p_description: description,
  });

  if (error) {
    console.error(`[credits] consume ${feature} rpc error:`, error);
    return {
      ok: false,
      response: NextResponse.json({ error: 'credit_check_failed' }, { status: 500 }),
    };
  }

  const res = data as { success?: boolean; error?: string; balance?: number; required?: number; balance_after?: number; consumed?: number } | null;

  if (!res?.success) {
    if (res?.error === 'insufficient_credits') {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: 'insufficient_credits',
            balance: res.balance,
            required: res.required,
          },
          { status: 402 },
        ),
      };
    }
    return {
      ok: false,
      response: NextResponse.json(
        { error: res?.error ?? 'credit_unknown_error' },
        { status: 500 },
      ),
    };
  }

  return {
    ok: true,
    consumed: res.consumed ?? amount,
    balanceAfter: res.balance_after ?? 0,
  };
}

/**
 * 생성 실패 시 호출. Best-effort — 예외를 던지지 않음.
 * BILLING_ENABLED=false 면 no-op.
 */
export async function refundCredits(
  supabase: SupabaseLike,
  feature: Feature,
  description?: string,
): Promise<void> {
  if (!BILLING_ENABLED) return;

  const amount = CREDIT_COSTS[feature];
  try {
    const { error } = await supabase.rpc('refund_credits', {
      p_amount: amount,
      p_feature: feature,
      p_description: description ?? `${feature} 생성 실패 환불`,
    });
    if (error) console.error(`[credits] refund ${feature} rpc error:`, error);
  } catch (e) {
    console.error(`[credits] refund ${feature} exception:`, e);
  }
}
