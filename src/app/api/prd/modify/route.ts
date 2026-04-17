import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MODIFY_DOCUMENT_SYSTEM_PROMPT } from '@/lib/prd/prompts';
import { parseJsonResponse } from '@/lib/prd/parse-json';
import { normalizeDocument, normalizeAnalysisData } from '@/lib/prd/normalize-document';
import type { PRDDocument, AnalysisData } from '@/lib/prd/types';

const MODEL_ID = 'google/gemini-2.5-flash';

interface ModifyRequest {
  document: PRDDocument;
  analysisData: AnalysisData;
  originalInput: string;
  message: string;
  images?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ModifyRequest = await request.json();

    if (!body.document || !body.message) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const userContent = `<existing-document>
${JSON.stringify(body.document, null, 2)}
</existing-document>

<analysis-data>
${JSON.stringify(body.analysisData, null, 2)}
</analysis-data>

<user-input>
${body.originalInput?.slice(0, 5000) || ''}
</user-input>

<user-request>
${body.message}
</user-request>${body.images?.length ? `\n\n[첨부 이미지 ${body.images.length}장 포함]` : ''}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://potenlab.com',
        'X-Title': '포텐페이퍼 PRD Generator',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: MODIFY_DOCUMENT_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 30000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter modify error:', errorText);
      return NextResponse.json({ error: 'Modification failed' }, { status: response.status });
    }

    const data = await response.json();
    const content = (data.choices?.[0]?.message?.content || '').trim();

    let result;
    try {
      result = parseJsonResponse(content);
    } catch {
      console.error('Failed to parse modify response:', content.slice(0, 300));
      return NextResponse.json({ error: 'Failed to parse modification result' }, { status: 500 });
    }

    const updatedDocument = normalizeDocument(result.updatedDocument);
    const updatedAnalysisData = normalizeAnalysisData(result.updatedAnalysisData);
    const summary = result.summary || '문서가 수정되었습니다.';

    return NextResponse.json({
      document: updatedDocument,
      analysisData: updatedAnalysisData,
      summary,
    });
  } catch (error) {
    console.error('PRD modify error:', error);
    return NextResponse.json(
      { error: 'PRD 수정에 실패했습니다. 다시 시도해주세요.' },
      { status: 500 },
    );
  }
}
