# LinkedIn Post Drafting

## Overview

This workflow generates LinkedIn posts from approved ideas, following LinkedIn-specific best practices and format guidelines.

## Platform Characteristics

| Attribute | Value |
|-----------|-------|
| Character Limit | 3,000 |
| Optimal Length | 1,300-2,000 characters |
| Hashtag Limit | 3-5 recommended |
| Link Preview | Yes (posts with links get lower reach) |
| Best Formats | Stories, lists, lessons learned, hot takes |

## Content Structure

### Hook (First 2-3 Lines)
The first lines appear before "...see more" - critical for engagement.
- Start with a bold statement, question, or statistic
- Create curiosity or controversy
- Avoid generic openings

### Body
- Use short paragraphs (1-3 sentences)
- Add line breaks for readability
- Include specific examples or data
- Tell a story when possible

### Call-to-Action
- Ask a question to drive comments
- Invite connection/follow
- Point to relevant resources
- Avoid external links when possible (use in comments)

## Formatting Guidelines

1. **White Space**: Use generous line breaks between paragraphs
2. **Symbols**: Strategic use of → • ↳ for visual hierarchy
3. **Numbers**: Use digits (5 instead of five) for scannability
4. **Emphasis**: Occasional ALL CAPS for key words (sparingly)

## Voice Adaptation

LinkedIn posts should feel:
- Professional but personable
- Authoritative but accessible
- Educational but engaging
- Confident but not arrogant

## Prompt Template

```
You are writing a LinkedIn post based on the following idea.

IDEA:
Title: {title}
Hook: {hook}
Key Points: {outline}
CTA: {suggested_cta}

VOICE PROFILE:
{voice_profile}

PLATFORM GUIDELINES:
- Maximum 3,000 characters (aim for 1,300-2,000)
- Start with a compelling hook (appears before "see more")
- Use short paragraphs with line breaks
- Include 3-5 relevant hashtags
- End with a discussion-driving question or clear CTA

FORMAT:
- First 2-3 lines = hook
- Body = 3-5 short paragraphs
- CTA = engagement-driving close
- Hashtags at the end

Generate the post and respond with JSON:
{
  "content": "The full post text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "suggested_image_prompt": "Optional: description of ideal visual"
}
```

## Example Output

```
Most people think growing on LinkedIn is about posting daily.

It's not.

Here's what actually moves the needle:

→ Consistency beats frequency (3x/week > random daily)
→ Engagement matters more than reach
→ Comments on others' posts build your network faster than your own posts

The secret nobody talks about?

Your first 100 followers don't come from content.
They come from genuine conversations in the comments.

I grew from 0 to 10K in 8 months by spending 30 min/day commenting before I posted anything.

What's your LinkedIn growth strategy? Drop it below 👇

#LinkedInGrowth #ContentMarketing #PersonalBranding
```

## Generation Flow

```
┌─────────────────┐
│  Receive Idea   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Load Voice +    │
│ Platform Profile│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Compose Prompt  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Post   │
│ via OpenAI      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse Response  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Post     │
│ Record          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Log to Audit    │
└─────────────────┘
```

## API Usage

**POST** `/api/generate/post`

```json
{
  "idea_id": "uuid",
  "platform": "linkedin",
  "additional_context": "Optional extra instructions"
}
```
