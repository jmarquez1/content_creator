export interface TextExtractionResult {
  text: string;
  format: 'txt' | 'md';
}

export function extractPlainText(content: string): TextExtractionResult {
  // Clean up the text
  const text = content
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\t/g, '  ') // Convert tabs to spaces
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim();

  return {
    text,
    format: 'txt',
  };
}

export function extractMarkdownText(content: string): TextExtractionResult {
  // For markdown, we keep most formatting intact
  // but clean up excessive whitespace
  const text = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    text,
    format: 'md',
  };
}

export function detectFileType(filename: string): 'pdf' | 'txt' | 'md' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'txt':
      return 'txt';
    case 'md':
    case 'markdown':
      return 'md';
    default:
      return 'unknown';
  }
}

export function truncateText(text: string, maxLength: number = 15000): string {
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
