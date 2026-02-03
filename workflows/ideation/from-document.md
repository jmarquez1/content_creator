# Ideation from Document

## Overview

This workflow generates content ideas from uploaded documents (PDF, TXT, or Markdown files). The system extracts text from the document and uses it as context for idea generation.

## Supported File Types

| Type | Extensions | Max Size | Notes |
|------|------------|----------|-------|
| PDF | `.pdf` | 10MB | Text extracted via pdf-parse |
| Plain Text | `.txt` | 10MB | Direct text extraction |
| Markdown | `.md`, `.markdown` | 10MB | Preserves formatting |

## Flow

```
┌─────────────────┐
│  Upload File    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate File   │
│ (type, size)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Text    │
│ (pdf-parse/raw) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Truncate if     │
│ needed (15k ch) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store Content   │
│ Source Record   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Adds       │
│ Optional Context│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Compose Prompt  │
│ with Doc Text   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Idea   │
│ via OpenAI      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Idea     │
│ + Audit Log     │
└─────────────────┘
```

## Text Extraction

### PDF Extraction
- Uses `pdf-parse` library (pure JavaScript, no native dependencies)
- Extracts text from all pages
- Captures metadata: page count, title, author, subject

### Plain Text Extraction
- Direct content read
- Normalizes line endings (CRLF → LF)
- Converts tabs to spaces
- Collapses excessive newlines

### Markdown Extraction
- Preserves markdown formatting
- Cleans up whitespace
- Format preserved for context-aware prompting

## Text Truncation

Documents are truncated to 15,000 characters maximum to fit within prompt context limits.

Truncation strategy:
1. If text ≤ 15k characters: use as-is
2. Try to break at last paragraph boundary (if > 80% through)
3. Try to break at last sentence (if > 90% through)
4. Fall back to hard cut with "..." suffix

All truncated documents get a `[Document truncated due to length]` notice appended.

## Content Source Storage

When a document is uploaded, a `content_sources` record is created:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "source_type": "document",
  "title": "filename.pdf",
  "extracted_text": "...",
  "metadata": {
    "filename": "filename.pdf",
    "fileType": "pdf",
    "fileSize": 12345,
    "numPages": 5,
    "title": "Document Title",
    "author": "Author Name"
  }
}
```

## User Input Fields

| Field | Required | Description |
|-------|----------|-------------|
| Document | Yes | The uploaded file |
| Focus Topic | No | Specific aspect to focus on |
| Target Audience | No | Who the content is for |
| Angle/Perspective | No | Unique angle to take |

## Prompt Composition

The document text is passed as the `example` field in user input, which gets included in the prompt as reference material:

```
REFERENCE MATERIAL:
[extracted document text]

Based on the above reference material, generate a content idea...
```

## API Endpoint

**POST** `/api/generate/idea`

```json
{
  "source_type": "document",
  "content_source_id": "uuid-from-upload",
  "extracted_text": "...",
  "topic": "optional focus topic",
  "audience": "optional target audience",
  "angle": "optional angle"
}
```

## Upload Endpoint

**POST** `/api/upload`

Form data:
- `file`: The document file

Response:
```json
{
  "success": true,
  "data": {
    "content_source_id": "uuid",
    "extracted_text": "...",
    "metadata": {
      "filename": "...",
      "fileType": "pdf",
      "fileSize": 12345,
      "numPages": 5
    }
  }
}
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| File too large | > 10MB | Reduce file size |
| Unsupported type | Not PDF/TXT/MD | Convert to supported format |
| Extraction failed | Corrupt/encrypted PDF | Try different file or convert |
| No text extracted | Image-only PDF | Use OCR tool first |

## Future Enhancements

1. **OCR Support**: Add tesseract.js for image-based PDFs
2. **Supabase Storage**: Store original files in bucket for retrieval
3. **Chunked Processing**: Handle very large documents via chunking
4. **Multiple Documents**: Allow combining multiple docs as context
