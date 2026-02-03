'use client';

import { Calendar, Tag, Youtube, TrendingUp, FileText, Edit3 } from 'lucide-react';
import { KanbanCard } from '@/components/kanban/card';
import { cn } from '@/lib/utils';
import type { Idea } from '@/types/ideas';

interface IdeaCardProps {
  idea: Idea;
}

const sourceTypeConfig: Record<string, { label: string; icon: typeof Youtube; color: string }> = {
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-500 bg-red-50' },
  topic: { label: 'Trends', icon: TrendingUp, color: 'text-blue-500 bg-blue-50' },
  document: { label: 'Document', icon: FileText, color: 'text-green-500 bg-green-50' },
  plain: { label: 'Manual', icon: Edit3, color: 'text-gray-500 bg-gray-50' },
};

export function IdeaCard({ idea }: IdeaCardProps) {
  const sourceConfig = sourceTypeConfig[idea.source_type || 'plain'] || sourceTypeConfig.plain;
  const SourceIcon = sourceConfig.icon;

  return (
    <KanbanCard>
      <h4 className="font-semibold text-[var(--color-foreground)] leading-tight line-clamp-2">
        {idea.title}
      </h4>
      {idea.hook && (
        <p className="line-clamp-2 text-sm text-[var(--color-muted-foreground)] mt-1">
          {idea.hook}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
        {idea.source_type && (
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
            sourceConfig.color
          )}>
            <SourceIcon className="w-3 h-3" />
            {sourceConfig.label}
          </span>
        )}
        {idea.tags && idea.tags.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]">
            <Tag className="h-3 w-3" />
            {idea.tags.length}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
          <Calendar className="h-3 w-3" />
          {new Date(idea.created_at).toLocaleDateString()}
        </span>
      </div>
    </KanbanCard>
  );
}
