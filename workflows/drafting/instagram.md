# Instagram Post Drafting

## Overview

This workflow generates Instagram posts from approved ideas, optimized for the platform's visual-first, engagement-driven format.

## Platform Characteristics

| Attribute | Value |
|-----------|-------|
| Caption Limit | 2,200 characters |
| Optimal Length | 150-300 for engagement, up to 2,200 for value posts |
| Hashtag Limit | 30 max, 5-15 recommended |
| First Line Visibility | ~125 characters before "...more" |
| Best Formats | Carousel summaries, single images, Reels captions |

## Content Structure

### Hook (First Line)
The first ~125 characters appear before truncation - critical for engagement.
- Start strong with value proposition or curiosity
- Can include emoji for visual appeal
- Avoid hashtags in hook area

### Body
- Short, punchy sentences
- Use emojis strategically (not excessively)
- Line breaks for readability
- Value-driven content

### Call-to-Action
- Save-worthy: "Save this for later"
- Share-worthy: "Tag someone who needs this"
- Comment-driving: Ask specific questions
- Profile-driving: "Link in bio"

## Formatting Guidelines

1. **Line Breaks**: Use blank lines between paragraphs
2. **Emojis**: Use as visual bullets or emphasis (max 3-5 per post)
3. **Hashtags**: Place in first comment OR at end of caption
4. **Length**: Match to content type (short for engagement, long for value)

## Voice Adaptation

Instagram posts should feel:
- Authentic and relatable
- Visually-minded (think about paired imagery)
- Community-focused
- Action-oriented

## Prompt Template

```
You are writing an Instagram caption based on the following idea.

IDEA:
Title: {title}
Hook: {hook}
Key Points: {outline}
CTA: {suggested_cta}

VOICE PROFILE:
{voice_profile}

PLATFORM GUIDELINES:
- Maximum 2,200 characters (aim for 150-300 or 500-1000 for value posts)
- First ~125 characters appear before "...more" - make them count
- Use emojis strategically (3-5 max)
- Include 5-15 relevant hashtags
- End with engagement-driving CTA

FORMAT:
- Hook (first line - punchy, visible)
- Body (value-packed, easy to scan)
- CTA (save/share/comment driver)
- Hashtags (can be separated by line breaks)

Generate the caption and respond with JSON:
{
  "content": "The full caption text (without hashtags)",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "suggested_image_prompt": "Description of ideal visual/carousel"
}
```

## Example Output

```
Stop scrolling. This will change how you create content 👇

Most creators focus on quantity over quality.

Here's what actually works:

📌 One piece of great content > 7 mediocre posts
📌 Engagement hours after posting matters more than timing
📌 Saves and shares beat likes every time

The algorithm rewards value, not volume.

Want proof? My top performing post took 4 hours to create. Posted once.

It still gets saves 6 months later.

Save this and start creating intentionally ✨

.
.
.
#contentcreator #instagramtips #socialmediamarketing #contentstrategy #creatoreconomy
```

## Post Types

### Carousel Posts
- First slide = hook
- 7-10 slides optimal
- Each slide = one clear point
- Last slide = CTA + handle

### Single Image Posts
- Strong hook in first line
- Value in caption body
- Image supports but doesn't contain all info

### Reel Captions
- Keep shorter (100-200 chars)
- Add context to video
- Strong CTA for engagement

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
│ Generate Caption│
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
  "platform": "instagram",
  "additional_context": "Optional: carousel/reel/single image preference"
}
```
