'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, ExternalLink, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tables, TrendSource } from '@/types/database';

type TrendRun = Tables<'trend_runs'>;
type TrendItem = Tables<'trend_items'>;

export default function TrendsPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [sources, setSources] = useState<TrendSource[]>(['reddit', 'youtube']);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRun, setCurrentRun] = useState<{
    run: TrendRun;
    items: TrendItem[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSource = (source: TrendSource) => {
    setSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleSearch = async () => {
    if (!topic.trim() || sources.length === 0) {
      setError('Please enter a topic and select at least one source');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trends/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sources }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to run trend research');
      }

      // Fetch the results
      const runResponse = await fetch(`/api/trends/runs/${result.data.trend_run_id}`);
      const runResult = await runResponse.json();

      if (runResponse.ok) {
        setCurrentRun(runResult.data);
      }

      if (result.data.errors) {
        setError(`Partial results: ${result.data.errors.join(', ')}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromTrends = () => {
    if (!currentRun) return;

    // Create trend summary from top items
    const topItems = currentRun.items.slice(0, 10);
    const trendSummary = topItems
      .map((item, i) => `${i + 1}. [${item.source}] ${item.title}`)
      .join('\n');

    // Store in session storage and redirect to ideas
    sessionStorage.setItem('trendSummary', trendSummary);
    sessionStorage.setItem('trendTopic', topic);
    router.push('/ideas?fromTrends=true');
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Trend Research"
        subtitle="Discover trending topics to inform your content"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Research Topic
              </CardTitle>
              <CardDescription>
                Search for trending content across Reddit and YouTube
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <div className="flex gap-2">
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., productivity tips, remote work, AI tools"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} isLoading={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sources</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={sources.includes('reddit') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSource('reddit')}
                  >
                    Reddit
                  </Button>
                  <Button
                    type="button"
                    variant={sources.includes('youtube') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSource('youtube')}
                  >
                    YouTube
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {currentRun && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Results for &quot;{currentRun.run.topic}&quot;</CardTitle>
                    <CardDescription>
                      {currentRun.items.length} trending items found
                    </CardDescription>
                  </div>
                  <Button onClick={handleGenerateFromTrends}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Idea from Trends
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentRun.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.source}
                          </Badge>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Engagement: {item.engagement_score}</span>
                            <span>Recency: {item.recency_score}</span>
                          </div>
                        </div>
                        <p className="mt-1 font-medium">{item.title}</p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            View original
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
