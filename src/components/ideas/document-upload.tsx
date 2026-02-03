'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (data: { content_source_id: string; extracted_text: string }) => void;
  isLoading?: boolean;
}

export function DocumentUpload({ onUpload, isLoading }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileSelect = (selectedFile: File | undefined) => {
    setError(null);

    if (!selectedFile) return;

    const ext = selectedFile.name.toLowerCase().split('.').pop();
    if (!['pdf', 'txt', 'md', 'markdown'].includes(ext || '')) {
      setError('Unsupported file type. Please upload PDF, TXT, or MD files.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Upload failed');
      }

      onUpload({
        content_source_id: result.data.content_source_id,
        extracted_text: result.data.extracted_text,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground">PDF, TXT, or MD (max 10MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.markdown"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {error}
        </div>
      )}

      {file && (
        <Button onClick={handleUpload} isLoading={isUploading || isLoading} className="w-full">
          Extract Text & Continue
        </Button>
      )}
    </div>
  );
}
