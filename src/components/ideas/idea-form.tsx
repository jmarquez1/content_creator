'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CreateIdeaInput, UpdateIdeaInput } from '@/types/ideas';
import type { Idea } from '@/types/ideas';

type IdeaFormProps =
  | {
      idea?: undefined;
      onSubmit: (data: CreateIdeaInput) => Promise<void>;
      onCancel: () => void;
      isLoading?: boolean;
    }
  | {
      idea: Idea;
      onSubmit: (data: UpdateIdeaInput) => Promise<void>;
      onCancel: () => void;
      isLoading?: boolean;
    };

export function IdeaForm({ idea, onSubmit, onCancel, isLoading }: IdeaFormProps) {
  const [tags, setTags] = useState<string[]>(idea?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIdeaInput>({
    defaultValues: {
      title: idea?.title ?? '',
      hook: idea?.hook ?? '',
      suggested_cta: idea?.suggested_cta ?? '',
    },
  });

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onFormSubmit = handleSubmit(async (data) => {
    const formData = {
      ...data,
      tags: tags.length > 0 ? tags : undefined,
    };
    // Type assertion needed due to discriminated union
    await (onSubmit as (data: CreateIdeaInput | UpdateIdeaInput) => Promise<void>)(formData);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
          placeholder="Enter idea title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hook">Hook</Label>
        <Textarea
          id="hook"
          {...register('hook')}
          placeholder="The attention-grabbing opening line"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="suggested_cta">Suggested CTA</Label>
        <Input
          id="suggested_cta"
          {...register('suggested_cta')}
          placeholder="e.g., Comment your thoughts below"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {idea ? 'Update' : 'Create'} Idea
        </Button>
      </div>
    </form>
  );
}
