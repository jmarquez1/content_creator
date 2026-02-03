import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables, TaskType } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

export type PromptTemplate = Tables<'prompt_templates'>;

export interface CreatePromptTemplateInput {
  task_type: TaskType;
  name: string;
  content: string;
}

export interface UpdatePromptTemplateInput {
  name?: string;
  content?: string;
}

export async function getPromptTemplates(
  supabase: DbClient,
  userId: string,
  taskType?: TaskType
): Promise<PromptTemplate[]> {
  let query = supabase
    .from('prompt_templates')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (taskType) {
    query = query.eq('task_type', taskType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as PromptTemplate[];
}

export async function getActivePromptTemplate(
  supabase: DbClient,
  userId: string,
  taskType: TaskType
): Promise<PromptTemplate> {
  // First try to get user's template for this task type
  const { data: userTemplate, error: userError } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('task_type', taskType)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (!userError && userTemplate) {
    return userTemplate as PromptTemplate;
  }

  // Fall back to system template
  const { data: systemTemplate, error: systemError } = await supabase
    .from('prompt_templates')
    .select('*')
    .is('user_id', null)
    .eq('task_type', taskType)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (systemError) throw systemError;
  return systemTemplate as PromptTemplate;
}

export async function getPromptTemplateById(
  supabase: DbClient,
  id: string
): Promise<PromptTemplate | null> {
  const { data, error } = await supabase.from('prompt_templates').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as PromptTemplate;
}

export async function createPromptTemplate(
  supabase: DbClient,
  userId: string,
  input: CreatePromptTemplateInput
): Promise<PromptTemplate> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .insert({
      user_id: userId,
      task_type: input.task_type,
      name: input.name,
      content: input.content,
      is_active: true,
      version: 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PromptTemplate;
}

export async function updatePromptTemplate(
  supabase: DbClient,
  id: string,
  userId: string,
  input: UpdatePromptTemplateInput
): Promise<PromptTemplate> {
  const current = await getPromptTemplateById(supabase, id);
  if (!current) throw new Error('Prompt template not found');

  // Create new version
  const { data, error } = await supabase
    .from('prompt_templates')
    .insert({
      user_id: userId,
      task_type: current.task_type,
      name: input.name ?? current.name,
      content: input.content ?? current.content,
      is_active: true,
      version: current.version + 1,
    })
    .select()
    .single();

  if (error) throw error;

  // Deactivate old version
  await supabase.from('prompt_templates').update({ is_active: false }).eq('id', id);

  return data as PromptTemplate;
}

export async function deletePromptTemplate(supabase: DbClient, id: string): Promise<void> {
  const { error } = await supabase.from('prompt_templates').update({ is_active: false }).eq('id', id);

  if (error) throw error;
}
