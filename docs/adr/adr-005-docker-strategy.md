# ADR-005: Docker Strategy

**Date:** 2026-05 

---

## Context

OpsPilot depends on PostgreSQL (with pgvector extension) and Ollama for local AI inference. A decision was needed on how to manage these dependencies across development and any future deployment.

The question has two parts:
1. Should Docker be used for local development infrastructure?
2. Should the Next.js application itself be containerised?

---

## Decision

**Use Docker for infrastructure services only** during development. The Next.js application runs natively on the host machine (`npm run dev`). Application containerisation is deferred until deployment is a real concern.

### What runs in Docker (dev)

```yaml
# docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ops_pilot
      POSTGRES_PASSWORD: ops_pilot_dev
      POSTGRES_DB: ops_pilot
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Ollama runs **natively** (not in Docker) because GPU passthrough in Docker adds complexity that is not worth it for a dev environment. Ollama's native installer handles this correctly.

### What does NOT run in Docker (dev)

- Next.js app — runs via `npm run dev` for hot reload, fast iteration
- Ollama — runs natively for GPU/performance reasons

---

## Rationale

### PostgreSQL in Docker is the right call
- Keeps dev environment clean — no system Postgres installation, no version conflicts
- `pgvector/pgvector:pg16` image comes with the pgvector extension pre-installed, which would otherwise require manual compilation
- Data persists in a named volume across container restarts
- Easy to reset: `docker compose down -v` wipes everything cleanly
- Matches what most professional dev teams do

### Running the app natively
- Hot reload is faster without Docker layer
- No Dockerfile to maintain during rapid iteration
- Debugging is simpler (no container networking to think about)
- Next.js is not a long-running infrastructure dependency — it's the thing being built

### Deferring application containerisation
- Containerising the app is a deployment concern, not a development concern
- If deployed to Vercel (likely for MVP), no Dockerfile is needed at all
- If deployed to a VPS or cloud VM later, a Dockerfile can be written then — against a known runtime environment
- Writing a Dockerfile speculatively adds maintenance overhead with no current benefit

---

## Developer Setup

```bash
# Start infrastructure
docker compose up -d

# Verify postgres is running
docker compose ps

# Stop infrastructure (data persists)
docker compose stop

# Full reset (destroys data)
docker compose down -v
```

```bash
# Install and run Ollama natively
brew install ollama          # macOS
ollama pull llama3.2
ollama pull nomic-embed-text
ollama serve                 # runs on http://localhost:11434
```

---

## Future: Application Containerisation

If OpsPilot is deployed to a self-hosted environment, a Dockerfile would be added at that point:

```dockerfile
# Dockerfile (future — not current)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

A production `docker-compose.yml` would then wire the app container to the postgres container. This is documented here as future intent, not current implementation.

---

## Alternatives Considered

| Option | Reason Rejected |
|--------|-----------------|
| Everything in Docker (app + db + ollama) | Hot reload friction; GPU passthrough complexity; overengineered for dev |
| No Docker at all (native Postgres install) | pgvector installation is non-trivial; pollutes host system; version management pain |
| Dev containers / VS Code devcontainer | Valid but adds VS Code coupling; more setup for collaborators |
