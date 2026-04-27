import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { embed } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: text,
  });

  return embedding;
}
