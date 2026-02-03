-- =====================================================
-- CONTENT CREATION APP - COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- https://jsvfeyrxoyvvjhwobtkg.supabase.co
-- =====================================================

-- =====================================================
-- 1. CREATE IDEAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  hook TEXT,
  outline JSONB,
  suggested_cta TEXT,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'developing', 'ready', 'archived')),
  tags TEXT[],
  source_type TEXT CHECK (source_type IN ('youtube', 'topic', 'document', 'plain')),
  source_reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS ideas_user_id_idx ON ideas(user_id);
CREATE INDEX IF NOT EXISTS ideas_status_idx ON ideas(status);
CREATE INDEX IF NOT EXISTS ideas_user_status_idx ON ideas(user_id, status);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CREATE POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'facebook')),
  content JSONB NOT NULL,
  variants JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  audit_log_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_idea_id_idx ON posts(idea_id);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_platform_idx ON posts(platform);
CREATE INDEX IF NOT EXISTS posts_user_status_idx ON posts(user_id, status);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CREATE CONTENT SOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'document')),
  url TEXT,
  title TEXT,
  transcript TEXT,
  extracted_text TEXT,
  original_file_path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS content_sources_user_id_idx ON content_sources(user_id);
CREATE INDEX IF NOT EXISTS content_sources_source_type_idx ON content_sources(source_type);
CREATE INDEX IF NOT EXISTS content_sources_created_at_idx ON content_sources(created_at DESC);

-- =====================================================
-- 4. CREATE TRENDS TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS trend_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS trend_runs_user_id_idx ON trend_runs(user_id);
CREATE INDEX IF NOT EXISTS trend_runs_status_idx ON trend_runs(status);
CREATE INDEX IF NOT EXISTS trend_runs_created_at_idx ON trend_runs(created_at DESC);

CREATE TABLE IF NOT EXISTS trend_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_run_id UUID REFERENCES trend_runs(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('reddit', 'youtube')),
  title TEXT NOT NULL,
  url TEXT,
  engagement_score INTEGER,
  recency_score INTEGER,
  combined_rank INTEGER,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS trend_items_trend_run_id_idx ON trend_items(trend_run_id);
CREATE INDEX IF NOT EXISTS trend_items_source_idx ON trend_items(source);
CREATE INDEX IF NOT EXISTS trend_items_combined_rank_idx ON trend_items(combined_rank);

-- =====================================================
-- 5. CREATE PROMPT SYSTEM TABLES
-- =====================================================
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

CREATE INDEX IF NOT EXISTS prompt_templates_user_id_idx ON prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS prompt_templates_task_type_idx ON prompt_templates(task_type);
CREATE INDEX IF NOT EXISTS prompt_templates_active_idx ON prompt_templates(is_active) WHERE is_active = true;

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

CREATE INDEX IF NOT EXISTS voice_profiles_user_id_idx ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS voice_profiles_default_idx ON voice_profiles(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS voice_profiles_active_idx ON voice_profiles(is_active) WHERE is_active = true;

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

CREATE INDEX IF NOT EXISTS platform_profiles_user_id_idx ON platform_profiles(user_id);
CREATE INDEX IF NOT EXISTS platform_profiles_platform_idx ON platform_profiles(platform);
CREATE INDEX IF NOT EXISTS platform_profiles_default_idx ON platform_profiles(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS platform_profiles_active_idx ON platform_profiles(is_active) WHERE is_active = true;

-- =====================================================
-- 6. CREATE AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('generate_idea', 'generate_post', 'generate_variants', 'rewrite', 'repurpose')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('idea', 'post')),
  entity_id UUID NOT NULL,
  prompt_snapshot JSONB NOT NULL,
  model_used TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  response_snapshot JSONB,
  template_versions JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

ALTER TABLE posts
  ADD CONSTRAINT posts_audit_log_id_fkey
  FOREIGN KEY (audit_log_id)
  REFERENCES audit_logs(id)
  ON DELETE SET NULL;

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Ideas policies
CREATE POLICY "Users can view own ideas" ON ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON ideas FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Content Sources policies
CREATE POLICY "Users can view own content sources" ON content_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own content sources" ON content_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content sources" ON content_sources FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own content sources" ON content_sources FOR DELETE USING (auth.uid() = user_id);

-- Trend Runs policies
CREATE POLICY "Users can view own trend runs" ON trend_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trend runs" ON trend_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trend runs" ON trend_runs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own trend runs" ON trend_runs FOR DELETE USING (auth.uid() = user_id);

-- Trend Items policies
CREATE POLICY "Users can view trend items from own runs" ON trend_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM trend_runs WHERE trend_runs.id = trend_items.trend_run_id AND trend_runs.user_id = auth.uid()));
CREATE POLICY "Users can insert trend items to own runs" ON trend_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trend_runs WHERE trend_runs.id = trend_items.trend_run_id AND trend_runs.user_id = auth.uid()));
CREATE POLICY "Users can delete trend items from own runs" ON trend_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM trend_runs WHERE trend_runs.id = trend_items.trend_run_id AND trend_runs.user_id = auth.uid()));

-- Prompt Templates policies (users see own + system defaults)
CREATE POLICY "Users can view own and default templates" ON prompt_templates FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own templates" ON prompt_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON prompt_templates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON prompt_templates FOR DELETE USING (auth.uid() = user_id);

-- Voice Profiles policies (users see own + system defaults)
CREATE POLICY "Users can view own and default voice profiles" ON voice_profiles FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own voice profiles" ON voice_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voice profiles" ON voice_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own voice profiles" ON voice_profiles FOR DELETE USING (auth.uid() = user_id);

-- Platform Profiles policies (users see own + system defaults)
CREATE POLICY "Users can view own and default platform profiles" ON platform_profiles FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own platform profiles" ON platform_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own platform profiles" ON platform_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own platform profiles" ON platform_profiles FOR DELETE USING (auth.uid() = user_id);

-- Audit Logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. SEED DATA - Default Profiles
-- =====================================================

-- Default Voice Profile: Calm Operator
INSERT INTO voice_profiles (user_id, name, persona, tone_rules, readability_rules, forbidden_language, version, is_default, is_active)
VALUES (
  NULL,
  'Calm Operator',
  'A calm decision partner who helps others think through problems. Not a guru. Not a coach. Just someone who''s seen enough to know what actually works.',
  ARRAY['Humble and grounded — never claim expertise you don''t have', 'Anti-hype — if it sounds like marketing, rewrite it', 'Practical and systems-first — focus on what can be implemented', 'No guru tone — never position yourself as having all the answers', 'No promises or guarantees — speak in observations and patterns'],
  ARRAY['5th-grade reading level maximum', 'Short sentences — aim for 10-15 words', 'One idea per sentence', 'No abstract jargon — if a 10-year-old wouldn''t understand it, simplify', 'If it reads like LinkedIn thought-leadership, rewrite it simpler'],
  ARRAY['game-changer', 'unlock', 'level up', 'crushing it', 'hustle', 'grind', 'mindset shift', 'powerful', 'secret', 'hack', 'leverage', 'scale', 'optimize', 'synergy', 'disrupt'],
  1, true, true
);

-- Default LinkedIn Platform Profile
INSERT INTO platform_profiles (user_id, platform, name, structure, formatting_rules, length_constraints, required_output_fields, version, is_default, is_active)
VALUES (
  NULL, 'linkedin', 'LinkedIn Default',
  '{"sections": [{"name": "hook", "description": "1-2 lines. Blunt. Names a familiar pain or contradiction.", "required": true}, {"name": "context", "description": "2-4 lines. Real scenario. No hero story. Grounded in experience.", "required": true}, {"name": "shift", "description": "Reframe the problem. The insight that changes how you see it.", "required": true}, {"name": "practical_tool", "description": "Bullets or short numbered list. Concrete, actionable steps.", "required": true}, {"name": "close_cta", "description": "Calm close. No pitch. Optional soft question.", "required": true}]}'::jsonb,
  ARRAY['Use line breaks liberally — dense paragraphs kill engagement', 'Bullets should be 1 line each', 'No emojis in body text', 'One emoji max in hook (optional)', 'No hashtags in body — add 3-5 at very end if needed'],
  '{"target_min": 1800, "target_max": 2400, "hard_max": 2500, "unit": "characters"}'::jsonb,
  ARRAY['post_title', 'post_text', 'meta_title', 'meta_description', 'excerpt'],
  1, true, true
);

-- Default Instagram Platform Profile
INSERT INTO platform_profiles (user_id, platform, name, structure, formatting_rules, length_constraints, required_output_fields, version, is_default, is_active)
VALUES (
  NULL, 'instagram', 'Instagram Default',
  '{"sections": [{"name": "hook", "description": "First line must stop the scroll. Bold claim or relatable pain.", "required": true}, {"name": "body", "description": "Value-packed content. Can use lists or short paragraphs.", "required": true}, {"name": "cta", "description": "Clear call to action. Save, share, comment, or link in bio.", "required": true}]}'::jsonb,
  ARRAY['Line breaks after every 1-2 sentences', 'Emojis allowed sparingly for visual breaks', 'Hashtags at end — 5-15 relevant tags', 'Can reference ''link in bio'' for longer content'],
  '{"target_min": 500, "target_max": 2000, "hard_max": 2200, "unit": "characters"}'::jsonb,
  ARRAY['caption_text', 'hashtags', 'alt_text'],
  1, true, true
);

-- Default Facebook Platform Profile
INSERT INTO platform_profiles (user_id, platform, name, structure, formatting_rules, length_constraints, required_output_fields, version, is_default, is_active)
VALUES (
  NULL, 'facebook', 'Facebook Page Default',
  '{"sections": [{"name": "hook", "description": "Attention-grabbing opener. Question or bold statement.", "required": true}, {"name": "body", "description": "Conversational tone. Can be longer form. Story-friendly.", "required": true}, {"name": "cta", "description": "Engagement prompt. Comment, share, or click.", "required": true}]}'::jsonb,
  ARRAY['Conversational and warm tone', 'Paragraphs of 2-3 sentences', 'Emojis allowed but not required', 'Links can be inline (not just ''link in bio'')', 'No hashtag stuffing — 0-3 max'],
  '{"target_min": 300, "target_max": 1500, "hard_max": 5000, "unit": "characters"}'::jsonb,
  ARRAY['post_text', 'link_preview_text'],
  1, true, true
);

-- Default Ideation Prompt Template
INSERT INTO prompt_templates (user_id, task_type, name, content, version, is_active)
VALUES (
  NULL, 'ideation', 'Default Ideation',
  'You are a content strategist helping generate content ideas.

Your task is to analyze the provided input and generate a compelling content idea.

For each idea, you must provide:
1. A clear, engaging title
2. A hook that captures attention in the first line
3. An outline with 3-5 key points to cover
4. A suggested call-to-action

Focus on ideas that:
- Address real problems or questions your audience has
- Provide actionable value
- Are specific enough to be useful, general enough to be relevant
- Can be adapted across multiple platforms

Return your response as a JSON object with the following structure:
{
  "title": "string",
  "hook": "string",
  "outline": ["string", "string", ...],
  "suggested_cta": "string",
  "tags": ["string", "string", ...]
}',
  1, true
);

-- Default Trend Ideation Prompt Template
INSERT INTO prompt_templates (user_id, task_type, name, content, version, is_active)
VALUES (
  NULL, 'trend_ideation', 'Default Trend Ideation',
  'You are a content strategist helping generate trend-informed content ideas.

Your task is to analyze the provided trends and user input to generate a relevant, timely content idea.

Consider:
- What conversations are people already having?
- What angles haven''t been covered yet?
- How can you add unique value to this topic?

For each idea, you must provide:
1. A clear, engaging title that relates to current trends
2. A hook that captures attention and references the trend
3. An outline with 3-5 key points to cover
4. A suggested call-to-action
5. Relevant tags including trend-related keywords

Return your response as a JSON object with the following structure:
{
  "title": "string",
  "hook": "string",
  "outline": ["string", "string", ...],
  "suggested_cta": "string",
  "tags": ["string", "string", ...]
}',
  1, true
);

-- Default Drafting Prompt Template
INSERT INTO prompt_templates (user_id, task_type, name, content, version, is_active)
VALUES (
  NULL, 'drafting', 'Default Drafting',
  'You are a content writer creating platform-specific social media content.

Your task is to transform the provided idea into a ready-to-publish post.

Follow the platform profile structure exactly. Each section is required unless marked optional.

Ensure your content:
- Matches the voice profile tone and style
- Stays within length constraints
- Includes all required output fields
- Follows all formatting rules

Return your response as a JSON object containing all required output fields for the platform.',
  1, true
);

-- =====================================================
-- DONE! Your database is now set up.
-- =====================================================
