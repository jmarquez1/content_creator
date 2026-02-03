import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables, Json } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

export type ContentSource = Tables<'content_sources'>;

export interface CreateContentSourceInput {
  source_type: 'youtube' | 'document';
  url?: string;
  title?: string;
  transcript?: string;
  extracted_text?: string;
  original_file_path?: string;
  metadata?: Record<string, unknown>;
}

export async function getContentSources(
  supabase: DbClient,
  userId: string,
  sourceType?: string
): Promise<ContentSource[]> {
  let query = supabase
    .from('content_sources')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sourceType) {
    query = query.eq('source_type', sourceType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ContentSource[];
}

export async function getContentSourceById(
  supabase: DbClient,
  id: string
): Promise<ContentSource | null> {
  const { data, error } = await supabase.from('content_sources').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as ContentSource;
}

export async function createContentSource(
  supabase: DbClient,
  userId: string,
  input: CreateContentSourceInput
): Promise<ContentSource> {
  const { data, error } = await supabase
    .from('content_sources')
    .insert({
      user_id: userId,
      source_type: input.source_type,
      url: input.url ?? null,
      title: input.title ?? null,
      transcript: input.transcript ?? null,
      extracted_text: input.extracted_text ?? null,
      original_file_path: input.original_file_path ?? null,
      metadata: (input.metadata as unknown as Json) ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ContentSource;
}

export async function deleteContentSource(supabase: DbClient, id: string): Promise<void> {
  const { error } = await supabase.from('content_sources').delete().eq('id', id);

  if (error) throw error;
}
