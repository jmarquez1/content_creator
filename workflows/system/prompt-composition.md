# Prompt Composition

## Objective
Compose a complete prompt from versioned blocks for AI generation tasks.

## Inputs
- task_type: string (required) — 'ideation' | 'trend_ideation' | 'drafting' | 'rewriting' | 'repurposing'
- user_id: string (required) — authenticated user ID
- platform: string (optional) — 'linkedin' | 'instagram' | 'facebook' (required for drafting)
- user_input: object (required) — topic, audience, angle, example, cta_preference
- trend_summary: string (optional) — from trend research

## Tools Required
- tools/db/prompts.ts
- tools/db/voice-profiles.ts
- tools/db/platform-profiles.ts
- tools/ai/compose-prompt.ts

## Steps
1. Fetch active prompt template for task_type
   - If user has custom template, use it
   - Otherwise, use system default
2. Fetch active voice profile
   - If user has custom profile, use it
   - Otherwise, use system default (is_default = true)
3. If task is drafting, fetch active platform profile for specified platform
   - If user has custom profile, use it
   - Otherwise, use system default for that platform
4. Compose prompt by combining:
   - Task template (defines operation type)
   - Voice profile (persona, tone, readability)
   - Platform profile (structure, formatting, constraints) — if applicable
   - User input (topic, audience, angle, etc.)
   - Trend summary — if provided
5. Return composed prompt with version metadata

## Outputs
- composed_prompt: string — the full prompt to send to OpenAI
- versions: object — record of all template/profile versions used
  - task_template_id: string
  - task_template_version: number
  - voice_profile_id: string
  - voice_profile_version: number
  - platform_profile_id: string (optional)
  - platform_profile_version: number (optional)

## Composition Order
```
┌─────────────────────────────────────────────────────────────┐
│                    COMPOSED PROMPT                          │
├─────────────────────────────────────────────────────────────┤
│  1. Task Template                                           │
│     You are a content creator assistant. Your task is to    │
│     [task-specific instructions from template]              │
├─────────────────────────────────────────────────────────────┤
│  2. Voice Profile                                           │
│     PERSONA: [persona from voice profile]                   │
│     TONE RULES:                                             │
│     - [rule 1]                                              │
│     - [rule 2]                                              │
│     READABILITY RULES:                                      │
│     - [rule 1]                                              │
│     - [rule 2]                                              │
│     FORBIDDEN LANGUAGE: [list]                              │
├─────────────────────────────────────────────────────────────┤
│  3. Platform Profile (if drafting)                          │
│     PLATFORM: [platform name]                               │
│     STRUCTURE:                                              │
│     - [section 1]: [description]                            │
│     - [section 2]: [description]                            │
│     FORMATTING RULES:                                       │
│     - [rule 1]                                              │
│     LENGTH CONSTRAINTS:                                     │
│     - Target: [min]-[max] [unit]                            │
│     - Hard max: [hard_max] [unit]                           │
│     REQUIRED OUTPUT FIELDS:                                 │
│     - [field 1]                                             │
│     - [field 2]                                             │
├─────────────────────────────────────────────────────────────┤
│  4. User Input                                              │
│     TOPIC: [topic]                                          │
│     AUDIENCE: [audience]                                    │
│     ANGLE: [angle]                                          │
│     EXAMPLE: [example or "none provided"]                   │
│     CTA PREFERENCE: [cta preference]                        │
├─────────────────────────────────────────────────────────────┤
│  5. Trend Summary (if provided)                             │
│     CURRENT TRENDS:                                         │
│     [trend summary]                                         │
└─────────────────────────────────────────────────────────────┘
```

## Edge Cases
- No active template for task type: Use hardcoded fallback, log warning
- No voice profile found: Use system default
- Platform profile missing for drafting: Return error, cannot proceed
- User input missing required fields: Return validation error

## Failure Handling
- Database error: Log error, return error response
- Template parsing error: Log error, return error response
