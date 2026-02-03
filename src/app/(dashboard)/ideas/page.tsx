'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Sparkles, Lightbulb } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { KanbanBoard, type KanbanColumn } from '@/components/kanban/board';
import { IdeaCard } from '@/components/ideas/idea-card';
import { IdeaForm } from '@/components/ideas/idea-form';
import { IdeaDetail } from '@/components/ideas/idea-detail';
import { GenerateIdeaModal } from '@/components/ideas/generate-idea-modal';
import { IDEA_STATUSES } from '@/types/ideas';
import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '@/types/ideas';
import type { IdeaStatus } from '@/types/database';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIdeas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ideas');
      const result = await response.json();
      if (result.data) {
        setIdeas(result.data);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleCreateIdea = async (data: CreateIdeaInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.data) {
        setIdeas((prev) => [result.data, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIdea = async (data: UpdateIdeaInput) => {
    if (!selectedIdea) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/ideas/${selectedIdea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.data) {
        setIdeas((prev) => prev.map((idea) => (idea.id === selectedIdea.id ? result.data : idea)));
        setSelectedIdea(result.data);
      }
    } catch (error) {
      console.error('Error updating idea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIdea = async () => {
    if (!selectedIdea) return;
    try {
      await fetch(`/api/ideas/${selectedIdea.id}`, { method: 'DELETE' });
      setIdeas((prev) => prev.filter((idea) => idea.id !== selectedIdea.id));
      setSelectedIdea(null);
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleDragEnd = async (itemId: string, _sourceColumn: string, destinationColumn: string) => {
    const newStatus = destinationColumn as IdeaStatus;

    // Optimistic update
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === itemId ? { ...idea, status: newStatus } : idea))
    );

    try {
      await fetch(`/api/ideas/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error('Error updating idea status:', error);
      // Revert on error
      fetchIdeas();
    }
  };

  const columns: KanbanColumn<Idea>[] = IDEA_STATUSES.map((status) => ({
    id: status.value,
    title: status.label,
    items: ideas.filter((idea) => idea.status === status.value),
  }));

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)]">Total Ideas</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">--</p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <p className="text-[var(--color-muted-foreground)]">Loading ideas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)]">Total Ideas</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">{ideas.length}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--color-border)]" />
          <div className="flex gap-2">
            {IDEA_STATUSES.map((status) => (
              <div key={status.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[var(--color-border)]">
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{status.label}</span>
                <span className="text-xs font-bold text-[var(--color-foreground)]">
                  {ideas.filter((i) => i.status === status.value).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-foreground)] text-sm font-medium flex items-center gap-2 hover:bg-[var(--color-secondary)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manual
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-hidden -mx-6 -mb-6">
        <KanbanBoard
          columns={columns}
          onDragEnd={handleDragEnd}
          renderCard={(idea) => <IdeaCard idea={idea} />}
          onCardClick={(idea) => setSelectedIdea(idea)}
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Idea"
        size="lg"
      >
        <IdeaForm
          onSubmit={handleCreateIdea}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {selectedIdea && (
        <IdeaDetail
          idea={selectedIdea}
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onUpdate={handleUpdateIdea}
          onDelete={handleDeleteIdea}
        />
      )}

      <GenerateIdeaModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onIdeaGenerated={(idea) => {
          setIdeas((prev) => [idea, ...prev]);
          setIsGenerateModalOpen(false);
        }}
      />
    </div>
  );
}
