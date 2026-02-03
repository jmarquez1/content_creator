import type { SupabaseClient } from '@supabase/supabase-js';
import type { Post, CreatePostInput, UpdatePostInput, PostWithIdea, PostStatus, PostContent } from '@/types/posts';
import type { Json } from '@/types/database';

export interface PostVariant {
  id: string;
  content: PostContent;
  variation_type: string;
  variation_description: string;
  created_at: string;
}

export async function createPost(
  supabase: SupabaseClient<any>,
  userId: string,
  input: CreatePostInput
): Promise<Post> {
  // Store content as JSON object with text and metadata
  const contentJson: PostContent = {
    text: input.content,
    hashtags: input.metadata?.hashtags as string[] | undefined,
    metadata: input.metadata,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      idea_id: input.idea_id,
      platform: input.platform,
      content: contentJson as unknown as Json,
      status: input.status || 'draft',
      published_at: input.published_at,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPost(
  supabase: SupabaseClient<any>,
  userId: string,
  postId: string
): Promise<PostWithIdea | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      idea:ideas(id, title, hook)
    `)
    .eq('id', postId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getPosts(
  supabase: SupabaseClient<any>,
  userId: string,
  filters?: {
    status?: PostStatus;
    platform?: string;
    idea_id?: string;
  }
): Promise<PostWithIdea[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      idea:ideas(id, title, hook)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.platform) {
    query = query.eq('platform', filters.platform);
  }

  if (filters?.idea_id) {
    query = query.eq('idea_id', filters.idea_id);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getPostsByStatus(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<Record<PostStatus, PostWithIdea[]>> {
  const posts = await getPosts(supabase, userId);

  const grouped: Record<PostStatus, PostWithIdea[]> = {
    draft: [],
    review: [],
    approved: [],
    published: [],
    archived: [],
  };

  for (const post of posts) {
    const status = post.status as PostStatus;
    if (grouped[status]) {
      grouped[status].push(post);
    }
  }

  return grouped;
}

export async function updatePost(
  supabase: SupabaseClient<any>,
  userId: string,
  postId: string,
  input: UpdatePostInput
): Promise<Post> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.content !== undefined) {
    // Get current post to preserve metadata
    const current = await getPost(supabase, userId, postId);
    const currentContent = current?.content as PostContent | null;

    updateData.content = {
      text: input.content,
      hashtags: currentContent?.hashtags,
      metadata: input.metadata || currentContent?.metadata,
    } as unknown as Json;
  }

  if (input.status !== undefined) updateData.status = input.status;
  if (input.published_at !== undefined) updateData.published_at = input.published_at;

  const { data, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', postId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(
  supabase: SupabaseClient<any>,
  userId: string,
  postId: string
): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function addVariant(
  supabase: SupabaseClient<any>,
  userId: string,
  postId: string,
  variant: Omit<PostVariant, 'id' | 'created_at'>
): Promise<Post> {
  // Get current post
  const post = await getPost(supabase, userId, postId);
  if (!post) throw new Error('Post not found');

  // Get existing variants or initialize empty array
  const existingVariants = (post.variants as PostVariant[] | null) || [];

  // Add new variant
  const newVariant: PostVariant = {
    id: crypto.randomUUID(),
    content: variant.content,
    variation_type: variant.variation_type,
    variation_description: variant.variation_description,
    created_at: new Date().toISOString(),
  };

  const updatedVariants = [...existingVariants, newVariant];

  // Update post with new variants array
  const { data, error } = await supabase
    .from('posts')
    .update({
      variants: updatedVariants as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPostVariants(
  supabase: SupabaseClient<any>,
  userId: string,
  postId: string
): Promise<PostVariant[]> {
  const post = await getPost(supabase, userId, postId);
  if (!post) return [];

  return (post.variants as PostVariant[] | null) || [];
}

export async function deleteVariant(
  supabase: SupabaseClient<any>,
  userId: string,
  postId: string,
  variantId: string
): Promise<Post> {
  const post = await getPost(supabase, userId, postId);
  if (!post) throw new Error('Post not found');

  const existingVariants = (post.variants as PostVariant[] | null) || [];
  const updatedVariants = existingVariants.filter((v) => v.id !== variantId);

  const { data, error } = await supabase
    .from('posts')
    .update({
      variants: updatedVariants as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markAsPublished(
  supabase: SupabaseClient<any>,
  userId: string,
  postId: string
): Promise<Post> {
  return updatePost(supabase, userId, postId, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
}

// Helper to get content text from a post
export function getPostText(post: Post): string {
  const content = post.content as PostContent | null;
  return content?.text || '';
}
