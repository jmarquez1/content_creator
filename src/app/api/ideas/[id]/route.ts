import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getIdeaById, updateIdea, deleteIdea } from '@/tools/db/ideas';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const idea = await getIdeaById(supabase, id);

    if (!idea) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Idea not found' }),
        { status: 404 }
      );
    }

    if (idea.user_id !== user.id) {
      return NextResponse.json(
        createErrorResponse({ code: 'FORBIDDEN', message: 'Access denied' }),
        { status: 403 }
      );
    }

    return NextResponse.json(createSuccessResponse(idea));
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const existingIdea = await getIdeaById(supabase, id);

    if (!existingIdea) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Idea not found' }),
        { status: 404 }
      );
    }

    if (existingIdea.user_id !== user.id) {
      return NextResponse.json(
        createErrorResponse({ code: 'FORBIDDEN', message: 'Access denied' }),
        { status: 403 }
      );
    }

    const body = await request.json();
    const idea = await updateIdea(supabase, id, body);

    return NextResponse.json(createSuccessResponse(idea));
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const existingIdea = await getIdeaById(supabase, id);

    if (!existingIdea) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Idea not found' }),
        { status: 404 }
      );
    }

    if (existingIdea.user_id !== user.id) {
      return NextResponse.json(
        createErrorResponse({ code: 'FORBIDDEN', message: 'Access denied' }),
        { status: 403 }
      );
    }

    await deleteIdea(supabase, id);

    return NextResponse.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
