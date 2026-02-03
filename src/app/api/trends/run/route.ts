import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import {
  createTrendRun,
  createTrendItems,
  updateTrendRunStatus,
  type CreateTrendItemInput,
} from '@/tools/db/trends';
import {
  fetchRedditTrends,
  calculateRedditEngagementScore,
  calculateRecencyScore as calculateRedditRecency,
} from '@/tools/fetch/reddit-trends';
import {
  fetchYouTubeTrends,
  calculateYouTubeEngagementScore,
  calculateYouTubeRecencyScore,
} from '@/tools/fetch/youtube-trends';
import type { TrendSource } from '@/types/database';

interface RunTrendRequest {
  topic: string;
  sources: TrendSource[];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        createErrorResponse({ code: 'UNAUTHORIZED', message: 'Not authenticated' }),
        { status: 401 }
      );
    }

    const body: RunTrendRequest = await request.json();

    if (!body.topic || !body.sources || body.sources.length === 0) {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Topic and at least one source are required',
        }),
        { status: 400 }
      );
    }

    // Create trend run
    const trendRun = await createTrendRun(supabase, user.id, {
      topic: body.topic,
      sources: body.sources,
    });

    // Update status to running
    await updateTrendRunStatus(supabase, trendRun.id, 'running');

    const allItems: CreateTrendItemInput[] = [];
    const errors: string[] = [];

    // Fetch from Reddit
    if (body.sources.includes('reddit')) {
      try {
        const redditResults = await fetchRedditTrends(body.topic);

        const redditItems: CreateTrendItemInput[] = redditResults.posts.map((post, index) => {
          const engagementScore = calculateRedditEngagementScore(post);
          const recencyScore = calculateRedditRecency(post.createdUtc);
          const combinedRank = index + 1; // Will be recalculated after combining all sources

          return {
            trend_run_id: trendRun.id,
            source: 'reddit' as TrendSource,
            title: post.title,
            url: post.permalink,
            engagement_score: engagementScore,
            recency_score: recencyScore,
            combined_rank: combinedRank,
            raw_data: {
              id: post.id,
              score: post.score,
              numComments: post.numComments,
              subreddit: post.subreddit,
            },
          };
        });

        allItems.push(...redditItems);
      } catch (error) {
        console.error('Reddit fetch error:', error);
        errors.push(`Reddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Fetch from YouTube
    if (body.sources.includes('youtube')) {
      try {
        const youtubeResults = await fetchYouTubeTrends(body.topic);

        const youtubeItems: CreateTrendItemInput[] = youtubeResults.videos.map((video, index) => {
          const engagementScore = calculateYouTubeEngagementScore(video);
          const recencyScore = calculateYouTubeRecencyScore(video.publishedAt);
          const combinedRank = index + 1;

          return {
            trend_run_id: trendRun.id,
            source: 'youtube' as TrendSource,
            title: video.title,
            url: video.url,
            engagement_score: engagementScore,
            recency_score: recencyScore,
            combined_rank: combinedRank,
            raw_data: {
              id: video.id,
              channelTitle: video.channelTitle,
              viewCount: video.viewCount,
              likeCount: video.likeCount,
              commentCount: video.commentCount,
            },
          };
        });

        allItems.push(...youtubeItems);
      } catch (error) {
        console.error('YouTube fetch error:', error);
        errors.push(`YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Sort by combined score and assign final ranks
    allItems.sort((a, b) => {
      const scoreA = ((a.engagement_score || 0) + (a.recency_score || 0)) / 2;
      const scoreB = ((b.engagement_score || 0) + (b.recency_score || 0)) / 2;
      return scoreB - scoreA;
    });

    allItems.forEach((item, index) => {
      item.combined_rank = index + 1;
    });

    // Save items
    if (allItems.length > 0) {
      await createTrendItems(supabase, allItems);
    }

    // Update status to completed
    await updateTrendRunStatus(supabase, trendRun.id, 'completed', new Date().toISOString());

    return NextResponse.json(
      createSuccessResponse({
        trend_run_id: trendRun.id,
        items_count: allItems.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error running trend research:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
