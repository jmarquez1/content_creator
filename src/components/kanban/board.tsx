'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './column';
import { KanbanCard, type KanbanCardProps } from './card';

export interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
}

interface KanbanBoardProps<T extends { id: string }> {
  columns: KanbanColumn<T>[];
  onDragEnd: (itemId: string, sourceColumn: string, destinationColumn: string) => void;
  renderCard: (item: T) => React.ReactNode;
  onCardClick?: (item: T) => void;
}

export function KanbanBoard<T extends { id: string }>({
  columns,
  onDragEnd,
  renderCard,
  onCardClick,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    for (const column of columns) {
      if (column.id === id) return column.id;
      if (column.items.find((item) => item.id === id)) return column.id;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    for (const column of columns) {
      const item = column.items.find((i) => i.id === active.id);
      if (item) {
        setActiveItem(item);
        break;
      }
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Can be used for visual feedback during drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveItem(null);
      return;
    }

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string) || (over.id as string);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      onDragEnd(active.id as string, activeContainer, overContainer);
    }

    setActiveId(null);
    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            items={column.items}
            renderCard={renderCard}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId && activeItem ? (
          <div className="opacity-80">{renderCard(activeItem)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export type { KanbanCardProps };
