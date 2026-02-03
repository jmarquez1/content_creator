import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export interface TranscriptResult {
  videoId: string;
  title?: string;
  transcript: string;
  segments: TranscriptSegment[];
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export async function fetchYoutubeTranscript(url: string): Promise<TranscriptResult> {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error('Invalid YouTube URL or video ID');
  }

  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcript available for this video');
    }

    const segments: TranscriptSegment[] = transcriptData.map((segment) => ({
      text: segment.text,
      offset: segment.offset,
      duration: segment.duration,
    }));

    const transcript = segments.map((s) => s.text).join(' ');

    return {
      videoId,
      transcript,
      segments,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('disabled') || error.message.includes('not available')) {
        throw new Error(
          'Transcript not available for this video. It may be disabled or the video may be private.'
        );
      }
      throw error;
    }
    throw new Error('Failed to fetch transcript');
  }
}

export function truncateTranscript(transcript: string, maxLength: number = 10000): string {
  if (transcript.length <= maxLength) {
    return transcript;
  }

  const truncated = transcript.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastPeriod > maxLength * 0.8) {
    return truncated.slice(0, lastPeriod + 1) + '\n\n[Transcript truncated due to length]';
  }

  if (lastSpace > maxLength * 0.9) {
    return truncated.slice(0, lastSpace) + '...\n\n[Transcript truncated due to length]';
  }

  return truncated + '...\n\n[Transcript truncated due to length]';
}
