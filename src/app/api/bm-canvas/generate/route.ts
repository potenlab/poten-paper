import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BM_CANVAS_SYSTEM_PROMPT } from '@/lib/bm-canvas/prompts';

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
        'X-Title': 'PotenPaper BM Canvas',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: BM_CANVAS_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `<idea>\n${truncated}\n</idea>\n\n위 사업 아이디어의 비즈니스 모델 캔버스를 JSON 형식으로 작성해주세요.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('[bm-canvas] OpenRouter error:', openrouterResponse.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter ${openrouterResponse.status}: ${errorText.slice(0, 200)}` },
        { status: openrouterResponse.status },
      );
    }

    const data = await openrouterResponse.json();
    let content = (data.choices?.[0]?.message?.content || '').trim();

    if (!content) {
      console.error('[bm-canvas] Empty content from LLM. Full response:', JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: 'empty_response' }, { status: 500 });
    }

    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) content = jsonBlockMatch[1].trim();

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('[bm-canvas] JSON parse failed. Content:', content.slice(0, 500));
      return NextResponse.json(
        { error: 'parse_failed', snippet: content.slice(0, 200) },
        { status: 500 },
      );
    }

    if (!parsed.canvas || !parsed.summary) {
      console.error('[bm-canvas] Missing canvas/summary. Parsed:', JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json({ error: 'missing_canvas_or_summary' }, { status: 500 });
    }

    const requiredKeys = [
      'keyPartners',
      'keyActivities',
      'keyResources',
      'valuePropositions',
      'customerRelationships',
      'channels',
      'customerSegments',
      'costStructure',
      'revenueStreams',
    ];
    for (const k of requiredKeys) {
      if (!Array.isArray(parsed.canvas[k])) {
        console.error(`[bm-canvas] missing block ${k}. canvas:`, JSON.stringify(parsed.canvas).slice(0, 300));
        return NextResponse.json({ error: `missing_block_${k}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      summary: parsed.summary,
      canvas: parsed.canvas,
    });
  } catch (error) {
    console.error('BM canvas error:', error);
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
