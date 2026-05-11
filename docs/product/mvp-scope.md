# MVP Scope

**Last updated:** 2025-05

---

## What OpsPilot Is

An AI-augmented internal operations platform for support and ops teams. Agents use it to triage, understand, and resolve tickets faster — assisted by AI summarisation, response drafting, and semantic search.

This is not a customer-facing product. It is the kind of internal tooling that operations teams build or buy. The MVP demonstrates a believable, production-quality implementation of this category of software.

---

## MVP Definition

The MVP is the smallest version of OpsPilot that demonstrates the full value loop:

> An agent can receive a ticket, understand it quickly with AI assistance, find relevant context, draft a response, and resolve it — with the full workflow captured in an audit trail.

---

## In Scope — MVP

### Authentication
- Email/password login via NextAuth
- Session management
- Protected routes
- Basic user profile (name, email, avatar, role)

### Ticket Inbox
- List view of all tickets
- Status, priority, and type filtering
- Search by title/description (full-text)
- Sort by created date, priority, updated date
- Unassigned / assigned to me filters
- Pagination

### Ticket Detail
- Full ticket information display
- Message thread (customer + agent messages)
- Internal notes (agent-only, not customer-visible)
- Status and priority update
- Tag management
- Assignment to self or another agent

### AI — Ticket Summarisation
- "Summarise" action on ticket detail
- Generates a structured summary: problem, context, current status, suggested next step
- Summary persisted to ticket record
- Audit event generated

### AI — Response Drafting
- "Draft response" action on ticket detail
- AI generates a suggested customer reply using ticket context
- Draft displayed in an editable textarea, not auto-sent
- Agent edits and submits manually

### Similar Ticket Retrieval
- On ticket detail, surface top 3–5 semantically similar resolved tickets
- Powered by pgvector cosine similarity on ticket embeddings
- Embeddings generated when a ticket is created/updated

### Knowledge Base
- Create and edit knowledge articles (title + markdown body + tags)
- List and search articles (full-text)
- Semantic search over articles (pgvector)
- Articles surfaced in AI context when drafting responses

### Activity / Audit Timeline
- Per-ticket timeline of all events
- Shows: status changes, assignments, messages sent, AI actions, tag changes
- Immutable — events are never edited or deleted

### Seed Data
- Realistic fake ticket data generated with Faker.js
- Sufficient volume to demonstrate inbox filtering and similarity search (50–100 tickets)

---

## Out of Scope — MVP

These are explicitly deferred. They are not forgotten — they are candidates for post-MVP iteration.

| Feature | Rationale for deferral |
|---------|----------------------|
| Email ingestion (real inbound email) | Infrastructure complexity; not required to demonstrate core value |
| Customer portal / external-facing UI | Increases scope significantly; MVP is agent-side only |
| Team / organisation management | Auth/RBAC complexity; single-team assumed for MVP |
| SLA tracking and alerting | Requires background job infrastructure; deferred |
| Real-time updates (WebSockets) | Polling or manual refresh acceptable for MVP |
| Mobile responsiveness | Desktop-first for internal tooling; responsive pass is post-MVP |
| Reporting and analytics dashboards | Valuable but not core workflow |
| Webhooks / outbound integrations | External coupling; deferred |
| AI model fine-tuning or custom prompts UI | Out of scope for v1 |

---

## Definition of Done — MVP

The MVP is considered complete when:

- [ ] An agent can log in and see the ticket inbox
- [ ] An agent can open a ticket, read the thread, and update its status
- [ ] An agent can trigger AI summarisation and see a structured summary
- [ ] An agent can trigger AI response drafting and edit/submit the draft
- [ ] Similar resolved tickets are surfaced on the ticket detail page
- [ ] Knowledge base articles can be created and searched
- [ ] The activity timeline shows the full history of a ticket
- [ ] Seed data produces a realistic-feeling demo environment
- [ ] The codebase is documented, linted, and has passing type checks

---

## Post-MVP Candidates

In rough priority order:

1. Email ingestion (parse inbound email into tickets)
2. Real-time updates via Server-Sent Events
3. SLA tracking (due dates, breach alerts)
4. Reporting dashboard (ticket volume, resolution time, AI usage)
5. Multi-team support
6. Webhook outbound notifications
