# ADR-001: Next.js Monolith Architecture

**Date:** 2026-05

---

## Context

OpsPilot requires a frontend UI, server-side business logic, database access, and AI integration. A decision was needed on whether to build a separated frontend/backend (e.g. Next.js + separate Express/Fastify API), or a unified monolith using Next.js App Router with server actions.

This is a solo-developed MVP with a primary goal of demonstrating production-quality engineering practices. Operational overhead and iteration speed are key constraints.

---

## Decision

Use a **Next.js 14+ App Router monolith** with server actions as the primary data mutation and query layer. No separate backend service will be created for the MVP.

---

## Rationale

### Faster iteration

A single codebase means no context switching between repos, no CORS configuration, no API contract maintenance between services. For a solo developer, this dramatically reduces friction.

### Server actions as the colocation model

Next.js server actions allow business logic to live adjacent to the UI that triggers it, inside the feature folder that owns it. This is idiomatic App Router architecture and mirrors how modern full-stack teams use the framework.

### Simpler deployment

A monolith deploys as a single unit to Vercel or a single container. No service orchestration, no inter-service networking, no separate environment configs for multiple services.

### Appropriate for the scale

OpsPilot is an internal tooling platform, not a high-throughput public API. The performance and separation benefits of a decoupled API are not yet warranted.

---

## Consequences

- Business logic lives inside `features/` and is invoked via server actions or server components — not via REST endpoints
- `app/api/` routes are used only for: webhooks, streaming responses (AI), and any genuinely external-facing integrations
- If OpsPilot were to grow into a multi-client product (mobile app, third-party integrations), a public API layer would be extracted at that point
- Developers joining the project need familiarity with App Router patterns (server components, server actions, the `use client` boundary)

---

## Alternatives Considered

| Option                         | Reason Rejected                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Next.js + separate Express API | Unnecessary operational overhead for solo MVP; premature separation                                                          |
| Next.js + tRPC                 | Valid option, but adds abstraction layer before it's needed; server actions are sufficient and more idiomatic for App Router |
| Remix                          | Strong alternative, but Next.js has broader ecosystem and employer familiarity                                               |
