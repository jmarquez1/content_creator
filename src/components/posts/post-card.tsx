'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Linkedin, Instagram, Facebook, Clock, CheckCircle, GripVertical, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostWithIdea, PostContent } from '@/types/posts';

interface PostCardProps {
  post: PostWithIdea;
  onClick?: () => void;
}

const platformConfig: Record<string, { icon: typeof Linkedin; color: string; bg: string }> = {
  linkedin: { icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50' },
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  facebook: { icon: Facebook, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export function PostCard({ post, onClick }: PostCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id,
    data: { post },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const content = post.content as PostContent | null;
  const text = content?.text || '';
  const truncatedText = text.length > 120 ? text.substring(0, 120) + '...' : text;
  const variantsCount = Array.isArray(post.variants) ? post.variants.length : 0;
  const platform = platformConfig[post.platform] || platformConfig.linkedin;
  const PlatformIcon = platform.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-xl bg-white border border-[var(--color-border)] p-4 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-primary)]/30',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-[var(--color-primary)]'
      )}
    >
      <div className="flex gap-3">
        <button
          className="flex-shrink-0 cursor-grab touch-none text-[var(--color-muted-foreground)] opacity-0 transition-all hover:text-[var(--color-foreground)] group-hover:opacity-100 -ml-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                platform.bg
              )}>
                <PlatformIcon className={cn('w-4 h-4', platform.color)} />
              </span>
              <span className="text-sm font-medium text-[var(--color-foreground)] capitalize">
                {post.platform}
              </span>
            </div>
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)] transition-colors opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Content preview */}
          <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-3 leading-relaxed">
            {truncatedText}
          </p>

          {/* Source idea */}
          {post.idea && (
            <p className="mt-2 text-xs text-[var(--color-primary)] font-medium truncate">
              From: {post.idea.title}
            </p>
          )}

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {variantsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]">
                  <Copy className="w-3 h-3" />
                  {variantsCount}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
              {post.published_at ? (
                <>
                  <CheckCircle className="h-3 w-3 text-[var(--color-success)]" />
                  <span>Published</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
