import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getPromptTemplates, createPromptTemplate } from '@/tools/db/prompt-templates';
import type { TaskType } from '@/types/database';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get('task_type') as TaskType | null;

    const templates = await getPromptTemplates(supabase, user.id, taskType ?? undefined);
    return NextResponse.json(createSuccessResponse(templates));
  } catch (error) {
    console.error('Error fetching prompt templates:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
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

    const body = await request.json();

    if (!body.task_type || !body.name || !body.content) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const template = await createPromptTemplate(supabase, user.id, body);
    return NextResponse.json(createSuccessResponse(template), { status: 201 });
  } catch (error) {
    console.error('Error creating prompt template:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
