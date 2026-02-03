'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Star, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tables, Json } from '@/types/database';

type PlatformProfile = Tables<'platform_profiles'>;

const platformLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

export default function PlatformProfilesPage() {
  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/platform-profiles');
      const result = await response.json();
      if (result.data) {
        setProfiles(result.data);
      }
    } catch (error) {
      console.error('Error fetching platform profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const groupedProfiles = profiles.reduce(
    (acc, profile) => {
      if (!acc[profile.platform]) {
        acc[profile.platform] = [];
      }
      acc[profile.platform].push(profile);
      return acc;
    },
    {} as Record<string, PlatformProfile[]>
  );

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Platform Profiles"
        subtitle="Configure platform-specific content formatting"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Profile
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading profiles...</div>
          ) : (
            Object.entries(groupedProfiles).map(([platform, platformProfiles]) => (
              <div key={platform}>
                <h2 className="mb-4 text-lg font-semibold">
                  {platformLabels[platform] || platform}
                </h2>
                <div className="space-y-4">
                  {platformProfiles.map((profile) => {
                    const constraints = profile.length_constraints as {
                      target_min?: number;
                      target_max?: number;
                      unit?: string;
                    };
                    return (
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
                              <CardDescription className="mt-1">
                                Target: {constraints?.target_min}-{constraints?.target_max}{' '}
                                {constraints?.unit || 'characters'}
                              </CardDescription>
                            </div>
                            {profile.user_id && (
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Formatting Rules</h4>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {profile.formatting_rules.slice(0, 3).map((rule, i) => (
                                  <li key={i}>• {rule}</li>
                                ))}
                                {profile.formatting_rules.length > 3 && (
                                  <li className="text-xs">
                                    +{profile.formatting_rules.length - 3} more...
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Required Fields</h4>
                              <div className="flex flex-wrap gap-1">
                                {profile.required_output_fields.map((field) => (
                                  <Badge key={field} variant="outline" className="text-xs">
                                    {field}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
