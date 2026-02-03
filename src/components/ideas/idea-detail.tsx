'use client';

import { useState } from 'react';
import { Edit, Trash2, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { IdeaForm } from './idea-form';
import { IDEA_STATUSES } from '@/types/ideas';
import type { Idea, UpdateIdeaInput, IdeaOutlineItem } from '@/types/ideas';
import type { IdeaStatus } from '@/types/database';

interface IdeaDetailProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateIdeaInput) => Promise<void>;
  onDelete: () => Promise<void>;
  onGeneratePost?: () => void;
}

export function IdeaDetail({
  idea,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onGeneratePost,
}: IdeaDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (data: UpdateIdeaInput) => {
    setIsLoading(true);
    try {
      await onUpdate(data);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: IdeaStatus) => {
    await onUpdate({ status: newStatus });
  };

  const outline = idea.outline as IdeaOutlineItem[] | null;
  const currentStatusIndex = IDEA_STATUSES.findIndex((s) => s.value === idea.status);
  const nextStatus = IDEA_STATUSES[currentStatusIndex + 1];

  const sourceTypeLabels: Record<string, string> = {
    youtube: 'YouTube Video',
    topic: 'Topic + Trends',
    document: 'Document',
    plain: 'Manual Input',
  };

  if (isEditing) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Idea" size="lg">
        <IdeaForm
          idea={idea}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isLoading}
        />
      </Modal>
    );
  }

  if (isDeleting) {
    return (
      <Modal isOpen={isOpen} onClose={() => setIsDeleting(false)} title="Delete Idea" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{idea.title}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={isLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={idea.title} size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant={idea.status === 'ready' ? 'success' : 'secondary'}>
            {IDEA_STATUSES.find((s) => s.value === idea.status)?.label}
          </Badge>
          {idea.source_type && (
            <Badge variant="outline">{sourceTypeLabels[idea.source_type]}</Badge>
          )}
        </div>

        {idea.hook && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Hook</h4>
            <p className="text-sm">{idea.hook}</p>
          </div>
        )}

        {outline && outline.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Outline</h4>
            <ul className="space-y-2">
              {outline.map((item, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="font-medium">{index + 1}.</span>
                  <span>{typeof item === 'string' ? item : item.point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {idea.suggested_cta && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-muted-foreground">Suggested CTA</h4>
            <p className="text-sm">{idea.suggested_cta}</p>
          </div>
        )}

        {idea.tags && idea.tags.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {idea.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleting(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          {idea.status === 'ready' && onGeneratePost && (
            <Button size="sm" onClick={onGeneratePost}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Post
            </Button>
          )}
          {nextStatus && idea.status !== 'archived' && (
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={() => handleStatusChange(nextStatus.value)}
            >
              Move to {nextStatus.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
