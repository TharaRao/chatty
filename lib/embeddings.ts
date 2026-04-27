import { embedContent } from '@ai-sdk/google';

export async function embedText(text: string): Promise<number[]> {
  const result = await embedContent({
    model: 'text-embedding-004',
    value: text,
  });

  return result.embedding;
}
