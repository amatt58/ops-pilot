# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

OpsPilot is an AI-augmented internal operations platform (ticket triage/support) built as a portfolio project. It's a Next.js monolith — no separate backend service. See `docs/architecture/overview.md`, `docs/architecture/data-model.md`, and `docs/adr/` for full rationale; this file summarizes what's needed to work in the repo day-to-day.

**Current state:** infrastructure, tooling, and the Prisma schema are in place; the `features/` and `tests/` directories exist but are empty. Business logic has not been implemented yet.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build         # prisma generate && prisma migrate deploy && next build
npm run start         # Run production build

npm run lint          # Biome lint check
npm run lint:fix      # Biome lint + auto-fix
npm run format        # Biome format --write

npm run typecheck     # tsc --noEmit
```

Database (no `db:*` npm scripts defined yet — use `prisma` directly):
```bash
docker compose up -d              # start Postgres (pgvector/pgvector:pg16)
docker compose down -v            # full reset, destroys data
npx prisma migrate dev            # create/apply a dev migration
npx prisma studio                 # inspect data
```

`prisma.config.ts` points migrations at `DIRECT_URL` (unpooled), while `server/db/index.ts` connects the runtime client via `DATABASE_URL` — both must be set (Neon requires the pooled/unpooled split in production).

Local AI (dev only, see below): `ollama pull llama3.2 && ollama pull nomic-embed-text && ollama serve`.

There is no test runner configured yet (`tests/` is empty).

## Architecture

**Layering is enforced by convention, not by tooling — read `docs/adr/adr-001` and `adr-002` before adding code in the wrong place:**

- `app/` — Next.js App Router routing/composition ONLY. No business logic. Pages import from `features/`, never the reverse.
- `features/<domain>/` — where all new feature work goes (`tickets/`, `knowledge-base/`, `ai/`, `audit/`, once created). Each feature owns `components/`, `hooks/`, `actions/` (server actions), `server/` (queries + Prisma→view-model mappers), `types.ts`, `schema.ts` (Zod).
- `server/` — shared backend infra, imported by features, never the other way around. `server/db/` is the Prisma client singleton (cached on `globalThis` to survive HMR). `server/ai/` (planned) will hold the AI provider abstraction.
- `shared/` — domain-agnostic utilities and UI primitives (shadcn/ui components live in `shared/components/ui/`, path-aliased via `components.json`: `@/shared/components`, `@/shared/lib`, `@/shared/hooks`).

**Non-negotiable rules from the ADRs:**
1. Server actions are the primary mutation/query layer. `app/api/` routes exist only for webhooks, streaming, or external integrations — not general CRUD.
2. Prisma models never reach the UI. Every feature exposes view models via mapper functions in `features/*/server/`; components consume view models only.
3. All external boundaries (server action inputs, AI outputs, API payloads) are validated with Zod at runtime, regardless of TypeScript types.
4. All AI calls go through `server/ai/` — no direct LLM SDK calls inside feature code. The provider (`AIProvider` interface: `complete()`, `embed()`) is resolved from `AI_PROVIDER` env var (`ollama` | `openai` | `anthropic`), so dev uses local Ollama and prod uses a hosted provider with zero code changes.

**Data model** (`prisma/schema.prisma`, detailed rationale in `docs/architecture/data-model.md`):
- `User` → `Ticket` (created/assigned), `TicketMessage`, `TicketAuditEvent`, `KnowledgeArticle`.
- `Ticket` has AI-generated fields (`aiSummary`, `aiSentiment`, `aiSuggestedTags`) but embeddings live in a separate `TicketEmbedding` (1:1, `vector(1536)` via pgvector) to keep the hot ticket-query path fast and allow independent re-embedding when the model changes — the `model` field on embedding rows tracks which model produced them; do not compare vectors across models.
- `TicketMessage` is a real table (not JSONB on Ticket) so multi-turn customer/agent/AI threads can be queried and streamed individually.
- `TicketAuditEvent` is append-only — never update or delete rows; it's the source of truth for the activity timeline.
- `KnowledgeArticle` mirrors the Ticket embedding pattern via `KnowledgeArticleEmbedding`.
- `Account` / `Session` / `VerificationToken` are Auth.js (NextAuth v5 beta) adapter models via `@auth/prisma-adapter`.

**Auth**: Auth.js v5 (beta) + Prisma adapter + bcrypt. `middleware.ts` is currently a stub — session/route protection is in-progress work.

## Environments

- **Local dev**: app runs natively (`npm run dev`, not containerized — hot reload). Postgres runs in Docker (`docker-compose.yml`, `pgvector/pgvector:pg16`). Ollama runs natively (not Dockerized, to avoid GPU passthrough complexity) for local completions/embeddings.
- **Production**: Vercel (app) + Neon (serverless Postgres, pgvector enabled by default) + OpenAI (`gpt-4o-mini` completions, `text-embedding-3-small` embeddings). Switching providers/DBs between environments is env-var only (`AI_PROVIDER`, `DATABASE_URL`) — no code branching. See `docs/adr/adr-006-deployment-strategy.md` for the full environment variable map.
- **Branching**: `feature/<issue>-<slug>` → PR into `dev` (auto Vercel preview) → `dev` → `main` (production) at epic boundaries. Nothing merges directly into `main` except from `dev`.

## Tooling notes

- Biome (not ESLint/Prettier) handles both lint and format — config in `biome.json`. Husky + lint-staged run Biome on staged `.ts/.tsx/.js/.jsx` files pre-commit.
- Path alias `@/*` maps to repo root (`tsconfig.json`).
- shadcn/ui config (`components.json`) uses the `new-york` style, `zinc` base color, and redirects all default shadcn paths under `shared/` rather than the top-level `components/`/`lib/`/`hooks/` shadcn normally expects.
