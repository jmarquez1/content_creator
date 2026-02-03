'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { AuditList } from '@/components/audit/audit-list';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import type { Tables, AuditAction } from '@/types/database';

type AuditLog = Tables<'audit_logs'>;

const ACTIONS: { value: AuditAction | 'all'; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'generate_idea', label: 'Generate Idea' },
  { value: 'generate_post', label: 'Generate Post' },
  { value: 'generate_variants', label: 'Generate Variants' },
  { value: 'rewrite', label: 'Rewrite' },
  { value: 'repurpose', label: 'Repurpose' },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedAction !== 'all') {
        params.set('action', selectedAction);
      }

      const response = await fetch(`/api/audit?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            View all AI generation history and prompt snapshots
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as AuditAction | 'all')}>
            <SelectTrigger className="w-44">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AuditList logs={logs} />
        )}
      </div>
    </div>
  );
}
