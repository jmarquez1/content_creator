'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KanbanCardProps {
  id: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function SortableCard({ id, children, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        <div className="flex-1 cursor-pointer min-w-0" onClick={onClick}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function KanbanCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}
