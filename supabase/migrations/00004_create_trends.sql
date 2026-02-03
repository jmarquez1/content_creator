-- Migration: Create trend_runs and trend_items tables
-- Description: Store trend research runs and their results

-- Trend runs - represents a single research session
CREATE TABLE IF NOT EXISTS trend_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for trend_runs
CREATE INDEX IF NOT EXISTS trend_runs_user_id_idx ON trend_runs(user_id);
CREATE INDEX IF NOT EXISTS trend_runs_status_idx ON trend_runs(status);
CREATE INDEX IF NOT EXISTS trend_runs_created_at_idx ON trend_runs(created_at DESC);

-- Trend items - individual trends found during a run
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

-- Indexes for trend_items
CREATE INDEX IF NOT EXISTS trend_items_trend_run_id_idx ON trend_items(trend_run_id);
CREATE INDEX IF NOT EXISTS trend_items_source_idx ON trend_items(source);
CREATE INDEX IF NOT EXISTS trend_items_combined_rank_idx ON trend_items(combined_rank);
