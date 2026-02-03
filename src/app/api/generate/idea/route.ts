import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { fetchYoutubeTranscript, truncateTranscript } from '@/tools/fetch/youtube-transcript';
import { createContentSource } from '@/tools/db/content-sources';
import { createIdea } from '@/tools/db/ideas';
import { createAuditLog } from '@/tools/db/audit-logs';
import { getActiveVoiceProfile } from '@/tools/db/voice-profiles';
import { getActivePromptTemplate } from '@/tools/db/prompt-templates';
import { composePrompt, type UserInput } from '@/tools/ai/compose-prompt';
import { generate, parseJsonResponse } from '@/tools/ai/generate';
import type { SourceType } from '@/types/database';

interface GenerateIdeaRequest {
  source_type: SourceType;
  topic?: string;
  audience?: string;
  angle?: string;
  example?: string;
  cta_preference?: string;
  youtube_url?: string;
  transcript?: string; // Manual transcript input
  trend_summary?: string;
  // Document source fields
  content_source_id?: string;
  extracted_text?: string;
}

interface GeneratedIdea {
  title: string;
  hook: string;
  outline: string[];
  suggested_cta: string;
  tags: string[];
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

    const body: GenerateIdeaRequest = await request.json();

    if (!body.source_type) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'source_type is required' }),
        { status: 400 }
      );
    }

    let contentSourceId: string | undefined;
    let contextContent: string | undefined;

    // Handle YouTube source
    if (body.source_type === 'youtube') {
      if (body.transcript) {
        // Manual transcript provided
        const contentSource = await createContentSource(supabase, user.id, {
          source_type: 'youtube',
          url: body.youtube_url,
          transcript: body.transcript,
        });
        contentSourceId = contentSource.id;
        contextContent = truncateTranscript(body.transcript);
      } else if (body.youtube_url) {
        // Auto-fetch transcript
        try {
          const result = await fetchYoutubeTranscript(body.youtube_url);
          const contentSource = await createContentSource(supabase, user.id, {
            source_type: 'youtube',
            url: body.youtube_url,
            title: result.title,
            transcript: result.transcript,
            metadata: { videoId: result.videoId },
          });
          contentSourceId = contentSource.id;
          contextContent = truncateTranscript(result.transcript);
        } catch (error) {
          return NextResponse.json(
            createErrorResponse({
              code: 'TRANSCRIPT_FETCH_FAILED',
              message: error instanceof Error ? error.message : 'Failed to fetch transcript',
              details: { requiresManualTranscript: true },
            }),
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          createErrorResponse({
            code: 'VALIDATION_ERROR',
            message: 'YouTube URL or transcript is required',
          }),
          { status: 400 }
        );
      }
    }

    // Handle document source
    if (body.source_type === 'document') {
      if (!body.content_source_id || !body.extracted_text) {
        return NextResponse.json(
          createErrorResponse({
            code: 'VALIDATION_ERROR',
            message: 'Document content_source_id and extracted_text are required',
          }),
          { status: 400 }
        );
      }
      contentSourceId = body.content_source_id;
      contextContent = body.extracted_text;
    }

    // Get active profiles
    const voiceProfile = await getActiveVoiceProfile(supabase, user.id);
    const taskType = body.trend_summary ? 'trend_ideation' : 'ideation';
    const promptTemplate = await getActivePromptTemplate(supabase, user.id, taskType);

    // Build user input
    const userInput: UserInput = {
      topic: body.topic,
      audience: body.audience,
      angle: body.angle,
      example: body.example || contextContent,
      cta_preference: body.cta_preference,
    };

    // Compose prompt
    const { prompt, versions } = composePrompt({
      taskType,
      voiceProfile,
      promptTemplate,
      userInput,
      trendSummary: body.trend_summary,
    });

    // Generate idea
    const result = await generate(prompt);
    const generatedIdea = parseJsonResponse<GeneratedIdea>(result.content);

    // Create idea record
    const idea = await createIdea(supabase, user.id, {
      title: generatedIdea.title,
      hook: generatedIdea.hook,
      outline: generatedIdea.outline.map((point) => ({ point })),
      suggested_cta: generatedIdea.suggested_cta,
      tags: generatedIdea.tags,
      source_type: body.source_type,
      source_reference_id: contentSourceId,
    });

    // Create audit log
    const auditLog = await createAuditLog(supabase, user.id, {
      action: 'generate_idea',
      entityType: 'idea',
      entityId: idea.id,
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
        user_input: userInput,
        trend_summary: body.trend_summary || null,
        composed_prompt: prompt,
      },
      modelUsed: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      responseSnapshot: generatedIdea,
      templateVersions: {
        task_template_version: versions.task_template_version,
        voice_profile_version: versions.voice_profile_version,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        idea,
        audit_log_id: auditLog.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating idea:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
