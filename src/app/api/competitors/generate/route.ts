import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { COMPETITORS_SYSTEM_PROMPT } from '@/lib/competitors/prompts';

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
        'X-Title': 'PotenPaper Competitors',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: COMPETITORS_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `<idea>\n${truncated}\n</idea>\n\n위 사업 아이디어의 경쟁사 비교표를 JSON 형식으로 작성해주세요.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('[competitors] OpenRouter error:', openrouterResponse.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter ${openrouterResponse.status}` },
        { status: openrouterResponse.status },
      );
    }

    const data = await openrouterResponse.json();
    let content = (data.choices?.[0]?.message?.content || '').trim();

    if (!content) {
      console.error('[competitors] Empty content:', JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: 'empty_response' }, { status: 500 });
    }

    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) content = jsonBlockMatch[1].trim();

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('[competitors] Parse failed:', content.slice(0, 300));
      return NextResponse.json({ error: 'parse_failed' }, { status: 500 });
    }

    if (!parsed.data || !parsed.summary) {
      console.error('[competitors] Missing fields:', JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json({ error: 'missing_fields' }, { status: 500 });
    }

    const { competitors, items } = parsed.data;
    if (!Array.isArray(competitors) || competitors.length < 2) {
      return NextResponse.json({ error: 'invalid_competitors' }, { status: 500 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'invalid_items' }, { status: 500 });
    }

    // 값 길이 일치 + enum 검증
    const validEnum = new Set(['yes', 'no', 'partial']);
    for (const it of items) {
      if (typeof it.feature !== 'string' || !Array.isArray(it.values)) {
        return NextResponse.json({ error: 'invalid_item_shape' }, { status: 500 });
      }
      if (it.values.length !== competitors.length) {
        return NextResponse.json({ error: 'values_length_mismatch' }, { status: 500 });
      }
      for (const v of it.values) {
        if (!validEnum.has(v)) {
          return NextResponse.json({ error: 'invalid_enum_value' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({
      summary: parsed.summary,
      data: parsed.data,
    });
  } catch (error) {
    console.error('[competitors] Error:', error);
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
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
