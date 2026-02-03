import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = SupabaseClient<any>;

export type VoiceProfile = Tables<'voice_profiles'>;

export interface CreateVoiceProfileInput {
  name: string;
  persona: string;
  tone_rules: string[];
  readability_rules: string[];
  forbidden_language?: string[];
  is_default?: boolean;
}

export interface UpdateVoiceProfileInput {
  name?: string;
  persona?: string;
  tone_rules?: string[];
  readability_rules?: string[];
  forbidden_language?: string[];
  is_default?: boolean;
}

export async function getVoiceProfiles(
  supabase: DbClient,
  userId: string
): Promise<VoiceProfile[]> {
  const { data, error } = await supabase
    .from('voice_profiles')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as VoiceProfile[];
}

export async function getActiveVoiceProfile(
  supabase: DbClient,
  userId: string
): Promise<VoiceProfile> {
  // First try to get user's default
  const { data: userDefault, error: userError } = await supabase
    .from('voice_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  if (!userError && userDefault) {
    return userDefault as VoiceProfile;
  }

  // Fall back to system default
  const { data: systemDefault, error: systemError } = await supabase
    .from('voice_profiles')
    .select('*')
    .is('user_id', null)
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  if (systemError) throw systemError;
  return systemDefault as VoiceProfile;
}

export async function getVoiceProfileById(
  supabase: DbClient,
  id: string
): Promise<VoiceProfile | null> {
  const { data, error } = await supabase.from('voice_profiles').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as VoiceProfile;
}

export async function getVoiceProfile(
  supabase: DbClient,
  userId: string,
  id: string
): Promise<VoiceProfile | null> {
  const { data, error } = await supabase
    .from('voice_profiles')
    .select('*')
    .eq('id', id)
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as VoiceProfile;
}

export async function createVoiceProfile(
  supabase: DbClient,
  userId: string,
  input: CreateVoiceProfileInput
): Promise<VoiceProfile> {
  // If setting as default, unset other defaults for this user
  if (input.is_default) {
    await supabase
      .from('voice_profiles')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('voice_profiles')
    .insert({
      user_id: userId,
      name: input.name,
      persona: input.persona,
      tone_rules: input.tone_rules,
      readability_rules: input.readability_rules,
      forbidden_language: input.forbidden_language ?? null,
      is_default: input.is_default ?? false,
      is_active: true,
      version: 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data as VoiceProfile;
}

export async function updateVoiceProfile(
  supabase: DbClient,
  id: string,
  userId: string,
  input: UpdateVoiceProfileInput
): Promise<VoiceProfile> {
  // Get current version
  const current = await getVoiceProfileById(supabase, id);
  if (!current) throw new Error('Voice profile not found');

  // If setting as default, unset other defaults for this user
  if (input.is_default) {
    await supabase
      .from('voice_profiles')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  // Create new version (versioning by creating new record and deactivating old)
  const { data, error } = await supabase
    .from('voice_profiles')
    .insert({
      user_id: userId,
      name: input.name ?? current.name,
      persona: input.persona ?? current.persona,
      tone_rules: input.tone_rules ?? current.tone_rules,
      readability_rules: input.readability_rules ?? current.readability_rules,
      forbidden_language: input.forbidden_language ?? current.forbidden_language,
      is_default: input.is_default ?? current.is_default,
      is_active: true,
      version: current.version + 1,
    })
    .select()
    .single();

  if (error) throw error;

  // Deactivate old version
  await supabase.from('voice_profiles').update({ is_active: false }).eq('id', id);

  return data as VoiceProfile;
}

export async function deleteVoiceProfile(supabase: DbClient, id: string): Promise<void> {
  const { error } = await supabase.from('voice_profiles').update({ is_active: false }).eq('id', id);

  if (error) throw error;
}
