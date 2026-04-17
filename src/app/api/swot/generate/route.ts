import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SWOT_SYSTEM_PROMPT } from '@/lib/swot/prompts';

const MODEL_ID = 'google/gemini-2.5-flash';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ideaText } = await request.json();

    if (!ideaText || typeof ideaText !== 'string' || !ideaText.trim()) {
      return NextResponse.json({ error: 'ideaText is required' }, { status: 400 });
    }

    const truncated = ideaText.trim().slice(0, 2000);

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://paper.potenlab.dev',
        'X-Title': '포텐페이퍼 SWOT',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: SWOT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `<idea>\n${truncated}\n</idea>\n\n위 사업 아이디어의 SWOT 분석을 JSON 형식으로 작성해주세요.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('[swot] OpenRouter error:', openrouterResponse.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter ${openrouterResponse.status}` },
        { status: openrouterResponse.status },
      );
    }

    const data = await openrouterResponse.json();
    let content = (data.choices?.[0]?.message?.content || '').trim();

    if (!content) {
      console.error('[swot] Empty content:', JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: 'empty_response' }, { status: 500 });
    }

    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) content = jsonBlockMatch[1].trim();

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('[swot] Parse failed:', content.slice(0, 300));
      return NextResponse.json({ error: 'parse_failed' }, { status: 500 });
    }

    if (!parsed.data || !parsed.summary) {
      console.error('[swot] Missing data/summary:', JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json({ error: 'missing_fields' }, { status: 500 });
    }

    for (const k of ['strengths', 'weaknesses', 'opportunities', 'threats']) {
      if (!Array.isArray(parsed.data[k])) {
        return NextResponse.json({ error: `missing_${k}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      summary: parsed.summary,
      data: parsed.data,
    });
  } catch (error) {
    console.error('[swot] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        error: '생성에 실패했습니다. 다시 시도해주세요.',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
