-- Seed data for Content Creator app
-- Note: user_id is NULL for system defaults (visible to all users via RLS)

-- Default Voice Profile: Calm Operator
INSERT INTO voice_profiles (
  user_id,
  name,
  persona,
  tone_rules,
  readability_rules,
  forbidden_language,
  version,
  is_default,
  is_active
) VALUES (
  NULL,
  'Calm Operator',
  'A calm decision partner who helps others think through problems. Not a guru. Not a coach. Just someone who''s seen enough to know what actually works.',
  ARRAY[
    'Humble and grounded — never claim expertise you don''t have',
    'Anti-hype — if it sounds like marketing, rewrite it',
    'Practical and systems-first — focus on what can be implemented',
    'No guru tone — never position yourself as having all the answers',
    'No promises or guarantees — speak in observations and patterns'
  ],
  ARRAY[
    '5th-grade reading level maximum',
    'Short sentences — aim for 10-15 words',
    'One idea per sentence',
    'No abstract jargon — if a 10-year-old wouldn''t understand it, simplify',
    'If it reads like LinkedIn thought-leadership, rewrite it simpler'
  ],
  ARRAY[
    'game-changer', 'unlock', 'level up', 'crushing it', 'hustle',
    'grind', 'mindset shift', 'powerful', 'secret', 'hack',
    'leverage', 'scale', 'optimize', 'synergy', 'disrupt'
  ],
  1,
  true,
  true
);

-- Default LinkedIn Platform Profile
INSERT INTO platform_profiles (
  user_id,
  platform,
  name,
  structure,
  formatting_rules,
  length_constraints,
  required_output_fields,
  version,
  is_default,
  is_active
) VALUES (
  NULL,
  'linkedin',
  'LinkedIn Default',
  '{
    "sections": [
      {
        "name": "hook",
        "description": "1-2 lines. Blunt. Names a familiar pain or contradiction.",
        "required": true
      },
      {
        "name": "context",
        "description": "2-4 lines. Real scenario. No hero story. Grounded in experience.",
        "required": true
      },
      {
        "name": "shift",
        "description": "Reframe the problem. The insight that changes how you see it.",
        "required": true
      },
      {
        "name": "practical_tool",
        "description": "Bullets or short numbered list. Concrete, actionable steps.",
        "required": true
      },
      {
        "name": "close_cta",
        "description": "Calm close. No pitch. Optional soft question.",
        "required": true
      }
    ]
  }'::jsonb,
  ARRAY[
    'Use line breaks liberally — dense paragraphs kill engagement',
    'Bullets should be 1 line each',
    'No emojis in body text',
    'One emoji max in hook (optional)',
    'No hashtags in body — add 3-5 at very end if needed'
  ],
  '{
    "target_min": 1800,
    "target_max": 2400,
    "hard_max": 2500,
    "unit": "characters"
  }'::jsonb,
  ARRAY['post_title', 'post_text', 'meta_title', 'meta_description', 'excerpt'],
  1,
  true,
  true
);

-- Default Instagram Platform Profile
INSERT INTO platform_profiles (
  user_id,
  platform,
  name,
  structure,
  formatting_rules,
  length_constraints,
  required_output_fields,
  version,
  is_default,
  is_active
) VALUES (
  NULL,
  'instagram',
  'Instagram Default',
  '{
    "sections": [
      {
        "name": "hook",
        "description": "First line must stop the scroll. Bold claim or relatable pain.",
        "required": true
      },
      {
        "name": "body",
        "description": "Value-packed content. Can use lists or short paragraphs.",
        "required": true
      },
      {
        "name": "cta",
        "description": "Clear call to action. Save, share, comment, or link in bio.",
        "required": true
      }
    ]
  }'::jsonb,
  ARRAY[
    'Line breaks after every 1-2 sentences',
    'Emojis allowed sparingly for visual breaks',
    'Hashtags at end — 5-15 relevant tags',
    'Can reference ''link in bio'' for longer content'
  ],
  '{
    "target_min": 500,
    "target_max": 2000,
    "hard_max": 2200,
    "unit": "characters"
  }'::jsonb,
  ARRAY['caption_text', 'hashtags', 'alt_text'],
  1,
  true,
  true
);

-- Default Facebook Platform Profile
INSERT INTO platform_profiles (
  user_id,
  platform,
  name,
  structure,
  formatting_rules,
  length_constraints,
  required_output_fields,
  version,
  is_default,
  is_active
) VALUES (
  NULL,
  'facebook',
  'Facebook Page Default',
  '{
    "sections": [
      {
        "name": "hook",
        "description": "Attention-grabbing opener. Question or bold statement.",
        "required": true
      },
      {
        "name": "body",
        "description": "Conversational tone. Can be longer form. Story-friendly.",
        "required": true
      },
      {
        "name": "cta",
        "description": "Engagement prompt. Comment, share, or click.",
        "required": true
      }
    ]
  }'::jsonb,
  ARRAY[
    'Conversational and warm tone',
    'Paragraphs of 2-3 sentences',
    'Emojis allowed but not required',
    'Links can be inline (not just ''link in bio'')',
    'No hashtag stuffing — 0-3 max'
  ],
  '{
    "target_min": 300,
    "target_max": 1500,
    "hard_max": 5000,
    "unit": "characters"
  }'::jsonb,
  ARRAY['post_text', 'link_preview_text'],
  1,
  true,
  true
);

-- Default Ideation Prompt Template
INSERT INTO prompt_templates (
  user_id,
  task_type,
  name,
  content,
  version,
  is_active
) VALUES (
  NULL,
  'ideation',
  'Default Ideation',
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
  1,
  true
);

-- Default Trend Ideation Prompt Template
INSERT INTO prompt_templates (
  user_id,
  task_type,
  name,
  content,
  version,
  is_active
) VALUES (
  NULL,
  'trend_ideation',
  'Default Trend Ideation',
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
  1,
  true
);

-- Default Drafting Prompt Template
INSERT INTO prompt_templates (
  user_id,
  task_type,
  name,
  content,
  version,
  is_active
) VALUES (
  NULL,
  'drafting',
  'Default Drafting',
  'You are a content writer creating platform-specific social media content.

Your task is to transform the provided idea into a ready-to-publish post.

Follow the platform profile structure exactly. Each section is required unless marked optional.

Ensure your content:
- Matches the voice profile tone and style
- Stays within length constraints
- Includes all required output fields
- Follows all formatting rules

Return your response as a JSON object containing all required output fields for the platform.',
  1,
  true
);
