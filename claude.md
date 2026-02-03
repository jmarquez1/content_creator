# CLAUDE.MD — Content Creation Ops App

> **This document is the operational contract for AI-assisted development.**
> All instructions are binding. Consult this file before every task.

---

## PROJECT IDENTITY

**Repository**: `content_creator`
**Purpose**: End-to-end content creation operations tool
**Type**: General-purpose SaaS (customization via settings, not code)

**Core Capabilities**:
- Idea generation from multiple sources
- Trend-based research and ideation
- Multi-platform content drafting
- Kanban workflow management
- Full audit trail of AI operations

---

## TECH STACK

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Supabase (Auth, Postgres, Storage) |
| AI | OpenAI API (generation only) |
| Auth | Supabase Auth with RLS |
| File Storage | Supabase Storage |

**Critical Rules**:
- RLS enabled on all tables (basic now, stricter later)
- OpenAI handles generation; all execution logic is deterministic code
- TypeScript strict mode enabled
- No `any` types without explicit justification

---

## WAT FRAMEWORK (MANDATORY)

This project operates under the **WAT Framework**. Violations are blocking errors.

### Layer 1 — Workflows

Location: `workflows/`

Workflows are markdown SOPs that define HOW to execute tasks.

**Required Structure for Each Workflow**:
```markdown
# [WORKFLOW NAME]

## Objective
[Single sentence describing the goal]

## Inputs
- [List all required inputs]
- [Include types and validation rules]

## Tools Required
- [List tools from tools/ directory]

## Steps
1. [Explicit step]
2. [Explicit step]
...

## Outputs
- [List all outputs with formats]

## Edge Cases
- [Condition]: [Action]

## Failure Handling
- [Failure type]: [Recovery action]
```

**Before executing any task**: Check if a workflow exists. If yes, follow it. If no, create the workflow first.

### Layer 2 — Agent (Claude)

You are the orchestration layer.

**You MUST**:
- Read and follow workflows before acting
- Decompose complex tasks into tool calls
- Validate outputs against workflow specs
- Log decisions for audit trail
- Update workflows when gaps are discovered

**You MUST NOT**:
- Execute side effects directly (use tools)
- Make API calls without going through tools
- Store or echo secrets
- Skip workflow consultation

### Layer 3 — Tools

Location: `tools/`

Tools are deterministic scripts that perform single operations.

**Tool Categories**:
| Category | Purpose | Examples |
|----------|---------|----------|
| `fetch/` | External data retrieval | YouTube transcript, Reddit API, trend scraping |
| `extract/` | Content extraction | PDF text extraction, document parsing |
| `db/` | Database operations | CRUD operations via Supabase client |
| `ai/` | AI wrapper functions | Prompt composition, OpenAI calls |
| `validate/` | Input/output validation | Schema validation, content length checks |

**Tool Requirements**:
- Single responsibility
- Explicit input/output types
- Error handling with typed errors
- No hardcoded credentials (use env vars)
- Logging for audit trail

### Self-Improvement Loop

After every significant task:
1. Identify workflow gaps encountered
2. Update affected workflow files
3. Document new edge cases
4. Commit workflow changes with task reference

Workflows are **operational memory**. They evolve.

---

## CONTEXT7 MCP (MANDATORY)

Use Context7 for all documentation lookups.

**When to Use Context7**:
- Before implementing any Supabase feature
- Before using Next.js 15 app router patterns
- Before making OpenAI API calls
- When encountering unfamiliar API behavior
- When official docs may have changed

**Usage Pattern**:
1. Call `resolve-library-id` with library name
2. Call `query-docs` with specific question
3. Apply findings to implementation

**Priority**: Context7 > cached knowledge > assumptions

---

## DIRECTORY STRUCTURE

```
content_creator/
├── claude.md                    # This file (source of truth)
├── .env.local                   # Local secrets (NEVER COMMIT)
├── .env.example                 # Template for required env vars
├── workflows/                   # WAT Layer 1: SOPs
│   ├── ideation/
│   │   ├── from-youtube.md
│   │   ├── from-topic.md
│   │   ├── from-document.md
│   │   └── from-plain-input.md
│   ├── drafting/
│   │   ├── linkedin.md
│   │   ├── instagram.md
│   │   └── facebook.md
│   ├── trends/
│   │   └── trend-research.md
│   └── system/
│       ├── prompt-composition.md
│       └── audit-logging.md
├── tools/                       # WAT Layer 3: Deterministic scripts
│   ├── fetch/
│   │   ├── youtube-transcript.ts
│   │   ├── reddit-trends.ts
│   │   └── youtube-trends.ts
│   ├── extract/
│   │   ├── pdf-extractor.ts
│   │   └── text-extractor.ts
│   ├── db/
│   │   ├── ideas.ts
│   │   ├── posts.ts
│   │   ├── prompts.ts
│   │   ├── voice-profiles.ts
│   │   ├── platform-profiles.ts
│   │   └── audit-logs.ts
│   ├── ai/
│   │   ├── compose-prompt.ts
│   │   └── generate.ts
│   └── validate/
│       ├── content-length.ts
│       └── schema.ts
├── src/
│   ├── app/                     # Next.js 15 App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   │   ├── ideas/
│   │   │   ├── posts/
│   │   │   ├── trends/
│   │   │   └── settings/
│   │   └── api/
│   │       ├── ideas/
│   │       ├── posts/
│   │       ├── trends/
│   │       ├── generate/
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── ideas/
│   │   ├── posts/
│   │   ├── kanban/
│   │   └── forms/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── openai/
│   │   │   └── client.ts
│   │   └── utils/
│   ├── types/
│   │   ├── database.ts          # Generated from Supabase
│   │   ├── ideas.ts
│   │   ├── posts.ts
│   │   └── prompts.ts
│   └── hooks/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── public/
├── tests/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## DATABASE SCHEMA

### Core Tables

```sql
-- Ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  hook TEXT,
  outline JSONB,
  suggested_cta TEXT,
  status TEXT NOT NULL DEFAULT 'inbox',
  tags TEXT[],
  source_type TEXT, -- 'youtube' | 'topic' | 'document' | 'plain'
  source_reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idea statuses (Kanban): inbox → developing → ready → archived

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  idea_id UUID REFERENCES ideas(id),
  platform TEXT NOT NULL, -- 'linkedin' | 'instagram' | 'facebook'
  content JSONB NOT NULL, -- platform-specific fields
  variants JSONB, -- array of variant objects
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  audit_log_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post statuses: draft → review → scheduled → published → archived

-- Content Sources
CREATE TABLE content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  source_type TEXT NOT NULL, -- 'youtube' | 'document'
  url TEXT,
  title TEXT,
  transcript TEXT,
  extracted_text TEXT,
  original_file_path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trend Runs
CREATE TABLE trend_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  topic TEXT NOT NULL,
  sources TEXT[] NOT NULL, -- ['reddit', 'youtube']
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trend Items
CREATE TABLE trend_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_run_id UUID REFERENCES trend_runs(id) NOT NULL,
  source TEXT NOT NULL, -- 'reddit' | 'youtube'
  title TEXT NOT NULL,
  url TEXT,
  engagement_score INTEGER,
  recency_score INTEGER,
  combined_rank INTEGER,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prompt Templates
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  task_type TEXT NOT NULL, -- 'ideation' | 'trend_ideation' | 'drafting' | 'rewriting' | 'repurposing'
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Voice Profiles
CREATE TABLE voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  persona TEXT NOT NULL,
  tone_rules TEXT[] NOT NULL,
  readability_rules TEXT[] NOT NULL,
  forbidden_language TEXT[],
  version INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform Profiles
CREATE TABLE platform_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL, -- 'linkedin' | 'instagram' | 'facebook'
  name TEXT NOT NULL,
  structure JSONB NOT NULL,
  formatting_rules TEXT[] NOT NULL,
  length_constraints JSONB NOT NULL,
  required_output_fields TEXT[] NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  prompt_snapshot JSONB NOT NULL, -- full composed prompt
  model_used TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  response_snapshot JSONB,
  template_versions JSONB, -- versions of all blocks used
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies (Basic)

```sql
-- All tables: users can only access their own data
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ideas" ON ideas
  FOR ALL USING (auth.uid() = user_id);

-- Repeat for: posts, content_sources, trend_runs, trend_items, audit_logs

-- Prompt/Voice/Platform profiles: users see own + system defaults
CREATE POLICY "Users can view own and default profiles" ON voice_profiles
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own profiles" ON voice_profiles
  FOR ALL USING (auth.uid() = user_id);
```

---

## PROMPT SYSTEM

### Architecture

Prompts are **never hardcoded**. They are composed at runtime from versioned blocks.

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPOSED PROMPT                          │
├─────────────────────────────────────────────────────────────┤
│  1. Task Template (from prompt_templates)                   │
│     - Defines the operation type                            │
├─────────────────────────────────────────────────────────────┤
│  2. Voice Profile (from voice_profiles)                     │
│     - Persona, tone, readability                            │
├─────────────────────────────────────────────────────────────┤
│  3. Platform Profile (from platform_profiles)               │
│     - Structure, formatting, constraints                    │
├─────────────────────────────────────────────────────────────┤
│  4. User Input                                              │
│     - Topic, audience, angle, example, CTA preference       │
├─────────────────────────────────────────────────────────────┤
│  5. Trend Summary (optional)                                │
│     - From trend_runs + trend_items                         │
└─────────────────────────────────────────────────────────────┘
```

### Composition Rules

1. Fetch active templates for task type
2. Fetch active voice profile (user's or default)
3. Fetch active platform profile
4. Merge user input
5. Append trend summary if applicable
6. Log full composed prompt to audit_logs BEFORE sending to OpenAI
7. Log response to audit_logs AFTER receiving

### Versioning

- Every edit creates a new version (never overwrite)
- Audit logs reference specific versions used
- Active flag determines which version is current

---

## SEED DATA

### Default Voice Profile

```json
{
  "name": "Calm Operator",
  "persona": "A calm decision partner who helps others think through problems. Not a guru. Not a coach. Just someone who's seen enough to know what actually works.",
  "tone_rules": [
    "Humble and grounded — never claim expertise you don't have",
    "Anti-hype — if it sounds like marketing, rewrite it",
    "Practical and systems-first — focus on what can be implemented",
    "No guru tone — never position yourself as having all the answers",
    "No promises or guarantees — speak in observations and patterns"
  ],
  "readability_rules": [
    "5th-grade reading level maximum",
    "Short sentences — aim for 10-15 words",
    "One idea per sentence",
    "No abstract jargon — if a 10-year-old wouldn't understand it, simplify",
    "If it reads like LinkedIn thought-leadership, rewrite it simpler"
  ],
  "forbidden_language": [
    "game-changer",
    "unlock",
    "level up",
    "crushing it",
    "hustle",
    "grind",
    "mindset shift",
    "powerful",
    "secret",
    "hack",
    "leverage",
    "scale",
    "optimize",
    "synergy",
    "disrupt"
  ],
  "is_default": true
}
```

### Default LinkedIn Platform Profile

```json
{
  "platform": "linkedin",
  "name": "LinkedIn Default",
  "structure": {
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
  },
  "formatting_rules": [
    "Use line breaks liberally — dense paragraphs kill engagement",
    "Bullets should be 1 line each",
    "No emojis in body text",
    "One emoji max in hook (optional)",
    "No hashtags in body — add 3-5 at very end if needed"
  ],
  "length_constraints": {
    "target_min": 1800,
    "target_max": 2400,
    "hard_max": 2500,
    "unit": "characters"
  },
  "required_output_fields": [
    "post_title",
    "post_text",
    "meta_title",
    "meta_description",
    "excerpt"
  ],
  "is_default": true
}
```

### Default Instagram Platform Profile

```json
{
  "platform": "instagram",
  "name": "Instagram Default",
  "structure": {
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
  },
  "formatting_rules": [
    "Line breaks after every 1-2 sentences",
    "Emojis allowed sparingly for visual breaks",
    "Hashtags at end — 5-15 relevant tags",
    "Can reference 'link in bio' for longer content"
  ],
  "length_constraints": {
    "target_min": 500,
    "target_max": 2000,
    "hard_max": 2200,
    "unit": "characters"
  },
  "required_output_fields": [
    "caption_text",
    "hashtags",
    "alt_text"
  ],
  "is_default": true
}
```

### Default Facebook Page Platform Profile

```json
{
  "platform": "facebook",
  "name": "Facebook Page Default",
  "structure": {
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
  },
  "formatting_rules": [
    "Conversational and warm tone",
    "Paragraphs of 2-3 sentences",
    "Emojis allowed but not required",
    "Links can be inline (not just 'link in bio')",
    "No hashtag stuffing — 0-3 max"
  ],
  "length_constraints": {
    "target_min": 300,
    "target_max": 1500,
    "hard_max": 5000,
    "unit": "characters"
  },
  "required_output_fields": [
    "post_text",
    "link_preview_text"
  ],
  "is_default": true
}
```

---

## CONTENT SOURCE WORKFLOWS

### 1. From YouTube Video

**Trigger**: User provides YouTube URL

**Flow**:
1. Validate URL format
2. Attempt automatic transcript fetch via `tools/fetch/youtube-transcript.ts`
3. If fetch fails → prompt user for manual transcript paste
4. Store in `content_sources` with `source_type: 'youtube'`
5. Proceed to ideation with transcript as context

**Tool**: `tools/fetch/youtube-transcript.ts`
**Workflow**: `workflows/ideation/from-youtube.md`

### 2. From Topic + Trend Research

**Trigger**: User provides topic for trend-based ideation

**Flow**:
1. Create `trend_run` record with status `pending`
2. Execute trend fetchers in parallel:
   - `tools/fetch/reddit-trends.ts` — fetch recent posts by relevance
   - `tools/fetch/youtube-trends.ts` — fetch recent videos by relevance
3. For each result:
   - Calculate `engagement_score` (upvotes, comments, views)
   - Calculate `recency_score` (based on post date)
   - Calculate `combined_rank`
4. Store as `trend_items` linked to `trend_run`
5. Update `trend_run` status to `completed`
6. Compose trend summary for prompt inclusion
7. Proceed to ideation with trend context

**Tools**:
- `tools/fetch/reddit-trends.ts`
- `tools/fetch/youtube-trends.ts`

**Workflow**: `workflows/trends/trend-research.md`

**Critical**: Trend research must be REAL. No simulated or mocked data in production.

### 3. From Uploaded Document

**Trigger**: User uploads PDF or text file

**Flow**:
1. Validate file type (PDF, TXT, MD)
2. Store original file in Supabase Storage
3. Extract text via appropriate tool:
   - PDF → `tools/extract/pdf-extractor.ts`
   - Text → `tools/extract/text-extractor.ts`
4. Store in `content_sources` with:
   - `original_file_path`
   - `extracted_text`
5. Proceed to ideation with extracted text as context

**Tools**:
- `tools/extract/pdf-extractor.ts`
- `tools/extract/text-extractor.ts`

**Workflow**: `workflows/ideation/from-document.md`

### 4. From Plain Input

**Trigger**: User provides topic without trend analysis

**Flow**:
1. Collect user input (topic, audience, angle, example, CTA preference)
2. Skip trend research
3. Proceed directly to ideation

**Workflow**: `workflows/ideation/from-plain-input.md`

---

## KANBAN BEHAVIOR

### Idea Statuses

| Status | Description |
|--------|-------------|
| `inbox` | New ideas, not yet reviewed |
| `developing` | Being refined, outline in progress |
| `ready` | Complete, ready to generate posts |
| `archived` | No longer active |

### Post Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial generation, not reviewed |
| `review` | Under review, may have variants |
| `scheduled` | Approved, awaiting publish date |
| `published` | Live (manual confirmation) |
| `archived` | No longer active |

### Rules

1. Moving an idea between columns does NOT auto-create posts
2. Posts are created ONLY via explicit user action ("Generate Post for LinkedIn")
3. One idea can have multiple posts across multiple platforms
4. Each post can have multiple variants
5. Status changes are logged for audit

---

## API DESIGN

### Endpoint Patterns

```
POST   /api/ideas                    # Create idea
GET    /api/ideas                    # List ideas (with status filter)
GET    /api/ideas/[id]               # Get single idea
PATCH  /api/ideas/[id]               # Update idea
DELETE /api/ideas/[id]               # Soft delete (archive)

POST   /api/posts                    # Create post from idea
GET    /api/posts                    # List posts (with filters)
GET    /api/posts/[id]               # Get single post
PATCH  /api/posts/[id]               # Update post
DELETE /api/posts/[id]               # Soft delete (archive)

POST   /api/trends/run               # Start trend research
GET    /api/trends/runs              # List trend runs
GET    /api/trends/runs/[id]         # Get run with items

POST   /api/generate/idea            # Generate idea from source
POST   /api/generate/post            # Generate post from idea
POST   /api/generate/variants        # Generate variants for post

GET    /api/settings/voice-profiles  # List voice profiles
POST   /api/settings/voice-profiles  # Create voice profile
PATCH  /api/settings/voice-profiles/[id]  # Update (creates new version)

GET    /api/settings/platform-profiles
POST   /api/settings/platform-profiles
PATCH  /api/settings/platform-profiles/[id]

GET    /api/settings/prompt-templates
POST   /api/settings/prompt-templates
PATCH  /api/settings/prompt-templates/[id]
```

### Response Format

```typescript
// Success
{
  "data": T,
  "meta": {
    "timestamp": string,
    "request_id": string
  }
}

// Error
{
  "error": {
    "code": string,
    "message": string,
    "details": object | null
  },
  "meta": {
    "timestamp": string,
    "request_id": string
  }
}
```

---

## SECURITY RULES

### Secrets Management

| Rule | Enforcement |
|------|-------------|
| Never store secrets in `claude.md` | This file is committed |
| Never commit `.env` or `.env.local` | Add to `.gitignore` |
| Service role key is server-only | Never expose to client |
| Assume keys may be rotated | Use env vars, not hardcoded values |
| Validate all user input | Server-side validation required |

### Required Environment Variables

```bash
# .env.local (NEVER COMMIT)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-only
OPENAI_API_KEY=                   # Server-only
REDDIT_CLIENT_ID=                 # For trend research
REDDIT_CLIENT_SECRET=             # For trend research
```

### `.env.example` Template

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Reddit API (for trend research)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

---

## AUDIT TRAIL

### What Gets Logged

Every AI generation logs:
- Full composed prompt (all blocks + user input)
- Model used
- Token counts (input/output)
- Raw response
- Versions of all templates/profiles used
- Timestamp
- User ID

### Audit Log Schema Reference

```typescript
interface AuditLog {
  id: string;
  user_id: string;
  action: 'generate_idea' | 'generate_post' | 'generate_variants' | 'rewrite' | 'repurpose';
  entity_type: 'idea' | 'post';
  entity_id: string;
  prompt_snapshot: {
    task_template: { id: string; version: number; content: string };
    voice_profile: { id: string; version: number; content: object };
    platform_profile: { id: string; version: number; content: object };
    user_input: object;
    trend_summary: string | null;
    composed_prompt: string;
  };
  model_used: string;
  input_tokens: number;
  output_tokens: number;
  response_snapshot: object;
  template_versions: {
    task_template_version: number;
    voice_profile_version: number;
    platform_profile_version: number;
  };
  created_at: string;
}
```

---

## CODING STANDARDS

### TypeScript

- Strict mode enabled
- No `any` without JSDoc justification
- Prefer `interface` over `type` for object shapes
- Use Zod for runtime validation
- Generate DB types from Supabase

### React/Next.js

- Server Components by default
- Client Components only when needed (interactivity, hooks)
- Use `use server` for server actions
- Colocate components with their routes when specific to that route

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Types: `kebab-case.ts`
- API routes: `route.ts` (Next.js 15 convention)

### Git

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Branch naming: `feat/description`, `fix/description`
- No direct commits to `main`

---

## DEVELOPMENT COMMANDS

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Generate Supabase types
npm run db:types

# Run migrations
npm run db:migrate

# Reset database (dev only)
npm run db:reset

# Run tests
npm test
```

---

## ERROR HANDLING

### Error Types

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: object
  ) {
    super(message);
  }
}

// Usage
throw new AppError('TRANSCRIPT_FETCH_FAILED', 'Could not fetch YouTube transcript', 400);
throw new AppError('TREND_RESEARCH_FAILED', 'Reddit API rate limited', 429);
throw new AppError('GENERATION_FAILED', 'OpenAI request failed', 502);
```

### Fallback Behaviors

| Failure | Fallback |
|---------|----------|
| YouTube transcript fetch | Prompt for manual paste |
| Reddit rate limit | Log, skip Reddit, continue with YouTube |
| OpenAI timeout | Retry once with exponential backoff |
| Supabase connection | Show error, don't lose user input |

---

## TESTING STRATEGY

### Unit Tests

- Tools in `tools/` must have unit tests
- Test happy path + edge cases
- Mock external APIs

### Integration Tests

- API routes must have integration tests
- Use test database
- Test RLS policies

### E2E Tests

- Critical flows only:
  - Create idea from YouTube
  - Generate post for LinkedIn
  - Kanban status changes

---

## LAUNCH CHECKLIST

Before any deployment:

- [ ] All migrations applied
- [ ] Seed data inserted
- [ ] RLS policies verified
- [ ] Environment variables set
- [ ] Type check passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Audit logging verified

---

## CHANGE LOG

| Date | Change | Author |
|------|--------|--------|
| 2026-02-03 | Initial document creation | Claude |

---

## APPENDIX: WORKFLOW TEMPLATES

### Workflow Template: Ideation from YouTube

Create as `workflows/ideation/from-youtube.md`:

```markdown
# Ideation from YouTube Video

## Objective
Generate content ideas from a YouTube video transcript.

## Inputs
- youtube_url: string (required) — valid YouTube URL
- user_id: string (required) — authenticated user ID

## Tools Required
- tools/fetch/youtube-transcript.ts
- tools/db/content-sources.ts
- tools/ai/compose-prompt.ts
- tools/ai/generate.ts
- tools/db/ideas.ts
- tools/db/audit-logs.ts

## Steps
1. Validate youtube_url format
2. Call youtube-transcript tool with URL
3. If transcript fetch succeeds:
   - Store in content_sources
   - Proceed to step 5
4. If transcript fetch fails:
   - Return error with fallback instruction
   - Wait for manual transcript input
   - Store manual transcript in content_sources
5. Fetch active voice profile
6. Compose ideation prompt with transcript context
7. Log composed prompt to audit_logs
8. Call OpenAI via generate tool
9. Log response to audit_logs
10. Parse response into idea structure
11. Create idea record linked to content_source
12. Return idea

## Outputs
- idea: Idea object with title, hook, outline, suggested_cta
- audit_log_id: string

## Edge Cases
- Invalid URL format: Return validation error immediately
- Video has no transcript: Return error with manual paste instructions
- Video is age-restricted: Return error with manual paste instructions
- Transcript too long: Truncate to first 10,000 characters with note

## Failure Handling
- YouTube API error: Log error, return fallback instruction
- OpenAI timeout: Retry once, then return error
- Database error: Log error, do not lose transcript data
```

---

**END OF DOCUMENT**

This file is the source of truth. Update it when the system evolves.
