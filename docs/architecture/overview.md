# Architecture Overview

**Last updated:** 2026-05

---

## System Summary

OpsPilot is a Next.js monolith with a PostgreSQL database and an AI integration layer. It follows a feature-based architecture with a clear separation between routing, business logic, and shared infrastructure.

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | Monolith — see ADR-001 |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS + shadcn/ui | |
| Database | PostgreSQL 16 + pgvector | Via Docker in dev |
| ORM | Prisma | Schema-first, typed client |
| Validation | Zod | Runtime validation at all boundaries |
| AI (dev) | Ollama (local) | See ADR-003 |
| AI (prod) | OpenAI / Anthropic | Switchable via env config |
| Linting/Formatting | Biome | See ADR-004 |
| Git hooks | Husky + lint-staged | Pre-commit quality gates |

---

## Application Layers

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│         (React client components)            │
└─────────────────────┬───────────────────────┘
                      │ HTTP / RSC / Server Actions
┌─────────────────────▼───────────────────────┐
│              Next.js App Router              │
│         app/ — routing and layout only       │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│              features/ layer                 │
│   Domain logic, server actions, components   │
│   tickets/ | knowledge-base/ | ai/ | audit/  │
└──────────┬───────────────────┬──────────────┘
           │                   │
┌──────────▼────────┐ ┌────────▼──────────────┐
│   server/db/      │ │    server/ai/          │
│   Prisma client   │ │   Provider abstraction │
│   DB utilities    │ │   Ollama / OpenAI etc. │
└──────────┬────────┘ └────────────────────────┘
           │
┌──────────▼────────┐
│   PostgreSQL      │
│   + pgvector      │
└───────────────────┘
```

---

## Request Flow: Server Action

```
User clicks "Summarise ticket"
  → Client component calls server action (features/tickets/actions/summarise.ts)
  → Server action validates input with Zod
  → Queries ticket + message thread via Prisma (server/db)
  → Assembles prompt context
  → Calls AI provider (server/ai)
  → Parses and validates AI response with Zod
  → Writes aiSummary to Ticket, logs TicketAuditEvent
  → Returns view model to client
  → UI updates optimistically
```

---

## Request Flow: Semantic Search

```
Agent types in search box
  → Server action receives query string
  → Embeds query via AI provider (server/ai)
  → Runs pgvector cosine similarity query
  → Returns top N similar tickets/articles
  → Client renders results
```

---

## Directory Structure

See [ADR-002](../adr/adr-002-feature-based-architecture.md) for full rationale.

```
ops-pilot/
├── app/                    # Next.js routing layer only
│   ├── (dashboard)/
│   │   ├── tickets/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── knowledge-base/
│   ├── layout.tsx
│   └── globals.css
├── features/               # Domain/business layer
│   ├── tickets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── server/
│   │   ├── types.ts
│   │   └── schema.ts
│   ├── knowledge-base/
│   ├── ai/
│   └── audit/
├── server/                 # Shared backend infrastructure
│   ├── db/
│   └── ai/
│       └── providers/
├── shared/                 # Domain-agnostic utilities
│   ├── components/
│   └── lib/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
└── tests/
```

---

## Key Architectural Principles

**1. Business logic never lives in `app/`**
Pages are composition layers. They import from `features/`, not the other way around.

**2. Server actions are the primary mutation layer**
REST-style API routes are used only for webhooks, streaming, and external integrations.

**3. Prisma models never reach the UI**
Mapper functions in `features/*/server/` transform persistence models into view models. The UI consumes view models only.

**4. All external boundaries are validated with Zod**
Server action inputs, AI outputs, and API payloads are validated at runtime regardless of TypeScript's compile-time guarantees.

**5. The AI layer is swappable**
All AI calls go through `server/ai/`. No direct LLM SDK calls in feature code.

---

## ADR Index

| ADR | Decision |
|-----|---------|
| [ADR-001](../adr/adr-001-nextjs-monolith.md) | Next.js monolith over separated API |
| [ADR-002](../adr/adr-002-feature-based-architecture.md) | Feature-based architecture |
| [ADR-003](../adr/adr-003-ai-provider-abstraction.md) | AI provider abstraction layer |
| [ADR-004](../adr/adr-004-biome-over-eslint.md) | Biome over ESLint + Prettier |
| [ADR-005](../adr/adr-005-docker-strategy.md) | Docker for infrastructure only |
