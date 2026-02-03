-- Migration: Create content_sources table
-- Description: Store original content sources (YouTube videos, documents, etc.)

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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS content_sources_user_id_idx ON content_sources(user_id);
CREATE INDEX IF NOT EXISTS content_sources_source_type_idx ON content_sources(source_type);
CREATE INDEX IF NOT EXISTS content_sources_created_at_idx ON content_sources(created_at DESC);
