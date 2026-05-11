# ADR-003: AI Provider Abstraction Layer

**Date:** 2026-05

---

## Context

OpsPilot's core value proposition is AI-augmented operations workflows — ticket summarisation, response drafting, similar ticket retrieval, knowledge base search. These features require LLM inference and embedding generation.

During development, calling a hosted LLM provider (OpenAI, Anthropic) for every iteration would incur API costs and require network access. In production, the choice of provider may change based on cost, capability, or privacy requirements.

A decision was needed on how to structure AI integration to avoid being tightly coupled to a single provider.

---

## Decision

Build a **provider abstraction layer** in `server/ai/` that defines a consistent interface for LLM operations, with concrete implementations per provider. Development defaults to **Ollama** (local). Production can be switched to any hosted provider via environment configuration.

### Interface design (conceptual)

```typescript
// server/ai/types.ts
interface AIProvider {
  complete(prompt: CompletionPrompt): Promise<CompletionResult>
  embed(text: string): Promise<number[]>
}

// server/ai/providers/ollama.ts
// server/ai/providers/openai.ts
// server/ai/providers/anthropic.ts

// server/ai/index.ts — resolves provider from env
export function getAIProvider(): AIProvider { ... }
```

### Environment configuration

```env
AI_PROVIDER=ollama          # ollama | openai | anthropic
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
AI_MODEL=llama3.2           # model name, provider-specific
EMBEDDING_MODEL=nomic-embed-text
```

---

## Rationale

### Cost during development

Ollama runs models locally at zero per-token cost. This makes rapid AI feature iteration practical without burning API credits on every test run.

### The engineering signal is orchestration, not the model

What demonstrates engineering skill is how AI is integrated into workflows — context assembly, structured output parsing, fallback handling, prompt versioning — not which provider is called. The abstraction makes this clear.

### Production flexibility

Internal tooling often has data privacy requirements that preclude sending data to hosted providers. An abstraction layer makes it straightforward to switch or to run locally in production too.

### Avoids lock-in

OpenAI's API has become a de facto standard, but pricing, availability, and capability shift frequently. Abstraction protects against churn.

---

## Consequences

- All AI calls go through `server/ai/` — never direct SDK calls inside feature code
- Features pass structured context objects to AI functions; they do not construct prompts directly
- Prompt templates are versioned and stored (initially as constants, later potentially in DB)
- AI output is always validated with Zod before being used
- Embedding vectors must store the model name that generated them (`embeddingModel` field on DB records) — embeddings are not comparable across models

---

## Ollama Setup (Development)

```bash
# Install Ollama
brew install ollama         # macOS
# or download from https://ollama.ai

# Pull required models
ollama pull llama3.2        # completion
ollama pull nomic-embed-text # embeddings

# Ollama runs as a local server on port 11434
ollama serve
```

---

## Alternatives Considered

| Option                             | Reason Rejected                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| Direct OpenAI SDK calls everywhere | Tight coupling; dev costs; no flexibility                                              |
| Vercel AI SDK as abstraction       | Valid option; may be introduced later but adds a dependency before its value is proven |
| Single provider only               | Insufficient for portfolio; does not demonstrate architectural thinking                |
