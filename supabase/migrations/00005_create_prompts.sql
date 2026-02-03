-- Migration: Create prompt_templates, voice_profiles, and platform_profiles tables
-- Description: Versioned prompt composition blocks

-- Prompt templates - define task-specific instructions
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('ideation', 'trend_ideation', 'drafting', 'rewriting', 'repurposing')),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for prompt_templates
CREATE INDEX IF NOT EXISTS prompt_templates_user_id_idx ON prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS prompt_templates_task_type_idx ON prompt_templates(task_type);
CREATE INDEX IF NOT EXISTS prompt_templates_active_idx ON prompt_templates(is_active) WHERE is_active = true;

-- Voice profiles - persona and tone settings
CREATE TABLE IF NOT EXISTS voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  persona TEXT NOT NULL,
  tone_rules TEXT[] NOT NULL,
  readability_rules TEXT[] NOT NULL,
  forbidden_language TEXT[],
  version INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for voice_profiles
CREATE INDEX IF NOT EXISTS voice_profiles_user_id_idx ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS voice_profiles_default_idx ON voice_profiles(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS voice_profiles_active_idx ON voice_profiles(is_active) WHERE is_active = true;

-- Platform profiles - platform-specific formatting and constraints
CREATE TABLE IF NOT EXISTS platform_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'facebook')),
  name TEXT NOT NULL,
  structure JSONB NOT NULL,
  formatting_rules TEXT[] NOT NULL,
  length_constraints JSONB NOT NULL,
  required_output_fields TEXT[] NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for platform_profiles
CREATE INDEX IF NOT EXISTS platform_profiles_user_id_idx ON platform_profiles(user_id);
CREATE INDEX IF NOT EXISTS platform_profiles_platform_idx ON platform_profiles(platform);
CREATE INDEX IF NOT EXISTS platform_profiles_default_idx ON platform_profiles(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS platform_profiles_active_idx ON platform_profiles(is_active) WHERE is_active = true;
