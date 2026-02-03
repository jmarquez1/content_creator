export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  url: string;
}

export interface YouTubeTrendResult {
  videos: YouTubeVideo[];
  query: string;
}

export async function fetchYouTubeTrends(
  query: string,
  options?: {
    maxResults?: number;
    publishedAfter?: string; // ISO 8601 date
  }
): Promise<YouTubeTrendResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  const maxResults = options?.maxResults ?? 25;

  // Default to last week if no date specified
  const publishedAfter =
    options?.publishedAfter ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Search for videos
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('order', 'relevance');
  searchUrl.searchParams.set('maxResults', maxResults.toString());
  searchUrl.searchParams.set('publishedAfter', publishedAfter);
  searchUrl.searchParams.set('key', apiKey);

  const searchResponse = await fetch(searchUrl.toString());

  if (!searchResponse.ok) {
    const error = await searchResponse.json();
    throw new Error(`YouTube API error: ${error.error?.message || searchResponse.status}`);
  }

  const searchData = await searchResponse.json();

  if (!searchData.items || searchData.items.length === 0) {
    return { videos: [], query };
  }

  // Get video IDs
  const videoIds = searchData.items.map(
    (item: { id: { videoId: string } }) => item.id.videoId
  );

  // Fetch video statistics
  const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  statsUrl.searchParams.set('part', 'snippet,statistics');
  statsUrl.searchParams.set('id', videoIds.join(','));
  statsUrl.searchParams.set('key', apiKey);

  const statsResponse = await fetch(statsUrl.toString());

  if (!statsResponse.ok) {
    throw new Error(`YouTube API error fetching stats: ${statsResponse.status}`);
  }

  const statsData = await statsResponse.json();

  const videos: YouTubeVideo[] = statsData.items.map(
    (item: {
      id: string;
      snippet: {
        title: string;
        description: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: { high?: { url: string } };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      likeCount: parseInt(item.statistics.likeCount || '0', 10),
      commentCount: parseInt(item.statistics.commentCount || '0', 10),
      thumbnailUrl: item.snippet.thumbnails.high?.url || '',
      url: `https://www.youtube.com/watch?v=${item.id}`,
    })
  );

  return { videos, query };
}

export function calculateYouTubeEngagementScore(video: YouTubeVideo): number {
  // Engagement rate calculation
  const totalEngagements = video.likeCount + video.commentCount;
  const engagementRate = video.viewCount > 0 ? (totalEngagements / video.viewCount) * 100 : 0;

  // Combine view count (reach) with engagement rate
  const viewScore = Math.min(100, Math.log10(video.viewCount + 1) * 15);
  const engagementScore = Math.min(100, engagementRate * 10);

  return Math.round(viewScore * 0.5 + engagementScore * 0.5);
}

export function calculateYouTubeRecencyScore(publishedAt: string): number {
  const published = new Date(publishedAt).getTime();
  const now = Date.now();
  const ageInHours = (now - published) / (1000 * 3600);

  if (ageInHours < 24) return 100;
  if (ageInHours < 48) return 90;
  if (ageInHours < 72) return 80;
  if (ageInHours < 168) return 60; // 1 week
  if (ageInHours < 336) return 40; // 2 weeks
  return 20;
}
