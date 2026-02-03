'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { SortableCard } from './card';
import { Plus } from 'lucide-react';

interface KanbanColumnProps<T extends { id: string }> {
  id: string;
  title: string;
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onCardClick?: (item: T) => void;
  color?: string;
}

const columnColors: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  inbox: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100',
    badgeText: 'text-slate-600',
  },
  developing: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-600',
  },
  ready: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-600',
  },
  archived: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100',
    badgeText: 'text-gray-600',
  },
  draft: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100',
    badgeText: 'text-slate-600',
  },
  review: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-600',
  },
  approved: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100',
    badgeText: 'text-teal-600',
  },
  published: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100',
    badgeText: 'text-violet-600',
  },
};

export function KanbanColumn<T extends { id: string }>({
  id,
  title,
  items,
  renderCard,
  onCardClick,
}: KanbanColumnProps<T>) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const colors = columnColors[id] || columnColors.inbox;

  return (
    <div className={cn(
      'flex h-full w-80 flex-shrink-0 flex-col rounded-2xl border-2 transition-all',
      colors.bg,
      colors.border,
      isOver && 'ring-2 ring-[var(--color-primary)] ring-offset-2'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]/50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
          <span className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded-full',
            colors.badge,
            colors.badgeText
          )}>
            {items.length}
          </span>
        </div>
        <button className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-3 overflow-y-auto p-3 transition-colors',
          isOver && 'bg-white/50'
        )}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableCard key={item.id} id={item.id} onClick={() => onCardClick?.(item)}>
              {renderCard(item)}
            </SortableCard>
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted-foreground)]">
            <div className="text-center">
              <p className="font-medium">No items</p>
              <p className="text-xs">Drop items here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
