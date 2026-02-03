# Facebook Post Drafting

## Overview

This workflow generates Facebook posts from approved ideas, optimized for the platform's community-focused, shareable format.

## Platform Characteristics

| Attribute | Value |
|-----------|-------|
| Character Limit | 63,206 characters |
| Optimal Length | 40-80 for engagement, 250-500 for value |
| Hashtag Use | Minimal (1-2 max, often none) |
| First Line Visibility | ~477 characters before "See more" |
| Best Formats | Stories, questions, behind-the-scenes, valuable insights |

## Content Structure

### Hook (First Line)
Facebook shows more text than other platforms, but the hook still matters.
- Start with relatable statement or question
- Create emotional connection
- Invite readers into a story

### Body
- Conversational tone
- Personal stories perform well
- Clear value or emotional payoff
- Medium-length paragraphs OK

### Call-to-Action
- Ask for opinions
- Encourage shares ("Know someone who...?")
- Request stories ("Tell me about...")
- Drive meaningful comments

## Formatting Guidelines

1. **Tone**: More conversational than LinkedIn
2. **Paragraphs**: Can be longer than Instagram/LinkedIn
3. **Hashtags**: Use sparingly or not at all
4. **Links**: Posts with links get less reach; put in comments if possible
5. **Emojis**: Use naturally, not excessively

## Voice Adaptation

Facebook posts should feel:
- Conversational and friendly
- Community-oriented
- Emotionally engaging
- Share-worthy

## Prompt Template

```
You are writing a Facebook post based on the following idea.

IDEA:
Title: {title}
Hook: {hook}
Key Points: {outline}
CTA: {suggested_cta}

VOICE PROFILE:
{voice_profile}

PLATFORM GUIDELINES:
- Optimal length 250-500 characters for engagement
- First ~477 characters visible before "See more"
- Conversational, community-focused tone
- Minimal or no hashtags
- Personal stories and questions perform well
- End with engagement-driving question or share prompt

FORMAT:
- Relatable opening
- Story or valuable insight
- Clear takeaway
- Community-engaging CTA

Generate the post and respond with JSON:
{
  "content": "The full post text",
  "hashtags": [],
  "suggested_image_prompt": "Optional: description of ideal visual"
}
```

## Example Output

```
Can we talk about something for a second?

I used to think I had to have it all figured out before I could share anything online.

Turns out that's exactly backwards.

The posts that get the most engagement? They're the ones where I share the messy middle. The struggles. The things I'm still learning.

People don't connect with perfection. They connect with progress.

So here's my challenge for you this week: Share something you're working on BEFORE it's done. Before it's polished. Before you feel "ready."

You might be surprised what happens.

What's something you've been holding back from sharing? I'd love to hear 👇
```

## Post Types

### Story Posts
- Personal narrative format
- Beginning, middle, end
- Clear lesson or insight
- Emotional connection

### Question Posts
- Open-ended questions
- Encourage community discussion
- Build engagement and reach

### Value Posts
- Tips or insights
- Practical takeaways
- Share-worthy content

### Behind-the-Scenes
- Process revelations
- Work in progress
- Humanizing content

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
  "platform": "facebook",
  "additional_context": "Optional extra instructions"
}
```

## Facebook-Specific Considerations

1. **Groups vs Pages**: Content style may vary
2. **Sharability**: Think "would someone want to tag a friend?"
3. **Comments**: Facebook rewards meaningful comment threads
4. **Timing**: Evening posts often perform better
5. **Native Content**: Avoid external links when possible
