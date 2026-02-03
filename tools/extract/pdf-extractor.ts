// Note: pdf-parse is a CommonJS module, we use dynamic import
export interface PdfExtractionResult {
  text: string;
  numPages: number;
  info?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

export async function extractPdfText(buffer: Buffer): Promise<PdfExtractionResult> {
  try {
    // Dynamic import for CommonJS module
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);

    return {
      text: data.text.trim(),
      numPages: data.numpages,
      info: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function truncateExtractedText(text: string, maxLength: number = 15000): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength);
  const lastParagraph = truncated.lastIndexOf('\n\n');
  const lastSentence = truncated.lastIndexOf('. ');

  if (lastParagraph > maxLength * 0.8) {
    return truncated.slice(0, lastParagraph) + '\n\n[Document truncated due to length]';
  }

  if (lastSentence > maxLength * 0.9) {
    return truncated.slice(0, lastSentence + 1) + '\n\n[Document truncated due to length]';
  }

  return truncated + '...\n\n[Document truncated due to length]';
}
