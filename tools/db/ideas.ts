import type { SupabaseClient } from '@supabase/supabase-js';
import type { IdeaStatus, Json, Tables } from '@/types/database';
import type { CreateIdeaInput, UpdateIdeaInput } from '@/types/ideas';

// Using any for the Supabase client as the complex generic typing causes issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

export type Idea = Tables<'ideas'>;

export async function getIdeas(
  supabase: DbClient,
  userId: string,
  status?: IdeaStatus
): Promise<Idea[]> {
  let query = supabase
    .from('ideas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Idea[];
}

export async function getIdeaById(supabase: DbClient, ideaId: string): Promise<Idea | null> {
  const { data, error } = await supabase.from('ideas').select('*').eq('id', ideaId).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Idea;
}

export async function createIdea(
  supabase: DbClient,
  userId: string,
  input: CreateIdeaInput
): Promise<Idea> {
  const { data, error } = await supabase
    .from('ideas')
    .insert({
      user_id: userId,
      title: input.title,
      hook: input.hook ?? null,
      outline: (input.outline as unknown as Json) ?? null,
      suggested_cta: input.suggested_cta ?? null,
      tags: input.tags ?? null,
      source_type: input.source_type ?? null,
      source_reference_id: input.source_reference_id ?? null,
      status: 'inbox',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Idea;
}

export async function updateIdea(
  supabase: DbClient,
  ideaId: string,
  input: UpdateIdeaInput
): Promise<Idea> {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.hook !== undefined) updateData.hook = input.hook;
  if (input.outline !== undefined) updateData.outline = input.outline;
  if (input.suggested_cta !== undefined) updateData.suggested_cta = input.suggested_cta;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.tags !== undefined) updateData.tags = input.tags;

  const { data, error } = await supabase
    .from('ideas')
    .update(updateData)
    .eq('id', ideaId)
    .select()
    .single();

  if (error) throw error;
  return data as Idea;
}

export async function updateIdeaStatus(
  supabase: DbClient,
  ideaId: string,
  status: IdeaStatus
): Promise<Idea> {
  const { data, error } = await supabase
    .from('ideas')
    .update({ status })
    .eq('id', ideaId)
    .select()
    .single();

  if (error) throw error;
  return data as Idea;
}

export async function deleteIdea(supabase: DbClient, ideaId: string): Promise<void> {
  const { error } = await supabase.from('ideas').delete().eq('id', ideaId);

  if (error) throw error;
}

export async function archiveIdea(supabase: DbClient, ideaId: string): Promise<Idea> {
  return updateIdeaStatus(supabase, ideaId, 'archived');
}
