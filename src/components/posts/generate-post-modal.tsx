'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Linkedin, Instagram, Facebook } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Idea } from '@/types/ideas';
import type { Post, Platform } from '@/types/posts';

interface GeneratePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: Idea[];
  selectedIdea?: Idea | null;
  onPostGenerated: (post: Post) => void;
}

const platforms: { value: Platform; label: string; icon: React.ReactNode }[] = [
  { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-5 w-5" /> },
  { value: 'instagram', label: 'Instagram', icon: <Instagram className="h-5 w-5" /> },
  { value: 'facebook', label: 'Facebook', icon: <Facebook className="h-5 w-5" /> },
];

export function GeneratePostModal({
  isOpen,
  onClose,
  ideas,
  selectedIdea,
  onPostGenerated,
}: GeneratePostModalProps) {
  const [ideaId, setIdeaId] = useState<string>('');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedIdea) {
      setIdeaId(selectedIdea.id);
    }
  }, [selectedIdea]);

  const handleGenerate = async () => {
    if (!ideaId || !platform) {
      setError('Please select an idea and platform');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea_id: ideaId,
          platform,
          additional_context: additionalContext || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to generate post');
      }

      onPostGenerated(result.data.post);
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIdeaId('');
    setPlatform(null);
    setAdditionalContext('');
    setError(null);
    onClose();
  };

  const selectedIdeaData = ideas.find((i) => i.id === ideaId);

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Generate New Post" size="lg">
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Idea Selection */}
        <div className="space-y-2">
          <Label>Select Idea</Label>
          <select
            value={ideaId}
            onChange={(e) => setIdeaId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Choose an idea...</option>
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title}
              </option>
            ))}
          </select>

          {selectedIdeaData && (
            <div className="rounded-lg border bg-muted/50 p-3 mt-2">
              <p className="text-sm font-medium">{selectedIdeaData.title}</p>
              {selectedIdeaData.hook && (
                <p className="text-sm text-muted-foreground mt-1">{selectedIdeaData.hook}</p>
              )}
            </div>
          )}
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <Label>Platform</Label>
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlatform(p.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                  platform === p.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                {p.icon}
                <span className="text-sm">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Context */}
        <div className="space-y-2">
          <Label htmlFor="context">Additional Context (Optional)</Label>
          <Textarea
            id="context"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Any specific instructions or context for this post..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} isLoading={isLoading} disabled={!ideaId || !platform}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Post
          </Button>
        </div>
      </div>
    </Modal>
  );
}
