'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptViewerProps {
  promptSnapshot: Record<string, unknown>;
  responseSnapshot: Record<string, unknown> | null;
  templateVersions: Record<string, unknown> | null;
}

export function PromptViewer({ promptSnapshot, responseSnapshot, templateVersions }: PromptViewerProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('composed_prompt');

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSection = (title: string, key: string, content: unknown) => {
    const isExpanded = expandedSection === key;
    const stringContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

    return (
      <div key={key} className="border rounded-lg overflow-hidden">
        <div
          className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-pointer hover:bg-muted"
          onClick={() => toggleSection(key)}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(stringContent, key);
            }}
          >
            {copied === key ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        {isExpanded && (
          <div className="p-3 bg-background">
            <pre className="text-xs whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {stringContent}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Template Versions */}
      {templateVersions && (
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(templateVersions).map(([key, value]) => (
            <span key={key} className="bg-muted px-2 py-1 rounded">
              {key.replace(/_/g, ' ')}: v{String(value)}
            </span>
          ))}
        </div>
      )}

      {/* Composed Prompt */}
      {promptSnapshot.composed_prompt &&
        renderSection('Composed Prompt', 'composed_prompt', promptSnapshot.composed_prompt)
      }

      {/* Voice Profile */}
      {promptSnapshot.voice_profile &&
        renderSection('Voice Profile', 'voice_profile', promptSnapshot.voice_profile)
      }

      {/* Platform Profile */}
      {promptSnapshot.platform_profile &&
        renderSection('Platform Profile', 'platform_profile', promptSnapshot.platform_profile)
      }

      {/* Task Template */}
      {promptSnapshot.task_template &&
        renderSection('Task Template', 'task_template', promptSnapshot.task_template)
      }

      {/* User Input */}
      {promptSnapshot.user_input &&
        renderSection('User Input', 'user_input', promptSnapshot.user_input)
      }

      {/* Trend Summary */}
      {promptSnapshot.trend_summary &&
        renderSection('Trend Summary', 'trend_summary', promptSnapshot.trend_summary)
      }

      {/* Idea Context */}
      {promptSnapshot.idea &&
        renderSection('Idea Context', 'idea', promptSnapshot.idea)
      }

      {/* Response */}
      {responseSnapshot &&
        renderSection('Generated Response', 'response', responseSnapshot)
      }
    </div>
  );
}
