# MOOD — AI Journal (Next.js + Clerk + Prisma + Neon + LangChain/OpenAI)

MOOD is an AI-powered journaling app built with Next.js (App Router). You write journal entries, the app generates a structured “mood analysis” for each entry, and you can chat with your journal to ask questions like “What was my best day?” or “How have I been feeling lately?”.

## What this app does

- **Journaling**: create entries and edit them in a dedicated editor page.
- **Automatic analysis**: each entry gets an `EntryAnalysis` record (mood, subject, summary, sentiment score, etc.).
- **Ask your journal (Q&A)**: asks an LLM questions over your entries and returns an answer plus **referenced entries** so the UI can link you back to the specific days.
- **Insights pages**: history chart + statistics view built from your analysis data.

## Tech stack

- **App**: Next.js (App Router), React, TypeScript
  - Config: `next.config.ts`, `tsconfig.json`
- **Auth**: Clerk
  - Provider: `app/layout.tsx`
  - Route protection: `middleware.ts` (public routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`)
  - Auth pages: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`
  - First-time DB user creation: `app/new-user/page.tsx`
- **Database**: Prisma ORM + Neon Postgres
  - Schema: `prisma/schema.prisma`
- **AI / LLM**: LangChain + OpenAI
  - Core logic: `util/ai.ts`
- **Styling/UI**: Tailwind CSS + Radix UI primitives
  - Global styles: `app/globals.css`
- **Linting**: ESLint (`eslint.config.mjs`)

## App structure (high level)

### Pages

- `/` — landing page
- `/journal` — list of journal entries + “Ask your journal” + “New entry”
- `/journal/[id]` — editor for a single entry
- `/history` — mood timeline chart
- `/statistics` — all-time + recent insights
- `/new-user` — creates the local Prisma `User` record for the signed-in Clerk user

### API routes

- `POST /api/entry` — create a new entry
  - Creates the entry plus a placeholder analysis (neutral defaults)
- `PATCH /api/entry/[id]` — update entry fields (typically `content`)
  - Re-runs AI analysis and upserts `EntryAnalysis`
- `DELETE /api/entry/[id]` — delete an entry
- `POST /api/question` — ask a question about your entries
  - Fetches your entries + analysis from DB
  - Builds context (similarity search via embeddings, or “best/worst day” selection)
  - Returns `{ answer, referencedEntries }`

## How the AI works

There are two AI workflows in `util/ai.ts`:

1) **Entry analysis** (`analyzeEntry`)

- Uses a structured output schema (Zod) to force a consistent JSON-like shape:
  - `mood`, `subject`, `negative`, `summary`, `sentimentScore`
- Converts `sentimentScore` (-10 to 10) into a UI color via `util/color.ts`.
- Triggered from `PATCH /api/entry/[id]` after saving edits.

2) **Journal Q&A** (`qa`)

- Takes your entries (and their analysis) and turns them into documents.
- For normal questions, it uses embeddings + an in-memory vector store to pick the most relevant entries.
- For “best/worst day” style queries, it skips embeddings and selects top/bottom entries by `sentimentScore`.
- The response includes:
  - `answer`: human-readable response
  - `referencedEntries`: the entry metadata that the UI uses to render links back to `/journal/[id]`

## Database schema (Prisma)

The core models in `prisma/schema.prisma`:

- `User` — your local user table linked to Clerk via `clerkId` (plus `email`, optional `name`)
- `JournalEntry` — the journal text (`content`) and status (`DRAFT`/`PUBLISHED`/`ARCHIVED`)
- `EntryAnalysis` — one-to-one analysis record per entry (mood/summary/sentiment/color/etc.)

## Environment variables

Create a `.env.local` file in the project root.

### Clerk

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Database (Neon Postgres)

- `DATABASE_URL`
- `DIRECT_URL`

### OpenAI (for LangChain)

- `OPENAI_API_KEY`

## Getting started (local development)

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

- Add all values listed in **Environment variables** to `.env.local`.

3) Generate Prisma Client and run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

4) (Optional) Seed the database

```bash
npm run db:seed
```

5) Start the dev server

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

- **First sign-in redirect**: if you see an error like “No local DB user found for Clerk id…”, go to `/new-user` (the app also redirects there in several server components). That route creates your Prisma `User` record.
- **No AI output**: ensure `OPENAI_API_KEY` is set. Both entry analysis and Q&A depend on it.
- **Why analysis updates on edit**: new entries start with neutral placeholder analysis; the real analysis is generated when the entry is updated via `PATCH /api/entry/[id]`.

## Roadmap ideas

- Webhook-based user sync (create Prisma user automatically when Clerk user is created)
- Persisted vector store (instead of rebuilding embeddings per Q&A request)
- More entry lifecycle features using `status` (draft/published/archived)
