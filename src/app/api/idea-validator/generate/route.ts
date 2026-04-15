import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { IDEA_VALIDATOR_SYSTEM_PROMPT } from '@/lib/idea-validator/prompts';

const MODEL_ID = 'google/gemini-2.5-flash';

export async function POST(request: NextRequest) {
  try {
    // Auth
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
        'HTTP-Referer': process.env.SITE_URL || 'https://poten-paper.vercel.app',
        'X-Title': 'PotenPaper Idea Validator',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: IDEA_VALIDATOR_SYSTEM_PROMPT },
          { role: 'user', content: `<idea>\n${truncated}\n</idea>\n\n위 아이디어를 지침대로 JSON 평가해주세요.` },
        ],
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('OpenRouter idea-validator error:', errorText);
      return NextResponse.json({ error: 'Analysis failed' }, { status: openrouterResponse.status });
    }

    const data = await openrouterResponse.json();
    let content = (data.choices?.[0]?.message?.content || '').trim();

    // Strip markdown fence if present
    const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) content = jsonBlockMatch[1].trim();

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content.slice(0, 200));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Minimal validation
    if (
      !parsed.summary ||
      !parsed.scores ||
      typeof parsed.overall_score !== 'number' ||
      !parsed.blue_team ||
      !parsed.red_team ||
      !Array.isArray(parsed.improvement_tips)
    ) {
      return NextResponse.json({ error: 'Invalid AI response structure' }, { status: 500 });
    }

    // Save to Supabase (blocking — we return the id for redirect)
    const { data: inserted, error: insertError } = await (supabase as any)
      .from('idea_validations')
      .insert({
        user_id: user.id,
        idea_text: truncated,
        scores: parsed.scores,
        overall_score: Math.round(parsed.overall_score),
        summary: parsed.summary,
        blue_team: parsed.blue_team,
        red_team: parsed.red_team,
        improvement_tips: parsed.improvement_tips,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      console.error('idea_validations insert failed:', insertError);
      // Still return result without id for preview — client will miss persistence
      return NextResponse.json({ result: parsed, id: null });
    }

    return NextResponse.json({ result: parsed, id: inserted.id });
  } catch (error) {
    console.error('Idea validator error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        error: '분석에 실패했습니다. 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
