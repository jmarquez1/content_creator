import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables, Platform, Json } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

export type PlatformProfile = Tables<'platform_profiles'>;

export interface CreatePlatformProfileInput {
  platform: Platform;
  name: string;
  structure: Record<string, unknown>;
  formatting_rules: string[];
  length_constraints: Record<string, unknown>;
  required_output_fields: string[];
  is_default?: boolean;
}

export interface UpdatePlatformProfileInput {
  name?: string;
  structure?: Record<string, unknown>;
  formatting_rules?: string[];
  length_constraints?: Record<string, unknown>;
  required_output_fields?: string[];
  is_default?: boolean;
}

export async function getPlatformProfiles(
  supabase: DbClient,
  userId: string,
  platform?: Platform
): Promise<PlatformProfile[]> {
  let query = supabase
    .from('platform_profiles')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as PlatformProfile[];
}

export async function getActivePlatformProfile(
  supabase: DbClient,
  userId: string,
  platform: Platform
): Promise<PlatformProfile> {
  // First try to get user's default for this platform
  const { data: userDefault, error: userError } = await supabase
    .from('platform_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  if (!userError && userDefault) {
    return userDefault as PlatformProfile;
  }

  // Fall back to system default for this platform
  const { data: systemDefault, error: systemError } = await supabase
    .from('platform_profiles')
    .select('*')
    .is('user_id', null)
    .eq('platform', platform)
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  if (systemError) throw systemError;
  return systemDefault as PlatformProfile;
}

export async function getPlatformProfileById(
  supabase: DbClient,
  id: string
): Promise<PlatformProfile | null> {
  const { data, error } = await supabase.from('platform_profiles').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as PlatformProfile;
}

export async function createPlatformProfile(
  supabase: DbClient,
  userId: string,
  input: CreatePlatformProfileInput
): Promise<PlatformProfile> {
  // If setting as default, unset other defaults for this user/platform
  if (input.is_default) {
    await supabase
      .from('platform_profiles')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('platform', input.platform);
  }

  const { data, error } = await supabase
    .from('platform_profiles')
    .insert({
      user_id: userId,
      platform: input.platform,
      name: input.name,
      structure: input.structure as unknown as Json,
      formatting_rules: input.formatting_rules,
      length_constraints: input.length_constraints as unknown as Json,
      required_output_fields: input.required_output_fields,
      is_default: input.is_default ?? false,
      is_active: true,
      version: 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PlatformProfile;
}

export async function updatePlatformProfile(
  supabase: DbClient,
  id: string,
  userId: string,
  input: UpdatePlatformProfileInput
): Promise<PlatformProfile> {
  const current = await getPlatformProfileById(supabase, id);
  if (!current) throw new Error('Platform profile not found');

  // If setting as default, unset other defaults for this user/platform
  if (input.is_default) {
    await supabase
      .from('platform_profiles')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('platform', current.platform);
  }

  // Create new version
  const { data, error } = await supabase
    .from('platform_profiles')
    .insert({
      user_id: userId,
      platform: current.platform,
      name: input.name ?? current.name,
      structure: (input.structure as unknown as Json) ?? current.structure,
      formatting_rules: input.formatting_rules ?? current.formatting_rules,
      length_constraints: (input.length_constraints as unknown as Json) ?? current.length_constraints,
      required_output_fields: input.required_output_fields ?? current.required_output_fields,
      is_default: input.is_default ?? current.is_default,
      is_active: true,
      version: current.version + 1,
    })
    .select()
    .single();

  if (error) throw error;

  // Deactivate old version
  await supabase.from('platform_profiles').update({ is_active: false }).eq('id', id);

  return data as PlatformProfile;
}

export async function deletePlatformProfile(supabase: DbClient, id: string): Promise<void> {
  const { error } = await supabase.from('platform_profiles').update({ is_active: false }).eq('id', id);

  if (error) throw error;
}
