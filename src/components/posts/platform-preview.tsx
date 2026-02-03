'use client';

import { Linkedin, Instagram, Facebook, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Platform, PostContent } from '@/types/posts';

interface PlatformPreviewProps {
  platform: Platform;
  content: PostContent;
  authorName?: string;
}

const MAX_LENGTHS: Record<Platform, number> = {
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
};

export function PlatformPreview({ platform, content, authorName = 'Your Name' }: PlatformPreviewProps) {
  const text = content.text || '';
  const hashtags = content.hashtags || [];
  const maxLength = MAX_LENGTHS[platform];
  const isOverLimit = text.length > maxLength;

  return (
    <Card className="overflow-hidden">
      {/* Platform Header */}
      <div className="flex items-center gap-3 border-b p-3">
        {platform === 'linkedin' && (
          <Linkedin className="h-5 w-5 text-blue-500" />
        )}
        {platform === 'instagram' && (
          <Instagram className="h-5 w-5 text-pink-500" />
        )}
        {platform === 'facebook' && (
          <Facebook className="h-5 w-5 text-indigo-500" />
        )}
        <span className="text-sm font-medium capitalize">{platform} Preview</span>
        <span className={`ml-auto text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {text.length}/{maxLength}
        </span>
      </div>

      {/* Post Preview */}
      <div className="p-4">
        {/* Author Section */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{authorName}</p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </div>

        {/* Content */}
        <div className="whitespace-pre-wrap text-sm">
          {text}
        </div>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {hashtags.map((tag, index) => (
              <span key={index} className="text-sm text-primary">
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        {/* Platform-specific engagement preview */}
        <div className="mt-4 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
          {platform === 'linkedin' && (
            <>
              <span>Like</span>
              <span>Comment</span>
              <span>Repost</span>
              <span>Send</span>
            </>
          )}
          {platform === 'instagram' && (
            <>
              <span>♡ Like</span>
              <span>💬 Comment</span>
              <span>↗ Share</span>
            </>
          )}
          {platform === 'facebook' && (
            <>
              <span>👍 Like</span>
              <span>💬 Comment</span>
              <span>↪ Share</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
