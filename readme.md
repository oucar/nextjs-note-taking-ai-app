# MOOD — AI Journal

**An AI-powered journaling app and a hands-on exploration of Retrieval-Augmented Generation (RAG).**

**Version:** 0.2.0 · **Changelog:** [CHANGELOG.md](CHANGELOG.md)

MOOD is a journaling application built with Next.js (App Router). You write journal entries, the app generates a structured mood analysis for each one, and you can chat with your journal — asking questions like *"What was my best day?"* or *"How have I been feeling lately?"* — and get answers grounded in your own writing, with links back to the specific entries.

## Purpose of this project

Beyond being a functional journaling app, this project was built as a **learning vehicle for understanding RAG and vector embeddings at a deeper level**. Rather than treating the AI layer as a black box, the goal was to implement every stage of a retrieval pipeline by hand: turning raw text into documents, embedding those documents into vectors, running similarity search, assembling context, and constraining the model's output into a structured, type-safe shape.

The entire AI layer lives in a single file — [`util/ai.ts`](util/ai.ts) — precisely so the whole pipeline can be read top to bottom and understood as one unit.

## What is RAG?

**Retrieval-Augmented Generation** is a technique for making a language model answer questions about information it was never trained on — in this case, your private journal entries.

A language model on its own has two limitations: it doesn't know your data, and you can't simply paste unlimited amounts of text into it (context windows are finite, and large prompts are slow and expensive). RAG solves both by splitting the problem into two stages:

1. **Retrieval** — Given a question, find the small subset of your documents that are actually *relevant* to it.
2. **Generation** — Hand only those documents to the model, along with the question, and ask it to answer using that material as its source of truth.

The result is an answer that is grounded in real data, cheaper to produce, and traceable — you know exactly which documents informed it. MOOD leans into that last property: every answer comes back with a `referencedEntries` list, so the UI can link each claim back to the journal entry it came from.

## How vectors make retrieval work

The retrieval step raises an obvious question: how does a computer know which journal entries are "relevant" to *"Have I been sleeping badly?"* when none of your entries contain the word "sleeping"? Keyword search fails here. The answer is **embeddings**.

An embedding model reads a piece of text and converts it into a **vector** — a long list of numbers (1,536 of them, for the OpenAI model used here) that acts as a kind of *coordinate for meaning*. You can think of it as placing every piece of text at a point in a huge multi-dimensional space, arranged so that **texts with similar meaning land close together**:

- *"I tossed and turned all night"* and *"Have I been sleeping badly?"* end up near each other — even though they share no keywords — because they're about the same idea.
- *"I got promoted at work today"* lands far away from both.

Once every document and the question itself are points in this space, relevance becomes geometry: **the most relevant entries are simply the nearest neighbors of the question**. Closeness is measured with cosine similarity — essentially, how much two vectors point in the same direction. A **vector store** is the data structure that holds these vectors and answers "give me the K nearest documents to this point" efficiently.

That's the whole trick. RAG's "retrieval" step is a nearest-neighbor search in meaning-space.

## The RAG pipeline in this app

Everything below is implemented in [`util/ai.ts`](util/ai.ts) and triggered by `POST /api/question`.

### 1. Document preparation (enrichment)

Each journal entry is wrapped in a LangChain `Document`. Rather than embedding the raw text alone, each document is **enriched** with its stored analysis — date, mood, subject, summary, and sentiment score — prepended as labeled headers. This gives the embedding (and later, the model) more semantic signal to work with, and it's a practical example of how much retrieval quality depends on *what* you embed, not just the search algorithm.

### 2. Embedding + similarity search

For a normal question, the pipeline:

- embeds all documents with `OpenAIEmbeddings`,
- loads them into an in-memory vector store (`MemoryVectorStore`),
- embeds the question,
- and retrieves the **6 nearest entries** via cosine similarity search.

> **Design note:** the vector store is deliberately in-memory and rebuilt on every request. For a personal journal with dozens of entries this is perfectly fine, and it keeps the pipeline transparent — there is no external infrastructure hiding the mechanics. At scale, you would persist embeddings in a real vector database (pgvector, Pinecone, etc.) and only embed each entry once. That trade-off is on the [roadmap](#roadmap-ideas), and understanding *why* it becomes necessary was part of the learning goal.

### 3. Retrieval routing (when *not* to use vectors)

An important lesson embedded in this codebase: **semantic search is not always the right retrieval strategy.** Questions like *"What were my best days?"* are not similarity problems — they're *ranking* problems. Embedding "best day" and searching for similar text would surface entries that merely mention good days, not the objectively highest-scoring ones.

So the pipeline detects best/worst-style questions and routes them down a different path: it skips embeddings entirely and sorts entries by the `sentimentScore` already stored in the database, taking the top or bottom 10. Metadata ranking and vector search are complementary retrieval strategies, and a good RAG system picks the right one per query.

### 4. Augmented generation with structured output

The retrieved entries are joined into a context block and placed into the system prompt, along with conversation history and formatting rules. The model (`gpt-4o-mini`, temperature 0 for deterministic answers) is then forced — via LangChain's `withStructuredOutput` and a Zod schema — to return a typed object:

```ts
{
  answer: string;              // the conversational answer
  referencedEntries: Array<{   // the entries the answer is grounded in
    id: string;
    date: string;
    subject: string;
    sentimentScore: number;
  }>;
}
```

This is what makes the answers *traceable*: the UI renders `answer` as text and turns `referencedEntries` into links back to `/journal/[id]`. Grounding plus citation is the core promise of RAG, made concrete.

### The second AI workflow: entry analysis

Separate from the Q&A pipeline, every saved entry is analyzed by `analyzeEntry`. It's a single structured-output call (no retrieval involved) that produces the `EntryAnalysis` record: `mood`, `subject`, `summary`, `negative`, and a `sentimentScore` from -10 to 10, which is mapped to a UI color. This analysis then feeds *back into* the RAG pipeline as document enrichment and ranking metadata — the two workflows compound.

## Features

- **Journaling** — create and edit entries in a dedicated editor with autosave.
- **Automatic analysis** — every entry gets a structured mood analysis on save.
- **Ask your journal (RAG Q&A)** — conversational answers grounded in your entries, with linked references.
- **Insights** — mood timeline chart, mood distribution, and statistics pages built from the analysis data.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Auth | Clerk (`middleware.ts` protects all non-public routes) |
| Database | Prisma ORM + Neon Postgres (`prisma/schema.prisma`) |
| AI / RAG | LangChain + OpenAI (`gpt-4o-mini`, `OpenAIEmbeddings`) — `util/ai.ts` |
| Validation | Zod (structured LLM output schemas) |
| UI | Tailwind CSS 4, Radix UI primitives, Recharts |

## App structure

### Pages

- `/` — landing page
- `/journal` — entry list + "Ask your journal" + "New entry"
- `/journal/[id]` — editor for a single entry
- `/history` — mood timeline chart
- `/statistics` — all-time + recent insights
- `/new-user` — creates the local Prisma `User` record for the signed-in Clerk user

### API routes

- `POST /api/entry` — create a new entry (with neutral placeholder analysis)
- `PATCH /api/entry/[id]` — update entry content; re-runs AI analysis and upserts `EntryAnalysis`
- `DELETE /api/entry/[id]` — delete an entry
- `POST /api/question` — the RAG endpoint: fetches your entries, runs the retrieval pipeline described above, returns `{ answer, referencedEntries }`

### Database schema

Three core models in `prisma/schema.prisma`:

- `User` — local user table linked to Clerk via `clerkId`
- `JournalEntry` — the journal text (`content`) and status (`DRAFT` / `PUBLISHED` / `ARCHIVED`)
- `EntryAnalysis` — one-to-one analysis per entry (mood, subject, summary, sentiment score, color)

## Environment variables

Create a `.env.local` file in the project root:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon Postgres
DATABASE_URL=
DIRECT_URL=

# OpenAI (used for both chat completions and embeddings)
OPENAI_API_KEY=
```

## Getting started (local development)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** — add all values listed above to `.env.local`.

3. **Generate Prisma Client and run migrations**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **(Optional) Seed the database**

   ```bash
   npm run db:seed
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Useful scripts

- `npm run dev` — start Next.js dev server (Turbopack)
- `npm run build` / `npm run start` — production build and start
- `npm run lint` — lint
- `npm run db:studio` — open Prisma Studio
- `npm run db:seed` — seed script (`prisma/seed.ts`)
- `npm run db:reset` — reset DB and re-run migrations (development only)

## Notes / troubleshooting

- **First sign-in redirect**: if you see "No local DB user found for Clerk id…", visit `/new-user` (the app also redirects there from server components). That route creates your Prisma `User` record.
- **No AI output**: ensure `OPENAI_API_KEY` is set. Entry analysis, embeddings, and Q&A all depend on it.
- **Why analysis updates on edit**: new entries start with neutral placeholder analysis; the real analysis is generated when the entry is updated via `PATCH /api/entry/[id]`.
- **`The table 'public.User' does not exist`**: your `DATABASE_URL` points at a database without the MOOD schema. Use a dedicated Postgres database (e.g. a new Neon project or branch), set `DATABASE_URL` and `DIRECT_URL` accordingly, then run `npx prisma migrate deploy`. If the database is dedicated to MOOD and losing its other data is acceptable, `npx prisma db push --accept-data-loss` will overwrite the schema.

## Version history

See **[CHANGELOG.md](CHANGELOG.md)** for release notes. Current version: **0.2.0** (2025-02-14).

## Roadmap ideas

- **Persisted vector store** — embed each entry once on save (pgvector / Pinecone) instead of rebuilding the in-memory store per question; the natural next step in the RAG learning path
- Webhook-based user sync (create the Prisma user automatically when the Clerk user is created)
- More entry lifecycle features using `status` (draft / published / archived)
- Privacy by design: entry encryption, PII detection + redaction before embedding, tenant-isolated RAG with audit logging
- Multi-model routing: cheap model for tagging/summaries, stronger model for final answers, with automatic fallback
