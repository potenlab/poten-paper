import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RESEARCH_SYSTEM_PROMPT, GENERATION_SYSTEM_PROMPT } from '@/lib/poten-paper/prompts';
import { parseJsonResponse } from '@/lib/poten-paper/parse-json';
import { getActivePrompts } from '@/lib/poten-paper/get-active-prompts';
import type { GenerateRequest, ChartData, BusinessPlanDocument } from '@/lib/poten-paper/types';

const MODEL_ID = 'google/gemini-2.5-flash';

function buildUserInput(req: GenerateRequest): string {
  if (req.inputType === 'upload' && req.documentText) {
    const parts = [`[업로드된 문서 내용]\n${req.documentText}`];
    if (req.title) parts.push(`\n사업계획서 제목: ${req.title}`);
    if (req.industry) parts.push(`산업 분야: ${req.industry}`);
    return parts.join('\n');
  }

  if (req.inputType === 'form' && req.ideaText) {
    return `[사업 아이디어]\n${req.ideaText}`;
  }

  if (req.inputType === 'form' && req.formData) {
    const f = req.formData;
    const parts = [
      `사업명: ${f.businessName}`,
      `산업 분야: ${f.industry}`,
      `사업 단계: ${f.businessStage}`,
      `타겟 고객: ${f.targetCustomer}`,
      `해결하고자 하는 문제: ${f.problemStatement}`,
      `솔루션: ${f.solutionDescription}`,
      `차별화 포인트: ${f.differentiator}`,
    ];
    if (f.revenueModel) parts.push(`수익 모델: ${f.revenueModel}`);
    if (f.teamDescription) parts.push(`팀 소개: ${f.teamDescription}`);
    if (f.additionalNotes) parts.push(`추가 참고사항: ${f.additionalNotes}`);
    return parts.join('\n');
  }

  throw new Error('Invalid input');
}

function sanitizeChartData(chart: any): ChartData | null {
  if (!chart || typeof chart !== 'object') return null;

  const validTypes = ['bar', 'horizontalBar', 'pie', 'donut', 'line', 'funnel', 'table', 'timeline'];
  if (!validTypes.includes(chart.type)) return null;

  if (chart.type === 'table' || chart.type === 'timeline') {
    if (!Array.isArray(chart.columns) || !Array.isArray(chart.rows)) return null;
    return chart as ChartData;
  }

  if (chart.type === 'funnel') {
    if (!Array.isArray(chart.data) || chart.data.length < 2) return null;
    const valid = chart.data.every((d: any) => typeof d.name === 'string' && typeof d.value === 'number');
    if (!valid) return null;
    return chart as ChartData;
  }

  if (!Array.isArray(chart.data) || chart.data.length === 0) return null;

  return chart as ChartData;
}

function sanitizeDocument(doc: any): BusinessPlanDocument {
  const sections = (doc.sections || []).map((section: any) => ({
    ...section,
    subSections: (section.subSections || []).map((sub: any) => ({
      ...sub,
      subSubSections: (sub.subSubSections || []).map((subsub: any) => ({
        ...subsub,
        chart: sanitizeChartData(subsub.chart),
        imagePrompt: subsub.imagePrompt || null,
        imageUrl: null,
      })),
    })),
  }));

  return {
    cover: doc.cover || {
      businessName: doc.title || '사업계획서',
      subtitle: '',
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
    },
    sections,
    format_version: 2,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();

    if (!body.inputType || (body.inputType === 'upload' && !body.documentText) || (body.inputType === 'form' && !body.ideaText && !body.formData)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    let userInput = buildUserInput(body);
    userInput = userInput.slice(0, 20000);

    // Load prompts from DB (with hardcoded fallback)
    const prompts = await getActivePrompts();

    // Phase 1: Research
    const researchResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://potenlab.com',
        'X-Title': 'Potenlab PotenPaper',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: prompts.research },
          { role: 'user', content: `다음 사업 정보를 기반으로 시장 리서치를 수행해주세요:\n\n<business-input>\n${userInput}\n</business-input>` },
        ],
        temperature: 0.5,
        max_tokens: 8000,
      }),
    });

    if (!researchResponse.ok) {
      const errorText = await researchResponse.text();
      console.error('OpenRouter research error:', errorText);
      return NextResponse.json({ error: 'Research phase failed' }, { status: researchResponse.status });
    }

    const researchData = await researchResponse.json();
    const researchContent = (researchData.choices?.[0]?.message?.content || '').trim();

    let researchResult;
    try {
      researchResult = parseJsonResponse(researchContent);
    } catch {
      console.error('Failed to parse research response:', researchContent.slice(0, 300));
      return NextResponse.json({ error: 'Failed to parse research data' }, { status: 500 });
    }

    // Phase 2: Generation
    const generationPrompt = `다음 사업 정보와 리서치 결과를 기반으로 청년창업사관학교 양식의 사업계획서를 작성해주세요.

<business-input>
${userInput}
</business-input>

<research-data>
${JSON.stringify(researchResult, null, 2)}
</research-data>`;

    const generationResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://potenlab.com',
        'X-Title': 'Potenlab PotenPaper',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: prompts.generation },
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
      return NextResponse.json({ error: 'Failed to parse business plan' }, { status: 500 });
    }

    const document = sanitizeDocument(generationResult);
    const title = generationResult.title || body.title || body.formData?.businessName || body.ideaText?.slice(0, 50) || '사업계획서';

    return NextResponse.json({
      result: {
        title,
        document,
        researchData: researchResult,
      },
    });
  } catch (error) {
    console.error('Poten paper generate error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: '사업계획서 생성에 실패했습니다. 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
