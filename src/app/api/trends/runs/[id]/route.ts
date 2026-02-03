import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getTrendRunWithItems, deleteTrendRun } from '@/tools/db/trends';

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
    const result = await getTrendRunWithItems(supabase, id);

    if (!result) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Trend run not found' }),
        { status: 404 }
      );
    }

    if (result.run.user_id !== user.id) {
      return NextResponse.json(
        createErrorResponse({ code: 'FORBIDDEN', message: 'Access denied' }),
        { status: 403 }
      );
    }

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    console.error('Error fetching trend run:', error);
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
    const result = await getTrendRunWithItems(supabase, id);

    if (!result) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Trend run not found' }),
        { status: 404 }
      );
    }

    if (result.run.user_id !== user.id) {
      return NextResponse.json(
        createErrorResponse({ code: 'FORBIDDEN', message: 'Access denied' }),
        { status: 403 }
      );
    }

    await deleteTrendRun(supabase, id);

    return NextResponse.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Error deleting trend run:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
