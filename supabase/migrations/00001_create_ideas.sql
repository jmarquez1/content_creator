-- Migration: Create ideas table
-- Description: Core table for storing content ideas with Kanban workflow

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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS ideas_user_id_idx ON ideas(user_id);
CREATE INDEX IF NOT EXISTS ideas_status_idx ON ideas(status);
CREATE INDEX IF NOT EXISTS ideas_user_status_idx ON ideas(user_id, status);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas(created_at DESC);

-- Trigger to update updated_at on row update
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
