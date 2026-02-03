'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface YouTubeInputProps {
  onSubmit: (data: { youtube_url: string; transcript?: string }) => void;
  isLoading?: boolean;
  transcriptError?: string | null;
}

export function YouTubeInput({ onSubmit, isLoading, transcriptError }: YouTubeInputProps) {
  const [url, setUrl] = useState('');
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) return;

    onSubmit({
      youtube_url: url,
      transcript: showManualTranscript ? manualTranscript : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="youtube-url">YouTube URL</Label>
        <Input
          id="youtube-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          Paste a YouTube video URL to extract the transcript
        </p>
      </div>

      {transcriptError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Could not fetch transcript automatically
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{transcriptError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowManualTranscript(true)}
              >
                Enter transcript manually
              </Button>
            </div>
          </div>
        </div>
      )}

      {showManualTranscript && (
        <div className="space-y-2">
          <Label htmlFor="manual-transcript">Manual Transcript</Label>
          <Textarea
            id="manual-transcript"
            value={manualTranscript}
            onChange={(e) => setManualTranscript(e.target.value)}
            placeholder="Paste the video transcript here..."
            rows={8}
          />
          <p className="text-xs text-muted-foreground">
            You can get the transcript from YouTube by clicking ... &gt; Show transcript
          </p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!url.trim() || isLoading}
        isLoading={isLoading}
      >
        {showManualTranscript ? 'Generate from Transcript' : 'Fetch Transcript & Generate'}
      </Button>
    </div>
  );
}
