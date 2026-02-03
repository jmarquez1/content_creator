# Trend Research

## Objective
Discover trending content across Reddit and YouTube for a given topic to inform ideation.

## Inputs
- topic: string (required) — search query for trend research
- sources: TrendSource[] (required) — ['reddit', 'youtube'] or subset
- user_id: string (required) — authenticated user ID

## Tools Required
- tools/fetch/reddit-trends.ts
- tools/fetch/youtube-trends.ts
- tools/db/trends.ts

## Steps
1. Validate inputs
   - topic is required and non-empty
   - sources must contain at least one valid source
2. Create trend_run record with status 'pending'
3. Update status to 'running'
4. For each source in parallel:
   - Reddit:
     a. Authenticate with Reddit API (client credentials)
     b. Search for posts matching topic
     c. Calculate engagement_score (upvotes + comments weighted)
     d. Calculate recency_score (based on post age)
   - YouTube:
     a. Search YouTube Data API for videos
     b. Fetch video statistics
     c. Calculate engagement_score (views + likes + comments weighted)
     d. Calculate recency_score (based on publish date)
5. Combine results from all sources
6. Sort by combined score (engagement + recency / 2)
7. Assign combined_rank (1 = highest)
8. Store all items in trend_items table
9. Update trend_run status to 'completed'
10. Return trend_run_id and item count

## Outputs
- trend_run_id: string
- items_count: number
- errors: string[] (if partial failure)

## Scoring Algorithm

### Engagement Score (0-100)
**Reddit:**
- Score weight: 70%
- Comments weight: 30%
- Use log scale: `min(100, log10(value + 1) * factor)`

**YouTube:**
- View score (reach): 50%
- Engagement rate (likes + comments / views): 50%
- Use log scale for views

### Recency Score (0-100)
| Age | Score |
|-----|-------|
| < 6 hours | 100 |
| < 24 hours | 90 |
| < 48 hours | 75 |
| < 72 hours | 60 |
| < 1 week | 40 |
| > 1 week | 20 |

### Combined Rank
`combinedScore = (engagement + recency) / 2`
Sort descending, assign rank 1-N

## Edge Cases
- Reddit API rate limited: Log warning, continue with YouTube results
- YouTube API quota exceeded: Log warning, continue with Reddit results
- No results found: Return empty items array, not an error
- Both sources fail: Return error status on trend_run

## Failure Handling
- Partial failure: Complete with available results, include errors array
- Total failure: Set trend_run status to 'failed'
- API credential missing: Return clear error message

## API Configuration

### Reddit API
1. Create app at https://www.reddit.com/prefs/apps
2. Select "script" type
3. Set redirect URI (not used for client credentials)
4. Copy client ID and secret
5. Add to .env.local:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   ```

### YouTube Data API
1. Go to https://console.cloud.google.com/
2. Create/select project
3. Enable "YouTube Data API v3"
4. Create API key (restrict to YouTube Data API)
5. Add to .env.local:
   ```
   YOUTUBE_API_KEY=your_api_key
   ```
