import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getVoiceProfiles, createVoiceProfile } from '@/tools/db/voice-profiles';

export async function GET() {
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

    const profiles = await getVoiceProfiles(supabase, user.id);
    return NextResponse.json(createSuccessResponse(profiles));
  } catch (error) {
    console.error('Error fetching voice profiles:', error);
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

    if (!body.name || !body.persona || !body.tone_rules || !body.readability_rules) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const profile = await createVoiceProfile(supabase, user.id, body);
    return NextResponse.json(createSuccessResponse(profile), { status: 201 });
  } catch (error) {
    console.error('Error creating voice profile:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
