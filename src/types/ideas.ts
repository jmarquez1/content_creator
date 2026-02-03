import type { Tables, IdeaStatus, SourceType } from './database';

export type Idea = Tables<'ideas'>;

export interface IdeaOutlineItem {
  point: string;
  details?: string;
}

export interface CreateIdeaInput {
  title: string;
  hook?: string;
  outline?: IdeaOutlineItem[];
  suggested_cta?: string;
  tags?: string[];
  source_type?: SourceType;
  source_reference_id?: string;
}

export interface UpdateIdeaInput {
  title?: string;
  hook?: string;
  outline?: IdeaOutlineItem[];
  suggested_cta?: string;
  status?: IdeaStatus;
  tags?: string[];
}

export const IDEA_STATUSES: { value: IdeaStatus; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'developing', label: 'Developing' },
  { value: 'ready', label: 'Ready' },
  { value: 'archived', label: 'Archived' },
];

export const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'plain', label: 'Plain Input' },
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'topic', label: 'Topic + Trends' },
  { value: 'document', label: 'Document Upload' },
];
