import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditAction, Json, Tables } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

export type AuditLog = Tables<'audit_logs'>;

export interface CreateAuditLogInput {
  action: AuditAction;
  entityType: 'idea' | 'post';
  entityId: string;
  promptSnapshot: {
    task_template?: { id: string; version: number; content: string };
    voice_profile?: { id: string; version: number; content: object };
    platform_profile?: { id: string; version: number; content: object };
    user_input?: object;
    trend_summary?: string | null;
    composed_prompt: string;
    idea?: { id: string; title: string; hook: string | null; outline: unknown };
    // Variant generation fields
    original_post?: { id: string; content: string; platform: string };
    variation_type?: string;
    variation_instruction?: string;
  };
  modelUsed: string;
  inputTokens?: number;
  outputTokens?: number;
  responseSnapshot?: object;
  templateVersions?: {
    task_template_version?: number;
    voice_profile_version?: number;
    platform_profile_version?: number;
  };
}

export async function createAuditLog(
  supabase: DbClient,
  userId: string,
  input: CreateAuditLogInput
): Promise<AuditLog> {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      prompt_snapshot: input.promptSnapshot as unknown as Json,
      model_used: input.modelUsed,
      input_tokens: input.inputTokens ?? null,
      output_tokens: input.outputTokens ?? null,
      response_snapshot: (input.responseSnapshot as unknown as Json) ?? null,
      template_versions: (input.templateVersions as unknown as Json) ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AuditLog;
}

export async function getAuditLogs(
  supabase: DbClient,
  userId: string,
  options?: {
    entityType?: string;
    entityId?: string;
    action?: AuditAction;
    limit?: number;
    offset?: number;
  }
): Promise<AuditLog[]> {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.entityType) {
    query = query.eq('entity_type', options.entityType);
  }
  if (options?.entityId) {
    query = query.eq('entity_id', options.entityId);
  }
  if (options?.action) {
    query = query.eq('action', options.action);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as AuditLog[];
}

export async function getAuditLogById(supabase: DbClient, id: string): Promise<AuditLog | null> {
  const { data, error } = await supabase.from('audit_logs').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as AuditLog;
}
