import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getPost, updatePost, deletePost, getPostVariants } from '@/tools/db/posts';
import type { UpdatePostInput } from '@/types/posts';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const includeVariants = searchParams.get('variants') === 'true';

    const post = await getPost(supabase, user.id, id);

    if (!post) {
      return NextResponse.json(
        createErrorResponse({ code: 'NOT_FOUND', message: 'Post not found' }),
        { status: 404 }
      );
    }

    let variants = null;
    if (includeVariants) {
      variants = await getPostVariants(supabase, user.id, id);
    }

    return NextResponse.json(createSuccessResponse({ post, variants }));
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const body: UpdatePostInput = await request.json();

    const post = await updatePost(supabase, user.id, id, body);

    return NextResponse.json(createSuccessResponse({ post }));
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    await deletePost(supabase, user.id, id);

    return NextResponse.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
