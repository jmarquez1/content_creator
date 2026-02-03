'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/types/database';

type VoiceProfile = Tables<'voice_profiles'>;

interface VoiceProfileFormProps {
  profile?: VoiceProfile;
  onSubmit: (data: Partial<VoiceProfile>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VoiceProfileForm({
  profile,
  onSubmit,
  onCancel,
  isLoading,
}: VoiceProfileFormProps) {
  const [toneRules, setToneRules] = useState<string[]>(profile?.tone_rules ?? ['']);
  const [readabilityRules, setReadabilityRules] = useState<string[]>(
    profile?.readability_rules ?? ['']
  );
  const [forbiddenWords, setForbiddenWords] = useState<string>(
    profile?.forbidden_language?.join(', ') ?? ''
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: profile?.name ?? '',
      persona: profile?.persona ?? '',
      is_default: profile?.is_default ?? false,
    },
  });

  const addToneRule = () => setToneRules([...toneRules, '']);
  const removeToneRule = (index: number) =>
    setToneRules(toneRules.filter((_, i) => i !== index));
  const updateToneRule = (index: number, value: string) => {
    const updated = [...toneRules];
    updated[index] = value;
    setToneRules(updated);
  };

  const addReadabilityRule = () => setReadabilityRules([...readabilityRules, '']);
  const removeReadabilityRule = (index: number) =>
    setReadabilityRules(readabilityRules.filter((_, i) => i !== index));
  const updateReadabilityRule = (index: number, value: string) => {
    const updated = [...readabilityRules];
    updated[index] = value;
    setReadabilityRules(updated);
  };

  const onFormSubmit = handleSubmit(async (data) => {
    const filteredToneRules = toneRules.filter((r) => r.trim() !== '');
    const filteredReadabilityRules = readabilityRules.filter((r) => r.trim() !== '');
    const forbidden = forbiddenWords
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w !== '');

    await onSubmit({
      name: data.name,
      persona: data.persona,
      tone_rules: filteredToneRules,
      readability_rules: filteredReadabilityRules,
      forbidden_language: forbidden.length > 0 ? forbidden : undefined,
      is_default: data.is_default,
    });
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Profile Name *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
          placeholder="e.g., Professional Writer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="persona">Persona *</Label>
        <Textarea
          id="persona"
          {...register('persona', { required: 'Persona is required' })}
          placeholder="Describe the writing persona..."
          rows={3}
        />
        {errors.persona && (
          <p className="text-sm text-destructive">{errors.persona.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tone Rules *</Label>
        {toneRules.map((rule, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={rule}
              onChange={(e) => updateToneRule(index, e.target.value)}
              placeholder="e.g., Humble and grounded"
            />
            {toneRules.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeToneRule(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addToneRule}>
          Add Rule
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Readability Rules *</Label>
        {readabilityRules.map((rule, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={rule}
              onChange={(e) => updateReadabilityRule(index, e.target.value)}
              placeholder="e.g., Short sentences (10-15 words)"
            />
            {readabilityRules.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeReadabilityRule(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addReadabilityRule}>
          Add Rule
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forbidden">Forbidden Words (comma-separated)</Label>
        <Textarea
          id="forbidden"
          value={forbiddenWords}
          onChange={(e) => setForbiddenWords(e.target.value)}
          placeholder="game-changer, unlock, hustle, etc."
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_default" {...register('is_default')} />
        <Label htmlFor="is_default" className="cursor-pointer">
          Set as default profile
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {profile ? 'Update' : 'Create'} Profile
        </Button>
      </div>
    </form>
  );
}
