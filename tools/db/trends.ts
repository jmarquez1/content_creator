import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables, TrendSource, Json } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

export type TrendRun = Tables<'trend_runs'>;
export type TrendItem = Tables<'trend_items'>;

export interface CreateTrendRunInput {
  topic: string;
  sources: TrendSource[];
}

export interface CreateTrendItemInput {
  trend_run_id: string;
  source: TrendSource;
  title: string;
  url?: string;
  engagement_score?: number;
  recency_score?: number;
  combined_rank?: number;
  raw_data?: object;
}

export async function getTrendRuns(supabase: DbClient, userId: string): Promise<TrendRun[]> {
  const { data, error } = await supabase
    .from('trend_runs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as TrendRun[];
}

export async function getTrendRunById(
  supabase: DbClient,
  id: string
): Promise<TrendRun | null> {
  const { data, error } = await supabase.from('trend_runs').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as TrendRun;
}

export async function getTrendRunWithItems(
  supabase: DbClient,
  id: string
): Promise<{ run: TrendRun; items: TrendItem[] } | null> {
  const run = await getTrendRunById(supabase, id);
  if (!run) return null;

  const { data: items, error } = await supabase
    .from('trend_items')
    .select('*')
    .eq('trend_run_id', id)
    .order('combined_rank', { ascending: true });

  if (error) throw error;

  return { run, items: items as TrendItem[] };
}

export async function createTrendRun(
  supabase: DbClient,
  userId: string,
  input: CreateTrendRunInput
): Promise<TrendRun> {
  const { data, error } = await supabase
    .from('trend_runs')
    .insert({
      user_id: userId,
      topic: input.topic,
      sources: input.sources,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrendRun;
}

export async function updateTrendRunStatus(
  supabase: DbClient,
  id: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  completedAt?: string
): Promise<TrendRun> {
  const update: { status: string; completed_at?: string } = { status };
  if (completedAt) {
    update.completed_at = completedAt;
  }

  const { data, error } = await supabase
    .from('trend_runs')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TrendRun;
}

export async function createTrendItem(
  supabase: DbClient,
  input: CreateTrendItemInput
): Promise<TrendItem> {
  const { data, error } = await supabase
    .from('trend_items')
    .insert({
      trend_run_id: input.trend_run_id,
      source: input.source,
      title: input.title,
      url: input.url ?? null,
      engagement_score: input.engagement_score ?? null,
      recency_score: input.recency_score ?? null,
      combined_rank: input.combined_rank ?? null,
      raw_data: (input.raw_data as unknown as Json) ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrendItem;
}

export async function createTrendItems(
  supabase: DbClient,
  items: CreateTrendItemInput[]
): Promise<TrendItem[]> {
  if (items.length === 0) return [];

  const { data, error } = await supabase
    .from('trend_items')
    .insert(
      items.map((item) => ({
        trend_run_id: item.trend_run_id,
        source: item.source,
        title: item.title,
        url: item.url ?? null,
        engagement_score: item.engagement_score ?? null,
        recency_score: item.recency_score ?? null,
        combined_rank: item.combined_rank ?? null,
        raw_data: (item.raw_data as unknown as Json) ?? null,
      }))
    )
    .select();

  if (error) throw error;
  return data as TrendItem[];
}

export async function deleteTrendRun(supabase: DbClient, id: string): Promise<void> {
  const { error } = await supabase.from('trend_runs').delete().eq('id', id);

  if (error) throw error;
}
