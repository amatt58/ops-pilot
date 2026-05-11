# Data Model

**Last updated:** 2026-05 
**Status:** Draft — pre-implementation

---

## Overview

This document describes the core data entities in OpsPilot, their fields, relationships, and the reasoning behind key modelling decisions. It is intentionally at a conceptual level — the authoritative schema lives in `prisma/schema.prisma`.

The goal of this document is to answer *why* the schema is shaped the way it is, and to provide a reference when designing queries, view models, and AI context assembly.

---

## Entity Map

```
User ──────────────────────────────────┐
  │                                    │
  ├── created → Ticket ←── assigned ──┘
  │               │
  │               ├── TicketMessage[]
  │               ├── TicketAuditEvent[]
  │               └── TicketEmbedding (1:1)
  │
  └── created → KnowledgeArticle
                    │
                    └── KnowledgeArticleEmbedding (1:1)
```

---

## Entities

### User

Represents an agent or admin using OpsPilot. Authentication is handled externally (NextAuth); this table stores profile and role data.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| email | string | Unique |
| name | string | Display name |
| avatarUrl | string? | Optional profile image |
| role | enum | `agent` \| `admin` |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### Ticket

The core entity. Represents a support request, incident, or task submitted by a customer or internal user.

#### Identity

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| title | string | Short summary, max 150 chars |
| description | text | Full problem description, markdown |
| status | enum | `open` \| `in_progress` \| `pending` \| `resolved` \| `closed` |
| priority | enum | `low` \| `medium` \| `high` \| `critical` |
| type | enum | `bug` \| `question` \| `feature_request` \| `incident` \| `task` |
| source | enum | `email` \| `web` \| `api` \| `internal` |

#### Assignment

| Field | Type | Notes |
|-------|------|-------|
| createdById | uuid | FK → User |
| assignedToId | uuid? | FK → User, nullable (unassigned) |

#### Timing

| Field | Type | Notes |
|-------|------|-------|
| createdAt | timestamp | |
| updatedAt | timestamp | |
| firstResponseAt | timestamp? | Set when first agent reply is sent |
| resolvedAt | timestamp? | Set when status → resolved |
| dueAt | timestamp? | SLA deadline |

#### Classification

| Field | Type | Notes |
|-------|------|-------|
| tags | string[] | Flat tag array (e.g. `["billing", "auth"]`) |
| category | string? | Broader classification |
| customFields | jsonb? | Flexible metadata (region, plan tier, etc.) |

#### AI-generated

| Field | Type | Notes |
|-------|------|-------|
| aiSummary | text? | LLM-generated summary |
| aiSentiment | enum? | `positive` \| `neutral` \| `negative` \| `frustrated` |
| aiSuggestedTags | string[]? | Model-suggested tags, pre-human-review |

> Note: Embedding vectors are stored in a separate `TicketEmbedding` table rather than inline on Ticket. This keeps the main ticket query fast and makes embedding versioning cleaner.

---

### TicketMessage

The conversation thread on a ticket. Not just a description — tickets have multi-turn exchanges between customers, agents, and the AI.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| ticketId | uuid | FK → Ticket |
| authorId | uuid? | FK → User, nullable for customer messages |
| body | text | Markdown content |
| messageType | enum | `customer_reply` \| `agent_note` \| `ai_draft` \| `system` |
| isInternal | boolean | Internal note vs customer-visible |
| createdAt | timestamp | |

**Why a separate table?** Tickets can have many messages. Storing them inline (e.g. as a JSONB array) would make querying, searching, and streaming individual messages significantly harder.

---

### TicketAuditEvent

An append-only log of every meaningful state change on a ticket. Powers the activity timeline UI. Never updated or deleted.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| ticketId | uuid | FK → Ticket |
| actorId | uuid? | FK → User, nullable for system events |
| actorType | enum | `user` \| `system` \| `ai` |
| eventType | enum | See event types below |
| previousValue | string? | Serialised previous state |
| newValue | string? | Serialised new state |
| metadata | jsonb? | Additional structured context |
| createdAt | timestamp | |

**Event types:**
- `ticket_created`
- `status_changed`
- `priority_changed`
- `assigned`
- `unassigned`
- `tag_added` / `tag_removed`
- `message_sent`
- `ai_summary_generated`
- `ai_draft_generated`
- `ai_tags_suggested`

**Why append-only?** Audit logs derive their value from immutability. The ability to reconstruct "what happened and when" requires that events are never modified.

---

### TicketEmbedding

Stores the vector embedding for a ticket, used for semantic similarity search. Separated from the Ticket table to keep ticket queries fast.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| ticketId | uuid | FK → Ticket, unique (1:1) |
| vector | vector(1536) | pgvector column |
| model | string | Model that generated this vector, e.g. `nomic-embed-text` |
| generatedAt | timestamp | When the embedding was last generated |

**Why store the model name?** Embeddings from different models are not comparable. If the embedding model changes, existing vectors must be regenerated. Storing the model name makes it possible to identify stale embeddings.

---

### KnowledgeArticle

Reference documentation, FAQs, or runbooks that the AI can retrieve when drafting responses.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| title | string | |
| body | text | Markdown content |
| tags | string[] | |
| createdById | uuid | FK → User |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### KnowledgeArticleEmbedding

Same pattern as TicketEmbedding — separated for the same reasons.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| articleId | uuid | FK → KnowledgeArticle, unique |
| vector | vector(1536) | pgvector column |
| model | string | |
| generatedAt | timestamp | |

---

## Key Modelling Decisions

### Embeddings in separate tables
Keeps the hot query paths (ticket list, ticket detail) free of large vector data. Enables independent lifecycle management — embeddings can be regenerated without touching ticket records.

### Tags as string arrays
Simple and sufficient for MVP. A join table (`TicketTag`) would be appropriate if tag management (renaming, merging, analytics) becomes a product requirement. `string[]` maps cleanly to a Postgres `text[]` column with GIN indexing.

### customFields as JSONB
Different customers or verticals need different metadata. Rather than premature schema expansion, `customFields` provides a flexible escape hatch. Important: business logic should not depend on `customFields` contents — it is for display and filtering only.

### Prisma model vs view model
The Prisma schema defines the persistence shape. The UI never consumes Prisma models directly — features expose view models (simplified, transformed types) via mapper functions. Example:

```typescript
// Persistence model (Prisma)
type Ticket = { id, title, status, priority, assignedToId, createdById, ... }

// View model (UI)
type TicketCard = { id, title, status, priority, assignee: { name, avatarUrl } | null, createdAt }

// Mapper
function toTicketCard(ticket: Ticket & { assignedTo: User | null }): TicketCard
```

This prevents leaking backend/internal fields to the frontend and keeps UI components simple.

---

## pgvector Setup

```sql
-- Required once per database
CREATE EXTENSION IF NOT EXISTS vector;
```

Handled via Prisma migration. The `pgvector/pgvector:pg16` Docker image includes the extension pre-installed.
