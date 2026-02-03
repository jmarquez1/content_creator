'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PostCard } from '@/components/posts/post-card';
import { GeneratePostModal } from '@/components/posts/generate-post-modal';
import { cn } from '@/lib/utils';
import type { PostWithIdea, PostStatus, Post } from '@/types/posts';
import type { Idea } from '@/types/ideas';

const COLUMNS: { id: PostStatus; title: string }[] = [
  { id: 'draft', title: 'Draft' },
  { id: 'review', title: 'In Review' },
  { id: 'approved', title: 'Approved' },
  { id: 'published', title: 'Published' },
];

const columnColors: Record<PostStatus, { bg: string; border: string; badge: string; badgeText: string }> = {
  draft: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100', badgeText: 'text-slate-600' },
  review: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100', badgeText: 'text-amber-600' },
  approved: { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100', badgeText: 'text-teal-600' },
  published: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100', badgeText: 'text-violet-600' },
  archived: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100', badgeText: 'text-gray-600' },
};

function DroppableColumn({
  id,
  title,
  children,
  count,
}: {
  id: PostStatus;
  title: string;
  children: React.ReactNode;
  count: number;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const colors = columnColors[id];

  return (
    <div className={cn(
      'flex h-full w-80 flex-shrink-0 flex-col rounded-2xl border-2 transition-all',
      colors.bg,
      colors.border,
      isOver && 'ring-2 ring-[var(--color-primary)] ring-offset-2'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]/50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
          <span className={cn(
            'px-2.5 py-1 text-xs font-semibold rounded-full',
            colors.badge,
            colors.badgeText
          )}>
            {count}
          </span>
        </div>
        <button className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-3 overflow-y-auto p-3 transition-colors',
          isOver && 'bg-white/50'
        )}
      >
        {children}
        {count === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted-foreground)]">
            <div className="text-center">
              <p className="font-medium">No posts</p>
              <p className="text-xs">Drop posts here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Record<PostStatus, PostWithIdea[]>>({
    draft: [],
    review: [],
    approved: [],
    published: [],
    archived: [],
  });
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<PostWithIdea | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?grouped=true');
      const result = await response.json();
      if (result.success) {
        setPosts(result.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas');
      const result = await response.json();
      if (result.success) {
        const readyIdeas = result.data.ideas.filter(
          (idea: Idea) => idea.status === 'ready' || idea.status === 'developing'
        );
        setIdeas(readyIdeas);
      }
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchIdeas();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const post = active.data.current?.post as PostWithIdea;
    setActivePost(post);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePost(null);

    if (!over) return;

    const postId = active.id as string;
    const newStatus = over.id as PostStatus;
    const post = active.data.current?.post as PostWithIdea;

    if (post.status === newStatus) return;

    setPosts((prev) => {
      const oldStatus = post.status as PostStatus;
      const newPosts = { ...prev };
      newPosts[oldStatus] = newPosts[oldStatus].filter((p) => p.id !== postId);
      newPosts[newStatus] = [...newPosts[newStatus], { ...post, status: newStatus }];
      return newPosts;
    });

    try {
      const updateData: { status: PostStatus; published_at?: string } = { status: newStatus };

      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Failed to update post status:', error);
      fetchPosts();
    }
  };

  const handlePostGenerated = (post: Post) => {
    setPosts((prev) => ({
      ...prev,
      draft: [post as PostWithIdea, ...prev.draft],
    }));
    setIsModalOpen(false);
  };

  const handlePostClick = (post: PostWithIdea) => {
    router.push(`/posts/${post.id}`);
  };

  const totalPosts = Object.values(posts).flat().length;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)]">Total Posts</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">--</p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <p className="text-[var(--color-muted-foreground)]">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)]">Total Posts</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">{totalPosts}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--color-border)]" />
          <div className="flex gap-2">
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[var(--color-border)]">
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{col.title}</span>
                <span className="text-xs font-bold text-[var(--color-foreground)]">
                  {posts[col.id]?.length || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Generate Post
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-hidden -mx-6 -mb-6">
        <div className="h-full overflow-x-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full min-w-max">
              {COLUMNS.map((column) => (
                <DroppableColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  count={posts[column.id]?.length || 0}
                >
                  <SortableContext
                    items={posts[column.id]?.map((p) => p.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    {posts[column.id]?.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onClick={() => handlePostClick(post)}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              ))}
            </div>

            <DragOverlay>
              {activePost && (
                <div className="opacity-80">
                  <PostCard post={activePost} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <GeneratePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ideas={ideas}
        onPostGenerated={handlePostGenerated}
      />
    </div>
  );
}
