'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Lightbulb, Clock, Cpu, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromptViewer } from './prompt-viewer';
import type { Tables } from '@/types/database';

type AuditLog = Tables<'audit_logs'>;

interface AuditListProps {
  logs: AuditLog[];
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  generate_idea: { label: 'Generated Idea', icon: <Lightbulb className="h-4 w-4" />, color: 'bg-yellow-500' },
  generate_post: { label: 'Generated Post', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-500' },
  generate_variants: { label: 'Generated Variant', icon: <Hash className="h-4 w-4" />, color: 'bg-purple-500' },
  rewrite: { label: 'Rewrote Content', icon: <FileText className="h-4 w-4" />, color: 'bg-green-500' },
  repurpose: { label: 'Repurposed Content', icon: <FileText className="h-4 w-4" />, color: 'bg-orange-500' },
};

export function AuditList({ logs }: AuditListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mb-4" />
        <p>No audit logs yet</p>
        <p className="text-sm">Logs will appear here after generating content</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const actionInfo = ACTION_LABELS[log.action] || { label: log.action, icon: <FileText className="h-4 w-4" />, color: 'bg-gray-500' };
        const isExpanded = expandedId === log.id;

        return (
          <Card key={log.id} className="overflow-hidden">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50"
              onClick={() => toggleExpand(log.id)}
            >
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              <div className={`rounded-full p-2 ${actionInfo.color} text-white shrink-0`}>
                {actionInfo.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{actionInfo.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {log.entity_type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  Entity ID: {log.entity_id}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Cpu className="h-3 w-3" />
                  <span>{log.model_used}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right shrink-0 text-xs text-muted-foreground">
                {log.input_tokens && log.output_tokens && (
                  <p>{log.input_tokens + log.output_tokens} tokens</p>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t p-4 bg-muted/25">
                <PromptViewer
                  promptSnapshot={log.prompt_snapshot as Record<string, unknown>}
                  responseSnapshot={log.response_snapshot as Record<string, unknown> | null}
                  templateVersions={log.template_versions as Record<string, unknown> | null}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
