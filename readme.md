# Journal App (Next.js + Clerk + Prisma + Neon)

A simple journaling app scaffold using Next.js (App Router) with Clerk authentication, Prisma ORM, and a Neon Postgres database. Tailwind CSS powers the styling.

## Stack

- App: Next.js (App Router), React, TypeScript
  - Config: `next.config.ts`, `tsconfig.json`
- Auth: Clerk https://dashboard.clerk.com/
  - Provider in `app/layout.tsx`
  - Route protection via `middleware.ts` (public routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`)
  - Auth pages: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`, `app/new-user/page.tsx`
- Data: Prisma + Neon Postgres
  - Env vars in `.env` / `.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`)
  - Schema in `prisma/schema.prisma` with models: `User`, `JournalEntry`, `Analysis`
- Styling: Tailwind CSS with PostCSS (`postcss.config.mjs`, global styles in `app/globals.css`)
- Linting: ESLint (`eslint.config.mjs`)

## Implemented

- Home page with CTA to `/journal`: `app/page.tsx`
- Clerk sign-in and sign-up flows with catch-all routes
- Route protection using Clerk middleware
- Prisma schema (users, journal entries, analysis)

## Prisma schema at a glance

- `User` — links to Clerk user (`clerkId`, `email`)
- `JournalEntry` — belongs to a user; stores `content`
- `Analysis` — one-to-one with `JournalEntry` (mood, summary, color, negative)

See `prisma/schema.prisma` for details.

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Set environment variables

- Copy or edit `.env.local` with your Clerk keys and Neon Postgres URLs.
- Required keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`.

3. Set up the database (Prisma)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Note: After you change `prisma/schema.prisma`, run the following to update the database and regenerate Prisma Client:

```bash
npx prisma db push
```

4. Run the development server

```bash
npm run dev
```

5. Inspect db

```bash
npx prisma studio
```

Open http://localhost:3000

## Next steps

- Build `/journal` pages and CRUD APIs
- Link Clerk users to Prisma `User` on sign-up/sign-in
- UI for creating entries and displaying analysis
- Add loading animations

##

LLM - Large Language Model
Transformers:
[LangChain.js: Basically ](https://js.langchain.com/docs/introduction/)

- Maybe write a Neural Network in js
