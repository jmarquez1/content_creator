import type { Tables, InsertTables, UpdateTables, Json } from './database';

export type Post = Tables<'posts'>;
export type InsertPost = InsertTables<'posts'>;
export type UpdatePost = UpdateTables<'posts'>;

export type PostStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type Platform = 'linkedin' | 'instagram' | 'facebook';

export interface PostContent {
  text: string;
  hashtags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreatePostInput {
  idea_id: string;
  platform: Platform;
  content: string;
  status?: PostStatus;
  variant_of?: string;
  published_at?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePostInput {
  content?: string;
  status?: PostStatus;
  published_at?: string;
  metadata?: Record<string, unknown>;
}

export interface PostWithIdea extends Post {
  idea?: {
    id: string;
    title: string;
    hook: string | null;
  } | null;
}

export interface GeneratePostRequest {
  idea_id: string;
  platform: Platform;
  voice_profile_id?: string;
  additional_context?: string;
}

export interface GenerateVariantRequest {
  post_id: string;
  variation_type: 'tone' | 'length' | 'angle' | 'cta';
  variation_instruction?: string;
}
