'use client';

import { FileText, Youtube, TrendingUp, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SourceType } from '@/types/database';

interface SourceOption {
  value: SourceType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sourceOptions: SourceOption[] = [
  {
    value: 'plain',
    label: 'Plain Input',
    description: 'Generate ideas from a topic',
    icon: FileText,
  },
  {
    value: 'youtube',
    label: 'YouTube Video',
    description: 'Extract ideas from video transcript',
    icon: Youtube,
  },
  {
    value: 'topic',
    label: 'Topic + Trends',
    description: 'Research trends first, then ideate',
    icon: TrendingUp,
  },
  {
    value: 'document',
    label: 'Document Upload',
    description: 'Generate ideas from PDF or text',
    icon: Upload,
  },
];

interface SourceSelectorProps {
  selected: SourceType | null;
  onSelect: (source: SourceType) => void;
}

export function SourceSelector({ selected, onSelect }: SourceSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sourceOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
            selected === option.value
              ? 'border-primary bg-primary/5'
              : 'hover:border-muted-foreground/50'
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              selected === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <option.icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">{option.label}</h3>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
