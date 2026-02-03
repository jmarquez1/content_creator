# Ideation from YouTube Video

## Objective
Generate content ideas from a YouTube video transcript.

## Inputs
- youtube_url: string (required) — valid YouTube URL
- transcript: string (optional) — manual transcript if auto-fetch fails
- topic: string (optional) — focus topic from the video
- audience: string (optional) — target audience description
- angle: string (optional) — specific angle or perspective
- cta_preference: string (optional) — preferred call-to-action style
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
   - Must match YouTube URL patterns (youtube.com/watch, youtu.be, etc.)
2. If transcript not provided:
   - Call youtube-transcript tool with URL
   - If fetch succeeds: store transcript and continue
   - If fetch fails: return error with fallback instruction
3. Store in content_sources
   - source_type: 'youtube'
   - url: youtube_url
   - transcript: transcript text
   - metadata: { videoId }
4. Truncate transcript if > 10,000 characters
5. Fetch active voice profile for user
6. Compose ideation prompt with transcript context
   - Include truncated transcript as example/reference
   - Include any provided focus topic, audience, angle
7. Log composed prompt to audit_logs
8. Call OpenAI via generate tool
   - Model: gpt-4o
   - Temperature: 0.7
   - Response format: JSON
9. Log response to audit_logs
10. Parse response into idea structure
    - title: string
    - hook: string
    - outline: array of strings
    - suggested_cta: string
    - tags: array of strings
11. Create idea record
    - source_type: 'youtube'
    - source_reference_id: content_source.id
12. Return created idea

## Outputs
- idea: Idea object with title, hook, outline, suggested_cta, tags
- audit_log_id: string
- content_source_id: string

## Edge Cases
- Invalid URL format: Return validation error immediately
- Video has no transcript: Return error with manual paste instructions
- Video is age-restricted: Return error with manual paste instructions
- Transcript too long: Truncate to first 10,000 characters with note
- Manual transcript provided: Skip auto-fetch, use provided transcript

## Failure Handling
- YouTube API error: Log error, return error with fallback option
- OpenAI timeout: Retry once, then return error
- Database error: Log error, do not lose transcript data
