import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getPlatformProfiles, createPlatformProfile } from '@/tools/db/platform-profiles';
import type { Platform } from '@/types/database';

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
    const platform = searchParams.get('platform') as Platform | null;

    const profiles = await getPlatformProfiles(supabase, user.id, platform ?? undefined);
    return NextResponse.json(createSuccessResponse(profiles));
  } catch (error) {
    console.error('Error fetching platform profiles:', error);
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

    if (
      !body.platform ||
      !body.name ||
      !body.structure ||
      !body.formatting_rules ||
      !body.length_constraints ||
      !body.required_output_fields
    ) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const profile = await createPlatformProfile(supabase, user.id, body);
    return NextResponse.json(createSuccessResponse(profile), { status: 201 });
  } catch (error) {
    console.error('Error creating platform profile:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
