import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ANALYSIS_SYSTEM_PROMPT, GENERATION_SYSTEM_PROMPT } from '@/lib/prd/prompts';
import { parseJsonResponse } from '@/lib/prd/parse-json';
import { normalizeDocument, normalizeAnalysisData } from '@/lib/prd/normalize-document';
import type { GenerateRequest } from '@/lib/prd/types';

const MODEL_ID = 'google/gemini-2.5-flash';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();

    if (!body.inputType || (body.inputType === 'upload' && !body.documentText) || (body.inputType === 'form' && !body.ideaText)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    let userInput = body.inputType === 'upload'
      ? body.documentText!
      : body.ideaText!;
    userInput = userInput.slice(0, 20000);

    // Phase 1: Analysis
    const analysisResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://potenlab.com',
        'X-Title': 'PotenKit PRD Generator',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: `<user-input>\n${userInput}\n</user-input>` },
        ],
        temperature: 0.5,
        max_tokens: 8000,
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenRouter analysis error:', errorText);
      return NextResponse.json({ error: 'Analysis phase failed' }, { status: analysisResponse.status });
    }

    const analysisData = await analysisResponse.json();
    const analysisContent = (analysisData.choices?.[0]?.message?.content || '').trim();

    let analysisResult;
    try {
      analysisResult = parseJsonResponse(analysisContent);
    } catch {
      console.error('Failed to parse analysis response:', analysisContent.slice(0, 300));
      return NextResponse.json({ error: 'Failed to parse analysis data' }, { status: 500 });
    }

    const normalizedAnalysis = normalizeAnalysisData(analysisResult);

    // Phase 2: Generation
    const now = new Date();
    const currentDate = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

    const generationPrompt = `다음 프로젝트 정보와 분석 결과를 기반으로 상세 PRD 문서를 작성해주세요.
오늘 날짜: ${currentDate} (cover.date에 이 날짜를 사용하세요)

<user-input>
${userInput}
</user-input>

<analysis-data>
${JSON.stringify(normalizedAnalysis, null, 2)}
</analysis-data>`;

    const generationResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://potenlab.com',
        'X-Title': 'PotenKit PRD Generator',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: GENERATION_SYSTEM_PROMPT },
          { role: 'user', content: generationPrompt },
        ],
        temperature: 0.2,
        max_tokens: 30000,
      }),
    });

    if (!generationResponse.ok) {
      const errorText = await generationResponse.text();
      console.error('OpenRouter generation error:', errorText);
      return NextResponse.json({ error: 'Generation phase failed' }, { status: generationResponse.status });
    }

    const generationData = await generationResponse.json();
    const generationContent = (generationData.choices?.[0]?.message?.content || '').trim();

    let generationResult;
    try {
      generationResult = parseJsonResponse(generationContent);
    } catch {
      console.error('Failed to parse generation response:', generationContent.slice(0, 300));
      return NextResponse.json({ error: 'Failed to parse PRD document' }, { status: 500 });
    }

    const document = normalizeDocument(generationResult);
    const title = document.cover.projectName || body.title || 'PRD';

    return NextResponse.json({
      title,
      document,
      analysisData: normalizedAnalysis,
    });
  } catch (error) {
    console.error('PRD generate error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: 'PRD 생성에 실패했습니다. 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
