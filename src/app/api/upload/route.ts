import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';
import { createContentSource } from '@/tools/db/content-sources';
import { extractPdfText, truncateExtractedText } from '@/tools/extract/pdf-extractor';
import {
  extractPlainText,
  extractMarkdownText,
  detectFileType,
  truncateText,
} from '@/tools/extract/text-extractor';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        createErrorResponse({ code: 'UNAUTHORIZED', message: 'Not authenticated' }),
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'No file provided' }),
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        createErrorResponse({ code: 'VALIDATION_ERROR', message: 'File too large (max 10MB)' }),
        { status: 400 }
      );
    }

    const fileType = detectFileType(file.name);
    if (fileType === 'unknown') {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Unsupported file type. Allowed: PDF, TXT, MD',
        }),
        { status: 400 }
      );
    }

    let extractedText: string;
    let metadata: Record<string, unknown> = {
      filename: file.name,
      fileType,
      fileSize: file.size,
    };

    try {
      if (fileType === 'pdf') {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await extractPdfText(buffer);
        extractedText = truncateExtractedText(result.text);
        metadata = {
          ...metadata,
          numPages: result.numPages,
          ...result.info,
        };
      } else {
        const content = await file.text();
        const result = fileType === 'md' ? extractMarkdownText(content) : extractPlainText(content);
        extractedText = truncateText(result.text);
      }
    } catch (error) {
      return NextResponse.json(
        createErrorResponse({
          code: 'EXTRACTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to extract text from file',
        }),
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'No text could be extracted from the file',
        }),
        { status: 400 }
      );
    }

    // Store in Supabase Storage (optional - can be enabled later)
    // const storagePath = `documents/${user.id}/${Date.now()}-${file.name}`;
    // await supabase.storage.from('documents').upload(storagePath, file);

    // Create content source record
    const contentSource = await createContentSource(supabase, user.id, {
      source_type: 'document',
      title: file.name,
      extracted_text: extractedText,
      metadata,
    });

    return NextResponse.json(
      createSuccessResponse({
        content_source_id: contentSource.id,
        extracted_text: extractedText,
        metadata,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
