# Changelog

All notable changes to **MOOD — AI Journal** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Webhook-based user sync (create Prisma user when Clerk user is created)
- Persisted vector store for journal Q&A (faster, no per-request embedding rebuild)
- Entry lifecycle UI: draft / published / archived status
- Encryption for entries and mood data
- PII detection and redaction before embedding / LLM
- Multi-model routing (cheaper model for tagging, stronger for answers)

### Possible improvements

- History chart: formatted date labels on X-axis (e.g. "Feb 14" instead of raw ISO)
- Statistics: mood distribution pie/bar chart (e.g. count by mood label)
- Export: download entries or insights as PDF/JSON
- Onboarding: guided first entry or tooltips for new users

---

## [0.1.1] - 2025-02-14

### Added

- **Changelog and version history** — This file; version reflected in `package.json`.
- **Journaling** — Create and edit entries in a dedicated editor with autosave.
- **Automatic analysis** — Each entry gets an `EntryAnalysis` (mood, subject, summary, sentiment score, color).
- **Ask your journal (Q&A)** — LLM-powered questions over entries with referenced entry links.
- **Insights** — History page: mood timeline line chart; Statistics page: all-time/30-day timeline, 12-month mood heatmap, quick stats (total entries, avg mood, date range).
- **Auth** — Clerk sign-in/sign-up; middleware protection; `/new-user` flow to create local Prisma user.
- **Database** — Prisma + Neon Postgres: `User`, `JournalEntry`, `EntryAnalysis`; entry status enum (DRAFT, PUBLISHED, ARCHIVED).
- **AI** — LangChain + OpenAI: structured entry analysis (Zod), Q&A with embeddings or best/worst-day selection.
- **UI** — Next.js App Router, Tailwind, Radix UI, Recharts; retro-style cards and theme toggle.

### Technical

- API routes: `POST /api/entry`, `PATCH /api/entry/[id]`, `DELETE /api/entry/[id]`, `POST /api/question`.
- Scripts: `dev`, `build`, `start`, `lint`, `db:seed`, `db:reset`, `db:studio`.

---

## Version history (summary)

| Version   | Date       | Notes                    |
|----------|------------|---------------------------|
| 0.1.1    | 2025-02-14 | Initial documented release|
| Unreleased | —        | Roadmap and improvements  |

---

<!-- Update the URLs below when you have a public repo; then you can use [Unreleased]: ...compare/v0.1.1...HEAD and [0.1.1]: .../releases/tag/v0.1.1 -->
