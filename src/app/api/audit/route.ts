import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { getAuditLogs } from '@/tools/db/audit-logs';
import type { AuditAction } from '@/types/database';

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
    const action = searchParams.get('action') as AuditAction | null;
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const logs = await getAuditLogs(supabase, user.id, {
      action: action || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      limit,
    });

    return NextResponse.json(createSuccessResponse({ logs }));
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
