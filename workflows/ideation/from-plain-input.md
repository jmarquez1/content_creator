# Ideation from Plain Input

## Objective
Generate content ideas from user-provided topic and context without external data sources.

## Inputs
- topic: string (required) — the main subject for ideation
- audience: string (optional) — target audience description
- angle: string (optional) — specific angle or perspective to take
- example: string (optional) — example content or style reference
- cta_preference: string (optional) — preferred call-to-action style
- user_id: string (required) — authenticated user ID

## Tools Required
- tools/ai/compose-prompt.ts
- tools/ai/generate.ts
- tools/db/ideas.ts
- tools/db/audit-logs.ts

## Steps
1. Validate user input
   - topic is required and non-empty
   - All optional fields should be trimmed strings or undefined
2. Fetch active voice profile for user
3. Compose ideation prompt
   - Use 'ideation' task template
   - Include voice profile
   - Include all provided user input
4. Log composed prompt to audit_logs
5. Call OpenAI via generate tool
   - Model: gpt-4-turbo
   - Temperature: 0.7
   - Response format: JSON
6. Log response to audit_logs
7. Parse response into idea structure
   - title: string
   - hook: string
   - outline: array of strings
   - suggested_cta: string
   - tags: array of strings
8. Create idea record
   - source_type: 'plain'
   - source_reference_id: null
9. Return created idea

## Outputs
- idea: Idea object with:
  - id: UUID
  - title: string
  - hook: string
  - outline: JSON array
  - suggested_cta: string
  - tags: string array
  - status: 'inbox'
  - source_type: 'plain'
- audit_log_id: string

## Edge Cases
- Empty topic: Return validation error
- OpenAI returns invalid JSON: Retry once with stricter prompt
- OpenAI returns empty response: Return error, log issue

## Failure Handling
- OpenAI rate limit: Wait and retry with exponential backoff
- OpenAI timeout: Retry once, then return error
- Database error: Log error, do not lose generated content
