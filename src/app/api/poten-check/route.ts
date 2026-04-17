import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { POTEN_CHECK_SYSTEM_PROMPT } from '@/lib/poten-checker/prompts';
import { consumeCredits, refundCredits } from '@/lib/credits/consume';

const MODEL_ID = 'google/gemini-2.5-flash';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  let consumedForRefund = false;
  const refundIfNeeded = async () => {
    if (!consumedForRefund) return;
    consumedForRefund = false;
    await refundCredits(supabase, 'poten_checker', '사업계획서 검증 실패 환불');
  };

  try {
    // Authenticate the user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentText } = await request.json();

    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json({ error: 'documentText is required' }, { status: 400 });
    }

    // 크레딧 차감 (BILLING_ENABLED=false 면 no-op)
    const consume = await consumeCredits(supabase, 'poten_checker', '사업계획서 검증');
    if (!consume.ok) return consume.response;
    consumedForRefund = consume.consumed > 0;

    const truncatedText = documentText.slice(0, 15000);

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://potenpaper.com',
        'X-Title': 'PotenPaper Poten Checker',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: POTEN_CHECK_SYSTEM_PROMPT },
          { role: 'user', content: `다음 사업계획서를 분석해주세요:\n\n<document>\n${truncatedText}\n</document>` },
        ],
        temperature: 0.3,
        max_tokens: 12000,
      }),
    });

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('OpenRouter poten-check error:', errorText);
      await refundIfNeeded();
      return NextResponse.json({ error: 'Analysis failed' }, { status: openrouterResponse.status });
    }

    const data = await openrouterResponse.json();
    let content = (data.choices?.[0]?.message?.content || '').trim();

    // Strip markdown code block wrappers if present
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) content = jsonBlockMatch[1].trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content.slice(0, 200));
      await refundIfNeeded();
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ result: parsed });
  } catch (error) {
    console.error('Poten check error:', error);
    await refundIfNeeded();
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: '분석에 실패했습니다. 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
