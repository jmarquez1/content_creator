import { getOpenAIClient, DEFAULT_MODEL, type OpenAIModel } from '@/lib/openai/client';

export interface GenerateOptions {
  model?: OpenAIModel;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface GenerateResult {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
}

const DEFAULT_OPTIONS: GenerateOptions = {
  model: DEFAULT_MODEL,
  temperature: 0.7,
  maxTokens: 4096,
  responseFormat: 'json',
};

export async function generate(
  prompt: string,
  options: GenerateOptions = {}
): Promise<GenerateResult> {
  const client = getOpenAIClient();

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const response = await client.chat.completions.create({
    model: mergedOptions.model!,
    messages: [
      {
        role: 'system',
        content:
          'You are a content creation assistant. Follow the instructions precisely and return valid JSON when requested.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: mergedOptions.temperature,
    max_tokens: mergedOptions.maxTokens,
    response_format:
      mergedOptions.responseFormat === 'json' ? { type: 'json_object' } : { type: 'text' },
  });

  const content = response.choices[0]?.message?.content || '';

  return {
    content,
    usage: {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
    },
    model: response.model,
  };
}

export function parseJsonResponse<T>(content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error}`);
  }
}
