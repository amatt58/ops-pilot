# Developer Setup

## Prerequisites

- Node.js 24+
- npm 10+
- Docker + Docker Compose
- [Ollama](https://ollama.ai) (for local AI, once the `ai/` feature lands — see below)

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/amatt58/ops-pilot.git
cd ops-pilot

# 2. Install dependencies
npm install

# 3. Copy environment config
cp .env.example .env
# Defaults already match docker-compose.yml — just set AUTH_SECRET
# (see Environment Variables below)

# 4. Start infrastructure (Postgres)
docker compose up -d

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed the database (creates one fixture admin user for local login)
npm run db:seed

# 7. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the seeded fixture user:

```
email:    admin@opspilot.local
password: changeme123
```

This is a dev-only fixture created by `prisma/seed.ts` (`role: admin`), not a real credential — there is no self-serve signup, so this is how you get your first session locally. Re-running `npm run db:seed` is safe; it upserts on email.

For subsequent sessions you only need:

```bash
docker compose up -d
npm run dev
```

and `docker compose stop` when you're done — the container's named volume persists data between sessions, so there's no need to re-migrate or re-seed. Only `docker compose down -v` wipes it.

Once the `ai/` feature lands, local AI features will additionally need Ollama running in a separate terminal:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
ollama serve
```

---

## Environment Variables

Copy `.env.example` to `.env`. The Postgres values already match `docker-compose.yml`, so local dev works with no edits beyond generating your own `AUTH_SECRET`:

```env
# Database — local Docker Postgres (docker compose up -d)
DIRECT_URL="postgresql://ops_pilot:ops_pilot_dev@localhost:5432/ops_pilot"
DATABASE_URL="postgresql://ops_pilot:ops_pilot_dev@localhost:5432/ops_pilot"

# Auth.js v5
AUTH_SECRET="generate-with-openssl-rand-base64-32"   # openssl rand -base64 32; local-dev only, never reuse in Vercel
# AUTH_URL is deliberately not set — Auth.js auto-detects it per request.
```

**Never point local dev at Neon.** Production and Preview use a separate pair of `DIRECT_URL`/`DATABASE_URL` values (Neon's unpooled/pooled endpoints) configured directly in the Vercel dashboard — they don't belong in this file and shouldn't be pasted here even temporarily. See [ADR-006](../adr/adr-006-deployment-strategy.md) for the full environment variable map.

AI provider variables (`AI_PROVIDER`, `OLLAMA_BASE_URL`, `AI_MODEL`, `EMBEDDING_MODEL` — see ADR-003) are not yet wired up in code or `.env.example`; they'll be added once the `ai/` feature is built.

---

## Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Run production build

npm run lint         # Biome lint check
npm run lint:fix     # Biome lint + auto-fix
npm run format       # Biome format

npm run typecheck    # tsc --noEmit

npm run db:seed      # Seed one fixture admin user (admin@opspilot.local) for local login
```

Prisma CLI commands not wrapped in an npm script:

```bash
npx prisma migrate dev      # Create/apply a dev migration
npx prisma migrate deploy   # Apply pending migrations (used in npm run build)
npx prisma studio           # Open Prisma Studio (inspect data)
npx prisma migrate reset    # Drop, recreate, migrate, and re-seed the database
```

---

## Infrastructure

```bash
# Start Postgres
docker compose up -d

# Stop (data persists)
docker compose stop

# Full reset (destroys all data)
docker compose down -v
```

---

## Git Workflow

- All work is tied to a GitHub issue
- Branch from `main` using the pattern: `feature/issue-number-short-description`
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`
- Pre-commit hooks run Biome lint + format and TypeScript type check automatically

---

## Project Structure

See [docs/architecture/overview.md](./architecture/overview.md) for the full picture.

```
app/          Next.js routing (pages, layouts)
features/     Domain business logic
server/       Shared infrastructure (DB, AI)
shared/       Generic utilities and components
prisma/       Schema and migrations
docs/         Architecture, product, ADRs
tests/        Test suites
```
