-- Migration: Enable RLS on all tables
-- Description: Row Level Security policies for user data isolation

-- Enable RLS on all tables
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Ideas: Users can only access their own ideas
CREATE POLICY "Users can view own ideas"
  ON ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas"
  ON ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON ideas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas"
  ON ideas FOR DELETE
  USING (auth.uid() = user_id);

-- Posts: Users can only access their own posts
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Content Sources: Users can only access their own content sources
CREATE POLICY "Users can view own content sources"
  ON content_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content sources"
  ON content_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content sources"
  ON content_sources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content sources"
  ON content_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Trend Runs: Users can only access their own trend runs
CREATE POLICY "Users can view own trend runs"
  ON trend_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trend runs"
  ON trend_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trend runs"
  ON trend_runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trend runs"
  ON trend_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Trend Items: Users can access items from their own trend runs
CREATE POLICY "Users can view trend items from own runs"
  ON trend_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trend_runs
      WHERE trend_runs.id = trend_items.trend_run_id
      AND trend_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert trend items to own runs"
  ON trend_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trend_runs
      WHERE trend_runs.id = trend_items.trend_run_id
      AND trend_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete trend items from own runs"
  ON trend_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trend_runs
      WHERE trend_runs.id = trend_items.trend_run_id
      AND trend_runs.user_id = auth.uid()
    )
  );

-- Prompt Templates: Users can see own + system defaults (user_id IS NULL)
CREATE POLICY "Users can view own and default templates"
  ON prompt_templates FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own templates"
  ON prompt_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON prompt_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON prompt_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Voice Profiles: Users can see own + system defaults (user_id IS NULL)
CREATE POLICY "Users can view own and default voice profiles"
  ON voice_profiles FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own voice profiles"
  ON voice_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice profiles"
  ON voice_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice profiles"
  ON voice_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Platform Profiles: Users can see own + system defaults (user_id IS NULL)
CREATE POLICY "Users can view own and default platform profiles"
  ON platform_profiles FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own platform profiles"
  ON platform_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platform profiles"
  ON platform_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own platform profiles"
  ON platform_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Audit Logs: Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
