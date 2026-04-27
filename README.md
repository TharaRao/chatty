# RAG Chatbot

A general-purpose chatbot that answers questions using your own documents as context. Built with Next.js, Vercel Postgres, and Gemini.

## Setup

### 1. Environment Variables

Update `.env.local` in the project root with:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key_here
POSTGRES_URL=your_vercel_postgres_connection_string
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

For Postgres, create a database in your [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Create Database → Postgres.

### 2. Database Schema

Run this SQL against your Postgres database (use the Vercel query editor or any Postgres client):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
```

### 3. Install Dependencies

Dependencies already installed. For future use:

```bash
npm install
```

## Usage

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to chat.

### Ingest Documents

Post text to the `/api/ingest` endpoint:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your document text here...",
    "metadata": {"source": "example.com"}
  }'
```

The endpoint will chunk the text (800 chars with 200 char overlap), embed each chunk, and store in the database.

### Chat

The chat UI at `/` sends messages to `/api/chat`, which:
1. Embeds your question
2. Searches for the 5 most relevant document chunks
3. Passes them to Gemini as context
4. Streams the response back

## Architecture

- **Frontend**: Next.js with `useChat` hook from `ai/react`
- **Embeddings**: Gemini `text-embedding-004` (768 dimensions)
- **Generation**: Gemini `2.5-flash` (fast & free tier)
- **Vector DB**: Vercel Postgres with pgvector
- **Streaming**: Vercel AI SDK

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Add your environment variables in the Vercel dashboard under Project Settings → Environment Variables.

## File Structure

```
app/
  page.tsx                 # Chat UI
  api/
    chat/route.ts          # RAG + streaming
    ingest/route.ts        # Document ingestion
lib/
  db.ts                    # Postgres client
  embeddings.ts            # Gemini embeddings wrapper
  rag.ts                   # Similarity search
```
