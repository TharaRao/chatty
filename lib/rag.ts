import { queryAll } from './db';
import { embedText } from './embeddings';

export interface Document {
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

export async function searchDocuments(query: string, limit: number = 5): Promise<Document[]> {
  const embedding = await embedText(query);

  const results = await queryAll(
    `SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [JSON.stringify(embedding), limit.toString()]
  );

  return results.map((row: any) => ({
    content: row.content,
    metadata: row.metadata,
    similarity: row.similarity,
  }));
}
