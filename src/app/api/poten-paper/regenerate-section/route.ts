import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActivePrompts } from '@/lib/poten-paper/get-active-prompts';

const MODEL_ID = 'google/gemini-2.5-flash';

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const originalInput: string = body.originalInput || '';
    const additionalContext: string = body.additionalContext || '';

    // ── v2 format: subSubSectionId + document ───────────────────────
    if (body.subSubSectionId && body.document) {
      const documentContext = body.document.sections
        .map((section: any) => {
          const subContent = section.subSections
            .map((sub: any) => {
              const subsubContent = sub.subSubSections
                .map((ss: any) => `#### ${ss.id} ${ss.titleKo}\n${ss.content}`)
                .join('\n\n');
              return `### ${sub.id} ${sub.titleKo}\n${subsubContent}`;
            })
            .join('\n\n');
          return `## ${section.number}. ${section.titleKo}\n${subContent}`;
        })
        .join('\n\n');

      let targetTitle = '';
      for (const section of body.document.sections) {
        for (const sub of (section as any).subSections) {
          for (const ss of sub.subSubSections) {
            if (ss.id === body.subSubSectionId) targetTitle = ss.titleKo;
          }
        }
      }

      const userPrompt = `## 재생성 요청 소소섹션: ${body.subSubSectionId} (${targetTitle})

<business-input>
${originalInput.slice(0, 15000)}
</business-input>

<research-data>
${JSON.stringify(body.researchData, null, 2)}
</research-data>

<existing-document>
${documentContext}
</existing-document>

${additionalContext ? `<user-request>\n${additionalContext}\n</user-request>` : ''}

위 정보를 기반으로 "${body.subSubSectionId} ${targetTitle}" 소소섹션만 새로 작성해주세요.`;

      const prompts = await getActivePrompts();
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            { role: 'system', content: prompts.regeneration },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter regenerate v2 error:', errorText);
        return NextResponse.json({ error: 'Regeneration failed' }, { status: response.status });
      }

      const data = await response.json();
      let content = (data.choices?.[0]?.message?.content || '').trim();
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) content = jsonBlockMatch[1].trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        console.error('Failed to parse regenerate v2 response:', content.slice(0, 200));
        return NextResponse.json({ error: 'Failed to parse regenerated section' }, { status: 500 });
      }

      return NextResponse.json({ subSubSection: parsed });
    }

    // ── v1 format: sectionKey + existingSections ─────────────────────
    if (body.sectionKey && body.existingSections) {
      const existingContext = body.existingSections
        .map((s: any) => `## ${s.titleKo}\n${s.content}`)
        .join('\n\n');

      const targetSection = body.existingSections.find((s: any) => s.key === body.sectionKey);
      const targetTitle = targetSection?.titleKo || body.sectionKey;

      const userPrompt = `## 재생성 요청 섹션: ${body.sectionKey} (${targetTitle})

<business-input>
${originalInput.slice(0, 15000)}
</business-input>

<research-data>
${JSON.stringify(body.researchData, null, 2)}
</research-data>

<existing-document>
${existingContext}
</existing-document>

${additionalContext ? `<user-request>\n${additionalContext}\n</user-request>` : ''}

위 정보를 기반으로 "${targetTitle}" 섹션만 새로 작성해주세요.`;

      const prompts = await getActivePrompts();
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            { role: 'system', content: prompts.regeneration },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter regenerate v1 error:', errorText);
        return NextResponse.json({ error: 'Regeneration failed' }, { status: response.status });
      }

      const data = await response.json();
      let content = (data.choices?.[0]?.message?.content || '').trim();
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) content = jsonBlockMatch[1].trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        console.error('Failed to parse regenerate v1 response:', content.slice(0, 200));
        return NextResponse.json({ error: 'Failed to parse regenerated section' }, { status: 500 });
      }

      return NextResponse.json({ section: parsed });
    }

    // Neither format matched
    console.error('Invalid regenerate request body keys:', Object.keys(body));
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Poten paper regenerate error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: '섹션 재생성에 실패했습니다.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
