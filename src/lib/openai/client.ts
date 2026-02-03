import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export type OpenAIModel = 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';

export const DEFAULT_MODEL: OpenAIModel = 'gpt-4o';
