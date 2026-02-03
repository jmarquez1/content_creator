'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Filter, ClipboardList } from 'lucide-react';
import { AuditList } from '@/components/audit/audit-list';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { Tables, AuditAction } from '@/types/database';

type AuditLog = Tables<'audit_logs'>;

const ACTIONS: { value: string; label: string }[] = [
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
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-muted-foreground)]">Total Entries</p>
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{logs.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            <Select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as AuditAction | 'all')}
              options={ACTIONS}
              className="w-44"
            />
          </div>
          <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[var(--color-border)] p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <p className="text-[var(--color-muted-foreground)]">Loading audit logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-[var(--color-muted-foreground)]" />
              </div>
              <p className="text-[var(--color-foreground)] font-medium">No audit logs yet</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Generate some content to see the audit trail
              </p>
            </div>
          </div>
        ) : (
          <AuditList logs={logs} />
        )}
      </div>
    </div>
  );
}
