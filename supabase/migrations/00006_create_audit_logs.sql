-- Migration: Create audit_logs table
-- Description: Complete audit trail for all AI generations

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

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Add foreign key reference from posts.audit_log_id
ALTER TABLE posts
  ADD CONSTRAINT posts_audit_log_id_fkey
  FOREIGN KEY (audit_log_id)
  REFERENCES audit_logs(id)
  ON DELETE SET NULL;
