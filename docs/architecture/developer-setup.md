# Developer Setup

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose
- [Ollama](https://ollama.ai) (for local AI)

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/amatt58/ops-pilot.git
cd ops-pilot

# 2. Install dependencies
npm install

# 3. Copy environment config
cp .env.example .env.local
# Edit .env.local — see Environment Variables below

# 4. Start infrastructure (Postgres)
docker compose up -d

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed the database
npm run db:seed

# 7. Start Ollama (separate terminal)
ollama pull llama3.2
ollama pull nomic-embed-text
ollama serve

# 8. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

```env
# Database
DATABASE_URL="postgresql://ops_pilot:ops_pilot_dev@localhost:5432/ops_pilot"

# Auth (NextAuth)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider
AI_PROVIDER="ollama"                        # ollama | openai | anthropic
OLLAMA_BASE_URL="http://localhost:11434"
AI_MODEL="llama3.2"
EMBEDDING_MODEL="nomic-embed-text"

# Optional: hosted providers
# OPENAI_API_KEY=""
# ANTHROPIC_API_KEY=""
```

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

npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database with fake data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database (destroys data)
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
