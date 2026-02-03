export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type IdeaStatus = 'inbox' | 'developing' | 'ready' | 'archived';
export type PostStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type Platform = 'linkedin' | 'instagram' | 'facebook';
export type SourceType = 'youtube' | 'topic' | 'document' | 'plain';
export type TaskType = 'ideation' | 'trend_ideation' | 'drafting' | 'draft_linkedin' | 'draft_instagram' | 'draft_facebook' | 'rewriting' | 'repurposing';
export type AuditAction =
  | 'generate_idea'
  | 'generate_post'
  | 'generate_variants'
  | 'rewrite'
  | 'repurpose';
export type TrendSource = 'reddit' | 'youtube';

export interface Database {
  public: {
    Tables: {
      ideas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          hook: string | null;
          outline: Json | null;
          suggested_cta: string | null;
          status: IdeaStatus;
          tags: string[] | null;
          source_type: SourceType | null;
          source_reference_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          hook?: string | null;
          outline?: Json | null;
          suggested_cta?: string | null;
          status?: IdeaStatus;
          tags?: string[] | null;
          source_type?: SourceType | null;
          source_reference_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          hook?: string | null;
          outline?: Json | null;
          suggested_cta?: string | null;
          status?: IdeaStatus;
          tags?: string[] | null;
          source_type?: SourceType | null;
          source_reference_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          idea_id: string | null;
          platform: Platform;
          content: Json;
          variants: Json | null;
          status: PostStatus;
          published_at: string | null;
          audit_log_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          idea_id?: string | null;
          platform: Platform;
          content: Json;
          variants?: Json | null;
          status?: PostStatus;
          published_at?: string | null;
          audit_log_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          idea_id?: string | null;
          platform?: Platform;
          content?: Json;
          variants?: Json | null;
          status?: PostStatus;
          published_at?: string | null;
          audit_log_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_sources: {
        Row: {
          id: string;
          user_id: string;
          source_type: string;
          url: string | null;
          title: string | null;
          transcript: string | null;
          extracted_text: string | null;
          original_file_path: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_type: string;
          url?: string | null;
          title?: string | null;
          transcript?: string | null;
          extracted_text?: string | null;
          original_file_path?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_type?: string;
          url?: string | null;
          title?: string | null;
          transcript?: string | null;
          extracted_text?: string | null;
          original_file_path?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      trend_runs: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          sources: TrendSource[];
          status: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic: string;
          sources: TrendSource[];
          status?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic?: string;
          sources?: TrendSource[];
          status?: string;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      trend_items: {
        Row: {
          id: string;
          trend_run_id: string;
          source: TrendSource;
          title: string;
          url: string | null;
          engagement_score: number | null;
          recency_score: number | null;
          combined_rank: number | null;
          raw_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trend_run_id: string;
          source: TrendSource;
          title: string;
          url?: string | null;
          engagement_score?: number | null;
          recency_score?: number | null;
          combined_rank?: number | null;
          raw_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trend_run_id?: string;
          source?: TrendSource;
          title?: string;
          url?: string | null;
          engagement_score?: number | null;
          recency_score?: number | null;
          combined_rank?: number | null;
          raw_data?: Json | null;
          created_at?: string;
        };
      };
      prompt_templates: {
        Row: {
          id: string;
          user_id: string | null;
          task_type: TaskType;
          name: string;
          content: string;
          version: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          task_type: TaskType;
          name: string;
          content: string;
          version?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          task_type?: TaskType;
          name?: string;
          content?: string;
          version?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      voice_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          persona: string;
          tone_rules: string[];
          readability_rules: string[];
          forbidden_language: string[] | null;
          version: number;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          persona: string;
          tone_rules: string[];
          readability_rules: string[];
          forbidden_language?: string[] | null;
          version?: number;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          persona?: string;
          tone_rules?: string[];
          readability_rules?: string[];
          forbidden_language?: string[] | null;
          version?: number;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      platform_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          platform: Platform;
          name: string;
          structure: Json;
          formatting_rules: string[];
          length_constraints: Json;
          required_output_fields: string[];
          version: number;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          platform: Platform;
          name: string;
          structure: Json;
          formatting_rules: string[];
          length_constraints: Json;
          required_output_fields: string[];
          version?: number;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          platform?: Platform;
          name?: string;
          structure?: Json;
          formatting_rules?: string[];
          length_constraints?: Json;
          required_output_fields?: string[];
          version?: number;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          prompt_snapshot: Json;
          model_used: string;
          input_tokens: number | null;
          output_tokens: number | null;
          response_snapshot: Json | null;
          template_versions: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          prompt_snapshot: Json;
          model_used: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          response_snapshot?: Json | null;
          template_versions?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: AuditAction;
          entity_type?: string;
          entity_id?: string;
          prompt_snapshot?: Json;
          model_used?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          response_snapshot?: Json | null;
          template_versions?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
