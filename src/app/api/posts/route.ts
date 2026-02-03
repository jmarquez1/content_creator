import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { createPost, getPosts, getPostsByStatus } from '@/tools/db/posts';
import type { CreatePostInput, PostStatus } from '@/types/posts';

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
    const groupByStatus = searchParams.get('grouped') === 'true';
    const status = searchParams.get('status') as PostStatus | null;
    const platform = searchParams.get('platform');
    const ideaId = searchParams.get('idea_id');

    if (groupByStatus) {
      const groupedPosts = await getPostsByStatus(supabase, user.id);
      return NextResponse.json(createSuccessResponse({ posts: groupedPosts }));
    }

    const posts = await getPosts(supabase, user.id, {
      status: status || undefined,
      platform: platform || undefined,
      idea_id: ideaId || undefined,
    });

    return NextResponse.json(createSuccessResponse({ posts }));
  } catch (error) {
    console.error('Error fetching posts:', error);
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

    const body: CreatePostInput = await request.json();

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

    if (!body.content) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'content is required' }),
        { status: 400 }
      );
    }

    const post = await createPost(supabase, user.id, body);

    return NextResponse.json(createSuccessResponse({ post }), { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
