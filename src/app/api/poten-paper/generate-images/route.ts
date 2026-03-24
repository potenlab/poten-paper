import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ImageRequest {
  subSubSectionId: string;
  imagePrompt: string;
}

/**
 * Extract image data URL from OpenRouter response message.
 * OpenRouter returns images in message.images as:
 *   [{ type: "image_url", image_url: { url: "data:image/png;base64,..." } }]
 */
function extractImageUrl(message: any): string | null {
  if (!message) return null;

  // Primary: message.images array with image_url objects
  if (Array.isArray(message.images)) {
    for (const img of message.images) {
      if (img?.image_url?.url) return img.image_url.url;
      // Plain string data URL
      if (typeof img === 'string' && img.startsWith('data:')) return img;
    }
  }

  // Fallback: content is a data URL string
  if (typeof message.content === 'string' && message.content.startsWith('data:')) {
    return message.content;
  }

  // Fallback: content is an array with image parts
  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (part?.type === 'image_url' && part?.image_url?.url) return part.image_url.url;
      if (typeof part === 'string' && part.startsWith('data:')) return part;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: { images: ImageRequest[] } = await request.json();

    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json({ error: 'No image requests provided' }, { status: 400 });
    }

    // Limit to 5 images per request
    const imageRequests = body.images.slice(0, 5);

    const results = await Promise.allSettled(
      imageRequests.map(async (req) => {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': process.env.SITE_URL || 'https://potenlab.com',
              'X-Title': 'Potenlab PotenPaper',
            },
            body: JSON.stringify({
              model: 'google/gemini-3-pro-image-preview',
              messages: [
                {
                  role: 'user',
                  content: `Generate a professional business plan illustration: ${req.imagePrompt}. The image should be clean, modern, and suitable for a formal business document. Use a professional color palette with blue (#0EA5E9) as accent color. IMPORTANT: Any text that appears in the image MUST be in Korean only. Do not use English or any other language for text in the image.`,
                },
              ],
              modalities: ['image', 'text'],
            }),
          });

          if (!response.ok) {
            console.error(`Image generation failed for ${req.subSubSectionId}:`, await response.text());
            return { subSubSectionId: req.subSubSectionId, imageUrl: null };
          }

          const data = await response.json();
          const message = data.choices?.[0]?.message;

          // Extract image URL from the response
          const imageUrl = extractImageUrl(message);
          return { subSubSectionId: req.subSubSectionId, imageUrl };
        } catch (err) {
          console.error(`Image generation error for ${req.subSubSectionId}:`, err);
          return { subSubSectionId: req.subSubSectionId, imageUrl: null };
        }
      })
    );

    const images = results.map((r) =>
      r.status === 'fulfilled' ? r.value : { subSubSectionId: '', imageUrl: null }
    ).filter((r) => r.subSubSectionId);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
