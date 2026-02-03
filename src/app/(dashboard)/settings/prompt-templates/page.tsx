'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tables } from '@/types/database';

type PromptTemplate = Tables<'prompt_templates'>;

const taskTypeLabels: Record<string, string> = {
  ideation: 'Ideation',
  trend_ideation: 'Trend Ideation',
  drafting: 'Drafting',
  rewriting: 'Rewriting',
  repurposing: 'Repurposing',
};

export default function PromptTemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/prompt-templates');
      const result = await response.json();
      if (result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Error fetching prompt templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const groupedTemplates = templates.reduce(
    (acc, template) => {
      if (!acc[template.task_type]) {
        acc[template.task_type] = [];
      }
      acc[template.task_type].push(template);
      return acc;
    },
    {} as Record<string, PromptTemplate[]>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center justify-between bg-white/50 backdrop-blur-sm border-b border-[var(--color-border)] px-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Prompt Templates</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Customize AI prompts for different tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading templates...</div>
          ) : (
            Object.entries(groupedTemplates).map(([taskType, taskTemplates]) => (
              <div key={taskType}>
                <h2 className="mb-4 text-lg font-semibold">
                  {taskTypeLabels[taskType] || taskType}
                </h2>
                <div className="space-y-4">
                  {taskTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              {!template.user_id && <Badge variant="secondary">System</Badge>}
                              <Badge variant="outline">v{template.version}</Badge>
                            </div>
                            <CardDescription className="mt-1">
                              {template.content.slice(0, 100)}...
                            </CardDescription>
                          </div>
                          {template.user_id && (
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded bg-muted p-3">
                          <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                            {template.content}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
