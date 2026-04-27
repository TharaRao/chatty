import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { embedText } from '@/lib/embeddings';
import { query } from '@/lib/db';

const IngestSchema = z.object({
  text: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

function chunkText(text: string, chunkSize: number = 800, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, metadata = {} } = IngestSchema.parse(body);

    const chunks = chunkText(text);
    let insertedCount = 0;

    for (const chunk of chunks) {
      try {
        const embedding = await embedText(chunk);

        await query(
          `INSERT INTO documents (content, embedding, metadata)
           VALUES ($1, $2::vector, $3)`,
          [chunk, JSON.stringify(embedding), JSON.stringify(metadata)]
        );

        insertedCount++;
      } catch (error) {
        console.error(`Failed to embed chunk: ${error}`);
        continue;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Ingested ${insertedCount} chunks from ${chunks.length} total chunks`,
        chunkCount: chunks.length,
        insertedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest document', details: String(error) },
      { status: 400 }
    );
  }
}
