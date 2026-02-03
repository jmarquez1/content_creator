import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getPost, addVariant, getPostText } from '@/tools/db/posts';
import { createAuditLog } from '@/tools/db/audit-logs';
import { generate, parseJsonResponse } from '@/tools/ai/generate';
import type { GenerateVariantRequest } from '@/types/posts';
import type { PostContent } from '@/types/posts';

interface GeneratedVariant {
  content: string;
  hashtags?: string[];
  variation_description: string;
}

const VARIATION_PROMPTS: Record<string, string> = {
  tone: `Create a variant of this post with a different tone.
Options: more casual, more professional, more enthusiastic, more conversational.
Choose the most appropriate alternative tone based on the content.`,

  length: `Create a variant of this post with a different length.
If the original is long, make it shorter and punchier.
If the original is short, expand it with more detail or examples.`,

  angle: `Create a variant of this post approaching the same topic from a different angle.
Consider: different perspective, different hook, different storytelling approach, or different value proposition.`,

  cta: `Create a variant of this post with a different call-to-action.
Options: ask a question, encourage sharing, prompt comments, drive to a link, or inspire action.
Choose the most effective alternative CTA for this content.`,
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        createErrorResponse({ code: 'UNAUTHORIZED', message: 'Not authenticated' }),
        { status: 401 }
      );
    }

    const body: GenerateVariantRequest = await request.json();

    if (!body.post_id) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'post_id is required' }),
        { status: 400 }
      );
    }

    if (!body.variation_type) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'variation_type is required' }),
        { status: 400 }
      );
    }

    // Fetch the original post
    const originalPost = await getPost(supabase, user.id, body.post_id);
    if (!originalPost) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Post not found' }),
        { status: 404 }
      );
    }

    // Get the text content from the post
    const originalText = getPostText(originalPost);

    // Build variation prompt
    const variationInstruction =
      body.variation_instruction || VARIATION_PROMPTS[body.variation_type] || VARIATION_PROMPTS.tone;

    const prompt = `You are a social media content expert. Your task is to create a variant of the following post.

ORIGINAL POST:
${originalText}

PLATFORM: ${originalPost.platform}

VARIATION INSTRUCTION:
${variationInstruction}

Create a variant that:
1. Maintains the core message and value
2. Follows the variation instruction
3. Is appropriate for ${originalPost.platform}
4. Feels fresh and different from the original

Respond with JSON:
{
  "content": "The variant post content",
  "hashtags": ["optional", "hashtags"],
  "variation_description": "Brief description of what was changed"
}`;

    // Generate variant
    const result = await generate(prompt);
    const generatedVariant = parseJsonResponse<GeneratedVariant>(result.content);

    // Create variant content
    const variantContent: PostContent = {
      text: generatedVariant.content,
      hashtags: generatedVariant.hashtags,
    };

    // Add variant to original post
    const updatedPost = await addVariant(supabase, user.id, originalPost.id, {
      content: variantContent,
      variation_type: body.variation_type,
      variation_description: generatedVariant.variation_description,
    });

    // Get the newly added variant (last one in the array)
    const variants = updatedPost.variants as Array<{ id: string }> | null;
    const newVariantId = variants?.[variants.length - 1]?.id;

    // Create audit log
    const auditLog = await createAuditLog(supabase, user.id, {
      action: 'generate_variants',
      entityType: 'post',
      entityId: originalPost.id,
      promptSnapshot: {
        original_post: {
          id: originalPost.id,
          content: originalText,
          platform: originalPost.platform,
        },
        variation_type: body.variation_type,
        variation_instruction: variationInstruction,
        composed_prompt: prompt,
      },
      modelUsed: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      responseSnapshot: generatedVariant,
    });

    return NextResponse.json(
      createSuccessResponse({
        post: updatedPost,
        variant_id: newVariantId,
        variation_description: generatedVariant.variation_description,
        audit_log_id: auditLog.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating variant:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
