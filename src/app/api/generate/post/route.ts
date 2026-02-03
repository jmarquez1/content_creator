import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getIdea } from '@/tools/db/ideas';
import { createPost } from '@/tools/db/posts';
import { createAuditLog } from '@/tools/db/audit-logs';
import { getActiveVoiceProfile, getVoiceProfile } from '@/tools/db/voice-profiles';
import { getActivePlatformProfile } from '@/tools/db/platform-profiles';
import { getActivePromptTemplate } from '@/tools/db/prompt-templates';
import { composePrompt, type UserInput } from '@/tools/ai/compose-prompt';
import { generate, parseJsonResponse } from '@/tools/ai/generate';
import type { Platform, GeneratePostRequest } from '@/types/posts';

interface GeneratedPost {
  content: string;
  hashtags?: string[];
  suggested_image_prompt?: string;
}

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

    const body: GeneratePostRequest = await request.json();

    if (!body.idea_id) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'idea_id is required' }),
        { status: 400 }
      );
    }

    if (!body.platform) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'platform is required' }),
        { status: 400 }
      );
    }

    // Fetch the idea
    const idea = await getIdea(supabase, body.idea_id);
    if (!idea) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Idea not found' }),
        { status: 404 }
      );
    }

    // Get voice profile (user-specified or active)
    const voiceProfile = body.voice_profile_id
      ? await getVoiceProfile(supabase, user.id, body.voice_profile_id)
      : await getActiveVoiceProfile(supabase, user.id);

    if (!voiceProfile) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Voice profile not found' }),
        { status: 404 }
      );
    }

    // Get platform profile
    const platformProfile = await getActivePlatformProfile(supabase, user.id, body.platform);

    // Get prompt template for post drafting
    const taskType = `draft_${body.platform}` as const;
    const promptTemplate = await getActivePromptTemplate(supabase, user.id, taskType);

    // Build user input from idea
    const outlineArray = Array.isArray(idea.outline)
      ? (idea.outline as Array<{ point: string }>)
      : null;
    const userInput: UserInput = {
      topic: idea.title,
      audience: body.additional_context,
      angle: idea.hook || undefined,
      example: outlineArray
        ? outlineArray.map((item) => item.point).join('\n')
        : undefined,
      cta_preference: idea.suggested_cta || undefined,
    };

    // Compose prompt
    const { prompt, versions } = composePrompt({
      taskType,
      voiceProfile,
      platformProfile,
      promptTemplate,
      userInput,
    });

    // Generate post content
    const result = await generate(prompt);
    const generatedPost = parseJsonResponse<GeneratedPost>(result.content);

    // Create post record
    const post = await createPost(supabase, user.id, {
      idea_id: body.idea_id,
      platform: body.platform,
      content: generatedPost.content,
      status: 'draft',
      metadata: {
        hashtags: generatedPost.hashtags,
        suggested_image_prompt: generatedPost.suggested_image_prompt,
      },
    });

    // Create audit log
    const auditLog = await createAuditLog(supabase, user.id, {
      action: 'generate_post',
      entityType: 'post',
      entityId: post.id,
      promptSnapshot: {
        task_template: {
          id: promptTemplate.id,
          version: promptTemplate.version,
          content: promptTemplate.content,
        },
        voice_profile: {
          id: voiceProfile.id,
          version: voiceProfile.version,
          content: {
            persona: voiceProfile.persona,
            tone_rules: voiceProfile.tone_rules,
            readability_rules: voiceProfile.readability_rules,
          },
        },
        platform_profile: platformProfile
          ? {
              id: platformProfile.id,
              version: platformProfile.version,
              content: {
                platform: platformProfile.platform,
                structure: platformProfile.structure,
                formatting_rules: platformProfile.formatting_rules,
                length_constraints: platformProfile.length_constraints,
              },
            }
          : null,
        user_input: userInput,
        idea: {
          id: idea.id,
          title: idea.title,
          hook: idea.hook,
          outline: idea.outline,
        },
        composed_prompt: prompt,
      },
      modelUsed: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      responseSnapshot: generatedPost,
      templateVersions: {
        task_template_version: versions.task_template_version,
        voice_profile_version: versions.voice_profile_version,
        platform_profile_version: versions.platform_profile_version,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        post,
        audit_log_id: auditLog.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
