'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SourceSelector } from './source-selector';
import { YouTubeInput } from './youtube-input';
import { DocumentUpload } from './document-upload';
import type { SourceType } from '@/types/database';
import type { Idea } from '@/types/ideas';

interface GenerateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIdeaGenerated: (idea: Idea) => void;
}

type Step = 'source' | 'input' | 'generating';

export function GenerateIdeaModal({ isOpen, onClose, onIdeaGenerated }: GenerateIdeaModalProps) {
  const [step, setStep] = useState<Step>('source');
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  // Plain input fields
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [angle, setAngle] = useState('');
  const [ctaPreference, setCtaPreference] = useState('');

  // Document upload state
  const [documentData, setDocumentData] = useState<{ content_source_id: string; extracted_text: string } | null>(null);

  const handleSourceSelect = (source: SourceType) => {
    setSourceType(source);
    if (source === 'topic') {
      // Redirect to trends page for topic + trends flow
      onClose();
      window.location.href = '/trends';
      return;
    }
    setStep('input');
  };

  const handlePlainGenerate = async () => {
    if (!topic.trim()) {
      setError('Topic is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'plain',
          topic,
          audience,
          angle,
          cta_preference: ctaPreference,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to generate idea');
      }

      onIdeaGenerated(result.data.idea);
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouTubeGenerate = async (data: { youtube_url: string; transcript?: string }) => {
    setIsLoading(true);
    setError(null);
    setTranscriptError(null);

    try {
      const response = await fetch('/api/generate/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'youtube',
          youtube_url: data.youtube_url,
          transcript: data.transcript,
          topic,
          audience,
          angle,
          cta_preference: ctaPreference,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.details?.requiresManualTranscript) {
          setTranscriptError(result.error.message);
          return;
        }
        throw new Error(result.error?.message || 'Failed to generate idea');
      }

      onIdeaGenerated(result.data.idea);
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = (data: { content_source_id: string; extracted_text: string }) => {
    setDocumentData(data);
  };

  const handleDocumentGenerate = async () => {
    if (!documentData) {
      setError('Please upload a document first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: 'document',
          content_source_id: documentData.content_source_id,
          extracted_text: documentData.extracted_text,
          topic,
          audience,
          angle,
          cta_preference: ctaPreference,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to generate idea');
      }

      onIdeaGenerated(result.data.idea);
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('source');
    setSourceType(null);
    setTopic('');
    setAudience('');
    setAngle('');
    setCtaPreference('');
    setError(null);
    setTranscriptError(null);
    setDocumentData(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'input') {
      setStep('source');
      setSourceType(null);
      setError(null);
      setTranscriptError(null);
      setDocumentData(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        step === 'source'
          ? 'Generate New Idea'
          : `Generate from ${sourceType === 'plain' ? 'Topic' : sourceType === 'youtube' ? 'YouTube' : 'Document'}`
      }
      size="lg"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 'source' && <SourceSelector selected={sourceType} onSelect={handleSourceSelect} />}

      {step === 'input' && sourceType === 'plain' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What's the main subject for your content?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Who are you writing for?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="angle">Angle / Perspective</Label>
            <Input
              id="angle"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="What unique angle do you want to take?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta">CTA Preference</Label>
            <Input
              id="cta"
              value={ctaPreference}
              onChange={(e) => setCtaPreference(e.target.value)}
              placeholder="e.g., Comment, Share, Visit link"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handlePlainGenerate} isLoading={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Idea
            </Button>
          </div>
        </div>
      )}

      {step === 'input' && sourceType === 'youtube' && (
        <div className="space-y-4">
          <YouTubeInput
            onSubmit={handleYouTubeGenerate}
            isLoading={isLoading}
            transcriptError={transcriptError}
          />

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium">Additional Context (Optional)</p>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="yt-topic">Focus Topic</Label>
                <Input
                  id="yt-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Specific aspect of the video to focus on"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yt-audience">Target Audience</Label>
                <Input
                  id="yt-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Who are you writing for?"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      )}

      {step === 'input' && sourceType === 'document' && (
        <div className="space-y-4">
          <DocumentUpload onUpload={handleDocumentUpload} isLoading={isLoading} />

          {documentData && (
            <>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  Document uploaded successfully. {documentData.extracted_text.length.toLocaleString()} characters extracted.
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="mb-3 text-sm font-medium">Additional Context (Optional)</p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="doc-topic">Focus Topic</Label>
                    <Input
                      id="doc-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Specific aspect of the document to focus on"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-audience">Target Audience</Label>
                    <Input
                      id="doc-audience"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Who are you writing for?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-angle">Angle / Perspective</Label>
                    <Input
                      id="doc-angle"
                      value={angle}
                      onChange={(e) => setAngle(e.target.value)}
                      placeholder="What unique angle do you want to take?"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleDocumentGenerate} isLoading={isLoading}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Idea
                </Button>
              </div>
            </>
          )}

          {!documentData && (
            <div className="flex justify-start pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
