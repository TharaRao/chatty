import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { searchDocuments } from '@/lib/rag';
import { z } from 'zod';

const ChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = ChatSchema.parse(body);

    if (messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return new Response('Last message must be from user', { status: 400 });
    }

    const relevantDocs = await searchDocuments(lastMessage.content, 5);

    const contextText = relevantDocs
      .map((doc, i) => `[Document ${i + 1}]\n${doc.content}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful assistant that answers questions based on the provided documents.

Here are the relevant documents for context:

${contextText}

Use the information from these documents to answer the user's question. If the documents don't contain relevant information, say so. Always cite which document you're using when you reference information.`;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(`Error: ${String(error)}`, { status: 500 });
  }
}
