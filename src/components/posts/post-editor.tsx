'use client';

import { useState } from 'react';
import { Save, Wand2, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { PlatformPreview } from './platform-preview';
import type { PostWithIdea, PostContent, Platform } from '@/types/posts';
import type { PostVariant } from '@/tools/db/posts';

interface PostEditorProps {
  post: PostWithIdea;
  onSave: (content: string) => Promise<void>;
  onGenerateVariant: (variationType: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

const VARIATION_TYPES = [
  { value: 'tone', label: 'Different Tone' },
  { value: 'length', label: 'Different Length' },
  { value: 'angle', label: 'Different Angle' },
  { value: 'cta', label: 'Different CTA' },
];

export function PostEditor({
  post,
  onSave,
  onGenerateVariant,
  onDelete,
  isLoading,
}: PostEditorProps) {
  const content = post.content as PostContent | null;
  const [text, setText] = useState(content?.text || '');
  const [selectedVariationType, setSelectedVariationType] = useState('tone');
  const [hasChanges, setHasChanges] = useState(false);

  const variants = (post.variants as PostVariant[] | null) || [];

  const handleTextChange = (value: string) => {
    setText(value);
    setHasChanges(value !== (content?.text || ''));
  };

  const handleSave = async () => {
    await onSave(text);
    setHasChanges(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const currentContent: PostContent = {
    text,
    hashtags: content?.hashtags,
    metadata: content?.metadata,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Post Content</Label>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <Textarea
          id="content"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={12}
          className="font-mono text-sm"
          placeholder="Write your post content..."
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={selectedVariationType} onValueChange={setSelectedVariationType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => onGenerateVariant(selectedVariationType)}
              isLoading={isLoading}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Variant
            </Button>
          </div>

          <Button onClick={handleSave} disabled={!hasChanges} isLoading={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Variants Section */}
        {variants.length > 0 && (
          <div className="mt-6 space-y-3">
            <Label>Variants ({variants.length})</Label>
            <div className="space-y-2">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleTextChange(variant.content.text)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium capitalize">
                      {variant.variation_type} variant
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(variant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {variant.content.text}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    {variant.variation_description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="space-y-4">
        <Label>Preview</Label>
        <PlatformPreview
          platform={post.platform as Platform}
          content={currentContent}
        />
      </div>
    </div>
  );
}
