import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getIdeas, createIdea } from '@/tools/db/ideas';
import type { IdeaStatus } from '@/types/database';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(createErrorResponse({ code: 'UNAUTHORIZED', message: 'Not authenticated' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as IdeaStatus | null;

    const ideas = await getIdeas(supabase, user.id, status ?? undefined);
    return NextResponse.json(createSuccessResponse(ideas));
  } catch (error) {
    console.error('Error fetching ideas:', error);
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
      return NextResponse.json(createErrorResponse({ code: 'UNAUTHORIZED', message: 'Not authenticated' }), { status: 401 });
    }

    const body = await request.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'Title is required' }),
        { status: 400 }
      );
    }

    const idea = await createIdea(supabase, user.id, body);
    return NextResponse.json(createSuccessResponse(idea), { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
