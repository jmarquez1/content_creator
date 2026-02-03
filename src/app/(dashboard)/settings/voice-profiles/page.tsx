'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Star, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { VoiceProfileForm } from '@/components/settings/voice-profile-form';
import type { Tables } from '@/types/database';

type VoiceProfile = Tables<'voice_profiles'>;

export default function VoiceProfilesPage() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/voice-profiles');
      const result = await response.json();
      if (result.data) {
        setProfiles(result.data);
      }
    } catch (error) {
      console.error('Error fetching voice profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreate = async (data: Partial<VoiceProfile>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settings/voice-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.data) {
        setProfiles((prev) => [result.data, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating voice profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between bg-white/50 backdrop-blur-sm border-b border-[var(--color-border)] px-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Voice Profiles</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage your writing persona and tone settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Profile
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No voice profiles found. Create one to get started.
            </div>
          ) : (
            profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        {profile.is_default && (
                          <Badge variant="success">
                            <Star className="mr-1 h-3 w-3" />
                            Default
                          </Badge>
                        )}
                        {!profile.user_id && <Badge variant="secondary">System</Badge>}
                        <Badge variant="outline">v{profile.version}</Badge>
                      </div>
                      <CardDescription className="mt-1">{profile.persona}</CardDescription>
                    </div>
                    {profile.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProfile(profile)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Tone Rules</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {profile.tone_rules.slice(0, 3).map((rule, i) => (
                          <li key={i}>• {rule}</li>
                        ))}
                        {profile.tone_rules.length > 3 && (
                          <li className="text-xs">
                            +{profile.tone_rules.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Readability Rules</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {profile.readability_rules.slice(0, 3).map((rule, i) => (
                          <li key={i}>• {rule}</li>
                        ))}
                        {profile.readability_rules.length > 3 && (
                          <li className="text-xs">
                            +{profile.readability_rules.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  {profile.forbidden_language && profile.forbidden_language.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">Forbidden Words</h4>
                      <div className="flex flex-wrap gap-1">
                        {profile.forbidden_language.slice(0, 8).map((word) => (
                          <Badge key={word} variant="outline" className="text-xs">
                            {word}
                          </Badge>
                        ))}
                        {profile.forbidden_language.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.forbidden_language.length - 8}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Voice Profile"
        size="lg"
      >
        <VoiceProfileForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {selectedProfile && (
        <Modal
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          title="Edit Voice Profile"
          size="lg"
        >
          <VoiceProfileForm
            profile={selectedProfile}
            onSubmit={async (data) => {
              // Would call update API here
              setSelectedProfile(null);
              fetchProfiles();
            }}
            onCancel={() => setSelectedProfile(null)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}
    </div>
  );
}
