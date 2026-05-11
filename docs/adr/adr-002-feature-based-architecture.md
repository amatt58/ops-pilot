# ADR-002: Feature-Based Architecture

**Date:** 2026-05

---

## Context

Next.js App Router enforces a routing structure inside `app/`, but does not prescribe where business logic, components, hooks, and server code should live. Without a deliberate structure, codebases tend toward either a "type-based" layout (all components in `/components`, all hooks in `/hooks`) or ad-hoc organisation that becomes hard to navigate as the project grows.

---

## Decision

Adopt a **feature-based architecture** where all code related to a domain concept is colocated under `features/<domain>/`. The `app/` directory is a thin routing and composition layer only.

### Directory structure

```
app/                        # Routing layer only — no business logic
  (dashboard)/
    tickets/
      page.tsx              # Composes from features/tickets
      [id]/
        page.tsx
  layout.tsx

features/                   # Domain/business layer
  tickets/
    components/             # UI components specific to tickets
    hooks/                  # Client-side hooks (useTicketFilters etc.)
    actions/                # Server actions (createTicket, updateStatus etc.)
    server/                 # Server-only utilities (queries, transformers)
    types.ts                # Domain types and view models
    schema.ts               # Zod schemas for validation
    constants.ts
  knowledge-base/
  audit/
  ai/

server/                     # Shared backend infrastructure (not a separate service)
  db/                       # Prisma client, connection config
  ai/                       # AI provider abstraction
  auth/                     # Auth utilities
  queue/                    # Background job infrastructure (future)

shared/                     # Truly shared, domain-agnostic code
  components/               # Generic UI primitives (Button, Modal, etc.)
  lib/                      # Generic utilities (formatDate, cn, etc.)
  types/                    # Shared TypeScript types

docs/
prisma/
tests/
```

---

## Rationale

### Cohesion over type-grouping

Grouping by feature (tickets, knowledge-base, ai) means everything related to a domain lives together. You can understand, modify, or delete a feature without hunting across the codebase.

### Clear layer responsibilities

- `app/` handles routing and page composition and nothing else
- `features/` owns business logic and feature-specific UI
- `server/` owns shared infrastructure (DB client, AI client); not feature logic
- `shared/` owns truly generic, domain-agnostic utilities

### Scales without premature microservices

This structure supports extracting a feature into its own service later if needed, because its boundaries are already clear. It does not require that extraction prematurely.

### Industry standard

This pattern mirrors how mature Next.js teams and feature-flagging architectures organise code. It is recognisable to any senior engineer reviewing the project.

---

## Consequences

- New features always start with a folder under `features/`
- `app/` pages should import from `features/`, never contain inline business logic
- `server/` is imported by features — not the other way around
- Shared UI components live in `shared/components/`, not inside any feature folder

---

## Alternatives Considered

| Option                                         | Reason Rejected                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Type-based (`/components`, `/hooks`, `/utils`) | Breaks down quickly; hard to find related code; doesn't scale                  |
| Flat structure                                 | Only viable for very small projects; inappropriate for portfolio demonstration |
| Domain-driven modules with barrel exports      | Over-engineered for this scale; adds indirection without current benefit       |
