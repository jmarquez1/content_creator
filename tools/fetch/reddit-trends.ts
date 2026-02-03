export interface RedditPost {
  id: string;
  title: string;
  url: string;
  score: number;
  numComments: number;
  createdUtc: number;
  subreddit: string;
  selftext?: string;
  permalink: string;
}

export interface RedditTrendResult {
  posts: RedditPost[];
  query: string;
}

async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ContentCreator/1.0',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Reddit API');
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchRedditTrends(
  query: string,
  options?: {
    limit?: number;
    timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  }
): Promise<RedditTrendResult> {
  const accessToken = await getRedditAccessToken();

  const limit = options?.limit ?? 25;
  const timeFilter = options?.timeFilter ?? 'week';

  const searchUrl = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=relevance&t=${timeFilter}&limit=${limit}&type=link`;

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'ContentCreator/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data = await response.json();

  const posts: RedditPost[] = data.data.children.map((child: { data: Record<string, unknown> }) => ({
    id: child.data.id as string,
    title: child.data.title as string,
    url: child.data.url as string,
    score: child.data.score as number,
    numComments: child.data.num_comments as number,
    createdUtc: child.data.created_utc as number,
    subreddit: child.data.subreddit as string,
    selftext: child.data.selftext as string | undefined,
    permalink: `https://reddit.com${child.data.permalink}`,
  }));

  return { posts, query };
}

export function calculateRedditEngagementScore(post: RedditPost): number {
  // Normalize score and comments to a 0-100 scale
  const scoreWeight = 0.7;
  const commentsWeight = 0.3;

  // Log scale to handle viral posts
  const normalizedScore = Math.min(100, Math.log10(post.score + 1) * 25);
  const normalizedComments = Math.min(100, Math.log10(post.numComments + 1) * 30);

  return Math.round(normalizedScore * scoreWeight + normalizedComments * commentsWeight);
}

export function calculateRecencyScore(createdUtc: number): number {
  const now = Date.now() / 1000;
  const ageInHours = (now - createdUtc) / 3600;

  // Score from 100 (brand new) to 0 (week old or more)
  if (ageInHours < 6) return 100;
  if (ageInHours < 24) return 90;
  if (ageInHours < 48) return 75;
  if (ageInHours < 72) return 60;
  if (ageInHours < 168) return 40; // 1 week
  return 20;
}
