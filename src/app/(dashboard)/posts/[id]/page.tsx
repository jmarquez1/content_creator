'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, CheckCircle, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PostEditor } from '@/components/posts/post-editor';
import type { PostWithIdea, PostStatus } from '@/types/posts';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500' },
  review: { label: 'In Review', color: 'bg-yellow-500' },
  approved: { label: 'Approved', color: 'bg-green-500' },
  published: { label: 'Published', color: 'bg-blue-500' },
  archived: { label: 'Archived', color: 'bg-gray-400' },
};

export default function PostDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<PostWithIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}?variants=true`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch post');
      }

      setPost(result.data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleSave = async (content: string) => {
    if (!post) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to save post');
      }

      setPost(result.data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateVariant = async (variationType: string) => {
    if (!post) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/generate/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          variation_type: variationType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to generate variant');
      }

      setPost(result.data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: PostStatus) => {
    if (!post) return;

    setIsSaving(true);
    try {
      const updateData: { status: PostStatus; published_at?: string } = { status: newStatus };

      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update status');
      }

      setPost(result.data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Failed to delete post');
      }

      router.push('/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-destructive">{error || 'Post not found'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/posts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[post.status as PostStatus];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold capitalize">{post.platform} Post</h1>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
            {post.idea && (
              <p className="text-sm text-muted-foreground">From: {post.idea.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.status !== 'published' && post.status !== 'archived' && (
            <>
              {post.status === 'draft' && (
                <Button variant="outline" onClick={() => handleStatusChange('review')}>
                  Submit for Review
                </Button>
              )}
              {post.status === 'review' && (
                <Button variant="outline" onClick={() => handleStatusChange('approved')}>
                  Approve
                </Button>
              )}
              {post.status === 'approved' && (
                <Button onClick={() => handleStatusChange('published')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Published
                </Button>
              )}
            </>
          )}
          {post.status !== 'archived' && (
            <Button variant="ghost" onClick={() => handleStatusChange('archived')}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <PostEditor
          post={post}
          onSave={handleSave}
          onGenerateVariant={handleGenerateVariant}
          onDelete={handleDelete}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
